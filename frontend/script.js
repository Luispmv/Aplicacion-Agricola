const map = L.map('map').setView([21.0, -101.0], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

fetch('http://localhost:3000/geo/zonas-riego')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: 'blue' },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`Zona: ${feature.properties.nombre}`);
      }
    }).addTo(map);
  });

fetch('http://localhost:3000/geo/tipos-cultivo')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: 'green', fillOpacity: 0.5 },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`Cultivo: ${feature.properties.cultivo}`);
      }
    }).addTo(map);
  });
