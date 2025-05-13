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

// Función para inicializar los eventos de las capas
function inicializarEventosCapas() {
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
        capas[options.capaId].elementos = elementos.getLayers();
        capas[options.capaId].grupo.addLayer(elementos);
        capas[options.capaId].grupo.addTo(map);
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
        capas[options.capaId].grupo.addTo(map);
      }
      inicializarEventosCapas();
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

// Función para aplicar filtros
function aplicarFiltros() {
  const estado = document.getElementById('estado-filter').value.toLowerCase();

  // Recorrer las capas de sensores y pozos
  ['sensores', 'pozos'].forEach(nombreCapa => {
    const capa = capas[nombreCapa];
    if (!capa) return;

    capa.elementos.forEach(elemento => {
      if (!elemento.feature || !elemento.feature.properties) return;

      const props = elemento.feature.properties;
      let mostrar = true;

      // Aplicar filtro de estado
      if (estado !== 'todos') {
        const elementoEstado = props.estado ? props.estado.toLowerCase() : null;
        if (elementoEstado !== estado) {
          mostrar = false;
        }
      }

      // Aplicar visibilidad
      if (mostrar) {
        elemento.setOpacity(1);
        if (elemento.setStyle) {
          elemento.setStyle({ opacity: 1, fillOpacity: 0.4 });
        }
      } else {
        elemento.setOpacity(0.1);
        if (elemento.setStyle) {
          elemento.setStyle({ opacity: 0.1, fillOpacity: 0.1 });
        }
      }
    });
  });
}

// Función para restablecer filtros
function restablecerFiltros() {
  document.getElementById('estado-filter').value = 'todos';
  
  ['sensores', 'pozos'].forEach(nombreCapa => {
    const capa = capas[nombreCapa];
    if (!capa) return;

    capa.elementos.forEach(elemento => {
      elemento.setOpacity(1);
      if (elemento.setStyle) {
        elemento.setStyle({ opacity: 1, fillOpacity: 0.4 });
      }
    });
  });
}

// Inicializar eventos cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  // Eventos para los botones de filtro
  const btnAplicarFiltros = document.getElementById('aplicar-filtros');
  if (btnAplicarFiltros) {
    btnAplicarFiltros.addEventListener('click', aplicarFiltros);
  }

  const btnRestablecerFiltros = document.getElementById('restablecer-filtros');
  if (btnRestablecerFiltros) {
    btnRestablecerFiltros.addEventListener('click', restablecerFiltros);
  }
});

// Variables para el buffer dinámico
let bufferMode = false;
let selectedPoint = null;
let bufferLayer = null;
let bufferCircle = null;
let elementsInBuffer = new Set();

// Función para iniciar el modo buffer
function startBufferMode() {
  bufferMode = true;
  document.getElementById('start-buffer').disabled = true;
  document.getElementById('apply-buffer').disabled = true;
  map.getContainer().style.cursor = 'crosshair';
  
  // Deshabilitar el movimiento del mapa
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  if (map.tap) map.tap.disable();
}

// Función para crear o actualizar el buffer
function updateBuffer(latlng) {
  const radius = parseFloat(document.getElementById('buffer-radius').value);
  
  // Limpiar buffer anterior
  if (bufferLayer) {
    map.removeLayer(bufferLayer);
  }
  if (bufferCircle) {
    map.removeLayer(bufferCircle);
  }

  // Crear círculo visual
  bufferCircle = L.circle(latlng, {
    radius: radius,
    color: '#2196F3',
    fillColor: '#2196F3',
    fillOpacity: 0.2,
    weight: 2
  }).addTo(map);

  // Crear buffer usando Turf.js
  const point = turf.point([latlng.lng, latlng.lat]);
  const buffered = turf.buffer(point, radius / 1000, { units: 'kilometers' });
  
  bufferLayer = L.geoJSON(buffered, {
    style: {
      color: '#2196F3',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0
    }
  }).addTo(map);

  // Habilitar botón de aplicar
  document.getElementById('apply-buffer').disabled = false;
  document.getElementById('clear-buffer').disabled = false;
}

