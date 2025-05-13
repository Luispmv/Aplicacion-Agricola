// Crear el mapa
const map = L.map('map').setView([21.12, -101.68], 12);

// Agregar mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Objeto para almacenar las capas
const capas = {
  sensores: { 
    grupo: L.markerClusterGroup(), 
    color: '#ff4444', 
    emoji: '📡',
    elementos: []
  },
  pozos: { 
    grupo: L.markerClusterGroup(), 
    color: '#4444ff', 
    emoji: '💧',
    elementos: []
  },
  parcelas: { 
    grupo: L.markerClusterGroup(), 
    color: '#44ff44', 
    emoji: '🌱',
    elementos: []
  },
  'zonas-riego': { 
    grupo: L.layerGroup(), 
    color: 'blue', 
    emoji: '💦',
    elementos: []
  },
  'tipos-cultivo': { 
    grupo: L.layerGroup(), 
    color: 'green', 
    emoji: '🌾',
    elementos: []
  }
};

// Variables para medición de distancia
let medicionActiva = false;
let puntosMedicion = [];
let lineaMedicion = null;
let marcadoresMedicion = [];

// Variables para análisis espacial
let bufferLayer = null;
let intersectionLayer = null;
let neighborLines = L.layerGroup().addTo(map);
let areaLabels = L.layerGroup().addTo(map);

// Cache para resultados de análisis
const cache = {
  sensoresEnZonas: new Map(),
  distanciasEntrePozos: new Map(),
  ultimaActualizacion: null,
  tiempoExpiracion: 5 * 60 * 1000 // 5 minutos
};

// Función para verificar y limpiar caché
function limpiarCacheExpirado() {
  const ahora = Date.now();
  if (cache.ultimaActualizacion && (ahora - cache.ultimaActualizacion > cache.tiempoExpiracion)) {
    cache.sensoresEnZonas.clear();
    cache.distanciasEntrePozos.clear();
    cache.ultimaActualizacion = ahora;
  }
}

// Función para cargar y agregar GeoJSON con popup
function cargarCapa(url, color, nombreCapa, options = {}) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (options.isPoint) {
        // Para puntos, usamos marcadores personalizados
        const elementos = L.geoJSON(data, {
          pointToLayer: function(feature, latlng) {
            const icon = L.divIcon({
              className: 'custom-icon',
              html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;">${options.emoji || ''}</div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
            return L.marker(latlng, { icon });
          },
          onEachFeature: function(feature, layer) {
            let contenido = `<strong>${nombreCapa}</strong><br>`;
            for (const key in feature.properties) {
              if (key !== 'geom' && key !== 'ubicacion') {
                contenido += `<b>${key}:</b> ${feature.properties[key]}<br>`;
              }
            }
            layer.bindPopup(contenido);
            layer.feature = feature;
          }
        });
        capas[options.capaId].elementos = elementos.getLayers();
        capas[options.capaId].grupo.addLayer(elementos);
      } else {
        // Para polígonos, usamos el código existente
        const elementos = L.geoJSON(data, {
          style: function(feature) {
            let colorFinal = color;

            if (nombreCapa === 'Tipo de Cultivo') {
              const cultivo = feature.properties.cultivo.toLowerCase();
              switch (cultivo) {
                case 'maíz': colorFinal = '#f5e663'; break;
                case 'trigo': colorFinal = '#d2b48c'; break;
                case 'caña de azúcar': colorFinal = '#66bb66'; break;
                case 'frijol': colorFinal = '#8b4513'; break;
                case 'tomate': colorFinal = '#ff4c4c'; break;
                case 'aguacate': colorFinal = '#3d9140'; break;
                case 'uva': colorFinal = '#8e44ad'; break;
                case 'limón': colorFinal = '#c4e538'; break;
                case 'sandia': colorFinal = "red"; break;
              }
            }

            return {
              color: colorFinal,
              weight: 2,
              fillOpacity: 0.4
            };
          },
          onEachFeature: function(feature, layer) {
            let contenido = `<strong>${nombreCapa}</strong><br>`;
            for (const key in feature.properties) {
              if (key !== 'geom') {
                contenido += `<b>${key}:</b> ${feature.properties[key]}<br>`;
              }
            }
            layer.bindPopup(contenido);
            layer.feature = feature;

            if (nombreCapa === 'Tipo de Cultivo') {
              const cultivo = feature.properties.cultivo;
              let emoji = '🌳';

              switch (cultivo.toLowerCase()) {
                case 'maíz': emoji = '🌽'; break;
                case 'trigo': emoji = '🌾'; break;
                case 'caña de azúcar': emoji = '🍬'; break;
                case 'frijol': emoji = '🫘'; break;
                case 'tomate': emoji = '🍅'; break;
                case 'aguacate': emoji = '🥑'; break;
                case 'uva': emoji = '🍇'; break;
                case 'limón': emoji = '🍋'; break;
                case 'sandia': emoji = '🍉'; break;
              }

              const centroide = turf.centroid(feature);
              const coords = centroide.geometry.coordinates;

              const icono = L.divIcon({
                className: 'emoji-icon',
                html: `<div style="font-size: 24px;">${emoji}</div>`
              });

              const marcador = L.marker([coords[1], coords[0]], { icon: icono });
              marcador.bindPopup(contenido);
              capas[options.capaId].elementos.push(marcador);
              capas[options.capaId].grupo.addLayer(marcador);
            }
          }
        });
        capas[options.capaId].elementos = capas[options.capaId].elementos.concat(elementos.getLayers());
        capas[options.capaId].grupo.addLayer(elementos);
      }
      actualizarEstadisticas();
    })
    .catch(err => console.error(`Error al cargar ${nombreCapa}:`, err));
}

