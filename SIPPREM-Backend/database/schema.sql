-- TIENEN QUE TENER INSTALADO EL POSTGIS EN POSTGRE O SINO LE VA A SALTAR UN ERROR CON EL TIPO GEOMETRIA
CREATE EXTENSION IF NOT EXISTS postgis;

create table rol(
	id_rol integer,
	tipo_rol varchar(20) not null unique,

	constraint pk_rol primary key (id_rol)
);

create table usuario(
	rut varchar(12),
	nombre varchar(100) not null,
	correo varchar(100) unique,
	telefono varchar(15) unique,
	foto bytea,
	hash_contrasenia varchar(255) not null,
	nuevo_user bool default true not null,
	fecha_registro timestamp default current_timestamp not null,
	eliminado bool default false not null,
	id_rol integer not null,

	constraint pk_usuario primary key (rut),
	constraint fk_rol foreign key (id_rol) references rol(id_rol) 
);

create table proyecto_patrullaje(
	id_proyecto integer generated always as identity,
	nombre_proyecto varchar (100) not null unique,
	nombre_sector varchar(100) not null,
	presupuesto integer not null,
	fecha_inicio date not null,
	fecha_termino date not null,
	zona_seleccionada geometry (Geometry, 4326) not null,
	activo bool default true not null, -- este es para el estado de un proyecto (activo o cerrado).
	eliminado bool default false not null, --este es para ver si fue eliminado. 
	
	constraint pk_proyecto_patrullaje primary key (id_proyecto)
	/* No se si es necesario hacer check o si me manejaran en el frontend
		Asi que los pongo porsiaca				
	*/,
	constraint chk_fechas check (fecha_termino >= fecha_inicio),
	constraint chk_presupuesto check (presupuesto > 0)
);

create table acceso_proyecto(
	rut varchar(12) not null,
	id_proyecto integer not null,

	constraint pk_acceso_proyecto primary key (rut, id_proyecto),
	constraint fk_acceso_proyecto_rut foreign key (rut) references usuario(rut),
	constraint fk_acceso_proyecto_id_proyecto foreign key(id_proyecto) references proyecto_patrullaje(id_proyecto)
);

create table actividad(
	id_actividad integer generated always as identity,
	titulo varchar (100) not null,
	fecha date not null,
	descripcion varchar(255) not null,
	eliminado bool default false not null, -- este es para marcarlos como eliminado
	id_proyecto integer not null,

	constraint pk_actividad primary key (id_actividad),
	constraint fk_actividad_proyecto foreign key (id_proyecto) references proyecto_patrullaje(id_proyecto)
);

create table item(
	id_item varchar(20),
	id_proyecto integer,
	eliminado bool default false not null,
	
	constraint pk_item primary key (id_item),
	constraint fk_item_proyecto foreign key (id_proyecto) references proyecto_patrullaje(id_proyecto)
);

create table tipo_vehiculo(
	id_tipo_vehiculo integer generated always as identity,
	tipo_vehiculo varchar(20) not null unique,

	constraint pk_tipo_vehiculo primary key (id_tipo_vehiculo)
);

create table vehiculo(
	nombre_vehiculo varchar(100) not null,
	id_tipo_vehiculo integer not null,

	constraint pk_vehiculo primary key (id_item),
	constraint fk_vehiculo_proyecto foreign key (id_proyecto) references proyecto_patrullaje(id_proyecto),
	constraint fk_vehiculo_tipo_vehiculo foreign key (id_tipo_vehiculo) references tipo_vehiculo(id_tipo_vehiculo)
)inherits (item);

create table articulo(
	constraint pk_articulo primary key (id_item),
	constraint fk_articulo_proyecto foreign key (id_proyecto) references proyecto_patrullaje(id_proyecto)
)inherits (item);

create table tipo_equipamiento_vehicular(
	id_tipo_eq_vehicular integer generated always as identity,
	tipo_eq_vehicular varchar (200) not null unique,

	constraint pk_tipo_equimamiento_vehicular primary key (id_tipo_eq_vehicular)
);

