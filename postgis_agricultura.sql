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




INSERT INTO tipos_cultivo (cultivo, temporada, productividad, requerimiento_agua, estado, responsable, geom)
VALUES ('Sandia', 'Anual', 6.0, 'Alta', 'Guanajuato', 'Ing Tilin',
ST_GeomFromText('POLYGON((-101.75 21.17, -101.74 21.17, -101.74 21.16, -101.75 21.16, -101.75 21.17))', 4326));

// Insertando los nuevos tipos de cultivo
INSERT INTO tipos_cultivo (cultivo, temporada, productividad, requerimiento_agua, estado, responsable, geom)
VALUES 
-- 1. Maíz
('Maíz', 'Primavera-Verano', 7.5, 'Alta', 'Guanajuato', 'Ing. López',
 ST_GeomFromText('POLYGON((-101.69 21.13, -101.68 21.13, -101.68 21.12, -101.69 21.12, -101.69 21.13))', 4326)),

-- 2. Trigo
('Trigo', 'Invierno', 5.8, 'Media', 'Guanajuato', 'Ing. Ramírez',
 ST_GeomFromText('POLYGON((-101.67 21.14, -101.66 21.14, -101.66 21.13, -101.67 21.13, -101.67 21.14))', 4326)),

-- 3. Caña de azúcar
('Caña de azúcar', 'Anual', 10.2, 'Muy Alta', 'Guanajuato', 'Ing. Torres',
 ST_GeomFromText('POLYGON((-101.70 21.11, -101.69 21.11, -101.69 21.10, -101.70 21.10, -101.70 21.11))', 4326)),

-- 4. Frijol
('Frijol', 'Primavera', 4.2, 'Baja', 'Guanajuato', 'Ing. Gutiérrez',
 ST_GeomFromText('POLYGON((-101.65 21.12, -101.64 21.12, -101.64 21.11, -101.65 21.11, -101.65 21.12))', 4326)),

-- 5. Tomate
('Tomate', 'Primavera-Verano', 9.1, 'Alta', 'Guanajuato', 'Ing. Herrera',
 ST_GeomFromText('POLYGON((-101.66 21.10, -101.65 21.10, -101.65 21.09, -101.66 21.09, -101.66 21.10))', 4326)),

-- 6. Aguacate
('Aguacate', 'Anual', 6.7, 'Media', 'Guanajuato', 'Ing. Mendoza',
 ST_GeomFromText('POLYGON((-101.68 21.15, -101.67 21.15, -101.67 21.14, -101.68 21.14, -101.68 21.15))', 4326)),

-- 7. Uva
('Uva', 'Primavera-Verano', 8.3, 'Media', 'Guanajuato', 'Ing. Cortés',
 ST_GeomFromText('POLYGON((-101.63 21.13, -101.62 21.13, -101.62 21.12, -101.63 21.12, -101.63 21.13))', 4326)),

-- 8. Limón
('Limón', 'Anual', 7.0, 'Alta', 'Guanajuato', 'Ing. Salazar',
 ST_GeomFromText('POLYGON((-101.61 21.14, -101.60 21.14, -101.60 21.13, -101.61 21.13, -101.61 21.14))', 4326));