// Cargar capas
cargarCapa('/geo/zonas-riego', 'blue', 'Zona de Riego', { capaId: 'zonas-riego' });
cargarCapa('/geo/tipos-cultivo', 'green', 'Tipo de Cultivo', { capaId: 'tipos-cultivo' });
cargarCapa('/geo/sensores', '#ff4444', 'Sensor', { 
  isPoint: true, 
  emoji: '📡',
  capaId: 'sensores'
});
cargarCapa('/geo/pozos', '#4444ff', 'Pozo', { 
  isPoint: true, 
  emoji: '💧',
  capaId: 'pozos'
});
cargarCapa('/geo/parcelas', '#44ff44', 'Parcela', { 
  isPoint: true, 
  emoji: '🌱',
  capaId: 'parcelas'
});

// Agregar las capas al mapa
Object.values(capas).forEach(capa => capa.grupo.addTo(map));

// Función para actualizar estadísticas
function actualizarEstadisticas() {
  const stats = document.getElementById('statistics');
  stats.innerHTML = '';

  Object.entries(capas).forEach(([id, capa]) => {
    const total = capa.elementos.length;
    const activos = capa.elementos.filter(el => 
      el.feature && el.feature.properties.estado && 
      el.feature.properties.estado.toLowerCase() === 'activo'
    ).length;

    const statItem = document.createElement('div');
    statItem.className = 'stat-item';
    statItem.innerHTML = `
      <span class="stat-label">${capa.emoji} ${id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
      <span class="stat-value">${total} (${activos} activos)</span>
    `;
    stats.appendChild(statItem);
  });
}

// Función para buscar elementos
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  
  Object.values(capas).forEach(capa => {
    capa.elementos.forEach(elemento => {
      if (elemento.feature && elemento.feature.properties) {
        const props = elemento.feature.properties;
        const matchesSearch = Object.values(props).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm)
        );
        
        if (matchesSearch) {
          elemento.setOpacity(1);
        } else {
          elemento.setOpacity(0.2);
        }
      }
    });
  });
});

// Manejar eventos de checkbox para mostrar/ocultar capas
document.querySelectorAll('.layer-item input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    const capaId = this.id;
    if (this.checked) {
      capas[capaId].grupo.addTo(map);
    } else {
      capas[capaId].grupo.removeFrom(map);
    }
  });
});

