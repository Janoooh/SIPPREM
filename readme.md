---
title: readme

---

# AQUI VA EL NOMBRE DEL PROYECTO

### Integrantes:
* Fernanda Barraza
* Edgar de la Cruz
* Alejandro Orellana
* Jorge Ramirez

---
## **Justificacion del problema**

Mantener el orden en las comunidades es de vital importancia para el bienestar comun de las personas que forman parte de ellas, y por eso es primordial evitar o amedrentar cualquier evento que amenace dicho orden planteado. Con eso en mente, los proyectos de patrullaje preventivo resultan ser una carta muy util para combatir diversos problemas que amenzan el orden, como lo pueden ser la concentracion de delitos, incivilidades o violencia. 

Sin embargo, para conseguir buenos resultados con dichos proyectos requerimos tener un buen manejo de los datos obtenidos en los patrullajes, de manera que podamos ver e interpretar la informacion obtenida de manera comoda y ordenada. La claridad en la informacion resulta muy importante para saber si el proyecto va por buen camino, o hay que gestionar los procesos de una manera distinta para tener mejor desempeño. 

Manejar la informacion por medio de planillas excel y documentos de texto no resulta lo suficientemente comodo y ordenado para mantener la informacion, y resulta ser muy limitado a comparacion de las multiples opciones que nos ofrece un software especializado en la gestion de estos datos. Por ello, se opta por desarrollar la presente plataforma, la cual busca como objetivo administrar de manera optima los datos generados por los patrullajes, y tambien administrar de forma agradable la planificacion de dichos eventos. Con este sistema, los distintos trabajadores de proyectos de patrullaje preventivos podran realizar sus labores de forma amena y simple, pero con una organizacion de los datos muy ordenada por detras de las interfaces.

----
## Usuarios objetivo
El documento entregado como contexto para este problema indica los usuarios que usarán la aplicación. Estos se pueden dividir en dos grupos:

### Personal de gestión y supervisión
Descripción general: 
Personal administrativo cuyo trabajo es principalmente de escritorio. Las funcionalidades deberán ser accesibles desde la pagina web y estarán relacionadas a la visión global de las zonas y los recursos.

Necesidades: 
* Visualización clara de la distribución del personal e inventario por proyecto.
* Herramientas dinámicas de programación de turnos y actividades.
* Monitoreo geográfico continuo para garantizar la cobertura de la comuna o sector.

Posibles dificultades: 
* Sobrecarga de información
* Lentitud en la actualización de datos en terreno.

Contexto de uso: 
Entorno de trabajo cerrado, usualmente una oficina, con conexión a internet fija y estable, donde se accede al sistema a través de un computador de escritorio o laptop de trabajo.

Objetivos: 
* Crear, editar y administrar patrullajes.
* Programar y asignar fechas, turnos y rutas en el calendario de actividades.
* Registrar y controlar el inventario de objetos (vehículos y equipamiento) asignados a cada proyecto?? o patrullaje.
* Monitorear la ubicación GPS en tiempo real de los patrulleros desplegados.
* Gestionar alertas recibidas desde terreno.

Nivel de experiencia tecnológica: Medio a alto.

### Personal en terreno
Descripción general:
Personal de seguridad que está la mayor parte del tiempo en ruta. Se están desplazando constantemente, por ende, interactuan con el sistema a través de la aplicación móvil.

Necesidades: 
* Interfaces simples con botones de gran tamaño y poco texto.
* Flujos de registro de incidentes ultrarrápidos que no entorpezcan su labor de patrullaje.
* Acceso directo e inmediato al botón de pánico.

Posibles dificultades: 
* Manejo del dispositivo bajo luz solar directa o en condiciones climáticas adversas (lluvia).
* Conexión a internet intermitente o nula en zonas de baja cobertura.
* Estrés o prisa al momento de reportar un evento crítico o presionar el botón de pánico.

Contexto de uso:
Vía pública con condiciones climáticas y horarios variables. Accede al sistema utilizando un dispositivo móvil estando a bordo de un vehículo o a pie. Utiliza los datos moviles, por ende, no se puede asegurar una conexión estable.

Objetivos:
* Iniciar/finalizar turnos de patrullaje y emitir su ubicación GPS.
* Registrar incidentes observados en ruta.
* Activar el botón de pánico ante emergencias o situaciones de riesgo crítico para solicitar apoyo inmediato a la central.

Nivel de experiencia tecnológica: bajo a medio.

---------