create table equipamiento_vehicular(
	id_vehiculo varchar(20) default null,
	id_tipo_eq_vehicular integer not null,

	constraint pk_equipamiento_vehicular primary key (id_item),
	constraint fk_equipamiento_vehicular foreign key(id_vehiculo) references vehiculo(id_item),
	constraint fk_eq_vehicular_proyecto foreign key (id_proyecto) references proyecto_patrullaje(id_proyecto),
	constraint fk_eq_vehicular_tipo_eq_vehicular foreign key(id_tipo_eq_vehicular) references tipo_equipamiento_vehicular(id_tipo_eq_vehicular)
)inherits (articulo);

create table tipo_equipamiento_personal (
	id_tipo_eq_personal integer generated always as identity,
	tipo_eq_personal varchar(200) not null unique,

	constraint pk_tipo_equimamiento_personal primary key (id_tipo_eq_personal)
);

create table equipamiento_personal(
	talla varchar(10) not null,
	id_tipo_eq_personal integer not null,

	constraint pk_equipamiento_personal primary key (id_item),
	constraint fk_eq_personal_proyecto foreign key (id_proyecto) references proyecto_patrullaje(id_proyecto),
	constraint fk_eq_persona_tipo_eq_personal foreign key (id_tipo_eq_personal) references tipo_equipamiento_personal(id_tipo_eq_personal)
)inherits (articulo);

create table planificacion_patrullaje(
	id_patrullaje integer generated always as identity,
	hora_inicio timestamp not null, -- un patrullaje puede empezar un dia y terminar otro
	hora_termino timestamp not null,
	zona geometry (Geometry, 4326) not null, 
	id_proyecto integer not null,

	constraint pk_plan_patrullaje primary key (id_patrullaje),
	constraint fk_proyecto_patrullaje foreign key (id_proyecto) references proyecto_patrullaje(id_proyecto)
);

create table realizacion_patrullaje(
	rut varchar(12) not null,
	id_patrullaje integer not null,

	constraint pk_realizacion_patrullaje primary key (rut, id_patrullaje),
	constraint fk_realizacion_patrullaje_rut foreign key(rut) references usuario(rut),
	constraint fk_realizacion_patrullaje_plan_patrullaje foreign key(id_patrullaje) references planificacion_patrullaje(id_patrullaje) on delete cascade
);

--tiene que tener el mismo id que la planificacion_patrullaje
create table ejecucion_patrullaje(
	id_patrullaje integer not null,
	hora_real_inicio timestamp not null,
	hora_real_termino timestamp,
	id_vehiculo varchar(20) not null,

	constraint pk_eje_patrullaje primary key (id_patrullaje),
	constraint fk_eje_patrullaje_plan_patrullaje foreign key (id_patrullaje) references planificacion_patrullaje(id_patrullaje),
	constraint fk_eje_patrullaje_vehiculo foreign key (id_vehiculo) references vehiculo(id_item),
    constraint chk_horas_ejecucion check (hora_real_termino is null or hora_real_termino >= hora_real_inicio)
);

create table categoria_incidente(
	id_categoria_incidente integer generated always as identity,
	categoria varchar(100) not null unique,

	constraint pk_categoria_incidente primary key (id_categoria_incidente)
);

create table incidente (
	id_incidente integer generated always as identity,
	observaciones varchar(255),
	fecha_hora timestamp not null,
	ubicacion geometry(Point, 4326) not null,
	nivel_gravedad integer not null, 
	id_patrullaje integer not null,
	id_categoria_incidente integer not null,

	constraint pk_incidente primary key (id_incidente),
	constraint fk_incidente_eje_patrullaje foreign key (id_patrullaje) references ejecucion_patrullaje(id_patrullaje),
	constraint fk_cat_incidente foreign key (id_categoria_incidente) references categoria_incidente(id_categoria_incidente),
	constraint chk_nv_gravedad check (nivel_gravedad >= 1 and nivel_gravedad <= 5) 
);

create table foto_incidente(
	id_foto integer generated always as identity,
	foto bytea not null,
	id_incidente integer not null,

	constraint pk_foto_incidente primary key (id_foto),
	constraint fk_incidente foreign key (id_incidente) references incidente(id_incidente)
);

create table uso_eq_personal(
	id_patrullaje integer not null,
	id_eq_personal varchar(20) not null,

	constraint pk_uso_eq_personal primary key (id_patrullaje, id_eq_personal),
	constraint fk_uso_eq_personal_patrullaje foreign key (id_patrullaje) references ejecucion_patrullaje(id_patrullaje),
	constraint fk_uso_eq_personal_eq_personal foreign key (id_eq_personal) references equipamiento_personal(id_item)
);

