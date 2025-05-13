// Crear el mapa
const map = L.map('map').setView([21.12, -101.68], 12); // Ajusta a tu zona

// Agregar mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Función para cargar y agregar GeoJSON con popup
function cargarCapa(url, color, nombreCapa, options = {}) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (options.isPoint) {
        // Para puntos, usamos marcadores personalizados
        L.geoJSON(data, {
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
          }
        }).addTo(map);
      } else {
        // Para polígonos, usamos el código existente
        L.geoJSON(data, {
          style: function(feature) {
            let colorFinal = color;

            if (nombreCapa === 'Tipo de Cultivo') {
              const cultivo = feature.properties.cultivo.toLowerCase();
              switch (cultivo) {
                case 'maíz':
                  colorFinal = '#f5e663'; break;
                case 'trigo':
                  colorFinal = '#d2b48c'; break;
                case 'caña de azúcar':
                  colorFinal = '#66bb66'; break;
                case 'frijol':
                  colorFinal = '#8b4513'; break;
                case 'tomate':
                  colorFinal = '#ff4c4c'; break;
                case 'aguacate':
                  colorFinal = '#3d9140'; break;
                case 'uva':
                  colorFinal = '#8e44ad'; break;
                case 'limón':
                  colorFinal = '#c4e538'; break;
                case 'sandia':
                  colorFinal = "red"; break;
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

            if (nombreCapa === 'Tipo de Cultivo') {
              const cultivo = feature.properties.cultivo;
              let emoji = '🌳';

              switch (cultivo.toLowerCase()) {
                case 'maíz':
                  emoji = '🌽'; break;
                case 'trigo':
                  emoji = '🌾'; break;
                case 'caña de azúcar':
                  emoji = '🍬'; break;
                case 'frijol':
                  emoji = '🫘'; break;
                case 'tomate':
                  emoji = '🍅'; break;
                case 'aguacate':
                  emoji = '🥑'; break;
                case 'uva':
                  emoji = '🍇'; break;
                case 'limón':
                  emoji = '🍋'; break;
                case 'sandia':
                  emoji = '🍉'; break;
              }

              const centroide = turf.centroid(feature);
              const coords = centroide.geometry.coordinates;

              const icono = L.divIcon({
                className: 'emoji-icon',
                html: `<div style="font-size: 24px;">${emoji}</div>`
              });

              const marcador = L.marker([coords[1], coords[0]], { icon: icono }).addTo(map);
              marcador.bindPopup(contenido);
            }
          }
        }).addTo(map);
      }
    })
    .catch(err => console.error(`Error al cargar ${nombreCapa}:`, err));
}

// Cargar capas de polígonos
cargarCapa('/geo/zonas-riego', 'blue', 'Zona de Riego');
cargarCapa('/geo/tipos-cultivo', 'green', 'Tipo de Cultivo');

// Cargar capas de puntos con sus respectivos colores y emojis
cargarCapa('/geo/sensores', '#ff4444', 'Sensor', { 
  isPoint: true, 
  emoji: '📡'
});

cargarCapa('/geo/pozos', '#4444ff', 'Pozo', { 
  isPoint: true, 
  emoji: '💧'
});

cargarCapa('/geo/parcelas', '#44ff44', 'Parcela', { 
  isPoint: true, 
  emoji: '🌱'
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