## **ROLES**
**Patrullero:** Encargado de realizar rondas en terreno y reportar incidentes. Utiliza la aplicación móvil.
**Supervisor:** Encargado de la gestión de patrullajes. Utiliza la aplicacion web.
**Administrador:** Responsable de la gestion de usuarios y la configuración de los proyectos de patrullaje preventivo. Utiliza la app de web

---
## Proto-personas
Estas proto-personas representan perfiles hipotéticos elaborados para guiar el diseño y desarrollo del proyecto. No provienen de investigaciones directas con usuarios reales, sino de una caracterización preliminar basada en el análisis del problema dado y las necesidades esperadas. 

### Proto-persona 1: Administrador
Nombre: Carlos Morales (42 años)
Rol: Administrador
Caracteristicas generales:

Necesidades principales:
* Disponer de una visión global estructurada de todos los proyectos y de sus respectivos patrullajes.
* Generar usuarios dentro del sistema para tener personal vinculados a cada proyecto.
* Mantener el control del inventario asignado a cada proyecto para evitar pérdidas o faltantes.

Objetivos de uso:
* Registrar y parametrizar los proyectos de patrullaje preventivo de la comuna.
* Dar de alta y de baja a personal y objetos por proyecto.
* Garantizar la continuidad operativa mediante el monitoreo de inventario y personal asignado a cada proyecto.

Dificultades o puntos de frustración:
* Descuadres entre el inventario físico y los registros del sistema.
* Interfaces complejas que requieren demasiados pasos para crear un proyecto.

Funcionalidades de la aplicación que utilizaría:
* Registrar y administrar proyectos de patrullaje preventivo.
* Administrar personal de un proyecto.
* Registrar y administrar inventario por proyecto.
* Gestionar actividades mediante el calendario.

Dispositivo y contexto probable de acceso:
Computador de escritorio o laptop corporativa.
Oficina o central de control con conexión a internet por cable/Wi-Fi estable.

### Proto-persona 2: Supervisor
Nombre: Maria Rodriguez (35 años)
Rol: supervisor
caracteristicas generales: Trabajó en un callcenter en sus primeros años de adultez. Estudió telecomunicaciones, debido a una recomendacion de una amiga. Su primer trabajo como profesional estuvo, muy a su pesar, relacionado al uso de camaras cctv. Su forma de trabajo es rapida y directa de tomar decisiones importantes en segundos. Gracias a su experincia puede estar atenta y dar instrucciones de forma clara, ademas de estar acostumbrada a muchas horas de ver un monitor.

Necesidades principales: 
* Planificar de forma ágil las rutas, turnos y coberturas diarias del proyecto.
* Saber exactamente dónde está distribuido el personal durante la jornada.
* Conocer los eventos con los que se topan los patrulleros.

Objetivos de uso:
* Organizar y asignar las rondas de patrullaje.
* Agendar actividades.
* Supervisar en el mapa la ubicación en tiempo real de los patrulleros desplegados.
* Evaluar los detalles de los incidentes (fotos y ubicación) y registrar su derivación a las autoridades en los casos necesarios.

Dificultades o puntos de frustación: 
* Sobrecarga visual.
* Ubicaciones GPS imprecisas o perdida de la señal de algun patrullero.
* Fatiga visual tras largas horas frente a la pantalla.

Funcionalidades de la aplicación que usaría:
* Registrar y planificar patrullajes.
* gestionar actividades en el calendario.
* Recepción de incidentes.
* Monitoreo de GPS en vivo a través de un mapa.

Dispositivo y contexto probable de acceso: Computador de escritorio o notebook. Contexto de oficina con conexión a internet estable y pantallas amplias.

### Proto-persona 3: Patrullero
Nombre: Matias Delgado (38 años)
Rol: Patrullero
Caracteristicas generales:
Es un ex FFAA. Trabaja diariamente en terreno realizando rondas preventivas. Su entorno de trabajo es dinámico y requiere que mantenga la atención en su entorno físico, por lo que interactúa con la aplicación en ráfagas cortas de tiempo. Debido a su pasado tiene conocimientos de defensa personal y de manipulacion de armas de fuego. Tiene un iphone 8 que compro en el marketplace regateando un precio ya de por si bajo. Nunca le preguntes su posicion politica ni que piensa de ciertas minorias.

Necesidades principales: 
* Conocer su patrullaje próximo.
* Reportar las novedades importantes mientras está en su ronda.
* Contar con una vía de auxilio inmediata ante agresiones o emergencias graves en terreno.
* Indicar el equipamiento que va a utilizar en el turno.