/*------------------------------------------------------------------------------

TRIGGERS

---------------------------------------------------------------------------*/
/*
Trigger para que no haya un patrullaje fuera de los rangos del proyecto
*/
create or replace function validar_fechas_patrullaje()
returns trigger as
$$
declare
	fecha_ini date;
	fecha_fin date;
begin
	if new.hora_termino <= new.hora_inicio then
		raise exception 'La hora de término debe ser posterior a la hora de inicio.';
	end if;

	select fecha_inicio, fecha_termino into fecha_ini, fecha_fin
	from proyecto_patrullaje
	where id_proyecto = new.id_proyecto;

	if new.hora_inicio::date < fecha_ini or new.hora_termino::date > fecha_fin then
		raise exception 'Las fechas del patrullaje estan fuera de rango del proyecto';
	end if;
	
return new;
end;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_fechas_patrullaje
BEFORE INSERT OR UPDATE ON planificacion_patrullaje
FOR EACH ROW
EXECUTE FUNCTION validar_fechas_patrullaje();

/*
Este es un trigger para una actividad no se pueda hacer fuera de los plazos del proyecto
*/
CREATE OR REPLACE FUNCTION validar_horario_actividad()
RETURNS TRIGGER AS $$
DECLARE
    date_inicio date;
    date_termino date;
BEGIN
    SELECT fecha_inicio, fecha_termino
    INTO date_inicio, date_termino
    FROM proyecto_patrullaje
    WHERE id_proyecto = NEW.id_proyecto;

    IF NEW.fecha < date_inicio OR NEW.fecha > date_termino THEN
        RAISE EXCEPTION 'La fecha de la actividad estan fuera del rango del proyecto';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_horario_actividad
BEFORE INSERT OR UPDATE ON actividad
FOR EACH ROW
EXECUTE FUNCTION validar_horario_actividad();


/*
Trigger para validar que un patrullaje esté dentro de la zona delimitada por el proyecto
*/
CREATE OR REPLACE FUNCTION validar_zona_patrullaje()
RETURNS TRIGGER AS $$
DECLARE
    zona_proyecto geometry;
BEGIN
    SELECT zona_seleccionada INTO zona_proyecto
    FROM proyecto_patrullaje
    WHERE id_proyecto = NEW.id_proyecto;

    IF NOT ST_Within(NEW.zona, zona_proyecto) THEN
        RAISE EXCEPTION 'La zona del patrullaje está fuera de la zona seleccionada.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verificar_zona_patrullaje
BEFORE INSERT OR UPDATE ON planificacion_patrullaje
FOR EACH ROW
EXECUTE FUNCTION validar_zona_patrullaje();

/*
Trigger para que un incidente no pueda estar fuera del area de patrullaje.

---rev
*/
CREATE OR REPLACE FUNCTION validar_ubicacion_incidente()
RETURNS TRIGGER AS $$
DECLARE
    zona_patrullaje geometry;
BEGIN
    SELECT planificacion_patrullaje.zona INTO zona_patrullaje
    FROM planificacion_patrullaje
    JOIN ejecucion_patrullaje ON planificacion_patrullaje.id_patrullaje = ejecucion_patrullaje.id_patrullaje
    WHERE ejecucion_patrullaje.id_patrullaje = NEW.id_patrullaje;

	/* El numero al final de la funcion indica la tolerancia, es decir que tanto se puede pasar
	 del area designada.
	*/
    IF NOT ST_DWithin(NEW.ubicacion::geography, zona_patrullaje::geography, 100) THEN
        RAISE EXCEPTION 'La ubicación del incidente está muy lejos de la zona de patrullaje.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_ubicacion_incidente
BEFORE INSERT OR UPDATE ON incidente
FOR EACH ROW
EXECUTE FUNCTION validar_ubicacion_incidente();