// Manejar filtros
document.getElementById('estado-filter').addEventListener('change', function() {
  const estado = this.value.toLowerCase();
  
  Object.values(capas).forEach(capa => {
    capa.elementos.forEach(elemento => {
      if (elemento.feature && elemento.feature.properties) {
        const elementoEstado = elemento.feature.properties.estado;
        if (estado === 'todos' || (elementoEstado && elementoEstado.toLowerCase() === estado)) {
          elemento.setOpacity(1);
        } else {
          elemento.setOpacity(0.2);
        }
      }
    });
  });
});

document.getElementById('tipo-cultivo-filter').addEventListener('change', function() {
  const tipoCultivo = this.value.toLowerCase();
  
  capas['tipos-cultivo'].elementos.forEach(elemento => {
    if (elemento.feature && elemento.feature.properties) {
      const cultivo = elemento.feature.properties.cultivo;
      if (tipoCultivo === 'todos' || (cultivo && cultivo.toLowerCase().includes(tipoCultivo))) {
        elemento.setOpacity(1);
      } else {
        elemento.setOpacity(0.2);
      }
    }
  });
});

// Función para medir distancia
function limpiarMedicion() {
  puntosMedicion.forEach(punto => map.removeLayer(punto));
  puntosMedicion = [];
  if (lineaMedicion) map.removeLayer(lineaMedicion);
  lineaMedicion = null;
}

document.getElementById('measure-distance').addEventListener('click', function() {
  this.classList.toggle('active');
  medicionActiva = !medicionActiva;
  
  if (!medicionActiva) {
    limpiarMedicion();
  }
});

map.on('click', function(e) {
  if (!medicionActiva) return;

  const punto = L.circleMarker(e.latlng, {
    color: '#ff4444',
    fillColor: '#ff4444',
    fillOpacity: 1,
    radius: 5
  }).addTo(map);
  
  puntosMedicion.push(punto);

  if (puntosMedicion.length === 2) {
    const punto1 = puntosMedicion[0].getLatLng();
    const punto2 = puntosMedicion[1].getLatLng();
    
    if (lineaMedicion) map.removeLayer(lineaMedicion);
    
    lineaMedicion = L.polyline([punto1, punto2], {
      color: '#ff4444',
      weight: 2,
      dashArray: '5, 10'
    }).addTo(map);

    const distancia = punto1.distanceTo(punto2);
    const distanciaKm = (distancia / 1000).toFixed(2);
    
    lineaMedicion.bindTooltip(
      `Distancia: ${distanciaKm} km`,
      { permanent: true, className: 'distance-tooltip' }
    );

    // Reiniciar después de 2 segundos
    setTimeout(() => {
      limpiarMedicion();
      document.getElementById('measure-distance').classList.remove('active');
      medicionActiva = false;
    }, 2000);
  }
});

// Toggle clustering
document.getElementById('toggle-clustering').addEventListener('click', function() {
  this.classList.toggle('active');
  const clustering = this.classList.contains('active');
  
  ['sensores', 'pozos', 'parcelas'].forEach(tipo => {
    map.removeLayer(capas[tipo].grupo);
    if (clustering) {
      capas[tipo].grupo = L.markerClusterGroup();
    } else {
      capas[tipo].grupo = L.layerGroup();
    }
    capas[tipo].elementos.forEach(elemento => capas[tipo].grupo.addLayer(elemento));
    capas[tipo].grupo.addTo(map);
  });
});