Objetivos de usos: 
* Visualizar el área de su proxima ronda, además de su fecha y hora de inicio y termino.
* Documentar e ingresar incidentes detectados durante su patrullaje.
* Solicitar apoyo de emergencia al supervisor mediante el botón de pánico.
* Informar el equipo que se va a utilizar, al igual que dar iniciar al patrullage.

Dificultades o puntos de frustración: 
* Utilizar el dispositivo movil mientras conduce o cuando se encuentra en exteriores. 
* Hacer uso de la aplicacion en lugares con poca covertura.

Funciones que usaria:
* Registro de incidentes
* Llenar la lista de equipamiento y comenzar el turno.
* Botón de pánico integrado


Contexto de uso: Aplicacion móvil (android). Se utilizará en exteriores, a pie o en vehículo, con conectividad a internet variable y bajo presión de tiempo.

---

## Especificacion de requerimientos

A continuacion, se detallan los requerimientos del sistema planteado anteriormente, con la intencion de dar el mayor detalle de las caracteristicas que tendra la plataforma final. Aqui encontramos una tabla resumen con los titulos de los requerimientos funcionales y no funcionales, y luego se proceden a especificar a detalle cada uno de esos requerimientos.

| ID    | Titulo de requerimiento funcional                          | Rol                                    |
| ----- | ---------------------------------------------------------- |:--------------------------             |
| RF01  | Gestion de proyectos de patrullaje preventivo              | Administrador                          |
| RF02  | Gestion de patrullajes por proyecto                        | Administrador y supervisor             |
| RF03  | Gestion de inventario por proyecto                         | Administrador y supervisor             |
| RF04  | Gestion de calendario por proyecto                         | Administrador y supervisor             |
| RF05  | Visualizacion de ubicacion de los patrulleros por proyecto | Administrador y supervisor             |
| RF06  | Registro de incidentes en patrullaje                       | Patrullero                             |
| RF07  | Disponer boton de panico para eventos riesgosos            | Patrullero                             |
| RF08  | Visualizar calendario personal de patrullajes planificados | Patrullero                             |
| RF09  | Gestion de incidentes por proyecto                         | Administrador y supervisor             |
| RF10  | Gestion de usuarios en sistema                             | Administrador                          |
| RF11  | Gestion de trabajadores por proyecto                       | Administrador y supervisor             |
| RF12  | Disponer inicio de sesion                                  | Administrador, supervisor y patrullero |



| ID    | Titulo de requerimiento no funcional |
| ----- | ------------------------------------ |
| RNF01 | Encriptacion de contraseñas          |
| RNF02 | Base de datos PostgreSQL             |
| RNF03 | Restriccion por roles                |
| RNF04 | Proteccion de credenciales API       |
| RNF05 | Portabilidad en android              |


### Requerimientos funcionales (RF)

* RF01: el bla bla bla

### Requerimientos no funcionales (RNF)

* RNF01: El sistema debe bla bla bla

## **Requerimientos funcionales**






* Registrar y administrar proyectos de patrullaje preventivo. (Admin)


* Registrar y planificar patrullajes para un proyecto. (Admin, Supervisor)
* Registrar y administrar inventario de objetos por proyecto. (Admin, Supervisor)
* Implementar calendario para gestionar actividades (Admin, Supervisor)
* Gestionar ubicacion de los patrulleros por proyecto. (Admin, Supervisor)
* Registrar incidente en patrullaje.(Patrullero)
* Implementar boton de panico para eventos de riesgo. (Patrullero)


* RF-01: Checklist de equipamiento (rol patrullero): La aplicación móvil debe 

* RF-02: Botón de pánico integrado (rol patrullero): 

Registro y Derivación de Incidentes (Roles: Patrullero): 
* RF-03: La aplicación móvil debe permitir al patrullero reportar eventos en terreno mediante un formulario que registre automáticamente las coordenadas GPS actuales, permita adjuntar evidencia fotográfica, asignar una categoría predefinida del suceso (Delito, incivilidades, problemas urbanos...) y una descripcion opcional del evento.

Derivación de eventos (rol: Supervisor): 
* RF-04: La plataforma web debe notificar al supervisor en tiempo real sobre los nuevos incidentes ingresados. El sistema debe permitirle visualizar los detalles (foto y ubicación), editar los datos del incidente como el estado del evento ("pendiente"...), eliminar en caso de que se haya ingresado un incidente por error y registrar su derivación en casos necesarios(Carabineros... etc).