/*
Trigger para validar que al asignar un patrullero a un patrullaje: tenga rol Patrullero activo, pertenezca al proyecto, y no tenga otro patrullaje con horario solapado.
*/
CREATE OR REPLACE FUNCTION validar_disponibilidad_patrullero()
RETURNS TRIGGER AS $$
DECLARE
    v_hora_inicio timestamp;
    v_hora_termino timestamp;
    v_id_proyecto integer;
    v_es_patrullero boolean;
    v_pertenece boolean;
    v_conflicto boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM usuario
        WHERE rut = NEW.rut AND id_rol = 3 AND eliminado = false
    ) INTO v_es_patrullero;

    IF NOT v_es_patrullero THEN
        RAISE EXCEPTION 'El usuario con RUT % no es un patrullero activo.', NEW.rut;
    END IF;

    SELECT hora_inicio, hora_termino, id_proyecto
    INTO v_hora_inicio, v_hora_termino, v_id_proyecto
    FROM planificacion_patrullaje
    WHERE id_patrullaje = NEW.id_patrullaje;

    SELECT EXISTS (
        SELECT 1
        FROM acceso_proyecto
        WHERE rut = NEW.rut AND id_proyecto = v_id_proyecto
    ) INTO v_pertenece;

    IF NOT v_pertenece THEN
        RAISE EXCEPTION 'El patrullero con RUT % no pertenece a este proyecto.', NEW.rut;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM realizacion_patrullaje rp
        INNER JOIN planificacion_patrullaje p ON rp.id_patrullaje = p.id_patrullaje
        WHERE rp.rut = NEW.rut
          AND rp.id_patrullaje <> NEW.id_patrullaje
          AND (p.hora_inicio, p.hora_termino) OVERLAPS (v_hora_inicio, v_hora_termino)
    ) INTO v_conflicto;

    IF v_conflicto THEN
        RAISE EXCEPTION 'El patrullero con RUT % ya tiene un patrullaje asignado en ese horario.', NEW.rut;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_disponibilidad_patrullero
BEFORE INSERT OR UPDATE ON realizacion_patrullaje
FOR EACH ROW
EXECUTE FUNCTION validar_disponibilidad_patrullero();

/*
Trigger para validar que el vehículo utilizado en ejecucion_patrullaje pertenezca al proyecto y no esté eliminado.
*/
CREATE OR REPLACE FUNCTION validar_vehiculo_ejecucion()
RETURNS TRIGGER AS $$
DECLARE
    v_id_proyecto integer;
    v_vehiculo_valido boolean;
BEGIN
    SELECT id_proyecto INTO v_id_proyecto
    FROM planificacion_patrullaje
    WHERE id_patrullaje = NEW.id_patrullaje;

    SELECT EXISTS (
        SELECT 1
        FROM vehiculo
        WHERE id_item = NEW.id_vehiculo
          AND id_proyecto = v_id_proyecto
          AND eliminado = false
    ) INTO v_vehiculo_valido;

    IF NOT v_vehiculo_valido THEN
        RAISE EXCEPTION 'El vehículo % no pertenece a este proyecto, o se encuentra eliminado.', NEW.id_vehiculo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_vehiculo_ejecucion
BEFORE INSERT OR UPDATE ON ejecucion_patrullaje
FOR EACH ROW
EXECUTE FUNCTION validar_vehiculo_ejecucion();

/*
Trigger para validar que el equipamiento personal utilizado en uso_eq_personal pertenezca al proyecto y no esté eliminado.
*/
CREATE OR REPLACE FUNCTION validar_eq_personal_ejecucion()
RETURNS TRIGGER AS $$
DECLARE
    v_id_proyecto integer;
    v_eq_valido boolean;
BEGIN
    SELECT id_proyecto INTO v_id_proyecto
    FROM planificacion_patrullaje
    WHERE id_patrullaje = NEW.id_patrullaje;

    SELECT EXISTS (
        SELECT 1
        FROM equipamiento_personal
        WHERE id_item = NEW.id_eq_personal
          AND id_proyecto = v_id_proyecto
          AND eliminado = false
    ) INTO v_eq_valido;

    IF NOT v_eq_valido THEN
        RAISE EXCEPTION 'El equipamiento personal % no pertenece a este proyecto, o se encuentra eliminado.', NEW.id_eq_personal;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_eq_personal_ejecucion
BEFORE INSERT OR UPDATE ON uso_eq_personal
FOR EACH ROW
EXECUTE FUNCTION validar_eq_personal_ejecucion();

/*-----------------------------------------------------------


AQUI EMPIEZA LA PARTE DE INSERCION DE DATOS. 


--------------------------------------------------------------*/



