require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));


const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});


app.get('/', (req, res) => {
  res.send('Bienvenido a la API de zonas de riego y tipos de cultivo.');
});

app.get('/', (req, res) => {
  res.send('Bienvenido a la API de zonas de riego y tipos de cultivo.');
});


app.get('/geo/zonas-riego', async (req, res) => {
  const query = `
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', jsonb_agg(
        jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::jsonb,
          'properties', to_jsonb(zr) - 'geom'
        )
      )
    ) AS geojson
    FROM zonas_riego zr;
  `;
  const result = await pool.query(query);
  res.json(result.rows[0].geojson);
});

app.get('/geo/tipos-cultivo', async (req, res) => {
  const query = `
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', jsonb_agg(
        jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::jsonb,
          'properties', to_jsonb(tc) - 'geom'
        )
      )
    ) AS geojson
    FROM tipos_cultivo tc;
  `;
  const result = await pool.query(query);
  res.json(result.rows[0].geojson);
});



// =============================================
// Endpoint para Sensores (GeoJSON)
// =============================================
app.get('/geo/sensores', async (req, res) => {
  try {
    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(ubicacion)::jsonb,
            'properties', to_jsonb(s) - 'ubicacion'
          )
        )
      ) AS geojson
      FROM sensores s;
    `;
    const result = await pool.query(query);
    res.json(result.rows[0].geojson);
  } catch (err) {
    console.error('Error al cargar sensores:', err);
    res.status(500).json({ error: 'Error al obtener datos de sensores' });
  }
});

// =============================================
// Endpoint para Pozos (GeoJSON)
// =============================================
app.get('/geo/pozos', async (req, res) => {
  try {
    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(ubicacion)::jsonb,
            'properties', to_jsonb(p) - 'ubicacion'
          )
        )
      ) AS geojson
      FROM pozos p;
    `;
    const result = await pool.query(query);
    res.json(result.rows[0].geojson);
  } catch (err) {
    console.error('Error al cargar pozos:', err);
    res.status(500).json({ error: 'Error al obtener datos de pozos' });
  }
});

// =============================================
// Endpoint para Parcelas (GeoJSON)
// =============================================
app.get('/geo/parcelas', async (req, res) => {
  try {
    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(ubicacion)::jsonb,
            'properties', to_jsonb(parc) - 'ubicacion'
          )
        )
      ) AS geojson
      FROM parcelas parc;
    `;
    const result = await pool.query(query);
    res.json(result.rows[0].geojson);
  } catch (err) {
    console.error('Error al cargar parcelas:', err);
    res.status(500).json({ error: 'Error al obtener datos de parcelas' });
  }
});






app.listen(3000, () => {
  console.log('Servidor backend corriendo en http://localhost:3000');
});