Monitoreo de GPS en vivo (rol supervisor):
* RF-05: El sistema debe mostrar al supervisor un mapa que actualice en tiempo real la posición enviada tanto por los dispositivos GPS físicos integrados en los vehículos como por los dispositivos móviles (app) de los patrulleros activos, además de las respectivas ubicaciones de los incidentes.

* RF-06: Crear, editar o eliminar proyectos de patrullaje (Administrador): El sistema debe permitir crear proyectos aprobados de patrullaje preventivo, dejando registrar todas sus especificaciones (lista de especificaciones...). Ademas, se deben poder editar dichas especificaciones, o eliminar los proyectos.

Inventario
* RF-07: El sistema debe permitir al administrador y al supervisor agregar, modificar o eliminar registros en la base de datos, tras validar automáticamente que cumpla con el formato establecido.

* **NO CUENTA** RF-0X: Registrar, editar o eliminar usuarios (Administrador): El sistema debe permitir registrar nuevos usuarios, recogiendo sus datos (los datos a recoger...) y seleccionando el tipo de usuario que sera (Supervisor o patrullero). Ademas, permitira editar cualquiera de estos datos, o eliminar un usuario. *Al crear una cuenta se genera una contraseña random, y la primera vez que inicia sesion el usuario se le solicita a el crear su propia contraseña.*

* RF-0X: Asignar proyectos de patrullaje a supervisores o patrulleros (Administrador): El sistema permite asignar proyectos de patrullaje a los supervisores o patrulleros para que trabajen en ellos.

* RF-


## **Requerimiento no funcional**
### Rendimiento
* RNF-01: El sistema debe permitir que la subida de datos al servidor (adjuntar evidencia) se pueda hacer en segundo no bloqueando la interfaz del patrullero y permitiendo seguir usando la aplicacion de forma inmediata.
* RNF-02: El sistema debe ser capaz de procesar y desplegar la informacion del gps de los patrulleros en pocos segundos.
* RNFXX: El sistema debe guardar la informacion de incidentes de forma local en caso de que no haya cobertura, sincronizando automaticamente cuando vuelva la conexion a internet
* RNF: El sistema debe rederizar y actualizar el mapa con todos los puntos de interes (incidentes y patrulleros) de forma fluida, sin bloqueos de la interfaz ni caidas de fotogramas?
* 

### Seguridad
* RNF-XX: Todas las contraseñas del sistema deben almacenarse en la base de datos utilizando una encriptacion -----
* RNF-XX: El sistema debe mostrar solo las caracteristicas relacionados a cada rol.
* RNF-XX


### Accesibilidad
* RNF-XX: El boton de panico debe tener una jerarquia visual alta y ser accesible desde todas las pantallas del patrullero.
* RNF-XX: El sistema debe permitir realizar cualquier accion en menos de 4 clicks/taps
* RNF-XX: El sistema debe proporcional retroalimentacion visual para indicar que una accion se realizo con exito.
* RNF-XX: Todos los textos de la aplicacion deben utilizar un lenguaje claro y directo.
* RNF-XX: Las pantallas deben mantener una jerarquia visual indicando claramente cuando esta en la pantalla principal y cuando en una secundaria.
* RNF-xx: Cada elemento interactuable debe ser claramente identificable.
* RNF-: El mapa debe utilizar una iconografia clara y un codigo de colores intuitivo que permita su lectura en un solo vistazo.
* RNF-: El sistema debe implementar un modo oscuro para miniminzar el daño de la vista para cuando se trabaje en turno de noche.

- Cuando termine el turno de patrullaje, el patrullero puede dar un reporte final.


## Definición de Arquitectura de Navegación y Experiencia del Usuario

### Rutas principales y secundarias

La arquitectura de navegación del sistema se ha diseñado segmentando el acceso y la experiencia según el rol del usuario, definiendo la plataforma de despliegue.
Rutas principales (vistas de primer nivel o de acceso directo) y secundarias (vistas de detalle, formularios o ventanas emergentes) para cada perfil de usuario.

Ruta de autenticación:
`/login` Pantalla inicial donde el usuario ingresa su correo/RUT y clave.

**Plataforma Web: Rol Administrador**

Rutas principales:
`/admin/inicio` Listado de proyectos activos y Dashboard principal.
`/admin/historial` Vista del historial general de proyectos.
`/admin/usuarios` Vista con el listado del personal registrado.
`/admin/perfil` Vista de datos del usuario.

