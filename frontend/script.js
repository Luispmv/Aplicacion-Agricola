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
  document.querySelector('.buffer-results').style.display = 'block';

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