INSERT INTO rol (id_rol, tipo_rol) VALUES 
(1, 'Admin'),
(2, 'Supervisor'),
(3, 'Patrullero');

INSERT INTO tipo_vehiculo (tipo_vehiculo) VALUES 
('Automovil'),
('Camioneta'),
('Motocicleta'),
('Bicicleta'),
('Lancha'),
('Scooter'),
('Cuatrimoto'),
('otro');

INSERT INTO tipo_equipamiento_vehicular (tipo_eq_vehicular) VALUES 
('Balizas de iluminación táctica'),
('Equipos de radio comunicaciones móviles'),
('Inversores de corriente continua a alterna'),
('Megáfonos con sonidos y USB'),
('Cámaras vehiculares de contexto'),
('Focos de luz LED direccionales'),
('Kits de emergencia vehiculares'),
('Sistemas de localización GPS Tracker'),
('Sistemas anti-asalto de corte a distancia'),
('Accesorios según territorio (cadenas/barras)'),
('Parrillas metálicas para motos'),
('Balizas estroboscópicas para motos'),
('Maletas traseras con chapa'),
('Radios portátiles de comunicación'),
('otro');

INSERT INTO tipo_equipamiento_personal (tipo_eq_personal) VALUES 
('Chaleco antibalas nivel IIIA'),
('Casco balístico nivel IIIA'),
('Botas tácticas con puntera reforzada'),
('Rodilleras de protección física'),
('Cámaras corporales HD'),
('Esposas de acero de carbono'),
('Bastones retráctiles'),
('otro');

INSERT INTO categoria_incidente (categoria) VALUES 
('Vandalismo y daño a la propiedad pública'),
('Vehículo mal estacionado o abandonado'),
('Luminaria pública defectuosa o apagada'),
('Consumo de alcohol o sustancias ilícitas en la vía pública'),
('Comercio ambulante no autorizado'),
('Presencia de personas en actitud sospechosa'),
('Basural clandestino o acumulación de escombros'),
('Animales sueltos o potencialmente peligrosos'),
('Altercado, riña o disturbios en la vía pública'),
('Daño en infraestructura vial (baches, señalética caída, etc.)'),
('Ruidos molestos o alteración del orden'),
('otro');

INSERT INTO usuario (rut, nombre, correo, telefono, hash_contrasenia, nuevo_user, fecha_registro, eliminado, id_rol) VALUES 
('00000000-0','Administrador root','admin@sipprem.com',null,'$2a$10$sG6X2ZW52kws8YOS7vZfousnSaZiClk5S/wpdk8GlkrHEAh5OkIK6',true,CURRENT_TIMESTAMP,false,1), --2pD7Api1Y8Wn
('12345678-9', 'Edgar De La Cruz', 'lil.crux@procasting.cl', '912345678', '$2b$10$WU5N9TLYVwNLuvl/TXcp7eWJXLCN2F2VI/1bpUum95WNVf3/inow6', true,CURRENT_TIMESTAMP,false, 1), --claveAdmin
('98765432-1', 'Fernanda Barraza', 'fer.barra@procasting.cl', '987654321', '$2b$10$2NfPAyuUYxjrEpxBTIvCsuPIuVbp6x.S4W71lFbP/BdAI1qk1588e', true,CURRENT_TIMESTAMP,false, 2),--claveSupervisor
('11223344-5', 'Alejandro Orellana', 'jano.ohh@procasting.cl', '911223344', '$2b$10$llTLLOaAWqjjx.IONcwHeex9BkdHLiVV3MYfAQ/R3M14d./GIRwiW', true,CURRENT_TIMESTAMP,false, 3), --clavePatrullero

