--VAN A ESTAR TODOS LOS NAMES CON CAMELLO CAJA POR QUE EL GEMI ME DIJO QUE ERA BUENA PRACTICE
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
	telefono varchar(15) unique, -- no se si va ser obligatorio, es un varchar por que se puede meter el +
	foto bytea,
	hash_contrasenia varchar(255) not null,
	nuevo_user bool default true not null,
	fecha_registro timestamp default current_timestamp not null, -- esto lo saque de los mockups. Es para que guarde cuando se creo
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
	zona_seleccionada geometry (Geometry, 4326) not null, -- este es el tipo de dato que se maneja en postgis segun el geminais
	activo bool default true not null, -- este es para el estado de un proyecto (activo o cerrado).
	eliminado bool default false not null, --este es para ver si fue eliminado. 
	
	constraint pk_proyecto_patrullaje primary key (id_proyecto)
	/* No se si es necesario hacer check o si me manejaran en el frontend
		Asi que los pongo porsiaca lol					
	*/,
	constraint chk_fechas check (fecha_termino >= fecha_inicio),
	constraint chk_presupuesto check (presupuesto > 0)
);

create table acceso_proyecto(
	rut varchar(12) not null,
	id_proyecto integer not null,
	es_encargado bool not null,

	constraint pk_acceso_proyecto primary key (rut, id_proyecto),
	constraint fk_acceso_proyecto_rut foreign key (rut) references usuario(rut),
	constraint fk_acceso_proyecto_id_proyecto foreign key(id_proyecto) references proyecto_patrullaje(id_proyecto)
);

create table actividad(
	id_actividad integer generated always as identity,
	titulo varchar (100) not null,
	fecha date not null, -- en los mockups aparece hora tambien, pero no se si agregarlo
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
	talla varchar(10),
	id_tipo_eq_personal integer not null,

	constraint pk_equipamiento_personal primary key (id_item),
	constraint fk_eq_personal_proyecto foreign key (id_proyecto) references proyecto_patrullaje(id_proyecto),
	constraint fk_eq_persona_tipo_eq_personal foreign key (id_tipo_eq_personal) references tipo_equipamiento_personal(id_tipo_eq_personal)
)inherits (articulo);

--este se cambio
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
	constraint fk_realizacion_patrullaje_plan_patrullaje foreign key(id_patrullaje) references planificacion_patrullaje(id_patrullaje)
);

--tiene que tener el mismo id que la planificacion_patrullaje
create table ejecucion_patrullaje(
	id_patrullaje integer not null,
	hora_real_inicio timestamp,
	hora_real_termino timestamp,
	id_vehiculo varchar(20) not null,

	constraint pk_eje_patrullaje primary key (id_patrullaje),
	constraint fk_eje_patrullaje_plan_patrullaje foreign key (id_patrullaje) references planificacion_patrullaje(id_patrullaje),
	constraint fk_eje_patrullaje_vehiculo foreign key (id_vehiculo) references vehiculo(id_item)
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
	nivel_gravedad integer not null,  --- no se cual va a ser la escala asi que le voy poner del 1 al 5
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

/*--------------------------------------------------------------------------------


AQUI PUSE UNOS TRIGGER PERO NO SE QUÉ SE VAN A VER EN EL FRONT END Y LO QUE SE
VA A VER EN LA BASE DE DATOS.

IGUAL EL GEMINI ME MANDA UNA FORMA PARA VERIFICAR QUE EL TEMAS DE LAS ZONAS, PERO NO SE




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
	select fecha_inicio, fecha_termino into fecha_ini, fecha_fin
	from proyecto_patrullaje
	where id_proyecto = new.id_proyecto;

	if new.hora_inicio::date < fecha_ini or new.hora_termino::date > fecha_fin then
		raise exception 'las fechas del patrullaje estan fuera de rango del proyecto';
	end if;
	
return new;
end;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_fechas_patrullaje
BEFORE INSERT OR UPDATE ON patrullaje
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




/*-----------------------------------------------------------


AQUI EMPIEZA LA PARTE DE INSERCION DE DATOS. LOS SAQUE DEL DOCUMENTO QUE
DEJARON EN EL GIT

--------------------------------------------------------------*/



INSERT INTO rol (id_rol, tipo_rol) VALUES 
(1, 'Administrador'),
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
('Vehículo sospechoso'),
('Obstrucción de vía pública'),
('Emergencia médica menor'),
('Daño a infraestructura pública');

INSERT INTO usuario (rut, nombre, correo, telefono, hash_contrasenia, nuevo_user, id_rol) VALUES 
('12345678-9', 'Lil edo de la crux', 'lil.crux@procasting.cl', '+56912345678', '$2b$10$WU5N9TLYVwNLuvl/TXcp7eWJXLCN2F2VI/1bpUum95WNVf3/inow6', false, 1),
('98765432-1', 'Fernanda Garrafa', 'Fer.garra@procasting.cl', '+56987654321', '$2b$10$2NfPAyuUYxjrEpxBTIvCsuPIuVbp6x.S4W71lFbP/BdAI1qk1588e', false, 2),
('11223344-5', 'Ale x under Avellana', 'jano.ohh@procasting.cl', '+56911223344', '$2b$10$llTLLOaAWqjjx.IONcwHeex9BkdHLiVV3MYfAQ/R3M14d./GIRwiW', true, 3);