// Función para encontrar elementos dentro del buffer
function findElementsInBuffer() {
  if (!bufferLayer) return;

  elementsInBuffer.clear();
  const bufferPolygon = bufferLayer.toGeoJSON().features[0];

  // Objeto para almacenar conteos
  const conteos = {
    sensores: 0,
    pozos: 0,
    parcelas: 0,
    'zonas-riego': 0,
    'tipos-cultivo': 0
  };

  Object.entries(capas).forEach(([capaId, capa]) => {
    capa.elementos.forEach(elemento => {
      let punto;
      if (elemento.getLatLng) {
        // Para marcadores (puntos)
        const latlng = elemento.getLatLng();
        punto = turf.point([latlng.lng, latlng.lat]);
      } else if (elemento.feature) {
        // Para polígonos, usar el centroide
        punto = turf.centroid(elemento.feature);
      }

      if (punto && turf.booleanPointInPolygon(punto, bufferPolygon)) {
        elementsInBuffer.add(elemento);
        conteos[capaId]++;
        
        // Resaltar elemento
        if (elemento.setStyle) {
          elemento.setStyle({
            color: '#4CAF50',
            weight: 3,
            fillOpacity: 0.6
          });
        } else if (elemento.setIcon) {
          // Crear un nuevo icono resaltado basado en el tipo de elemento
          let emoji = '';
          switch(capaId) {
            case 'sensores': emoji = '📡'; break;
            case 'pozos': emoji = '💧'; break;
            case 'parcelas': emoji = '🌱'; break;
            default: emoji = '📍';
          }

          elemento.setIcon(L.divIcon({
            className: 'highlighted-icon',
            html: `<div style="background-color: #4CAF50; width: 24px; height: 24px; border-radius: 50%; border: 3px solid yellow; display: flex; align-items: center; justify-content: center;">${emoji}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          }));
        }
      }
    });
  });

  // Actualizar contadores en la interfaz
  Object.entries(conteos).forEach(([capaId, cantidad]) => {
    const contador = document.getElementById(`${capaId}-count`);
    if (contador) {
      contador.textContent = cantidad;
    }
  });

  // Mostrar el panel de resultados
  const bufferResults = document.querySelector('.buffer-results');
  bufferResults.style.display = 'flex';

  // Mostrar cantidad total de elementos encontrados
  const total = elementsInBuffer.size;
  alert(`Se encontraron ${total} elementos dentro del buffer`);
}

// Función para limpiar el buffer
function clearBuffer() {
  if (bufferLayer) {
    map.removeLayer(bufferLayer);
  }
  if (bufferCircle) {
    map.removeLayer(bufferCircle);
  }
  
  // Restaurar estilos originales
  elementsInBuffer.forEach(elemento => {
    if (elemento.setStyle) {
      elemento.setStyle({
        color: elemento.options.originalColor || '#3388ff',
        weight: 2,
        fillOpacity: 0.4
      });
    } else if (elemento.setIcon) {
      const originalIcon = elemento.options.icon.options.html;
      elemento.setIcon(L.divIcon({
        className: 'custom-icon',
        html: originalIcon,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      }));
    }
  });

  // Limpiar contadores
  Object.keys(capas).forEach(capaId => {
    const contador = document.getElementById(`${capaId}-count`);
    if (contador) {
      contador.textContent = '0';
    }
  });

  // Ocultar el panel de resultados
  document.querySelector('.buffer-results').style.display = 'none';

  elementsInBuffer.clear();
  bufferMode = false;
  selectedPoint = null;
  bufferLayer = null;
  bufferCircle = null;
  
  // Restaurar botones y controles del mapa
  document.getElementById('start-buffer').disabled = false;
  document.getElementById('apply-buffer').disabled = true;
  document.getElementById('clear-buffer').disabled = true;
  map.getContainer().style.cursor = '';

  // Habilitar el movimiento del mapa
  map.dragging.enable();
  map.touchZoom.enable();
  map.doubleClickZoom.enable();
  map.scrollWheelZoom.enable();
  map.boxZoom.enable();
  map.keyboard.enable();
  if (map.tap) map.tap.enable();
}

// Eventos para el buffer
map.on('click', function(e) {
  if (bufferMode) {
    selectedPoint = e.latlng;
    updateBuffer(selectedPoint);
  }
});

// Eventos para los botones de buffer
document.getElementById('start-buffer').addEventListener('click', startBufferMode);
document.getElementById('apply-buffer').addEventListener('click', findElementsInBuffer);
document.getElementById('clear-buffer').addEventListener('click', clearBuffer);

// Eventos para ajustar el radio del buffer
document.getElementById('increase-buffer').addEventListener('click', function() {
  const input = document.getElementById('buffer-radius');
  input.value = Math.min(parseInt(input.value) + 10, 1000);
  if (selectedPoint) {
    updateBuffer(selectedPoint);
  }
});

document.getElementById('decrease-buffer').addEventListener('click', function() {
  const input = document.getElementById('buffer-radius');
  input.value = Math.max(parseInt(input.value) - 10, 10);
  if (selectedPoint) {
    updateBuffer(selectedPoint);
  }
});

document.getElementById('buffer-radius').addEventListener('input', function() {
  if (selectedPoint) {
    updateBuffer(selectedPoint);
  }
});

// Agregar estilos para los elementos resaltados
const highlightStyle = document.createElement('style');
highlightStyle.textContent = `
  .highlighted-icon {
    transform: scale(1.2);
    transition: transform 0.2s;
  }
`;
document.head.appendChild(highlightStyle);

// Variables para medición de distancia
let medicionActiva = false;
let puntosSeleccionados = [];
let lineaMedicion = null;

// Función para iniciar medición
function iniciarMedicion() {
  medicionActiva = true;
  document.getElementById('start-distance').disabled = true;
  document.getElementById('clear-distance').disabled = false;
  map.getContainer().style.cursor = 'crosshair';
  
  // Mostrar el panel de resultados
  document.querySelector('.distance-results').style.display = 'flex';

  // Deshabilitar controles del mapa
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  if (map.tap) map.tap.disable();

  // Habilitar eventos de clic solo en pozos y sensores
  ['pozos', 'sensores'].forEach(tipo => {
    capas[tipo].elementos.forEach(elemento => {
      elemento.on('click', manejarSeleccionPunto);
    });
  });
}

// Función para manejar la selección de puntos
function manejarSeleccionPunto(e) {
  if (!medicionActiva) return;

  const elemento = e.target;
  const tipo = elemento.feature.properties.tipo || 
               (capas.pozos.elementos.includes(elemento) ? 'Pozo' : 'Sensor');
  const nombre = elemento.feature.properties.nombre || 'Sin nombre';

  puntosSeleccionados.push({
    elemento: elemento,
    tipo: tipo,
    nombre: nombre,
    latlng: elemento.getLatLng()
  });

  // Actualizar información en el panel
  const index = puntosSeleccionados.length;
  document.getElementById(`punto${index}-info`).textContent = 
    `${tipo}: ${nombre}`;

  // Resaltar el punto seleccionado
  elemento.setIcon(L.divIcon({
    className: 'selected-point',
    html: `<div style="background-color: #FF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid yellow; display: flex; align-items: center; justify-content: center;">
           ${tipo === 'Pozo' ? '💧' : '📡'}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }));

  // Si ya tenemos dos puntos, calcular la distancia
  if (puntosSeleccionados.length === 2) {
    calcularDistancia();
  }
}

// Función para calcular la distancia
function calcularDistancia() {
  const punto1 = puntosSeleccionados[0].latlng;
  const punto2 = puntosSeleccionados[1].latlng;

  // Eliminar línea anterior si existe
  if (lineaMedicion) {
    map.removeLayer(lineaMedicion);
  }

  // Dibujar línea entre puntos
  lineaMedicion = L.polyline([punto1, punto2], {
    color: '#FF4444',
    weight: 3,
    dashArray: '5, 10'
  }).addTo(map);

  // Calcular distancia usando Turf.js
  const from = turf.point([punto1.lng, punto1.lat]);
  const to = turf.point([punto2.lng, punto2.lat]);
  const distancia = turf.distance(from, to, { units: 'kilometers' });

  // Mostrar distancia en el formato más apropiado
  let distanciaTexto;
  if (distancia < 1) {
    distanciaTexto = `${Math.round(distancia * 1000)} metros`;
  } else {
    distanciaTexto = `${distancia.toFixed(2)} kilómetros`;
  }

  document.getElementById('distance-value').textContent = distanciaTexto;

  // Centrar el mapa para mostrar ambos puntos
  const bounds = L.latLngBounds([punto1, punto2]);
  map.fitBounds(bounds, { padding: [50, 50] });
}

// Función para limpiar medición
function limpiarMedicion() {
  // Eliminar línea de medición
  if (lineaMedicion) {
    map.removeLayer(lineaMedicion);
  }

  // Restaurar iconos originales
  puntosSeleccionados.forEach(punto => {
    const tipo = punto.tipo === 'Pozo' ? 'pozos' : 'sensores';
    punto.elemento.setIcon(L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color: ${capas[tipo].color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;">
             ${punto.tipo === 'Pozo' ? '💧' : '📡'}</div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    }));
  });

  // Restablecer variables
  medicionActiva = false;
  puntosSeleccionados = [];
  lineaMedicion = null;

  // Restablecer interfaz
  document.getElementById('start-distance').disabled = false;
  document.getElementById('clear-distance').disabled = true;
  document.getElementById('punto1-info').textContent = 'No seleccionado';
  document.getElementById('punto2-info').textContent = 'No seleccionado';
  document.getElementById('distance-value').textContent = '-';
  document.querySelector('.distance-results').style.display = 'none';
  map.getContainer().style.cursor = '';

  // Habilitar controles del mapa
  map.dragging.enable();
  map.touchZoom.enable();
  map.doubleClickZoom.enable();
  map.scrollWheelZoom.enable();
  map.boxZoom.enable();
  map.keyboard.enable();
  if (map.tap) map.tap.enable();

  // Remover eventos de clic
  ['pozos', 'sensores'].forEach(tipo => {
    capas[tipo].elementos.forEach(elemento => {
      elemento.off('click', manejarSeleccionPunto);
    });
  });
}

// Agregar eventos a los botones
document.getElementById('start-distance').addEventListener('click', iniciarMedicion);
document.getElementById('clear-distance').addEventListener('click', limpiarMedicion);

// Variables para centroides
let centroideActual = null;
let marcadorCentroide = null;

// Función para habilitar/deshabilitar botones de centroide
function actualizarBotonesCentroide() {
  const cultivoSelect = document.getElementById('cultivo-select');
  const calcularBtn = document.getElementById('calculate-centroid');
  const limpiarBtn = document.getElementById('clear-centroid');
  
  calcularBtn.disabled = !cultivoSelect.value;
  limpiarBtn.disabled = !centroideActual;
}

// Función para calcular el centroide
function calcularCentroide() {
  const cultivoSeleccionado = document.getElementById('cultivo-select').value;
  if (!cultivoSeleccionado) return;

  // Limpiar centroide anterior
  limpiarCentroide();

  // Encontrar todos los polígonos del cultivo seleccionado
  const poligonosCultivo = capas['tipos-cultivo'].elementos.filter(elemento => 
    elemento.feature && 
    elemento.feature.properties.cultivo && 
    elemento.feature.properties.cultivo.toLowerCase() === cultivoSeleccionado.toLowerCase()
  );

  if (poligonosCultivo.length === 0) {
    alert('No se encontraron áreas para este tipo de cultivo');
    return;
  }

  // Unir todos los polígonos del mismo cultivo
  let unionFeature;
  try {
    unionFeature = poligonosCultivo.reduce((union, poligono) => {
      const feature = poligono.feature;
      if (!union) return feature;
      return turf.union(union, feature);
    }, null);
  } catch (error) {
    console.error('Error al unir polígonos:', error);
    return;
  }

  // Calcular el centroide
  const centroide = turf.centroid(unionFeature);
  const coords = centroide.geometry.coordinates;

  // Crear marcador del centroide
  marcadorCentroide = L.circleMarker([coords[1], coords[0]], {
    radius: 8,
    color: 'red',
    fillColor: '#ff4444',
    fillOpacity: 0.7,
    weight: 2
  }).addTo(map);

  // Crear círculo decorativo alrededor del centroide
  centroideActual = L.circle([coords[1], coords[0]], {
    radius: 50,
    color: 'red',
    fillColor: '#ff4444',
    fillOpacity: 0.2,
    weight: 1,
    dashArray: '5, 10'
  }).addTo(map);

  // Actualizar panel de resultados
  document.getElementById('cultivo-info').textContent = 
    `${getEmojiCultivo(cultivoSeleccionado)} ${cultivoSeleccionado}`;
  document.getElementById('coords-info').textContent = 
    `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
  document.querySelector('.centroid-results').style.display = 'flex';

  // Zoom al centroide
  map.setView([coords[1], coords[0]], 16);

  // Actualizar estado de botones
  actualizarBotonesCentroide();
}

// Función para obtener el emoji del cultivo
function getEmojiCultivo(cultivo) {
  const emojis = {
    'maíz': '🌽',
    'trigo': '🌾',
    'caña de azúcar': '🍬',
    'frijol': '🫘',
    'tomate': '🍅',
    'aguacate': '🥑',
    'uva': '🍇',
    'limón': '🍋',
    'sandia': '🍉'
  };
  return emojis[cultivo.toLowerCase()] || '🌱';
}

// Función para limpiar el centroide
function limpiarCentroide() {
  if (marcadorCentroide) {
    map.removeLayer(marcadorCentroide);
    marcadorCentroide = null;
  }
  if (centroideActual) {
    map.removeLayer(centroideActual);
    centroideActual = null;
  }

  // Restablecer interfaz
  document.getElementById('cultivo-select').value = '';
  document.getElementById('cultivo-info').textContent = '-';
  document.getElementById('coords-info').textContent = '-';
  document.querySelector('.centroid-results').style.display = 'none';

  // Actualizar estado de botones
  actualizarBotonesCentroide();
}

// Eventos para los controles de centroide
document.getElementById('cultivo-select').addEventListener('change', actualizarBotonesCentroide);
document.getElementById('calculate-centroid').addEventListener('click', calcularCentroide);
document.getElementById('clear-centroid').addEventListener('click', limpiarCentroide);