('11111111-1', 'Juan Pérez', 'juan.perez@example.com', '911111111', '$2b$10$cdg6h9SaGY80GjlCtA90rO8/7W19RTjUFHc83.jC7dQkvCmhgfVAu', true,CURRENT_TIMESTAMP,false, 2), --1111111111
('18222333-k', 'Carlos Gomez', 'carlos.gomez@sipprem.com', '999999999', '$2b$10$xFtisP3ex8tZ0pu5QYW18eL6jG53xjRrDpbednEXrxkoFkjTnCGdW', true,CURRENT_TIMESTAMP,false, 3), --dcf3239cde37
('19333444-5', 'Maria Silva', 'maria.silva@sipprem.com', '922222222', '$2b$10$XFkzu3iLlYwOqKetPWa/Pe6.6HuW7iebKpebZy9XsyMN4rLsS.OCi', true,CURRENT_TIMESTAMP,false, 2), --ff8332d2050b
('20444555-k', 'Juan Soto', 'juan.soto@sipprem.com', '933333333', '$2b$10$jNDyTHWPHnSX5HGnZKb5Luw4dnQoK2g8n0QW1nfY54SU7hNl8lSj.', true,CURRENT_TIMESTAMP,false, 3), --d0691a1dbe47
('21555666-8', 'Ana Morales', 'ana.morales@sipprem.com', '944444444', '$2b$10$revqFHB/JZ1GF8uqBGHRquZBF5utJhODzw3oVikgcJvlGGBhvLnhy', true,CURRENT_TIMESTAMP,false, 3)--fe90573d9eeb
;


INSERT INTO proyecto_patrullaje (nombre_proyecto, nombre_sector, presupuesto, fecha_inicio, fecha_termino, zona_seleccionada) 
VALUES 
(
    'Patrullaje Preventivo Plan Valparaíso', 
    'Valparaíso', 
    15000000, 
    '2026-06-01', 
    '2026-12-01', 
    ST_GeomFromText('POLYGON((-71.63 -33.03, -71.61 -33.03, -71.61 -33.05, -71.63 -33.05, -71.63 -33.03))', 4326)
),
(
    'Seguridad Urbana Sector Centro Rancagua', 
    'Rancagua', 
    10000000, 
    '2026-06-01', 
    '2027-07-01',
    ST_GeomFromText('POLYGON((-70.75 -34.16, -70.73 -34.16, -70.73 -34.18, -70.75 -34.18, -70.75 -34.16))', 4326)
);

INSERT INTO acceso_proyecto (rut, id_proyecto) VALUES 
('11111111-1', 1),
('19333444-5', 1),
('18222333-k', 1),
('21555666-8', 1),
('98765432-1', 2),
('19333444-5', 2),
('20444555-k', 2),
('11223344-5', 2);

INSERT INTO actividad (titulo, fecha, descripcion, id_proyecto) VALUES 
(
    'Reunión de coordinación inicial', 
    '2026-06-02', 
    'Reunión con carabineros y delegados municipales para definir rutas críticas en el Plan.', 
    1
),
(
    'Capacitación en plataforma y geolocalización', 
    '2026-06-10', 
    'Inducción al personal de patrullaje sobre el registro de incidentes y uso del sistema.', 
    1
),
(
    'Mantenimiento preventivo de flota', 
    '2026-07-15', 
    'Revisión técnica y mantención de vehículos y equipamiento vehicular asignados.', 
    1
),
(
    'Operativo conjunto de fiscalización', 
    '2026-08-05', 
    'Fiscalización de comercio ambulante no autorizado en zonas de alta afluencia.', 
    1
),
(
    'Auditoría intermedia de presupuesto', 
    '2026-09-01', 
    'Revisión de gastos y avance financiero del proyecto de patrullaje.', 
    1
),
(
    'Lanzamiento oficial del proyecto', 
    '2026-06-02', 
    'Ceremonia de presentación del plan de seguridad sector centro con autoridades locales.', 
    2
),
(
    'Inspección de luminarias y espacios públicos', 
    '2026-06-20', 
    'Levantamiento de puntos oscuros y zonas con deficiencias lumínicas junto al municipio.', 
    2
),
(
    'Entrega de equipamiento personal', 
    '2026-06-25', 
    'Distribución de chalecos antibalas, cámaras corporales y bastones al personal operativo.', 
    2
),
(
    'Reunión con junta de vecinos', 
    '2026-07-18', 
    'Conversatorio de seguridad preventiva y entrega de canales de reporte ciudadano.', 
    2
),
(
    'Evaluación operacional mensual', 
    '2026-08-10', 
    'Análisis de estadísticas de patrullaje y reasignación de recursos móviles según demanda.', 
    2
);

