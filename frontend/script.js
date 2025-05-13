
// Crear el mapa
const map = L.map('map').setView([21.12, -101.68], 10); // Ajusta a tu zona

// Agregar mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Función para cargar y agregar GeoJSON con popup
function cargarCapa(url, color, nombreCapa) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      L.geoJSON(data, {
        style: {
          color: color,
          weight: 2
        },
        onEachFeature: function (feature, layer) {
          let contenido = `<strong>${nombreCapa}</strong><br>`;
          for (const key in feature.properties) {
            contenido += `<b>${key}:</b> ${feature.properties[key]}<br>`;
          }
          layer.bindPopup(contenido);

          // Calcular el centro (centroide) del polígono
          const centroide = turf.centroid(feature);

          // Determinar el emoji según el tipo de capa
          let emoji = nombreCapa.includes("Riego") ? "💧" : "🌳";

          // Agregar un marcador en el centro con el emoji
          const coords = centroide.geometry.coordinates;

          let popupEmoji = `<strong>${nombreCapa}</strong><br>`;
          for (const key in feature.properties) {
            popupEmoji += `<b>${key}:</b> ${feature.properties[key]}<br>`;
          }
          L.marker([coords[1], coords[0]], {
            icon: L.divIcon({
            className: 'emoji-icon',
            html: `<div style="font-size: 24px;">${emoji}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
          }).bindPopup(popupEmoji).addTo(map);
          }
      }).addTo(map);
    })
    .catch(err => console.error(`Error al cargar ${nombreCapa}:`, err));
}


// Cargar capas con popup
cargarCapa('/geo/zonas-riego', 'blue', 'Zona de Riego');
cargarCapa('/geo/tipos-cultivo', 'green', 'Tipo de Cultivo');
