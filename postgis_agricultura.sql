CREATE EXTENSION postgis;

CREATE TABLE sensores (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT,
    estado TEXT,
    fecha_instalacion DATE,
    capacidad NUMERIC,
    unidad_medida TEXT,
    ubicacion GEOMETRY(Point, 4326)
);

CREATE TABLE pozos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    profundidad NUMERIC,
    caudal NUMERIC,
    estado TEXT,
    fecha_construccion DATE,
    tipo_pozo TEXT,
    ubicacion GEOMETRY(Point, 4326)
);


CREATE TABLE parcelas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    cultivo_principal TEXT,
    propietario TEXT,
    area NUMERIC,
    estado TEXT,
    sistema_riego TEXT,
    ubicacion GEOMETRY(Point, 4326)
);



CREATE TABLE zonas_riego (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    metodo TEXT,
    eficiencia NUMERIC,
    responsable TEXT,
    estado TEXT,
    fecha_creacion DATE,
    geom GEOMETRY(Polygon, 4326)
);


CREATE TABLE tipos_cultivo (
    id SERIAL PRIMARY KEY,
    cultivo TEXT,
    temporada TEXT,
    productividad NUMERIC,
    requerimiento_agua TEXT,
    estado TEXT,
    responsable TEXT,
    geom GEOMETRY(Polygon, 4326)
);


// Inserts

INSERT INTO pozos (nombre, profundidad, caudal, estado, fecha_construccion, tipo_pozo, ubicacion)
VALUES
('Pozo Norte', 120, 25, 'Operativo', '2020-06-20', 'Manual', ST_SetSRID(ST_Point(-101.6800, 21.1240), 4326)),
('Pozo Sur', 95, 30, 'En mantenimiento', '2018-09-10', 'Automático', ST_SetSRID(ST_Point(-101.6835, 21.1205), 4326));

INSERT INTO parcelas (nombre, cultivo_principal, propietario, area, estado, sistema_riego, ubicacion)
VALUES
('Parcela 1', 'Maíz', 'Juan Pérez', 2.5, 'Sembrado', 'Goteo', ST_SetSRID(ST_Point(-101.6820, 21.1220), 4326)),
('Parcela 2', 'Trigo', 'María López', 3.1, 'Preparando suelo', 'Aspersión', ST_SetSRID(ST_Point(-101.6845, 21.1195), 4326));

INSERT INTO sensores (nombre, tipo, estado, fecha_instalacion, capacidad, unidad_medida, ubicacion)
VALUES
('Sensor A', 'Humedad', 'Activo', '2024-03-15', 50, 'ml/h', ST_SetSRID(ST_Point(-101.6860, 21.1225), 4326)),
('Sensor B', 'Temperatura', 'Inactivo', '2023-11-10', 20, '°C', ST_SetSRID(ST_Point(-101.6840, 21.1210), 4326)),
('Sensor C', 'PH', 'Activo', '2024-01-08', 5, 'pH', ST_SetSRID(ST_Point(-101.6855, 21.1230), 4326));

INSERT INTO zonas_riego (nombre, tipo_riego, capacidad_litros, estado, fecha_creacion, responsable, geometria)
VALUES (
  'Zona Riego 1', 'Goteo', 50000, 'Operativo', '2022-03-15', 'Ing. Torres',
  ST_SetSRID(ST_GeomFromText('POLYGON((
    -101.6870 21.1210,
    -101.6860 21.1210,
    -101.6860 21.1220,
    -101.6870 21.1220,
    -101.6870 21.1210
  ))'), 4326)
);


INSERT INTO zonas_riego (
    nombre, metodo, eficiencia, responsable, estado, fecha_creacion, geom
) VALUES (
    'Zona Riego 1', 'Aspersión', 75.5, 'Ing. Torres', 'Operativo', '2023-04-10',
    ST_SetSRID(ST_GeomFromText('POLYGON((
        -101.6870 21.1210,
        -101.6860 21.1210,
        -101.6860 21.1220,
        -101.6870 21.1220,
        -101.6870 21.1210
    ))'), 4326)
);


INSERT INTO tipos_cultivo (
    cultivo, temporada, productividad, requerimiento_agua, estado, responsable, geom
) VALUES (
    'Maíz', 'Primavera-Verano', 8.2, 'Media', 'Sembrado', 'Agr. González',
    ST_SetSRID(ST_GeomFromText('POLYGON((
        -101.6840 21.1230,
        -101.6830 21.1230,
        -101.6830 21.1240,
        -101.6840 21.1240,
        -101.6840 21.1230
    ))'), 4326)
);



//GEOJSON
SELECT jsonb_build_object(
  'type',     'FeatureCollection',
  'features', jsonb_agg(
    jsonb_build_object(
      'type',       'Feature',
      'geometry',   ST_AsGeoJSON(geom)::jsonb,
      'properties', to_jsonb(zr) - 'geom'
    )
  )
)
FROM zonas_riego zr;


SELECT jsonb_build_object(
  'type',     'FeatureCollection',
  'features', jsonb_agg(
    jsonb_build_object(
      'type',       'Feature',
      'geometry',   ST_AsGeoJSON(geom)::jsonb,
      'properties', to_jsonb(tc) - 'geom'
    )
  )
)
FROM tipos_cultivo tc;