INSERT INTO vehiculo (id_item, id_proyecto, nombre_vehiculo, id_tipo_vehiculo) VALUES 
('VEH-001', 1, 'Chevrolet Sail 1.5', 1),
('VEH-002', 1, 'Toyota Hilux 4x4', 2),
('VEH-003', 1, 'Yamaha XT 250', 3),
('VEH-004', 1, 'Trek Marlin 7', 4),
('VEH-005', 1, 'Boston Whaler 220', 5),
('VEH-006', 2, 'Nissan Versa Sense', 1),
('VEH-007', 2, 'Mitsubishi L200 Katana', 2),
('VEH-008', 2, 'Honda XR 190L', 3),
('VEH-009', 2, 'Polaris Sportsman 570', 7),
('VEH-010', 2, 'Xiaomi Mi Electric Scooter Pro 2', 6);

INSERT INTO equipamiento_vehicular (id_item, id_proyecto, id_vehiculo, id_tipo_eq_vehicular) VALUES 
('EQV-001', 1, 'VEH-001', 1),
('EQV-002', 1, 'VEH-001', 2),
('EQV-003', 1, 'VEH-002', 4),
('EQV-004', 1, 'VEH-002', 5),
('EQV-005', 1, 'VEH-003', 12),
('EQV-006', 2, 'VEH-006', 1),
('EQV-007', 2, 'VEH-006', 8),
('EQV-008', 2, 'VEH-007', 7),
('EQV-009', 2, 'VEH-008', 12),
('EQV-010', 2, 'VEH-009', 10);

INSERT INTO equipamiento_personal (id_item, id_proyecto, talla, id_tipo_eq_personal) VALUES 
('EQP-001', 1, 'L', 1),
('EQP-002', 1, 'M', 2),
('EQP-003', 1, '42', 3),
('EQP-004', 1, 'No aplica', 5),
('EQP-005', 1, 'No aplica', 6),
('EQP-006', 2, 'XL', 1),
('EQP-007', 2, 'L', 2),
('EQP-008', 2, '43', 3),
('EQP-009', 2, 'No aplica', 7),
('EQP-010', 2, 'No aplica', 5);

INSERT INTO planificacion_patrullaje (hora_inicio, hora_termino, zona, id_proyecto) VALUES 
(
    '2026-06-05 08:00:00', 
    '2026-06-05 16:00:00', 
    ST_GeomFromText('POLYGON((-71.625 -33.035, -71.615 -33.035, -71.615 -33.045, -71.625 -33.045, -71.625 -33.035))', 4326), 
    1
),
(
    '2026-06-12 16:00:00', 
    '2026-06-13 00:00:00', 
    ST_GeomFromText('POLYGON((-71.630 -33.040, -71.620 -33.040, -71.620 -33.050, -71.630 -33.050, -71.630 -33.040))', 4326), 
    1
),
(
    '2026-06-20 00:00:00', 
    '2026-06-20 08:00:00', 
    ST_GeomFromText('POLYGON((-71.620 -33.030, -71.610 -33.030, -71.610 -33.040, -71.620 -33.040, -71.620 -33.030))', 4326), 
    1
),
(
    '2026-07-02 10:00:00', 
    '2026-07-02 18:00:00', 
    ST_GeomFromText('POLYGON((-71.628 -33.038, -71.618 -33.038, -71.618 -33.048, -71.628 -33.048, -71.628 -33.038))', 4326), 
    1
),
(
    '2026-07-05 08:00:00', 
    '2026-07-05 16:00:00', 
    ST_GeomFromText('POLYGON((-70.745 -34.165, -70.735 -34.165, -70.735 -34.175, -70.745 -34.175, -70.745 -34.165))', 4326), 
    2
),
(
    '2026-07-10 16:00:00', 
    '2026-07-11 00:00:00', 
    ST_GeomFromText('POLYGON((-70.750 -34.170, -70.740 -34.170, -70.740 -34.180, -70.750 -34.180, -70.750 -34.170))', 4326), 
    2
),
(
    '2026-07-18 22:00:00', 
    '2026-07-19 06:00:00', 
    ST_GeomFromText('POLYGON((-70.740 -34.160, -70.730 -34.160, -70.730 -34.170, -70.740 -34.170, -70.740 -34.160))', 4326), 
    2
),
(
    '2026-07-25 09:00:00', 
    '2026-07-25 17:00:00', 
    ST_GeomFromText('POLYGON((-70.748 -34.168, -70.738 -34.168, -70.738 -34.178, -70.748 -34.178, -70.748 -34.168))', 4326), 
    2
);