-- =============================================
-- INSERTS PARA POZOS (10 nuevos, total: 12)
-- =============================================
INSERT INTO pozos (nombre, profundidad, caudal, estado, fecha_construccion, tipo_pozo, ubicacion) VALUES
('Pozo Central', 110, 28, 'Operativo', '2021-05-15', 'Automático', ST_SetSRID(ST_Point(-101.6812, 21.1235), 4326)),
('Pozo Este', 85, 18, 'Operativo', '2019-11-22', 'Manual', ST_SetSRID(ST_Point(-101.6778, 21.1218), 4326)),
('Pozo Oeste', 130, 35, 'En reparación', '2020-08-10', 'Automático', ST_SetSRID(ST_Point(-101.6885, 21.1203), 4326)),
('Pazo La Joya', 95, 22, 'Operativo', '2022-01-30', 'Manual', ST_SetSRID(ST_Point(-101.6790, 21.1187), 4326)),
('Pozo San Miguel', 105, 30, 'Operativo', '2021-07-14', 'Automático', ST_SetSRID(ST_Point(-101.6823, 21.1172), 4326)),
('Pozo El Llano', 115, 25, 'En mantenimiento', '2020-03-05', 'Manual', ST_SetSRID(ST_Point(-101.6840, 21.1190), 4326)),
('Pozo Santa Rosa', 90, 20, 'Operativo', '2022-09-18', 'Automático', ST_SetSRID(ST_Point(-101.6785, 21.1200), 4326)),
('Pozo Los Ángeles', 100, 27, 'Operativo', '2021-10-25', 'Manual', ST_SetSRID(ST_Point(-101.6862, 21.1215), 4326)),
('Pozo La Esperanza', 120, 32, 'En proyecto', '2023-02-12', 'Automático', ST_SetSRID(ST_Point(-101.6805, 21.1160), 4326)),
('Pozo Nuevo Horizonte', 88, 19, 'Operativo', '2022-04-08', 'Manual', ST_SetSRID(ST_Point(-101.6830, 21.1180), 4326));

-- =============================================
-- INSERTS PARA SENSORES (10 nuevos, total: 13)
-- =============================================
INSERT INTO sensores (nombre, tipo, estado, fecha_instalacion, capacidad, unidad_medida, ubicacion) VALUES
('Sensor D', 'Humedad', 'Activo', '2024-02-20', 55, 'ml/h', ST_SetSRID(ST_Point(-101.6825, 21.1228), 4326)),
('Sensor E', 'Temperatura', 'Activo', '2024-01-15', 25, '°C', ST_SetSRID(ST_Point(-101.6818, 21.1202), 4326)),
('Sensor F', 'PH', 'Inactivo', '2023-12-10', 6, 'pH', ST_SetSRID(ST_Point(-101.6850, 21.1198), 4326)),
('Sensor G', 'Humedad', 'Activo', '2024-03-01', 60, 'ml/h', ST_SetSRID(ST_Point(-101.6795, 21.1215), 4326)),
('Sensor H', 'Lluvia', 'Activo', '2024-02-28', 100, 'mm', ST_SetSRID(ST_Point(-101.6835, 21.1175), 4326)),
('Sensor I', 'Viento', 'Mantenimiento', '2023-11-30', 15, 'km/h', ST_SetSRID(ST_Point(-101.6800, 21.1190), 4326)),
('Sensor J', 'Luz Solar', 'Activo', '2024-01-22', 1200, 'lux', ST_SetSRID(ST_Point(-101.6848, 21.1205), 4326)),
('Sensor K', 'CO2', 'Activo', '2024-03-10', 800, 'ppm', ST_SetSRID(ST_Point(-101.6780, 21.1180), 4326)),
('Sensor L', 'Nitrógeno', 'Inactivo', '2023-10-05', 5, 'mg/kg', ST_SetSRID(ST_Point(-101.6865, 21.1195), 4326)),
('Sensor M', 'Conductividad', 'Activo', '2024-02-15', 2, 'dS/m', ST_SetSRID(ST_Point(-101.6810, 21.1178), 4326));

-- =============================================
-- INSERTS PARA PARCELAS (3 nuevos, total: 5)
-- =============================================
INSERT INTO parcelas (nombre, cultivo_principal, propietario, area, estado, sistema_riego, ubicacion) VALUES
('Parcela 3', 'Aguacate', 'Pedro Ramírez', 4.2, 'Cosechando', 'Microaspersión', ST_SetSRID(ST_Point(-101.6795, 21.1230), 4326)),
('Parcela 4', 'Uva', 'Laura Sánchez', 3.8, 'Podando', 'Goteo', ST_SetSRID(ST_Point(-101.6852, 21.1185), 4326)),
('Parcela 5', 'Limón', 'Carlos Mendoza', 5.5, 'Fertilizando', 'Aspersión', ST_SetSRID(ST_Point(-101.6820, 21.1165), 4326));