// Crear leyenda
const legend = document.querySelector('.legend');
Object.entries(capas).forEach(([id, capa]) => {
  const item = document.createElement('div');
  item.className = 'legend-item';
  
  const color = document.createElement('div');
  color.className = 'legend-color';
  color.style.backgroundColor = capa.color;
  
  const label = document.createElement('span');
  label.textContent = `${capa.emoji || ''} ${id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  
  item.appendChild(color);
  item.appendChild(label);
  legend.appendChild(item);
});

// Agregar estilos CSS para los iconos personalizados
const style = document.createElement('style');
style.textContent = `
  .custom-icon {
    text-align: center;
    line-height: 16px;
  }
  .emoji-icon {
    text-align: center;
  }
`;
document.head.appendChild(style);

// Función para mostrar resultados
function mostrarResultado(mensaje, tipo = 'info') {
  const resultados = document.getElementById('analysis-results');
  const resultado = document.createElement('div');
  resultado.className = `result-item ${tipo}`;
  resultado.textContent = mensaje;
  resultados.insertBefore(resultado, resultados.firstChild);

  // Limitar a 10 resultados
  while (resultados.children.length > 10) {
    resultados.removeChild(resultados.lastChild);
  }
}

// Función para crear buffer
document.getElementById('create-buffer').addEventListener('click', function() {
  // Limpiar buffer anterior
  if (bufferLayer) {
    map.removeLayer(bufferLayer);
  }

  const radio = parseFloat(document.getElementById('buffer-radius').value);
  const elementosSeleccionados = [];

  // Recolectar elementos seleccionados
  Object.values(capas).forEach(capa => {
    capa.elementos.forEach(elemento => {
      if (elemento.feature) {
        elementosSeleccionados.push(elemento);
      }
    });
  });

  if (elementosSeleccionados.length === 0) {
    mostrarResultado('No hay elementos para crear buffer', 'warning');
    return;
  }

  // Crear buffer para cada elemento
  const buffers = elementosSeleccionados.map(elemento => {
    const coords = elemento.getLatLng ? 
      [elemento.getLatLng().lng, elemento.getLatLng().lat] :
      elemento.feature.geometry.coordinates;
    
    return turf.buffer(
      turf.point(coords),
      radio / 1000, // Convertir metros a kilómetros
      { units: 'kilometers' }
    );
  });

  // Unir todos los buffers
  const bufferUnion = turf.union(...buffers);
  
  // Agregar al mapa
  bufferLayer = L.geoJSON(bufferUnion, {
    className: 'buffer-layer'
  }).addTo(map);

  mostrarResultado(`Buffer creado con radio de ${radio} metros`, 'success');
});

// Función para encontrar vecinos
document.getElementById('find-neighbors').addEventListener('click', function() {
  neighborLines.clearLayers();
  const radio = parseFloat(document.getElementById('neighbor-radius').value);
  const puntos = [];

  // Recolectar todos los puntos
  ['sensores', 'pozos', 'parcelas'].forEach(tipo => {
    capas[tipo].elementos.forEach(elemento => {
      if (elemento.getLatLng) {
        puntos.push({
          tipo,
          elemento,
          coords: [elemento.getLatLng().lng, elemento.getLatLng().lat]
        });
      }
    });
  });

  let conexiones = 0;
  
  // Buscar vecinos para cada punto
  puntos.forEach((punto, i) => {
    const otros = puntos.slice(i + 1);
    otros.forEach(otro => {
      const from = turf.point(punto.coords);
      const to = turf.point(otro.coords);
      const distancia = turf.distance(from, to, { units: 'kilometers' });

      if (distancia <= radio / 1000) { // Convertir metros a kilómetros
        // Dibujar línea entre vecinos
        const linea = L.polyline(
          [
            [punto.coords[1], punto.coords[0]],
            [otro.coords[1], otro.coords[0]]
          ],
          { className: 'neighbor-line' }
        );
        neighborLines.addLayer(linea);
        conexiones++;
      }
    });
  });

  mostrarResultado(`Se encontraron ${conexiones} conexiones entre vecinos`, 'success');
});

// Función para analizar intersecciones
document.getElementById('analyze-intersection').addEventListener('click', function() {
  if (intersectionLayer) {
    map.removeLayer(intersectionLayer);
  }

  const zonasRiego = [];
  const tiposCultivo = [];

  // Recolectar polígonos
  capas['zonas-riego'].elementos.forEach(elemento => {
    if (elemento.feature) {
      zonasRiego.push(elemento.feature);
    }
  });

  capas['tipos-cultivo'].elementos.forEach(elemento => {
    if (elemento.feature) {
      tiposCultivo.push(elemento.feature);
    }
  });

  if (zonasRiego.length === 0 || tiposCultivo.length === 0) {
    mostrarResultado('No hay suficientes polígonos para analizar', 'warning');
    return;
  }

  let intersecciones = [];

  // Calcular intersecciones
  zonasRiego.forEach(zona => {
    tiposCultivo.forEach(cultivo => {
      try {
        const intersection = turf.intersect(zona, cultivo);
        if (intersection) {
          intersecciones.push({
            intersection,
            zonaRiego: zona.properties.nombre,
            tipoCultivo: cultivo.properties.cultivo
          });
        }
      } catch (error) {
        console.error('Error al calcular intersección:', error);
      }
    });
  });

  // Mostrar intersecciones en el mapa
  if (intersecciones.length > 0) {
    intersectionLayer = L.geoJSON(
      turf.featureCollection(intersecciones.map(i => i.intersection)),
      { className: 'intersection-layer' }
    ).addTo(map);

    mostrarResultado(
      `Se encontraron ${intersecciones.length} intersecciones entre zonas de riego y cultivos`,
      'success'
    );

    // Mostrar detalles de cada intersección
    intersecciones.forEach(({ zonaRiego, tipoCultivo }) => {
      mostrarResultado(`Intersección: ${zonaRiego} con ${tipoCultivo}`);
    });
  } else {
    mostrarResultado('No se encontraron intersecciones', 'warning');
  }
});

// Función para calcular áreas
document.getElementById('calculate-areas').addEventListener('click', function() {
  areaLabels.clearLayers();
  let totalArea = 0;
  const areasPorTipo = {};

  // Calcular áreas de polígonos
  ['zonas-riego', 'tipos-cultivo'].forEach(tipo => {
    capas[tipo].elementos.forEach(elemento => {
      if (elemento.feature) {
        try {
          const area = turf.area(elemento.feature);
          const areaHectareas = (area / 10000).toFixed(2); // Convertir a hectáreas
          totalArea += parseFloat(areaHectareas);

          // Agregar al contador por tipo
          const tipoNombre = tipo === 'zonas-riego' ? 'Zonas de Riego' : 'Tipos de Cultivo';
          areasPorTipo[tipoNombre] = (areasPorTipo[tipoNombre] || 0) + parseFloat(areaHectareas);

          // Agregar etiqueta en el mapa
          const centro = turf.center(elemento.feature);
          const label = L.divIcon({
            className: 'area-label',
            html: `${areaHectareas} ha`
          });

          L.marker([centro.geometry.coordinates[1], centro.geometry.coordinates[0]], {
            icon: label
          }).addTo(areaLabels);
        } catch (error) {
          console.error('Error al calcular área:', error);
        }
      }
    });
  });

  // Mostrar resultados
  mostrarResultado(`Área total: ${totalArea.toFixed(2)} hectáreas`, 'success');
  Object.entries(areasPorTipo).forEach(([tipo, area]) => {
    mostrarResultado(`${tipo}: ${area.toFixed(2)} hectáreas`);
  });
});

// Modificar la función contarSensoresActivosEnZonasRiego para usar caché
function contarSensoresActivosEnZonasRiego() {
  limpiarCacheExpirado();
  
  // Generar clave de caché
  const cacheKey = JSON.stringify(
    capas.sensores.elementos
      .filter(s => s.feature.properties.estado.toLowerCase() === 'activo')
      .map(s => s.feature.properties.id)
  );
  
  // Verificar caché
  if (cache.sensoresEnZonas.has(cacheKey)) {
    const resultadosCached = cache.sensoresEnZonas.get(cacheKey);
    mostrarResultado(resultadosCached.mensaje, 'success');
    return;
  }
  
  // Resto del código existente...
  const resultados = [];
  const sensoresActivos = capas.sensores.elementos.filter(sensor => 
    sensor.feature.properties.estado.toLowerCase() === 'activo'
  );
  
  // Optimización: Crear índice espacial para zonas
  const zonasIndex = new Map();
  capas['zonas-riego'].elementos.forEach(zona => {
    const bounds = L.latLngBounds(
      zona.getBounds().getSouthWest(),
      zona.getBounds().getNorthEast()
    );
    zonasIndex.set(zona, bounds);
  });
  
  // Procesar sensores por lotes para mejor rendimiento
  const tamanoLote = 10;
  for (let i = 0; i < sensoresActivos.length; i += tamanoLote) {
    const lote = sensoresActivos.slice(i, i + tamanoLote);
    
    capas['zonas-riego'].elementos.forEach(zona => {
      if (!resultados.find(r => r.zona === zona.feature.properties.nombre)) {
        resultados.push({
          zona: zona.feature.properties.nombre,
          sensoresActivos: 0,
          sensores: []
        });
      }
      
      const resultado = resultados.find(r => r.zona === zona.feature.properties.nombre);
      const zonaBounds = zonasIndex.get(zona);
      
      lote.forEach(sensor => {
        const sensorLatLng = sensor.getLatLng();
        
        // Primero verificar bounds para optimizar
        if (zonaBounds.contains(sensorLatLng)) {
          const sensorPunto = turf.point([sensorLatLng.lng, sensorLatLng.lat]);
          const zonaPoligono = turf.polygon(zona.feature.geometry.coordinates);
          
          if (turf.booleanPointInPolygon(sensorPunto, zonaPoligono)) {
            resultado.sensoresActivos++;
            resultado.sensores.push(sensor);
          }
        }
      });
    });
  }
  
  // Generar mensaje
  let mensaje = '<h4>Sensores Activos por Zona de Riego:</h4>';
  resultados.forEach(r => {
    mensaje += `<p><b>${r.zona}:</b> ${r.sensoresActivos} sensores activos</p>`;
  });
  
  const total = resultados.reduce((sum, r) => sum + r.sensoresActivos, 0);
  mensaje += `<p><b>Total:</b> ${total} sensores activos en zonas de riego</p>`;
  
  // Guardar en caché
  cache.sensoresEnZonas.set(cacheKey, {
    mensaje,
    resultados,
    timestamp: Date.now()
  });
  cache.ultimaActualizacion = Date.now();
  
  mostrarResultado(mensaje, 'success');
  
  // Resaltar sensores (usando requestAnimationFrame para mejor rendimiento)
  requestAnimationFrame(() => {
    resultados.forEach(r => {
      r.sensores.forEach(sensor => {
        sensor.setIcon(L.divIcon({
          className: 'custom-icon-highlight',
          html: `<div style="background-color: #ff4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid yellow;">📡</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        }));
      });
    });
  });
  
  // Restaurar iconos
  setTimeout(() => {
    requestAnimationFrame(() => {
      sensoresActivos.forEach(sensor => {
        sensor.setIcon(L.divIcon({
          className: 'custom-icon',
          html: `<div style="background-color: #ff4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;">📡</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        }));
      });
    });
  }, 3000);
}

// Función mejorada para medir distancia entre pozos
function medirDistanciaEntrePozos() {
  let midiendo = false;
  let pozosSeleccionados = [];
  let lineasDistancia = L.layerGroup().addTo(map);
  
  function limpiarMedicion() {
    lineasDistancia.clearLayers();
    pozosSeleccionados = [];
    midiendo = false;
    capas.pozos.elementos.forEach(pozo => {
      pozo.setIcon(L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color: #4444ff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;">💧</div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      }));
    });
  }

  limpiarMedicion();
  
  // Activar modo medición
  midiendo = true;
  mostrarResultado('Selecciona dos pozos para medir la distancia entre ellos', 'info');
  
  // Añadir eventos temporales a los pozos
  capas.pozos.elementos.forEach(pozo => {
    pozo.on('click', function() {
      if (!midiendo) return;
      
      pozosSeleccionados.push(pozo);
      pozo.setIcon(L.divIcon({
        className: 'custom-icon-selected',
        html: `<div style="background-color: #4444ff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid yellow;">💧</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      }));
      
      if (pozosSeleccionados.length === 2) {
        const punto1 = turf.point([
          pozosSeleccionados[0].getLatLng().lng,
          pozosSeleccionados[0].getLatLng().lat
        ]);
        const punto2 = turf.point([
          pozosSeleccionados[1].getLatLng().lng,
          pozosSeleccionados[1].getLatLng().lat
        ]);
        
        // Calcular distancia
        const distancia = turf.distance(punto1, punto2, {units: 'kilometers'});
        
        // Dibujar línea
        const linea = L.polyline([
          pozosSeleccionados[0].getLatLng(),
          pozosSeleccionados[1].getLatLng()
        ], {
          color: 'yellow',
          weight: 3,
          dashArray: '5, 10'
        });
        
        // Añadir etiqueta con distancia
        const centro = L.latLng(
          (pozosSeleccionados[0].getLatLng().lat + pozosSeleccionados[1].getLatLng().lat) / 2,
          (pozosSeleccionados[0].getLatLng().lng + pozosSeleccionados[1].getLatLng().lng) / 2
        );
        
        const etiqueta = L.divIcon({
          className: 'distance-label',
          html: `<div style="background-color: white; padding: 5px; border-radius: 5px; border: 2px solid yellow;">
                   <b>${distancia.toFixed(2)} km</b>
                 </div>`,
          iconSize: [80, 30],
          iconAnchor: [40, 15]
        });
        
        lineasDistancia.addLayer(linea);
        lineasDistancia.addLayer(L.marker(centro, {icon: etiqueta}));
        
        // Mostrar resultado
        mostrarResultado(`
          <h4>Distancia entre Pozos:</h4>
          <p><b>Pozo 1:</b> ${pozosSeleccionados[0].feature.properties.nombre}</p>
          <p><b>Pozo 2:</b> ${pozosSeleccionados[1].feature.properties.nombre}</p>
          <p><b>Distancia:</b> ${distancia.toFixed(2)} kilómetros</p>
        `, 'success');
        
        // Limpiar después de 5 segundos
        setTimeout(limpiarMedicion, 5000);
      }
    });
  });
}

// Añadir botones al panel de control
const controlSection = document.querySelector('.control-section');
const analysisButtons = document.createElement('div');
analysisButtons.className = 'analysis-buttons';
analysisButtons.innerHTML = `
  <button id="contar-sensores" class="tool-button">📊 Contar Sensores en Zonas</button>
  <button id="medir-pozos" class="tool-button">📏 Medir entre Pozos</button>
`;
controlSection.appendChild(analysisButtons);

// Eventos para los nuevos botones
document.getElementById('contar-sensores').addEventListener('click', contarSensoresActivosEnZonasRiego);
document.getElementById('medir-pozos').addEventListener('click', medirDistanciaEntrePozos);

// Optimizar la carga inicial de datos
document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos en paralelo
  Promise.all([
    fetch('/geo/zonas-riego').then(res => res.json()),
    fetch('/geo/tipos-cultivo').then(res => res.json()),
    fetch('/geo/sensores').then(res => res.json()),
    fetch('/geo/pozos').then(res => res.json()),
    fetch('/geo/parcelas').then(res => res.json())
  ]).then(([zonasRiego, tiposCultivo, sensores, pozos, parcelas]) => {
    // Procesar datos en lotes
    requestAnimationFrame(() => {
      procesarCapa(zonasRiego, 'zonas-riego', 'blue', 'Zona de Riego');
      procesarCapa(tiposCultivo, 'tipos-cultivo', 'green', 'Tipo de Cultivo');
    });
    
    requestAnimationFrame(() => {
      procesarCapa(sensores, 'sensores', '#ff4444', 'Sensor', true, '📡');
      procesarCapa(pozos, 'pozos', '#4444ff', 'Pozo', true, '💧');
      procesarCapa(parcelas, 'parcelas', '#44ff44', 'Parcela', true, '🌱');
    });
  }).catch(err => console.error('Error cargando datos:', err));
});