Rutas secundarias:
`/admin/inicio/agregar-proyecto` Formulario para agregar un proyecto nuevo.
`/admin/inicio/detalle-proyecto` Vista de detalles del proyecto seleccionado.  ❓
`/admin/usuarios/agregar` Formulario para registrar un usuario nuevo.
`/admin/usuarios/detalle` Vista con la ficha de información detallada del usuario.
`/admin/usuarios/editar` Formulario para modificar los datos de un usuario.   ❓

**Plataforma Web: Rol Supervisor**

Rutas principales (Menú lateral):
`/supervisor/inicio` Vista general con los detalles del proyecto activo y actividades futuras.
`/supervisor/cronograma` Vista del calendario para la planificación operativa.
`/supervisor/inventario` Vista de gestión de vehículos y listado de artículos disponibles.
`/supervisor/mapa-gps` Vista del mapa interactivo para el monitoreo de dispositivos en tiempo real.
`/supervisor/personal` Vista con el listado de los trabajadores asignados.
`/supervisor/historial` Vista de historial de patrullajes. ❓

Rutas secundarias:
`/supervisor/cronograma/registrar-patrullaje` Formulario para la asignación de encargados, acompañantes y horarios.
`/supervisor/inventario/vehiculos/agregar` Formulario para registrar un vehículo nuevo.
`/supervisor/inventario/articulos/editar` Formulario para ajustar (agregar o quitar) el stock de un artículo existente.
`/supervisor/personal/agregar` Formulario para añadir un nuevo trabajador al sistema. ❓

**Plataforma Móvil: Rol Patrullero**

Rutas principales:
`/patrullero/inicio` Detalle del próximo patrullaje asignado.
`/patrullero/calendario` Vista de planificación de patrullajes.
`/patrullero/perfil` Vista de datos del usuario.

Rutas secundarias:
`/patrullero/inicio/preparacion` Vista de preparación para el patrullaje.
`/patrullero/inicio/preparacion/agregar-articulo` Formulario para agregar artículos a utilizar.
`/patrullero/inicio/patrullaje-activo` Vista del mapa interactivo durante el patrullaje.
`/patrullero/inicio/patrullaje-activo/reportar` Formulario para reportar un incidente.

### Relaciones jerárquicas entre vistas
```
[Ruta Pública]
 └── /login (Autenticación)
```
**Plataforma Web: Rol Administrador**
```
[Nivel 0]
 └── /admin
       │
       └── [Nivel 1]
            ├── /admin/inicio
            │    │
            │    └── [Nivel 2]
            │         ├── /admin/inicio/agregar-proyecto
            │         └── /admin/inicio/detalle-proyecto
            │
            ├── /admin/historial
            │
            ├── /admin/usuarios
            │    │
            │    └── [Nivel 2]
            │         ├── /admin/usuarios/agregar
            │         ├── /admin/usuarios/detalle
            │         └── /admin/usuarios/editar
            │
            └── /admin/perfil
```
**Plataforma Web: Rol Supervisor**
```
[Nivel 0]
 └── /supervisor
       │
       └── [Nivel 1]
            ├── /supervisor/inicio
            │
            ├── /supervisor/cronograma
            │    │
            │    └── [Nivel 2]
            │         └── /supervisor/cronograma/registrar-patrullaje
            │
            ├── /supervisor/inventario
            │    │
            │    └── [Nivel 2]
            │         ├── /supervisor/inventario/vehiculos/agregar
            │         └── /supervisor/inventario/articulos/editar
            │
            ├── /supervisor/mapa-gps
            │
            ├── /supervisor/historial
            │
            └── /supervisor/personal
                 │
                 └── [Nivel 2]
                      └── /supervisor/personal/agregar
```
**Plataforma Móvil: Rol Patrullero**
```
[Nivel 0]
 └── /patrullero
       │
       └── [Nivel 1]
            ├── /patrullero/inicio
            │    │
            │    └── [Nivel 2]
            │         ├── /patrullero/inicio/preparacion
            │         │    └── [Nivel 3]
            │         │         └── /patrullero/inicio/preparacion/agregar-articulo
            │         │
            │         └── /patrullero/inicio/patrullaje-activo
            │              └── [Nivel 3]
            │                   └── /patrullero/inicio/patrullaje-activo/reportar
            │
            ├── /patrullero/calendario
            └── /patrullero/perfil
```
### Flujo de navegación entre funcionalidades
El sistema presenta los siguientes flujos de navegación dinámicos principales, los cuales guían al usuario transversalmente entre módulos al completar tareas clave:

**Flujo del Administrador (Plataforma Web)**



**Flujo del Supervisor (Plataforma Web)**



**Flujo del Patrullero (Plataforma Móvil)**