INSERT INTO ejecucion_patrullaje (id_patrullaje, hora_real_inicio, hora_real_termino, id_vehiculo) VALUES 
(
    1, 
    '2026-06-05 08:05:00', 
    '2026-06-05 15:55:00', 
    'VEH-001'
),
(
    2, 
    '2026-06-12 16:10:00', 
    '2026-06-13 00:05:00', 
    'VEH-002'
),
(
    3, 
    '2026-06-20 00:00:00', 
    '2026-06-20 08:15:00', 
    'VEH-003'
),
(
    4, 
    '2026-06-02 10:02:00', 
    '2026-06-02 17:50:00', 
    'VEH-004'
),
(
    5, 
    '2026-07-05 08:00:00', 
    '2026-07-05 16:10:00', 
    'VEH-006'
),
(
    6, 
    '2026-07-10 15:50:00', 
    '2026-07-11 00:15:00', 
    'VEH-007'
),
(
    7, 
    '2026-07-18 22:05:00', 
    '2026-07-19 05:55:00', 
    'VEH-008'
),
(
    8, 
    '2026-07-25 09:10:00', 
    '2026-07-25 17:05:00', 
    'VEH-009'
);

INSERT INTO realizacion_patrullaje (rut, id_patrullaje) VALUES 
('18222333-k', 1),
('21555666-8', 2),
('18222333-k', 3),
('21555666-8', 3),
('18222333-k', 4),
('20444555-k', 5),
('11223344-5', 6),
('20444555-k', 7),
('11223344-5', 7),
('20444555-k', 8);

INSERT INTO uso_eq_personal (id_patrullaje, id_eq_personal) VALUES 
(1, 'EQP-001'),
(1, 'EQP-002'),
(2, 'EQP-003'),
(3, 'EQP-004'),
(4, 'EQP-005'),
(5, 'EQP-006'),
(6, 'EQP-007'),
(7, 'EQP-008'),
(8, 'EQP-009'),
(8, 'EQP-010');

INSERT INTO incidente (observaciones, fecha_hora, ubicacion, nivel_gravedad, id_patrullaje, id_categoria_incidente) VALUES 
(
    'Se encontró un vehículo abandonado bloqueando parcialmente el tránsito en calle Almirante Montt.', 
    '2026-03-05 09:30:00', 
    ST_GeomFromText('POINT(-71.622 -33.038)', 4326), 
    2, 
    1, 
    2 
),
(
    'Luminaria pública completamente apagada en esquina de Plaza Sotomayor generando punto ciego.', 
    '2026-03-12 18:15:00', 
    ST_GeomFromText('POINT(-71.627 -33.042)', 4326), 
    3, 
    2, 
    3 
),
(
    'Presencia de grupo consumiendo alcohol en la vía pública frente a comercio local.', 
    '2026-03-20 02:45:00', 
    ST_GeomFromText('POINT(-71.618 -33.033)', 4326), 
    4, 
    3, 
    4 
),
(
    'Acumulación de escombros y restos de muebles en la vía pública.', 
    '2026-04-02 12:20:00', 
    ST_GeomFromText('POINT(-71.625 -33.045)', 4326), 
    2, 
    4, 
    7 
),
(
    'Comercio ambulante no autorizado ocupando el flujo peatonal en Paseo Independencia.', 
    '2026-04-05 10:10:00', 
    ST_GeomFromText('POINT(-70.742 -34.168)', 4326), 
    1, 
    5, 
    5 
),
(
    'Bache profundo de gran tamaño en calzada que pone en riesgo a vehículos menores.', 
    '2026-04-10 17:30:00', 
    ST_GeomFromText('POINT(-70.746 -34.172)', 4326), 
    3, 
    6, 
    10 
),
(
    'Denuncia por ruidos molestos excesivos provenientes de domicilio particular a altas horas.', 
    '2026-04-19 01:15:00', 
    ST_GeomFromText('POINT(-70.735 -34.165)', 4326), 
    2, 
    7, 
    11 
),
(
    'Perro potencialmente peligroso suelto deambulando sin supervisión ni arnés.', 
    '2026-04-25 11:00:00', 
    ST_GeomFromText('POINT(-70.740 -34.175)', 4326), 
    3, 
    8, 
    8 
);

INSERT INTO foto_incidente (foto, id_incidente) VALUES 
('\x89504E470D0A1A0A0000000D49484452', 1);
