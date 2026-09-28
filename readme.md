# Sistema Integrado de Proyectos de Patrullajes Preventivos Municipales (SIPPREM)

### Integrantes:
* Fernanda Barraza
* Edgar de la Cruz
* Alejandro Orellana
* Jorge Ramirez

## Indice

1. [Justificacion del problema](#Justificación-del-problema)
2. [Usuarios objetivos.](#Usuarios-objetivo)
    - [Personal de gestión y supervisión](#Personal-de-gestión-y-supervisión)
    - [Personal en terreno](#Personal-en-terreno)
3. [Roles](#Roles)
4. [Proto-personas](#Proto-personas)
    - [Proto-persona 1: Administrador](#Proto-persona-1-Administrador)
    - [Proto-persona 2: Supervisor](#Proto-persona-2-Supervisor)
    - [Proto-persona 3: Patrullero](#Proto-persona-3-Patrullero)
5. [Especificacion de requerimientos](#Especificacion-de-requerimientos)
    - [Requerimientos funcionales (RF)](#Requerimientos-funcionales-(RF))
    - [Requerimientos no funcionales (RNF)](#Requerimientos-no-funcionales-(RNF))
6. [Definición de arquitectura de navegación y experiencia del usuario](#Definición-de-arquitectura-de-navegación-y-experiencia-del-usuario)
    - [Rutas principales y secundarias](#Rutas-principales-y-secundarias)
    - [Relaciones jerárquicas entre vistas](#Relaciones-jerárquicas-entre-vistas)
    - [Flujo de navegación entre funcionalidades](#Flujo-de-navegación-entre-funcionalidades)
    - [Diferenciación de acceso según roles](#Diferenciación-de-acceso-según-roles)
    - [Flujo de tareas principales (Task Flow)](#Flujo-de-tareas-principales-(Task-Flow))
    - [Puntos críticos de interacción](#Puntos-críticos-de-interacción)
    - [Coherencia de experiencia entre dispositivos](#Coherencia-de-experiencia-entre-dispositivos)
    - [Justificación Técnica](#Justificación-Técnica)
8. [Prototipo de UI/UX de la aplicación](#Prototipo-de-UI/UX-de-la-aplicación)
9. [Librerías principales utilizadas](#Librerías-principales-utilizadas)

---
## **Justificación del problema**

Mantener el orden en las comunidades es de vital importancia para el bienestar común de las personas que forman parte de ellas, por ello es primordial evitar o amedrentar cualquier evento que amenace dicho orden. Con eso en mente, los proyectos de patrullaje preventivo resultan ser una carta muy útil para combatir estos problemas que amenzan el orden, como lo pueden ser la concentración de delitos, incivilidades o violencia. 

Sin embargo, para conseguir buenos resultados con dichos proyectos requerimos tener un buen manejo de los datos obtenidos en los patrullajes, de manera que podamos ver e interpretar la información obtenida de manera cómoda y ordenada. La claridad en la información resulta muy importante para saber si el proyecto va por buen camino o hay que gestionar los procesos de una manera distinta para tener mejor desempeño. 

El Manejar los datos por medio de planillas excel y documentos de texto resulta ser muy limitado a comparación de las múltiples opciones que nos ofrece un software especializado en la gestión de este tipo de información. Por ello, se opta por desarrollar la presente plataforma, la cual tiene como objetivo administrar de manera óptima los datos generados por los patrullajes, además de gestionar de forma agradable la planificación de eventos. Con este sistema, los distintos trabajadores de proyectos de patrullaje preventivos podrán realizar sus labores de forma amena y simple, pero con una mejor organización de los datos gracias a unas interfaces fáciles de usar.

----
## **Usuarios objetivo**
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
* Registrar y controlar el inventario de objetos (vehículos y equipamiento) asignados a cada proyecto o patrullaje.
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

## **Roles**
**Patrullero:** Encargado de realizar rondas en terreno y reportar incidentes. Utiliza la aplicación móvil.  
**Supervisor:** Encargado de la gestión de patrullajes. Utiliza la aplicacion web.  
**Administrador:** Responsable de la gestion de usuarios y la configuración de los proyectos de patrullaje preventivo. Utiliza la app de web.

---
## Proto-personas
Estas proto-personas representan perfiles hipotéticos elaborados para guiar el diseño y desarrollo del proyecto. No provienen de investigaciones directas con usuarios reales, sino de una caracterización preliminar basada en el análisis del problema dado y las necesidades esperadas. 

### Proto-persona 1: Administrador
Nombre: Carlos Morales (42 años).  
Rol: Administrador.

Caracteristicas generales:  
Profesional ordenado, metódico y enfocado en la gestión eficiente de recursos municipales. Trabaja en horario de oficina desde la central de operaciones. Es el encargado de coordinar presupuestos, flota vehicular, equipamiento y proyectos de patrullaje.

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
Nombre: Maria Rodriguez (35 años).  
Rol: supervisor.

Caracteristicas generales:  
Profesional con formación técnica o experiencia previa en centros de control, monitoreo o atención de emergencias. Acostumbrada a jornadas de trabajo frente a monitores, toma de decisiones rápida en situaciones de estrés y comunicación directa con equipos en terreno.

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
* Ubicaciones GPS imprecisas o pérdida de la señal de algún patrullero.
* Fatiga visual tras largas horas frente a la pantalla.

Funcionalidades de la aplicación que usaría:
* Registrar y planificar patrullajes.
* gestionar actividades en el calendario.
* Recepción de incidentes.
* Monitoreo de GPS en vivo a través de un mapa.

Dispositivo y contexto probable de acceso:  
Computador de escritorio o notebook. Contexto de oficina con conexión a internet estable y pantallas amplias.

### Proto-persona 3: Patrullero
Nombre: Matias Delgado (38 años).  
Rol: Patrullero.

Caracteristicas generales:  
Personal operativo de seguridad que realiza rondas preventivas en terreno. Trabaja en un entorno dinámico y cambiante que exige mantener constante atención visual y auditiva al entorno físico, por lo que interactúa con la aplicación mediante accesos breves y puntuales. Cuenta con capacitación formal en protocolos de seguridad, contención de riesgos y procedimientos de patrullaje en la vía pública.

Necesidades principales: 
* Conocer su patrullaje próximo.
* Reportar las novedades importantes mientras está en su ronda.
* Contar con una vía de auxilio inmediata ante agresiones o emergencias graves en terreno.
* Indicar el equipamiento que va a utilizar en el turno.

Objetivos de usos: 
* Visualizar el área de su proxima ronda, además de su fecha y hora de inicio y termino.
* Documentar e ingresar incidentes detectados durante su patrullaje.
* Solicitar apoyo de emergencia al supervisor mediante el botón de pánico.
* Informar al equipo qué se va a utilizar, al igual que dar inicio al patrullaje.

Dificultades o puntos de frustración: 
* Utilizar el dispositivo móvil mientras conduce o cuando se encuentra en exteriores. 
* Hacer uso de la aplicación en lugares con poca covertura.

Funciones que usaría:
* Registro de incidentes
* Llenar la lista de equipamiento y comenzar el turno.
* Botón de pánico integrado


Contexto de uso:  
Aplicación móvil (android). Se utilizará en exteriores, a pie o en vehículo, con conectividad a internet variable y bajo presión de tiempo.

---

## Especificacion de requerimientos

A continuacion, se detallan los requerimientos del sistema planteado, con la intencion de dar el mayor detalle de las características que tendrá la plataforma final. Aquí encontramos una tabla resumen con los títulos de los requerimientos funcionales y no funcionales y luego se proceden a especificar a detalle cada uno de ellos.

| ID | Título de requerimiento funcional                         | Rol                                   | Interfaz    |
|----| ----------------------------------------------------------|:--------------------------------------|:------------|
|RF01| Gestión de proyectos de patrullaje preventivo             | Administrador                         |SistemaGestor|
|RF02| Gestión de patrullajes por proyecto                       | Administrador y supervisor            |SistemaGestor|
|RF03| Gestión de inventario por proyecto                        | Administrador y supervisor            |SistemaGestor|
|RF04| Implementación de calendario por proyecto                 | Administrador y supervisor            |SistemaGestor|
|RF05| Visualización de ubicación de los patrulleros por proyecto| Administrador y supervisor            |SistemaGestor|
|RF06| Realización de patrullaje planificado                     | Patrullero                            |AppPatrullaje|
|RF07| Registro de incidentes en patrullaje                      | Patrullero                            |AppPatrullaje|
|RF08| Disponer botón de pánico para eventos riesgosos           | Patrullero                            |AppPatrullaje|
|RF09| Visualizar calendario personal de patrullajes planificados| Patrullero                            |AppPatrullaje|
|RF10| Visualización de incidentes por proyecto                  | Administrador y supervisor            |SistemaGestor|
|RF11| Gestion de usuarios en sistema                            | Administrador                         |SistemaGestor|
|RF12| Gestión de trabajadores por proyecto                      | Administrador y supervisor            |SistemaGestor|
|RF13| Disponer inicio de sesión                                 | Administrador, supervisor y patrullero|Ambas        |



| ID    | Título de requerimiento no funcional         |
| ----- | -------------------------------------------- |
| RNF01 | Encriptación de contraseñas                  |
| RNF02 | Base de datos PostgreSQL                     |
| RNF03 | Restricción por roles                        |
| RNF04 | Protección de credenciales API               |
| RNF05 | Manejar operaciones síncronas y asíncronas   |
| RNF06 | Portabilidad en android                      |


### Requerimientos funcionales (RF)

* **RF01**: El sistema debe permitir gestionar proyectos de patrullaje preventivo por medio de un CRUD, implementando cada opción de la siguiente manera:
    * Crear proyecto: Se debe contar con un formulario para agregar proyectos de patrullaje preventivo, que registre: Nombre del proyecto (Campos de texto), fecha de inicio y de término (2 Campos de fecha respectivamente), presupuesto asignado (Campo numérico), supervisor encargado (Lista desplegable que muestra los supervisores existentes en el sistema) y patrulleros que trabajarán en él (Lista con patrulleros agregables, en base a los patrulleros existentes en el sistema). Además, debe contar con un mapa interactivo, dando la opción de marcar vértices para formar un polígono, y así indicar el área seleccionada para el proyecto. El formulario tendrá un botón para enviar los datos, de modo que al presionarlo valide que todos los campos están completos, y cree el proyecto.
    * Visualizar proyecto: Se podrá observar un resumen de los datos ingresados en la creación del proyecto de patrullaje preventivo en una lista de tarjetas.
    * Actualizar datos de proyecto: En las tarjetas donde se visualiza el resumen de los datos del proyecto se dispondrá de un botón para editar los registros ingresados en la creación del proyecto, mostrando un formulario con los mismos campos que tiene el de creación.
    * Borrar proyecto: En cada tarjeta de visualización de proyecto se dispondrá de un botón para eliminar el respectivo proyecto de patrullaje preventivo. Al presionar el botón, se mandan dos mensajes para confirmar si realmente quiere borrar el proyecto, teniendo que confirmar dos veces para borrarlo.

* **RF02**: El sistema debe permitir gestionar los patrullajes para cada proyecto de patrullaje preventivo. Lo anterior se cumple por medio de las siguientes opciones:
    * Planificar patrullaje: Para un día seleccionado, podremos planificar un patrullaje por medio de un formulario que solicite: el encargado del patrullaje (Lista desplegable con los patrulleros que trabajan en ese proyecto), el acompañante de dicho patrullaje (lista desplegable igual a la anterior, pero agregando la opción de "ninguno"), la hora de inicio y de término (2 Campos de fecha respectivamente). Además, se cuenta con un mapa interactivo que permite marcar vértices para formar un polígono que delimite el área a patrullar. Se tiene un botón para registrar la planificación del patrullaje, al presionarlo valida que los patrulleros seleccionados tengan disponible su horario en la hora acordada para el patrullaje, y también valida que el área marcada por el polígono esté dentro del área del proyecto. Tras eso, planifica el patrullaje.
    * Modificar patrullaje planificado: Para un patrullaje seleccionado de un día, podremos modificar alguno de los datos obtenidos en el formulario de planificar patrullaje. Para lo anterior se dispone de un formulario igual al de planificación de patrullaje, incluyendo las mismas validaciones al presionar el botón de actualizar datos.

* **RF03**: El sistema debe permitir gestionar el inventario de un proyecto de patrullaje preventivo, permitiendo almacenar la información de los vehículos y artículos disponibles para los patrullajes. Lo anterior se cumple con las siguientes opciones:
    * Registrar vehículo: Se dispone un formulario para agregar un vehículo para patrullajes, el cual solicita: el tipo de vehículo (Lista desplegable, con las opciones definidas en el archivo CatalogoDeVehiculos), el nombre del vehículo (Campo de texto), su patente o identificador (Campo de texto), y equipamiento para el vehículo (Lista con artículos de categoría "EquipamientoVehicular" que estén registrados en el inventario). Se tiene un botón para registrar el vehículo al tocarse.
    * Visualizar vehículos: Se cuenta con una lista de tarjetas que muestran el nombre del vehículo, su tipo y la patente o identificador correspondiente.
    * Modificar vehículo: Junto a la visualización de cada vehículo se cuenta con un botón para editar los datos registrados. Para lo anterior se tiene el mismo formulario que se usó para crear el vehículo.
    * Eliminar vehículo: En la tarjeta de visualización del vehículo se cuenta con un botón para eliminar un registro de vehículo. Al apretarlo, nos mostrará un mensaje que pide confirmar si realmente queremos borrar el registro.
    * Registrar artículo: Se cuenta con un formulario que permite registrar artículos, solicitando: la categoria de artículo (Selección entre "EquipamientoPersonal" o "EquipamientoVehicular"), el artículo a registrar (Lista desplegable, con las opciones definidas en los archivos "CatalogoDeEquipamientoVehicular" o "CatalogoDeEquipamientoPersonal"), el identificador del artículo (Campo de texto), y talla (si corresponde, campo de texto). Existe un botón para registrar el artículo.
    * Visualizar artículo: Se muestra la cantidad existente de cada artículo de los archivos de equipamiento, siempre y cuando se tenga más de 1 en el inventario. Además, se tiene una lista de tarjetas que por cada una de ellas muestra la información obtenida en el registro de artículo.
    * Modificar artículo: En las tarjetas de visualización de los artículos se tiene un botón para modificar los datos registrados, usando un formulario igual al de creación de artículo.
    * Eliminar artículo: Se tiene un botón para quitar un artículo específico registrado en el sistema. Tras presionarlo, pedirá confirmación para eliminarlo. 

* **RF04**: El sistema tendrá integrado un calendario por cada proyecto de patrullaje preventivo, el cual permitirá planificar y visualizar la coordinación de patrullajes y actividades. El calendario muestra los días por mes, y al seleccionar uno de esos días uno puede coordinar un patrullaje, o una actividad. 
    * Para la planificación de patrullaje ver RF02. 
    * Para la planificación de actividad se tiene un formulario que solicita el título de la actividad (Campo de texto), y una descripción (Campo de texto). 
    * Visualmente, los patrullajes y actividades se ven en los días del calendario como puntos de colores.
    * El calendario debe indicar visualmente el día actual en el que nos encontramos, basándose en la hora de la zona del proyecto.

* **RF05**: El sistema debe permitir visualizar la ubicación de los patrulleros que se encuentran en patrullajes activos, mostrándola a través de un mapa geográfico de la zona del proyecto de patrullaje preventivo.
    * Habrá una marca muy clara visualmente de dónde se encuentra cada patrullero.
    * Existe la opción de seleccionar la marca visual de cada patrullero en el mapa para poder visualizar información sobre su patrullaje activo, viendo el nombre del patrullero, la patente o identificador del vehículo en el que está patrullando, y las horas de inicio y término del patrullaje que está realizando.

* **RF06**: La aplicación debe mostrar en el inicio el siguiente patrullaje asignado a nuestro usuario, mostrando la información que contiene la planificación del patrullaje. Además, dispone de un botón para iniciar el proceso de patrullaje (Dicho botón solo es presionable cuando falten menos de 15 minutos para que sea la hora de inicio del patrullaje). Tras presionar el botón cuando sea posible, la aplicación nos solicitará la patente o el identificador del vehículo que vamos a utilizar (Campo de texto), y además podremos agregar a una lista los artículos de equipamiento personal que vamos a llevar al patrullaje (En base a la disponibilidad del inventario del proyecto). Se tiene un botón para confirmar el inicio de patrullaje una vez que ya ingresamos los datos anteriores. Tras iniciar el patrullaje exitosamente, la aplicación nos mostrará un mapa geográfico que indica la zona donde tenemos que patrullar, y además se indicará la hora de inicio y de término.

* **RF07**: La aplicación debe contar con un botón para registrar incidentes cuando estamos en un patrullaje activo. Dicho botón nos llevará a un formulario que permite avisar de cualquier incidente que pueda suceder mientras un patrullero hace su ronda. Para lo anterior, tendremos que registrar: Categoría del incidente (Selección de opción entre "Delito" o "Incivilidad"), fotos del suceso (Si se tienen, se suben por un botón que permite cargar las fotos), gravedad del incidente (Lista desplegable con opciones de una escala de gravedad), y las observaciones del suceso (Campo de texto). Tras llenar esos datos, se puede enviar el incidente con un botón correspondiente.

* **RF08**: La aplicación debe disponer de un botón de pánico para situaciones de emergencia donde los patrulleros requieran ayuda o apoyo. Dicho botón debe ser visible y accesible al estar realizando un patrullaje. Su funcionamiento se detalla de la siguiente manera:
    * Al presionar el botón se envía un aviso muy notorio a la vista del supervisor del proyecto, donde él podrá mirar claramente qué patrullero le está pidiendo socorro, y en qué ubicación se encuentra actualmente patrullando.
    * Para solicitar ayuda correctamente con el botón se debe mantener presionado por 5 segundos, esto con la intención de evitar clicks por error.
    * El botón solamente manda un aviso al supervisor, sin ningún contexto de la situación que está pasando el patrullero, es por ello que la función está recomendada para ser utilizada solo en situaciones de peligro inminente para el patrullero.

* **RF09**: La aplicación debe mostrar el calendario de patrullajes que se le han asignado a un patrullero. Dicho calendario tiene un formato de días por mes, y marca las planificaciones de patrullaje que nos han asignado con puntos de color. El presente calendario es global para el patrullero, de forma que si está en varios proyectos de patrullaje preventivo, él podrá ver todos los patrullajes juntos en este mismo calendario. Se le puede hacer click a un día específico del calendario para ver a más detalle el o los patrullajes que se tienen planificados para ese día, informando del proyecto al que pertenecen, el área seleccionada para patrullar, y la hora de inicio y término.

* **RF10**: El sistema debe mostrar una lista con tarjetas de información de los distintos incidentes que han reportado los patrulleros en sus actividades de patrullaje. Dichas tarjetas deben mostrar: la categoría del incidente, la fecha en que se registró, quién lo reportó, las observaciones escritas, las fotos adjuntadas, y la gravedad del suceso asignada por el patrullero. Para una visualización más ordenada, se cuenta con opciones para ordenar los incidentes registrados por categoría, fecha, o patrullero, de esa manera podemos agrupar la información de manera más flexible.

* **RF11**: El sistema debe permitir gestionar los usuarios que existen en el sistema, pudiendo agregar, visualizar y eliminar registros de usuario según sea necesario. Las anteriores funciones se cumplen de la siguiente manera:
    * Agregar usuario: Se cuenta con un formulario donde se solicita: el nombre completo de la persona, su rut, correo, teléfono, y el rol que le asignaremos en el sistema (Supervisor o patrullero). Además, también se puede subir una foto de dicha persona para que le quede guardada en su perfil. Para registrar al usuario, se cuenta con un botón que al presionarlo valida que el RUT sea válido, o que no exista otro usuario con el mismo RUT, tras ello, se crea el usuario nuevo. Al crear un usuario, se genera una contraseña aleatoria que es informada por el sistema al creador, de modo que la primera vez que el nuevo usuario inicie sesión deberá usar esa clave para entrar.
    * Visualizar usuarios: Se visualiza una lista de tarjetas, donde cada una de ellas muestra un resumen de la información de un usuario registrado en el sistema.
    * Eliminar usuario: En la tarjeta donde se visualiza cada usuario, se dispone también de un botón para eliminar su registro. Al apretar dicho botón, el sistema nos pedirá confirmar 2 veces para efectivamente eliminarlo.
    * Además, cada usuario cuando acceda al sistema podrá visualizar sus datos personales registrados en el sistema, pudiendo modificar dicha información con un formulario similar al de creación de usuario que tiene el administrador.

* **RF12**: El sistema debe permitir gestionar los trabajadores asignados a cada proyecto, permitiendo visualizar, agregar o eliminar usuarios. Las funciones anteriores se cumplen de la siguiente manera:
    * Visualizar trabajadores: Se muestra una lista con tarjetas, donde cada una de ellas indica el nombre y rol de cada usuario relacionado con el proyecto.
    * Agregar trabajadores: Se tiene una lista desplegable que permite seleccionar cualquier usuario registrado en el sistema que sea de menor nivel que el nuestro, y un botón para agregar el usuario seleccionado como trabajador al proyecto de patrullaje preventivo.
    * Eliminar trabajador: En la tarjeta de visualización de cada trabajador se cuenta con un botón para quitar a esa persona del proyecto de patrullaje preventivo seleccionado. Tras apretar el botón, nos pedirá confirmar si realmente queremos eliminar a esa persona del proyecto.

* **RF13**: El sistema debe permitir iniciar sesión en la plataforma por medio de un formulario login que nos solicite las credenciales de acceso (Correo o rut, y contraseña). El sistema tendrá registrado de base 2 usuarios administradores para poder acceder a la plataforma, después, dichos usuarios podrán registrar más personas en base al RF11. Todo usuario nuevo que inicie sesión por primera vez en la plataforma deberá obligatoriamente cambiar su contraseña provisoria a una personal, definida por ellos mismos.

### Requerimientos no funcionales (RNF)

* **RNF01**: El sistema debe almacenar las contraseñas de cada usuario con una encriptación bcrypt, con la intención de proteger las claves ante posibles fugas o ataques que pueda sufrir la base de datos de la plataforma.

* **RNF02**: El sistema debe manejar todos los datos de registros y transacciones internamente con una base de datos que tenga arquitectura relacional, usando específicamente el sistema de postgreSQL.

* **RNF03**: El sistema debe restringir los niveles de acceso que tienen los distintos roles del sistema. La jerarquia entre roles quedaria de forma: Administrador (Nivel 3), Supervisor (Nivel 2), Patrullero (Nivel 1). El administrador tiene acceso y permisos para todos los requerimientos de la plataforma. El supervisor tiene acceso y permiso para los requerimientos RF2, RF3, RF4, RF5, RF10, RF12 y RF13. El patrullero tiene acceso y permiso para todos los requerimientos de la aplicación de patrullaje (RF6, RF7, RF8, RF9 y RF13).

* **RNF04**: El sistema debe proteger las credenciales de autenticación para conexiones con APIs utilizadas en la plataforma, evitando dejar dichos datos en lugares que tenga acceso un usuario del sistema o en el repositorio público donde se encuentra el desarrollo de la plataforma.

* **RNF05**: El sistema debe manejar correctamente las operaciones síncronas y asíncronas según corresponda, evitando bloqueos por tiempos de espera de respuestas de alguna API, que puede causar lentitud en el flujo de tareas de los usuarios.

* **RNF06**: La interfaz del patrullero debe funcionar correctamente en sistemas operativos Android.

## Definición de arquitectura de navegación y experiencia del usuario

### Rutas principales y secundarias

La arquitectura de navegación del sistema se ha diseñado segmentando el acceso y la experiencia según el rol del usuario, definiendo la plataforma de despliegue.
Rutas principales (vistas de primer nivel o de acceso directo) y secundarias (vistas de detalle o formularios asociados a una ruta principal) para cada perfil de usuario.

Ruta de autenticación:
`/login` Pantalla inicial donde el usuario ingresa su correo/RUT y clave.

**1. Plataforma Web: Rol Administrador**

Rutas principales:  
`/admin/inicio` Listado de proyectos activos y Dashboard principal.  
`/admin/historial` Vista del historial general de proyectos.  
`/admin/usuarios` Vista con el listado del personal registrado.  
`/admin/perfil` Vista de datos del usuario (solo lectura).  

Rutas secundarias:  
`/admin/inicio/agregar-proyecto` Formulario para agregar un proyecto nuevo.  
`/admin/proyecto/:id` Vista de detalles del proyecto seleccionado.  

Al hacer clic en un proyecto desde el listado inicial (`/admin/inicio`), el sistema direcciona a `/admin/proyecto/:id/...`, desplegando el mismo entorno operativo de menú lateral del rol Supervisor. Esto permite que el Administrador navegue por las sub-vistas del proyecto (cronograma, inventario, mapa, etc.) manteniendo la coherencia estructural pero operando con privilegios de control total.  

`/admin/inicio/editar-proyecto` Formulario para modificar los parámetros de un proyecto existente.  
`/admin/usuarios/agregar` Formulario para registrar un usuario nuevo.  
`/admin/usuarios/detalle` Vista con la ficha de información detallada del usuario.  
`/admin/usuarios/editar` Formulario para modificar los datos de un usuario.  

**2. Plataforma Web: Rol Supervisor**

Rutas principales:  
`/supervisor/inicio` Vista inicial con el listado de proyectos activos a los que el Supervisor tiene acceso.  

`/supervisor/proyecto/:id/inicio-proyecto` Vista con detalle del proyecto seleccionado y actividades futuras.  
`/supervisor/proyecto/:id/cronograma` Vista del calendario para la planificación operativa.  
`/supervisor/proyecto/:id/inventario` Vista de gestión de vehículos y listado de artículos disponibles.  
`/supervisor/proyecto/:id/mapa-gps` Vista del mapa interactivo para el monitoreo de dispositivos en tiempo real.  
`/supervisor/proyecto/:id/historial` Vista de historial de patrullajes.  
`/supervisor/proyecto/:id/personal` Vista con el listado de los trabajadores asignados.  
`/supervisor/perfil` Vista de datos del usuario (solo lectura).  

Rutas secundarias:  
`/supervisor/proyecto/:id/cronograma/registrar-patrullaje` Formulario para la asignación de encargados, acompañantes y horarios.  
`/supervisor/proyecto/:id/cronograma/registrar-actividad` Formulario para añadir nuevas actividades a un día específico del calendario.  
`/supervisor/proyecto/:id/inventario/vehiculos/agregar` Formulario para registrar un vehículo nuevo y asignarle artículos vehiculares.  
`/supervisor/proyecto/:id/inventario/articulos` Vista con el listado detallado de todos los artículos registrados y barra de búsqueda.  
`/supervisor/proyecto/:id/inventario/articulos/registrar` Formulario para registrar un nuevo artículo, especificando categoría, tipo, identificador y talla.  

**3. Plataforma Móvil: Rol Patrullero**

Rutas principales:  
`/patrullero/inicio` Detalle del próximo patrullaje asignado.  
`/patrullero/calendario` Vista de planificación de patrullajes.  
`/patrullero/perfil` Vista de datos del usuario.  

Rutas secundarias:  
`/patrullero/inicio/preparacion` Vista de preparación para el patrullaje.  
`/patrullero/inicio/preparacion/agregar-articulo` Formulario para modificar los artículos a utilizar, permitiendo agregar o eliminar artículos.  
`/patrullero/inicio/patrullaje-activo` Vista del mapa interactivo durante el patrullaje.  
`/patrullero/inicio/patrullaje-activo/reportar` Formulario para reportar un incidente.  

### Relaciones jerárquicas entre vistas
```
[Ruta Pública]
 └── /login (Autenticación)
```
**Plataforma web: Rol administrador**
```
[Ruta Protegida]
[Nivel 0]
 └── /admin
       │
       └── [Nivel 1]
            ├── /admin/inicio
            │    │
            │    └── [Nivel 2]
            │         ├── /admin/inicio/agregar-proyecto
            │         ├── /admin/inicio/editar-proyecto
            │         └── /admin/proyecto/:id (Despliega menú lateral operativo)
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
**Plataforma web: Rol supervisor**
```
[Ruta Protegida]
[Nivel 0]
 └── /supervisor
       │
       └── [Nivel 1]
            ├── /supervisor/inicio
            ├── /supervisor/perfil
            │
            └── /supervisor/proyecto/:id
                 │
                 └── [Nivel 2]
                      ├── /supervisor/proyecto/:id/inicio-proyecto
                      │
                      ├── /supervisor/proyecto/:id/cronograma
                      │    │
                      │    └── [Nivel 3]
                      │         ├── /supervisor/proyecto/:id/cronograma/registrar-patrullaje
                      │         └── /supervisor/proyecto/:id/cronograma/registrar-actividad
                      │
                      ├── /supervisor/proyecto/:id/inventario
                      │    │
                      │    └── [Nivel 3]
                      │         ├── /supervisor/proyecto/:id/inventario/vehiculos/agregar
                      │         └── /supervisor/proyecto/:id/inventario/articulos
                      │               │
                      │               └── [Nivel 4]
                      │                    └── /supervisor/proyecto/:id/inventario/articulos/registrar
                      │
                      ├── /supervisor/proyecto/:id/mapa-gps
                      │
                      ├── /supervisor/proyecto/:id/historial
                      │
                      └── /supervisor/proyecto/:id/personal
```
**Plataforma móvil: Rol patrullero**
```
[Ruta Protegida]
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
            │
            └── /patrullero/perfil
```
### Flujo de navegación entre funcionalidades
El sistema presenta los siguientes flujos de navegación dinámicos principales, los cuales guían al usuario transversalmente entre módulos al completar tareas clave.  
La flecha (→) indica la vista a la que se retorna o redirecciona después de ejecutar la acción indicada.  

**Matriz de transiciones: Rol administrador**

| Vista Origen                      | Acción (Gatillador)          | Vista Destino                          | Comportamiento / Retorno       |
| --------------------------------- | ---------------------------- | -------------------------------------- | ------------------------------ |
| `/login`                          | Autenticación válida         | `/admin/inicio`                        | Acceso al sistema              |
| `/admin/inicio`                   | Clic en `[Agregar proyecto]` | `/admin/inicio/agregar-proyecto`       | Guardar → `/admin/inicio`      |
| `/admin/inicio`                   | Clic en `[Ver]`              | `/admin/proyecto/:id`       | Despliega entorno y menú lateral de gestión del proyecto       |
| `/admin/inicio`                   | Clic en `[Editar]`           | `/admin/inicio/editar-proyecto`        | Guardar → `/admin/inicio`      |
| `/admin/usuarios`                 | Clic en `[Agregar usuario]`  | `/admin/usuarios/agregar`              | Guardar → `/admin/usuarios`    |
| `/admin/usuarios`                 | Clic en `[Ver]`              | `/admin/usuarios/detalle`              | Volver → `/admin/usuarios`     |
| `/admin/usuarios`                 | Clic en `[Editar]`           | `/admin/usuarios/editar`               | Guardar → `/admin/usuarios`    |
| Cualquier vista del administrador | Clic en `[Logo]`             | `/admin/inicio`                        | Navegación directa al inicio   |
| Cualquier vista del administrador | Seleccionar opción en Navbar | Ruta asociada a la opción seleccionada | Navegación directa             |

**Matriz de transiciones: Rol supervisor**

| Vista Origen                       | Acción (Gatillador)                     | Vista Destino                            | Comportamiento Retorno     |
| ---------------------------------- | --------------------------------------- | ----------------------------------------------- | ----------    |
| `/login`	                      | Autenticación válida	                   | `/supervisor/inicio`                            | Acceso al sistema           |
| `/supervisor/inicio`               | Clic en [`Ver Proyecto`]        | `/supervisor/proyecto/:id/inicio-proyecto`	| Despliega entorno y menú lateral del proyecto |
| `/supervisor/proyecto/:id/cronograma`           | Clic en `[Registrar Patrullaje]`        | `/supervisor/proyecto/:id/cronograma/registrar-patrullaje`   | Guardar → `/supervisor/proyecto/:id/cronograma`  |
| `/supervisor/proyecto/:id/cronograma`	       | Clic en `[Registrar Actividad]`         | `/supervisor/proyecto/:id/cronograma/registrar-actividad`    | Guardar → `/supervisor/proyecto/:id/cronograma`  |
| `/supervisor/proyecto/:id/inventario`           | Clic en `[Agregar Vehículo]`            | `/supervisor/proyecto/:id/inventario/vehiculos/agregar`      | Guardar → `/supervisor/proyecto/:id/inventario`  |
| `/supervisor/proyecto/:id/inventario`           | Clic en `[Mostrar todos los artículos]` | `/supervisor/proyecto/:id/inventario/articulos`              | Navegación directa     |
| `/supervisor/proyecto/:id/inventario/articulos` | Clic en `[Registrar artículo]`   | `/supervisor/proyecto/:id/inventario/articulos/registrar`  | Registrar → `/supervisor/proyecto/:id/inventario/articulos`|
| Cualquier vista del supervisor     | Clic en `[Logo]`                        | `/supervisor/inicio`                            | Navegación directa al inicio |

**Matriz de transiciones: Rol patrullero**

| Vista Origen                           | Acción (Gatillador)                 | Vista Destino                                     | Comportamiento / Retorno                        |
| -------------------------------------- | ----------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| `/login`                               | Autenticación válida                | `/patrullero/inicio`                              | Acceso al sistema                               |
| `/patrullero/inicio`                   | Clic en `[Iniciar Patrullaje]`      | `/patrullero/inicio/preparacion`                  | Inicio del proceso de preparación.              |
| `/patrullero/inicio/preparacion`       | Clic en `[Agregar artículos]`       | `/patrullero/inicio/preparacion/agregar-articulo` | Guardar → `/patrullero/inicio/preparacion`      |
| `/patrullero/inicio/preparacion`       | Clic en `[Iniciar Patrullaje]`      | `/patrullero/inicio/patrullaje-activo`            | Inicio del patrullaje activo              |
| `/patrullero/inicio/patrullaje-activo` | Clic en `[Reportar Incidente]`      | `/patrullero/inicio/patrullaje-activo/reportar`   | Enviar → `/patrullero/inicio/patrullaje-activo` |
| Cualquier vista del patrullero         | Seleccionar opción en Menú Inferior | Ruta asociada a la pestaña seleccionada           | Navegación directa                              |

###  Diferenciación de acceso según roles 
La diferenciación de acceso se gestiona a nivel arquitectónico mediante **Rutas Protegidas (Protected Routes)** en React Router y renderizado condicional de componentes en la interfaz, garantizando que cada perfil interactúe exclusivamente con su entorno operativo.

**Gestión de Accesos y Privilegios (Matriz de Autorización)**
El sistema define tres niveles de acceso estrictos:  

| Módulo / Funcionalidad       | Administrador                       | Supervisor                                   | Patrullero                    |
| ---------------------------- | ----------------------------------- | -------------------------------------------- | ----------------------------- |
| Gestión de Proyectos         | Control Total (Todos los proyectos) | Visualización (Solo proyecto asignado)       | Sin Acceso                    |
| Gestión de Usuarios/Personal | Control Total (CRUD) y asignación   | Asignación (Solo selección para el proyecto) | Sin Acceso                    |
| Gestión de Inventario        | Modificación (Agregar/Editar stock) | Modificación (Agregar/Editar stock)          | Selección de uso              |
| Gestión de Patrullaje | Planificación (Asignación en cronograma) | Planificación (Asignación en cronograma)     | Ejecución (Iniciar)           |
| Reporte de Incidentes        | Solo Lectura                        | Solo Lectura                                 | Creación (Emisión en terreno) |

###  Flujo de tareas principales (Task Flow)
A continuación, se describen de forma lineal los principales procesos que cada usuario realiza para cumplir sus objetivos de negocio, desde el inicio hasta la finalización de la tarea.

**Task Flow 1: Creación y habilitación de un nuevo proyecto.**  
Rol: Administrador.  
Objetivo: Crear y habilitar un nuevo proyecto operativo en la plataforma web.  

```
Inicio de sesión
       ↓
Inicio del administrador
       ↓
Gestión de proyectos
       ↓
Seleccionar "Agregar Proyecto"
       ↓
Ingresar parámetros operativos requeridos
       ↓
Seleccionar "Crear Proyecto"
       ↓
¿Datos válidos?
 ↓            ↓
No           Sí
 ↓            ↓
Mostrar    Registrar
errores    proyecto
              ↓
    Mostrar confirmación
              ↓
 Visualizar en listado activo
```

**Task Flow 2: Registro de nuevo personal operativo**  
Rol: Administrador  
Objetivo: Registrar y asignar rol a un nuevo trabajador en el sistema.  

```
Inicio de sesión
       ↓
Inicio del administrador
       ↓
Módulo de usuarios
       ↓
Seleccionar "Agregar usuario"
       ↓
Ingresar datos personales
       ↓
Asignar rol (Supervisor o Patrullero)
       ↓
Seleccionar "Crear Usuario"
       ↓
¿Datos válidos?
  ↓            ↓
 No           Sí
  ↓            ↓
Mostrar      Registrar
errores      usuario
              ↓
     Mostrar confirmación
              ↓
     Visualizar en listado
```

**Task Flow 3: Planificación y asignación de un patrullaje**  
Rol: Supervisor  
Objetivo: Planificar un patrullaje asignando personal a un día específico.  

```
Inicio de sesión
       ↓
Inicio (listado de proyectos)
       ↓
Seleccionar proyecto
       ↓
Módulo de cronograma
       ↓
Seleccionar día en el calendario
       ↓
Seleccionar "Registrar Patrullaje"
       ↓
Asignar encargado de ruta y acompañantes
       ↓
Seleccionar "Registrar"
       ↓
¿Datos válidos?
  ↓          ↓
  No         Sí
  ↓          ↓
Mostrar    Registrar
errores    patrullaje
             ↓
    Actualizar cronograma
```

**Task Flow 4: Registro de vehículos y artículos en el inventario**  
Rol: Administrador y Supervisor  
Objetivo: Registrar un nuevo vehículo o artículo en el inventario del proyecto.  

```
Inicio de sesión
       ↓
Inicio (listado de proyectos)
       ↓
Seleccionar Proyecto
       ↓
Módulo de inventario
       ↓
¿Qué recurso registrar?
    ↓                  ↓
Vehículo            Artículo
    ↓                  ↓
Seleccionar         Seleccionar "Mostrar
"Agregar Vehículo"  todos los artículos"
    ↓                  ↓
Ingresar tipo,      Seleccionar "Registrar
nombre y patente    artículo"
    ↓                  ↓
Seleccionar art.    Ingresar categoría,
vehiculares         identificador y talla
    ↓                  ↓
Seleccionar         Seleccionar
"Registrar          "Registrar
vehículo"           artículo"
          ↘        ↙
       ¿Datos válidos?
          ↓      ↓
         No      Sí
          ↓      ↓
    Mostrar     Registrar recurso
    errores          ↓
               Actualizar inventario
```

**Task Flow 5: Ejecución de patrullaje y reporte de novedades**  
Rol: Patrullero  
Objetivo: Iniciar un patrullaje asignado, monitorear la ruta y reportar anomalías.  
```
Inicio de sesión en app móvil
            ↓
Inicio del patrullero
            ↓
Revisar próximo patrullaje asignado
            ↓
Seleccionar "Iniciar Patrullaje"
            ↓
Fase de preparación
            ↓
Confirmar vehículo y artículos
            ↓
Seleccionar "Iniciar Patrullaje" (Definitivo)
            ↓
Transición a mapa GPS activo
            ↓
¿Detecta anomalía en terreno?
    ↓                  ↓
    No                 Sí
    ↓                  ↓
Continuar       Seleccionar "Reportar
patrullaje      Incidente"
                       ↓
               Completar categoría,
               gravedad, foto y obs.
                       ↓
               Seleccionar "Reportar"
                       ↓
                ¿Datos válidos?
                  ↓        ↓
                 No        Sí
                  ↓        ↓
               Mostrar   Enviar
               errores   reporte
                           ↓
               Retornar al mapa GPS activo
```

### Puntos críticos de interacción
Corresponden a aquellas acciones o momentos del sistema en los que una interfaz poco clara, una validación insuficiente o una navegación compleja puede afectar significativamente la experiencia del usuario o la integridad de la información.  

Para este sistema se identifican los siguientes puntos críticos:  

1. Inicio de sesión y acceso según rol: El sistema deberá informar claramente cuando las credenciales sean incorrectas y, una vez autenticado el usuario, deberá redirigirlo al entorno correspondiente según su rol. También deberá impedir el acceso a funcionalidades no autorizadas.
2. Inicio del patrullaje activo: La transición desde la preparación al patrullaje activo deberá requerir una confirmación explícita e informar claramente al patrullero que el monitoreo GPS ha comenzado, evitando activaciones accidentales.
3. Registro de incidentes en terreno: El formulario de reporte deberá permitir registrar la información de manera rápida y clara, priorizando los datos esenciales y reduciendo el riesgo de pérdida de información durante el proceso.
4. Gestión de inventario y recursos: Las acciones de registro, asignación y modificación de vehículos y artículos deberán contar con validaciones y retroalimentación clara para evitar errores en el stock, duplicidad de asignaciones o inconsistencias en los datos.

### Coherencia de experiencia entre dispositivos
La experiencia entre las plataformas Web y Móvil deberá mantener una estructura coherente, adaptando la distribución de los elementos a las características de cada dispositivo.  

1. Navegación: La estructura se adaptará al dispositivo, manteniendo una lógica de navegación y terminología coherentes, mientras las funcionalidades se adaptan al rol y contexto de uso.  
2. Identidad visual: Se mantendrán consistentes los colores, tipografía, iconografía y estados de interacción.  
3. Lenguaje: Las etiquetas, botones y mensajes utilizarán una terminología común en ambas plataformas.  
4. Interacciones: Las acciones equivalentes mantendrán una lógica de funcionamiento consistente, aunque su presentación se adapte al dispositivo.  

### Justificación Técnica
La arquitectura de navegación se definió considerando criterios de usabilidad, eficiencia de interacción, claridad estructural y escalabilidad, adaptándose a las necesidades de los distintos roles y a la gestión de la información de los patrullajes.  
 
- Usabilidad: Se diferenciaron las interfaces según el contexto de uso, priorizando la gestión de datos en Web y las acciones rápidas en Móvil. 
- Eficiencia de interacción: Las tareas principales se estructuraron mediante recorridos directos, reduciendo pasos innecesarios en actividades como el inicio del patrullaje y el reporte de incidentes. 
- Claridad estructural: Las funcionalidades se organizaron jerárquicamente y según los roles (/admin, /supervisor, /patrullero), facilitando la navegación y el control de acceso.
- Escalabilidad: La organización modular permite incorporar nuevas funcionalidades y módulos sin alterar la estructura general de navegación.  
- --

## Prototipo de UI/UX de la aplicación
[Prototipo de la **aplicación web** en Figma](https://www.figma.com/proto/luq0vLrnyxx6yFhgkAImBM/SIPPREM?node-id=2052-5369&p=f&t=47KR1fhEi2rMMzYt-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1)

[Prototipo de la **aplicación móvil** en Figma](https://www.figma.com/proto/luq0vLrnyxx6yFhgkAImBM/SIPPREM?node-id=2027-2989&p=f&t=rUyJSRY9yLM1bh7c-1&scaling=scale-down&content-scaling=fixed&page-id=2019%3A2512&starting-point-node-id=2027%3A2989)

---
## Librerías principales utilizadas

| Librería | Propósito |
|---|---|
| `react` | Núcleo de la biblioteca para la construcción de interfaces de usuario mediante componentes reutilizables. |
| `react-dom` | Adaptador que permite el renderizado del árbol de componentes de React directamente en el DOM del navegador.|
| `@ionic/react` | Proporciona la suite de componentes UI móviles y web de Ionic (IonPage, IonContent, IonButton, IonInput, IonCard, etc.). |
| `@ionic/react-router` | Integra el sistema de navegación, transiciones e historial de Ionic sobre la arquitectura de React Router. |
| `react-router-dom` | Gestión y definición de la navegación declarativa y rutas entre las distintas vistas de la aplicación. |
| `ionicons` | Colección oficial de iconos utilizada por los componentes de Ionic.|
|  `leaflet`     | Biblioteca motor para la renderización, manipulación e interacción con mapas interactivos de código abierto.|
|  `react-leaflet` | Wrapper de React que expone los elementos de Leaflet como componentes declarativos.|
