# Requisitos Previos
Cuenta con las siguientes herramientas instaladas en tu sistema antes de comenzar:
- Git (para clonar y gestionar el repositorio)
- Node.js (v18 o superior) y npm
- PostgreSQL con la extensión PostGIS habilitada (necesaria para el almacenamiento de zonas geográficas)
- Ionic CLI (para el desarrollo y ejecución del frontend: `npm install -g @ionic/cli`)


## Guía de instalación y ejecución  
Clonar el repositorio  
Abre la CMD y ejecuta los siguientes comandos:

```
git clone https://github.com/Janoooh/SIPPREM.git
cd SIPPREM
cd SIPPREM-Gestor
npm install
```

### Backend (Servidor y API REST)

Compilar y Ejecutar
Abre tu terminal (CMD) en la raíz del proyecto y ejecuta:
```
cd siprem-backend
npm install
npx tsc
node dist/app.js
```
El servidor quedará escuchando en `http://localhost:3000`


Pruebas para el funcionamiento de la API REST con Postman
La API está desarrollada con Node.js, Express y TypeScript, conectándose a una base de datos PostgreSQL.
URL Base: `http://localhost:3000/api/v1`

### Como crear la base de datos

En este documento markdown se procede a explicar paso a paso como crear la base de datos con el archivo schema.sql presente en la carpeta database.

#### Proceso paso a paso

Para poder instalar y correr la base de datos necesitaremos tener instalado postgreSQL, idealmente en la version 18, pues con esa se trabajo en el desarrollo del proyecto. Si ya tenemos instalado el postgreSQL deberemos asegurarnos de que la ruta de la carpeta con los archivos del programa esten en una variable PATH. Para lo anterior podemos usar el siguiente comando en la CMD:
```
set PATH=%PATH%;C:\Program Files\PostgreSQL\18\bin
```
Dicho comando asocia la ruta a la variable PATH para esa instancia de la CMD (Lo que significa que si abrimos otra tenemos que usar el comando nuevamente). Considere que la ruta de la carpeta con los archivos de postgreSQL puede estan en otra ubicacion, por lo que debe comprobar en su computadora donde lo instalo exactamente.

Tras ejecutar lo anterior estamos asegurados de que podemos usar comandos de psql (El cliente CLI de postgreSQL). Para usar comandos de psql tendremos que utilizar un usuario de postgreSQL, el cual se detalla despues de poner el indicador "-U" en el comando. Para este caso se utilizara el usuario default postgres. Necesitaremos saber la clave del usuario seleccionado (En caso de no saber la clave del usuario postgres se puede cambiar por medio del software pgAdmin, un cliente GUI para postgreSQL. El cambio de clave se realiza con el comando "ALTER USER nombre_de_usuario WITH PASSWORD 'nueva_contrasena';").

Ahora, procedemos a crear la base de datos con el comando:
```
psql -U postgres -c "CREATE DATABASE sipprem_db;"
```

Tras tener la base de datos creada procederemos a ejecutar el script de schema.sql, usando el comando:
```
psql -U postgres -d sipprem_db -f database/schema.sql
```
Para lo anterior tenemos que asegurarnos de estar en la carpeta de SIPPREM-Backend del proyecto.

Tras la ejecucion correcta de los comandos anteriores tendremos nuestra base de datos creada, con los datos de prueba iniciales.

Considere que dependiendo del nombre que haya asignado a la base de datos tendra que configurar el archivo .env

### Configuracion del .env

Para el correcto funcionamiento de la API, tendremos que crear un archivo llamado ".env", el
cual debera tener el formato que tiene el archiv ".env.prueba". Se recomienda copiar el contenido
del archivo ".env.prueba" y copiarlo en el nuevo archivo creado ".env", ahi debera modificar el valor
de cada variable de entorno por lo que le indica el texto. 

**PONGA EL PUERTO 3000 EN BACKEND_PORT, para que la conexion del frontend sea exitosa.**

**En el desarrollo se utilizo el mismo texto CODIGOGENERADORDEJWT en la variable de entorno de JWT_SECRET, puede usar el mismo.**

**En la variable DB_USER se coloca el nombre del usuario que utilizara para conectarse a la base de datos, se recomienda poner el usuario postgres. La variable DB_PASSWORD es la clave de dicho usuario seleccionado.**

**La variable DB_HOST se debe dejar localhost para el correcto funcionamiento del frontend y backend.**

**Como el instructivo para crear la base de datos pone de nombre sipprem_db, se recomienda poner ese valor para la variable de entorno DB_NAME.**

### Pruebas de Endpoints (Postman)

Se recomienda utilizar **Postman** para realizar las pruebas de forma rápida y visual. La colección incluye todos los casos de éxito y los principales casos de error y validaciones de negocio.  
Sigue estos pasos para configurar el entorno:  
1. Importar la colección:  
   * Carga el archivo `pruebas_sipprem.postman_collection.json` dentro de Postman.

2. Autenticación (JWT):  
   * Utiliza ambas peticiones de login disponibles (`Obtener Token Admin` u `Obtener Token Patrullero`).
   * Copia el token obtenido y guárdalo en su respectiva variable global (`TokenAdmin` o `TokenPatrullero`).

3. Ejecución de operaciones:  
   * Con las variables listas, se puede realizar una ejecución masiva haciendo clic en los tres puntos (`...`) al lado de `My Collection`, seleccionando `Run` y ejecutando el flujo completo.

# Módulo de proyectos
Módulo encargado de la gestión completa de proyectos de patrullaje. Incluyendo operaciones de creación, listado, obtención por ID, actualización y eliminación.

## 1. Listar todos los proyectos
Obtiene un listado de todos los proyectos activos que no hayan sido eliminados lógicamente.

Método: `GET`  
Ruta: `/api/v1/proyectos`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros: Ninguno  

Respuestas Esperadas:  
- 200 OK: Devuelve la lista con los proyectos encontrados.

```JSON
{
"ok": true,
"message": "Proyectos obtenidos correctamente.",
"data": [ ... ]
}
```

Casos de Error:  
- 404 Not Found: No hay proyectos registrados en el sistema.
- 500 Internal Server Error: Error interno del servidor al procesar la solicitud.

## 2. Crear un proyecto
Registra un nuevo proyecto de patrullaje en la base de datos.

Método: `POST`  
Ruta: `/api/v1/proyectos`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`  
Body requerido (JSON):  

```JSON
{
  "nombre_proyecto": "string",
  "nombre_sector": "string",
  "presupuesto": "number",
  "fecha_inicio": "string (YYYY-MM-DD)",
  "fecha_termino": "string (YYYY-MM-DD)",
  "zona_seleccionada": "any (coordenadas o datos de zona)"
}
```
Respuestas Esperadas:  
- 201 Created: Proyecto creado exitosamente.

```JSON
{
  "ok": true,
  "message": "Proyecto creado correctamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: Faltan datos obligatorios en el cuerpo de la petición.
- 500 Internal Server Error: Error interno al intentar guardar el proyecto.

## 3. Obtener un proyecto por ID
Busca y devuelve los detalles de un proyecto específico a través de su identificador único.  

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):
- `id_proyecto` (number): ID único del proyecto.  

Respuestas Esperadas:  
- 200 OK: Devuelve los datos del proyecto encontrado.

```JSON
{
  "ok": true,
  "message": "Proyecto encontrado correctamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: El ID proporcionado no es válido o no es numérico.
- 404 Not Found: El proyecto solicitado no existe o ya fue eliminado.
- 500 Internal Server Error: Error interno del servidor.

## 4. Actualizar un proyecto
Modifica los datos de un proyecto existente.  

Método: `PUT`  
Ruta: `/api/v1/proyectos/:id_proyecto`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto a actualizar.  

Body (JSON):  
```JSON
{
  "nombre_proyecto": "string",
  "nombre_sector": "string",
  "presupuesto": "number",
  "fecha_inicio": "string",
  "fecha_termino": "string",
  "zona_seleccionada": "any",
  "activo": "boolean"
}
```
Respuestas Esperadas:  
- 200 OK: Proyecto actualizado correctamente.

```JSON
{
  "ok": true,
  "message": "Proyecto actualizado correctamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: El ID enviado en la ruta no es válido.
- 404 Not Found: El proyecto no existe o ya fue eliminado.
- 500 Internal Server Error: Error interno al actualizar.

## 5. Eliminar un proyecto (Eliminación lógica)
Realiza una baja lógica del proyecto cambiando su estado de eliminación a verdadero (eliminado = true).  

Método: `DELETE`  
Ruta: `/api/v1/proyectos/:id_proyecto`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.  

Respuestas Esperadas:  
- 200 OK: Proyecto marcado como eliminado correctamente.

```JSON
{
  "ok": true,
  "message": "Proyecto eliminado correctamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: Faltan datos o el ID no es válido.  
- 404 Not Found: El proyecto no existe o ya se encontraba eliminado.  
- 500 Internal Server Error: Error del servidor al procesar la eliminación.  

### Evidencia de pruebas en Postman 
![Evidencia proyectos](./pruebas/capturas/evidencia-proyectos.png)

# Módulo de incidentes
Este módulo gestiona el registro, listado y consulta detallada de los incidentes reportados durante los patrullajes.  

## 1. Listar todos los incidentes de un proyecto
Obtiene un listado de todos los incidentes asociados a un proyecto específico, cruzando la información con sus respectivos patrullajes y categorías.  

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/incidentes`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.  

Respuestas Esperadas:  
- 200 OK: Devuelve la lista con los incidentes encontrados.

```JSON
{
  "ok": true,
  "message": "Incidentes obtenidos correctamente.",
  "data": [ ... ]
}
```
Casos de Error:  
- 400 Bad Request: El ID del proyecto no es válido o no es numérico.
- 404 Not Found: El proyecto no existe o no hay incidentes registrados para este proyecto.
- 500 Internal Server Error: Error interno del servidor o de base de datos.

## 2. Obtener un incidente específico por ID
Busca y devuelve los detalles completos de un incidente en particular (incluyendo su fotografía opcional) validando que pertenezca al proyecto indicado.  

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/incidentes/:id_incidente`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`, `patrullero`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_incidente` (string/number): ID único del incidente.  

Respuestas Esperadas:  
- 200 OK: Devuelve los datos detallados del incidente.

```JSON
{
  "ok": true,
  "message": "Incidente encontrado correctamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: Los identificadores proporcionados no son válidos.
- 404 Not Found: El incidente no fue encontrado o no pertenece al proyecto.
- 500 Internal Server Error: Error interno del servidor.

## 3. Registrar un nuevo incidente
Permite reportar y registrar un incidente asociado a un patrullaje dentro del proyecto, admitiendo además una ubicación geográfica (WKT) y una fotografía opcional.  

Método: `POST`  
Ruta: `/api/v1/proyectos/:id_proyecto/incidentes`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`, `patrullero`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
Body requerido (JSON):  

```JSON
{
  "id_patrullaje": 1,
  "id_categoria_incidente": 2,
  "nivel_gravedad": 3,
  "observaciones": "Descripción detallada del incidente ocurrido...",
  "ubicacion": "POINT(-70.6565 -33.4435)",
  "fotografia": "base64_o_url_de_la_foto (opcional)"
}
```
Respuestas Esperadas:  
- 201 Created: Incidente reportado correctamente.

```JSON
{
  "ok": true,
  "message": "Incidente reportado correctamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: Faltan datos obligatorios, el formato es incorrecto o el nivel de gravedad está fuera del rango permitido (1 a 5).
- 404 Not Found: El proyecto especificado no existe, o el patrullaje indicado no existe/no pertenece al proyecto.
- 500 Internal Server Error: Error interno del servidor al procesar el registro.

### Evidencia de pruebas en Postman
![Evidencia incidentes](./pruebas/capturas/evidencia-incidentes.png)

# Módulo de vehículos
Módulo encargado de la gestión completa de vehículos asociados a un proyecto. Incluye operaciones de listado, obtención por ID, registro, actualización y eliminación lógica.  

## 1. Listar todos los vehículos de un proyecto
Obtiene un listado de todos los vehículos activos asociados a un proyecto específico que no hayan sido eliminados lógicamente.  

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/vehiculos`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`, `patrullero`   
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.

Respuestas esperadas:  
- 200 OK: Devuelve la lista con los vehículos registrados.

```JSON
{
  "ok": true,
  "message": "Estos son los vehiculos registrados.",
  "data": [
    {
      "id_item": "ABC-123",
      "nombre_vehiculo": "Honda Civic",
      "tipo_vehiculo": "Automóvil"
    }
  ]
}
```

Casos de error:  
- 400 Bad Request: El ID del proyecto no es válido o no es numérico.
- 404 Not Found: El proyecto no existe o no hay vehículos registrados para mostrar.
- 500 Internal Server Error: Error interno del servidor al procesar la solicitud.

## 2. Obtener un vehículo por ID
Busca y devuelve los detalles de un vehículo específico perteneciente a un proyecto determinado.  

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/vehiculos/:id_vehiculo`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):
- `id_proyecto` (number): ID único del proyecto.
- `id_vehiculo` (string): Identificador único del vehículo.

Respuestas esperadas:  
- 200 OK: Devuelve los datos del vehículo encontrado.

```JSON
{
  "ok": true,
  "message": "vehiculo encontrado correctamente.",
  "data": {
    "id_item": "ABC-123",
    "nombre_vehiculo": "Honda Civic",
    "tipo_vehiculo": "Automóvil"
  }
}
```

Casos de Error:  
- 400 Bad Request: El ID del proyecto no es válido o el ID del vehículo está vacío/inválido.
- 404 Not Found: El proyecto solicitado no existe o el vehículo no fue encontrado.
- 500 Internal Server Error: Error interno del servidor.

## 3. Agregar un vehículo
Registra un nuevo vehículo asociado a un proyecto de patrullaje en la base de datos.

Método: `POST`  
Ruta: `/api/v1/proyectos/:id_proyecto/vehiculos`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):
- `id_proyecto` (number): ID único del proyecto.

Body requerido (JSON):  
```JSON
{
  "id_item": "string (ej: ABC-123)",
  "nombre_vehiculo": "string",
  "id_tipo_vehiculo": "number"
}
```

Respuestas Esperadas:  
- 201 Created: Vehículo registrado exitosamente.

```JSON
{
  "ok": true,
  "message": "Vehiculo registrado correctamente.",
  "data": {
    "id_item": "ABC-123",
    "id_proyecto": 1,
    "nombre_vehiculo": "Honda Civic",
    "id_tipo_vehiculo": 2,
    "eliminado": false
  }
}
```

Casos de Error:  
- 400 Bad Request: Faltan datos obligatorios o el formato de los datos es incorrecto.
- 404 Not Found: El proyecto especificado o el tipo de vehículo no existen.
- 409 Conflict: Ya existe un vehículo/ítem con ese identificador en la base de datos.
- 500 Internal Server Error: Error interno al intentar guardar el vehículo.

---

## 4. Actualizar un vehículo
Modifica parcialmente los datos (nombre y/o tipo) de un vehículo existente.

Método: `PATCH`  
Ruta: `/api/v1/proyectos/:id_proyecto/vehiculos/:id_vehiculo`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_vehiculo` (string): Identificador único del vehículo a actualizar.

Body (JSON - al menos un campo requerido):  
```JSON
{
  "nombre_vehiculo": "string (opcional)",
  "id_tipo_vehiculo": "number (opcional)"
}
```

Respuestas Esperadas:  
- 200 OK: Vehículo actualizado correctamente.

```JSON
{
  "ok": true,
  "message": "Vehiculo actualizado correctamente.",
  "data": {
    "id_item": "ABC-123",
    "nombre_vehiculo": "Toyota Corolla",
    "id_tipo_vehiculo": 2,
    "id_proyecto": 1
  }
}
```

Casos de Error:  
- 400 Bad Request: Identificadores inválidos o no se envió ningún campo para actualizar.
- 404 Not Found: El proyecto no existe, el tipo de vehículo no existe o el vehículo no fue encontrado/se encuentra eliminado.
- 500 Internal Server Error: Error interno al actualizar.

## 5. Eliminar un vehículo (Eliminación lógica)
Realiza una baja lógica del vehículo cambiando su estado a eliminado (`eliminado = true`).

Método: `DELETE`  
Ruta: `/api/v1/proyectos/:id_proyecto/vehiculos/:id_vehiculo`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_vehiculo` (string): Identificador único del vehículo.

Respuestas Esperadas:  
- 200 OK: Vehículo marcado como eliminado correctamente.

```JSON
{
  "ok": true,
  "message": "Vehiculo eliminado correctamente.",
  "data": {
    "id_item": "ABC-123",
    "id_proyecto": 1,
    "nombre_vehiculo": "Toyota Corolla",
    "id_tipo_vehiculo": 2,
    "eliminado": true
  }
}
```

Casos de Error:  
- 400 Bad Request: Faltan datos o los parámetros de ruta no son válidos.
- 404 Not Found: El vehículo no existe o ya se encontraba eliminado.
- 500 Internal Server Error: Error del servidor al procesar la eliminación.

### Subrutas de Tipos de Vehiculo

El router principal cuenta con la siguiente redirección hacia las operaciones de gestión de los catálogo de tipos:

* **Ruta base:** `/api/v1/proyectos/:id_proyecto/vehiculos/tipos`
* **Módulo de rutas:** [Tipos de vehiculos](#submodulo-tipos-de-vehiculos)  

### Evidencia de pruebas en Postman 
![Evidencia vehículos](./pruebas/capturas/evidencia-vehiculos.png)

# Módulo de Equipamiento Personal

Módulo encargado de la gestión completa del equipamiento personal asociado a los proyectos de patrullaje. Incluye operaciones de listado, obtención por ID, registro, actualización y eliminación lógica.

## 1. Listar todos los equipamientos personales de un proyecto
Obtiene un listado de todos los equipamientos personales activos asociados a un proyecto específico que no hayan sido eliminados lógicamente.

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_personal`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`, `patrullero`  
Parámetros de ruta (Path Params):
- `id_proyecto` (number): ID único del proyecto.  

Respuestas esperadas:  
- 200 OK: Devuelve la lista con los equipamientos personales registrados.

```JSON
{
  "ok": true,
  "message": "Estos son los equipamientos personales registrados.",
  "data": [
    {
      "id_item": "EQP-001",
      "talla": "L",
      "tipo_eq_personal": "Chaleco Antibalas"
    }
  ]
}
```

Casos de error:  
- 400 Bad Request: El ID del proyecto no es válido o no es numérico.
- 404 Not Found: El proyecto no existe o no hay equipamientos personales para mostrar.
- 500 Internal Server Error: Error interno del servidor al procesar la solicitud.

## 2. Obtener un equipamiento personal por ID
Busca y devuelve los detalles de un equipamiento personal específico perteneciente a un proyecto determinado.

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_personal/:id_eq_personal`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):
- `id_proyecto` (number): ID único del proyecto.
- `id_eq_personal` (string): Identificador único del equipamiento personal (código/item ID).  

Respuestas Esperadas:  
- 200 OK: Devuelve los datos del equipamiento personal encontrado.

```JSON
{
  "ok": true,
  "message": "Equipamiento personal encontrado exitosamente.",
  "data": {
    "id_item": "EQP-001",
    "tipo_eq_personal": "Chaleco Antibalas",
    "talla": "L"
  }
}
```

Casos de error:  
- 400 Bad Request: El identificador del equipamiento o del proyecto no es válido.
- 404 Not Found: El proyecto no existe o el equipamiento personal no fue encontrado.
- 500 Internal Server Error: Error interno del servidor.

## 3. Agregar un equipamiento personal
Registra un nuevo equipamiento personal asociado a un proyecto de patrullaje en la base de datos.

Método: `POST`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_personal`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):
- `id_proyecto` (number): ID único del proyecto.  

Body requerido (JSON):  
```JSON
{
  "id_item": "string (ej: EQP-001)",
  "id_tipo": "number",
  "talla": "string (ej: L, M, S o "No aplica" en algunos casos)"
}
```

Respuestas esperadas:  
- 201 Created: Equipamiento personal registrado exitosamente.

```JSON
{
  "ok": true,
  "message": "Equipamiento personal registrado correctamente.",
  "data": {
    "id_item": "EQP-001",
    "id_proyecto": 1,
    "id_tipo_eq_personal": 5,
    "talla": "No aplica",
    "eliminado": false
  }
}
```

Casos de Error:  
- 400 Bad Request: Faltan datos obligatorios o el formato de los datos es incorrecto.
- 404 Not Found: El proyecto especificado o el tipo de equipamiento personal no existe.
- 409 Conflict: Ya existe un objeto/ítem con ese identificador en la base de datos.
- 500 Internal Server Error: Error interno al intentar guardar el equipamiento personal.

## 4. Actualizar un equipamiento personal
Modifica parcialmente los datos (tipo y/o talla) de un equipamiento personal existente.

Método: `PATCH`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_personal/:id_eq_personal`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_eq_personal` (string): Identificador único del equipamiento personal a actualizar.  

Body (JSON - al menos un campo requerido):  
```JSON
{
  "id_tipo": "number (opcional)",
  "talla": "string (opcional)"
}
```

Respuestas Esperadas:  
- 200 OK: Equipamiento personal actualizado correctamente.

```JSON
{
  "ok": true,
  "message": "Equipamiento personal actualizado correctamente.",
  "data": {
    "id_item": "EQP-001",
    "id_proyecto": 1,
    "id_tipo_eq_personal": 3, //<- este puede cambiar
    "talla": "XL" //<- este puede cambiar
  }
}
```

Casos de Error:  
- 400 Bad Request: Los datos proporcionados no son válidos o no se envió ningún campo para actualizar (tipo o talla).
- 404 Not Found: El proyecto no existe, el tipo de equipamiento personal no existe o el equipamiento no fue encontrado/se encuentra eliminado.
- 500 Internal Server Error: Error interno al actualizar.

## 5. Eliminar un equipamiento personal (Eliminación lógica)
Realiza una baja lógica del equipamiento personal cambiando su estado a eliminado (`eliminado = true`).

Método: `DELETE`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_personal/:id_eq_personal`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_eq_personal` (string): Identificador único del equipamiento personal.  

Respuestas Esperadas:  
- 200 OK: Equipamiento personal marcado como eliminado correctamente.

```JSON
{
  "ok": true,
  "message": "Equipamiento personal eliminado correctamente.",
  "data": {
    "id_item": "EQP-001",
    "id_proyecto": 1,
    "id_tipo_eq_personal": 3,
    "talla": "XL",
    "eliminado": true
  }
}
```

Casos de Error:  
- 400 Bad Request: Faltan datos o los parámetros de ruta no son válidos.
- 404 Not Found: El equipamiento personal no existe o ya se encontraba eliminado.
- 500 Internal Server Error: Error del servidor al procesar la eliminación.

### Subrutas de Tipos de equipamientos personales

El router principal cuenta con la siguiente redirección hacia las operaciones de gestión de los catálogo de tipos:

* **Ruta base:** `/api/v1/proyectos/:id_proyecto/eq_personal/tipos`
* **Módulo de rutas:** [Tipos de equipamientos personales](#submodulo-tipos-de-equipamientos-personales).

### Evidencia de pruebas en Postman
![Evidencia Eq. Personal](./pruebas/capturas/evidencia-eqpersonal.png)


# Módulo de equipamiento vehicular
Este módulo gestiona el registro, listado, consulta detallada, actualización y eliminación lógica de los equipamientos vehiculares asociados a los proyectos de patrullaje. 

## 1. Listar todos los equipamientos vehiculares de un proyecto
Obtiene un listado de todos los artículos de equipamiento vehicular activos asociados a un proyecto específico.  

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_vehicular`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.  

Respuestas Esperadas:  
- 200 OK: Devuelve la lista con los artículos de equipamiento vehicular registrados.

```JSON
{
  "ok": true,
  "message": "Estos son los articulos registrados.",
  "data": [
    {
      "id_item": "EQV-001",
      "tipo_eq_vehicular": "Barra LED Estroboscópica"
    }
  ]
}
```
Casos de Error:  
- 400 Bad Request: El ID del proyecto no es válido o no es numérico.
- 404 Not Found: El proyecto no existe o no hay artículos vehiculares para mostrar.
- 500 Internal Server Error: Error interno del servidor o de base de datos.

## 2. Obtener un equipamiento vehicular específico por ID
Busca y devuelve los detalles de un equipamiento vehicular específico perteneciente a un proyecto determinado.  

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_vehicular/:id_eq_vehicular`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_eq_vehicular` (string): Identificador único del equipamiento vehicular (id_item).  

Respuestas Esperadas:  
- 200 OK: Devuelve los datos del equipamiento vehicular encontrado.

```JSON
{
  "ok": true,
  "message": "Equipamiento vehicular encontrado correctamente.",
  "data": {
    "id_item": "EQV-001",
    "tipo_eq_vehicular": "Barra LED Estroboscópica"
  }
}
```
Casos de Error:  
- 400 Bad Request: Los identificadores proporcionados no son válidos.
- 404 Not Found: El proyecto no existe o el equipamiento vehicular no fue encontrado.
- 500 Internal Server Error: Error interno del servidor.

## 3. Registrar un nuevo equipamiento vehicular
Permite agregar un nuevo equipamiento vehicular y asociarlo a un proyecto y tipo específico.  

Método: `POST`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_vehicular`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.  

Body requerido (JSON):  

```JSON
{
  "id_item": "string",
  "id_tipo": "number"
}
```
Respuestas Esperadas:  
- 201 Created: Equipamiento vehicular registrado correctamente.

```JSON
{
  "ok": true,
  "message": "Equipamiento vehicular registrado correctamente.",
  "data": {
    "id_item": "EQV-003",
    "id_proyecto": 1,
    "id_tipo_eq_vehicular": 2,
    "eliminado": false
  }
}
```
Casos de Error:  
- 400 Bad Request: Faltan datos para poder completar la acción o los datos no tienen el formato correcto.
- 404 Not Found: El proyecto especificado o el tipo de equipamiento vehicular no existe.
- 409 Conflict: Ya existe un objeto con ese identificador.
- 500 Internal Server Error: Error interno del servidor al procesar el registro.

## 4. Actualizar un equipamiento vehicular
Permite modificar el tipo asignado a un equipamiento vehicular existente en el proyecto.  

Método: `PATCH`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_vehicular/:id_eq_vehicular`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_eq_vehicular` (string): Identificador único del equipamiento vehicular.
Body requerido (JSON):  

```JSON
{
  "id_tipo": "number (opcional)"
}
```
Respuestas Esperadas:  
- 200 OK: Equipamiento vehicular actualizado correctamente.

```JSON
{
  "ok": true,
  "message": "Equipamiento vehicular actualizado correctamente.",
  "data": {
    "id_item": "EQV-003",
    "id_proyecto": 1,
    "id_tipo_eq_vehicular": 5
  }
}
```
Casos de Error:  
- 400 Bad Request: Los datos no son válidos o no se proporcionó al menos un campo válido para actualizar.
- 404 Not Found: El proyecto no existe, el tipo especificado no existe, o el equipamiento vehicular no fue encontrado/se encuentra eliminado.
- 500 Internal Server Error: Error interno del servidor al actualizar.

## 5. Eliminar un equipamiento vehicular (Eliminación lógica)
Realiza una baja lógica del equipamiento vehicular cambiando su estado a eliminado (`eliminado = true`).  

Método: `DELETE`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_vehicular/:id_eq_vehicular`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_eq_vehicular` (string): Identificador único del equipamiento vehicular.  

Respuestas Esperadas:  
- 200 OK: Artículo vehicular eliminado correctamente.

```JSON
{
  "ok": true,
  "message": "Articulo vehicular eliminado correctamente.",
  "data": {
    "id_item": "EQV-003",
    "id_proyecto": 1,
    "id_tipo_eq_vehicular": 5,
    "eliminado": true
  }
}
```
Casos de Error:  
- 400 Bad Request: Faltan datos para completar la acción o los parámetros no son válidos.
- 404 Not Found: El artículo vehicular no existe o ya se encontraba eliminado.
- 500 Internal Server Error: Error interno del servidor al procesar la eliminación.

### Evidencia de pruebas en Postman
![Evidencia Eq. Vehicular](./pruebas/capturas/evidencia-eqvehicular.png)

# Submódulo - Tipos

## Subrutas de Tipos de Equipamiento Vehicular

El router principal cuenta con la siguiente redirección hacia las operaciones de gestión de los catálogo de tipos:

* **Ruta base:** `/api/v1/proyectos/:id_proyecto/eq_vehicular/tipos`
* **Módulo de rutas:** [Tipos de equipamientos vehiculares](#submodulo-tipos-de-equipamientos-vehiculares)


## Submodulo tipos de vehiculos

Este submódulo gestiona el catálogo de los tipos de vehiculos disponibles en el sistema.

### Listar todos los tipos de vehículo

Obtiene el listado completo de todos los tipos de vehículo registrados en el sistema.

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/vehiculos/tipos`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  

Respuestas Esperadas:  
- 200 OK: Devuelve el catálogo de tipos de vehículo registrados.

```JSON
{
  "ok": true,
  "message": "Estos son los tipos de vehiculo registrados.",
  "data": [
    {
      "tipo_vehiculo": "Camioneta"
    },
    {
      "tipo_vehiculo": "Motocicleta"
    }
  ]
}
```

Casos de Error:  
- 404 Not Found: No hay tipos de vehiculo para mostrar.

- 500 Internal Server Error: Error interno del servidor o de base de datos.    
## Submodulo tipos de equipamientos personales

Este submódulo gestiona el catálogo de los tipos de equipamientos personales disponibles en el sistema.

### Listar todos los tipos de equipamiento personal

Obtiene el listado completo de todos los tipos de equipamiento personal registrados en el sistema.

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_personal/tipos`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  

Respuestas Esperadas:  
- 200 OK: Devuelve el catálogo de tipos de equipamiento personal registrados.

```JSON
{
  "ok": true,
  "message": "Estos son los tipos de equipamientos personales registrados.",
  "data": [
    {
      "tipo_eq_personal": "Chaleco Antibalas"
    },
    {
      "tipo_eq_personal": "Radio Portátil"
    }
  ]
}
```

Casos de Error:  
- 404 Not Found: No hay tipos de equipamientos personales para mostrar.
- 500 Internal Server Error: Error interno del servidor o de base de datos.  

## Submodulo tipos de equipamientos vehiculares

Este submódulo gestiona el catálogo de los tipos de equipamientos vehiculares disponibles en el sistema.

### Listar todos los tipos de equipamiento vehicular

Obtiene el listado completo de todos los tipos de equipamiento vehicular registrados en el sistema.

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/eq_vehicular/tipos`  
Autenticación: Requiere Token JWT.  
Roles permitidos: `admin`, `supervisor`  

Respuestas Esperadas:  
- 200 OK: Devuelve el catálogo de tipos de equipamiento vehicular registrados.

```JSON
{
  "ok": true,
  "message": "Estos son los tipos de equipamientos vehiculares registrados.",
  "data": [ {...} , {...} , ...]
}
```

Casos de Error:  
- 404 Not Found: No hay tipos de equipamientos vehiculares registrados en el sistema.
- 500 Internal Server Error: Error interno del servidor o de base de datos.

### Evidencia de pruebas en Postman
![Evidencia subtipos](./pruebas/capturas/evidencia-subtipos.png)


# Módulo de actividades
Módulo encargado de la gestión del cronograma y registro de actividades asociadas a un proyecto de patrullaje. Incluyendo operaciones de listado, creación, actualización y eliminación lógica.

## 1. Listar todas las actividades de un proyecto
Obtiene un listado de todas las actividades activas (que no hayan sido eliminadas lógicamente) asociadas a un proyecto específico, ordenadas por fecha de forma ascendente.

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/actividades`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`, `patrullero`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.  

Respuestas Esperadas:  
- 200 OK: Devuelve la lista con las actividades encontradas.

```JSON
{
  "ok": true,
  "message": "Actividades obtenidas correctamente.",
  "data": [ ... ]
}
```
Casos de Error:  
- 400 Bad Request: El ID del proyecto es inválido o no es numérico.
- 404 Not Found: El proyecto no existe o ha sido eliminado.
- 500 Internal Server Error: Error del servidor interno al obtener las actividades del proyecto.

## 2. Crear una actividad
Registra una nueva actividad dentro de un proyecto de patrullaje en la base de datos.

Método: `POST`  
Ruta: `/api/v1/proyectos/:id_proyecto/actividades`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.  

Body requerido (JSON):  
```JSON
{
  "titulo": "string",
  "fecha": "string (YYYY-MM-DD)",
  "descripcion": "string"
}
```
Respuestas Esperadas:  
- 201 Created: Actividad creada exitosamente.

```JSON
{
  "ok": true,
  "message": "Actividad creada exitosamente.",
  "data": { ... }
}
```

Casos de Error:  
- 400 Bad Request: Faltan campos obligatorios en el cuerpo de la petición o el ID del proyecto es inválido.
- 404 Not Found: No se puede crear la actividad porque el proyecto no existe o ha sido eliminado.
- 500 Internal Server Error: Error del servidor interno al crear la actividad (o fecha fuera del rango del proyecto).

## 3. Actualizar una actividad
Modifica los datos (título, fecha y descripción) de una actividad existente.

Método: `PUT`  
Ruta: `/api/v1/proyectos/:id_proyecto/actividades/:id_actividad`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_actividad` (number): ID único de la actividad a actualizar.  

Body (JSON):  
```JSON
{
  "titulo": "string",
  "fecha": "string (YYYY-MM-DD)",
  "descripcion": "string"
}
```
Respuestas Esperadas:  
- 200 OK: Actividad actualizada exitosamente.
```JSON
{
  "ok": true,
  "message": "Actividad actualizada exitosamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: El ID de la actividad es inválido o faltan campos obligatorios (título, fecha, descripción).
- 404 Not Found: No se pudo actualizar la actividad porque no existe o ha sido eliminada.
- 500 Internal Server Error: Error del servidor interno al actualizar la actividad.

## 4. Eliminar una actividad (Eliminación lógica)
Realiza una baja lógica de la actividad cambiando su estado de eliminación a verdadero (`eliminado = true`).

Método: `DELETE`  
Ruta: `/api/v1/proyectos/:id_proyecto/actividades/:id_actividad`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `id_actividad` (number): ID único de la actividad a eliminar.  

Respuestas Esperadas:  
- 200 OK: Actividad marcada como eliminada exitosamente.
```JSON
{
  "ok": true,
  "message": "Actividad eliminada exitosamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: El ID de la actividad es inválido.
- 404 Not Found: La actividad no existe o ya ha sido eliminada.
- 500 Internal Server Error: Error del servidor interno al eliminar la actividad.

### Evidencia de pruebas en Postman
![Evidencia actividades](./pruebas/capturas/evidencia-actividades.png)

---

# Módulo de trabajadores
Este módulo gestiona la consulta, asignación y desvinculación de trabajadores (usuarios) que participan en un proyecto de patrullaje específico.

## 1. Listar todos los trabajadores de un proyecto
Obtiene un listado de todos los trabajadores activos asignados a un proyecto específico, incluyendo sus datos personales y su rol en el sistema.

Método: `GET`  
Ruta: `/api/v1/proyectos/:id_proyecto/trabajadores`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.  

Respuestas Esperadas:  
- 200 OK: Devuelve la lista con los trabajadores asignados al proyecto.
```JSON
{
  "ok": true,
  "message": "Trabajadores del proyecto obtenidos exitosamente.",
  "data": [ ... ]
}
```
Casos de Error:  
- 400 Bad Request: El ID del proyecto es inválido o no es numérico.
- 404 Not Found: El proyecto no existe o se ha eliminado.
- 500 Internal Server Error: Error del servidor interno al obtener los trabajadores del proyecto.

## 2. Asignar un trabajador a un proyecto
Vincula un usuario registrado y activo a un proyecto de patrullaje.

Método: `POST`  
Ruta: `/api/v1/proyectos/:id_proyecto/trabajadores`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.  

Body requerido (JSON):  
```JSON
{
  "rut": "string"
}
```
Respuestas Esperadas:  
- 201 Created: Trabajador asignado al proyecto exitosamente.
```JSON
{
  "ok": true,
  "message": "Trabajador asignado al proyecto exitosamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: El RUT del trabajador o el ID del proyecto no son válidos.
- 404 Not Found: El proyecto o el usuario especificado no existe o ha sido eliminado.
- 409 Conflict: El trabajador ya se encuentra asignado a este proyecto.
- 500 Internal Server Error: Error del servidor interno al asignar el trabajador al proyecto.

## 3. Retirar un trabajador de un proyecto
Elimina la asignación de un trabajador dentro de un proyecto de patrullaje específico.

Método: `DELETE`  
Ruta: `/api/v1/proyectos/:id_proyecto/trabajadores/:rut`  
Autenticación: Requiere Token JWT  
Roles permitidos: `admin`, `supervisor`  
Parámetros de ruta (Path Params):  
- `id_proyecto` (number): ID único del proyecto.
- `rut` (string): RUT único del trabajador a retirar del proyecto.  

Respuestas Esperadas:  
- 200 OK: Trabajador retirado del proyecto exitosamente.
```JSON
{
  "ok": true,
  "message": "Trabajador retirado del proyecto exitosamente.",
  "data": { ... }
}
```
Casos de Error:  
- 400 Bad Request: El RUT del trabajador o el ID del proyecto no son válidos.
- 404 Not Found: El trabajador no se encuentra asignado a este proyecto.
- 500 Internal Server Error: Error del servidor interno al sacar al trabajador del proyecto.

### Evidencia de pruebas en Postman
![Evidencia trabajadores](./pruebas/capturas/evidencia-trabajadores.png)

---
title: EstosSonMisEndpoints

---

# Modulo de Auth

Modulo encargado de gestionar los accesos de usuarios registrados al sistema, entregando metodos para poder iniciar sesion, y para cambiar la contraseña (Siempre y cuando el usuario tenga disponible esa accion).

## 1. Iniciar sesion en el sistema.

Valida las credenciales de acceso ingresadas, y genera el token JWT para darle una sesion activa al usuario.

Método: POST
Ruta: /api/v1/auth
Autenticación: No requiere
Roles permitidos: admin, supervisor, patrullero
Body requerido (JSON):

```
{
    "idIngresado": "string (RUT o correo)",
    "claveIngresada": "string (clave)"
}
```

Respuestas esperadas:

200 OK: El inicio de sesion se realizo correctamente.
```
{
    "ok": true,
    "message": "El inicio de sesion se realizo correctamente.",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJydXRVc3VhcmlvIjoiMjE1NTU2NjYtOCIsImNvcnJlb1VzdWFyaW8iOiJhbmEubW9yYWxlc0BzaXBwcmVtLmNvbSIsInJvbCI6IlBhdHJ1bGxlcm8iLCJpYXQiOjE3OTI5NjMwMjUsImV4cCI6MTc5MzAwNjIyNX0.jQbfP1-DpmlN16f-ZJM1FvvdZ3cEloV0GEqZNFaiI08",
        "datosUsuario": {
            "rut": "21555666-8",
            "nombre": "Ana Morales",
            "correo": "ana.morales@sipprem.com",
            "foto": null,
            "nuevo_user": true,
            "id_rol": 3,
            "tipo_rol": "Patrullero"
        }
    }
}
```

Casos de error:

401: Las credenciales de acceso son incorrectas.

## 2. Cambiar clave de un usuario con nuevo_user = true

Permite cambiar la clave de un usuario que en los registros de la base de datos tiene la columna nuevo_user en true, usandose principalmente para cambiar la clave generada aleatoriamente cuando se crea un usuario.

Método: PATCH
Ruta: /api/v1/auth
Autenticación: Requiere Token JWT
Roles permitidos: admin, supervisor, patrullero
Body requerido (JSON):

```
{ 
    "idIngresado": "string (RUT o correo)",
    "claveNuevaIng": "string (clave nueva)"
}
```

Respuestas esperadas:

200 OK: La clave se cambio correctamente.

```
{
    "ok": true,
    "message": "La clave se cambio correctamente.",
    "data": null
}
```

Casos de error:

400: No se encontro el usuario con rut/correo ingresado, o el usuario no tiene nuevo_user en true.

## Evidencia de pruebas en postman

### Evidencia de pruebas en Postman
![Evidencia auth](./pruebas/capturas/evidencia-auth.png)

---
title: EstosSonMisEndpointsPatrullajes

---

# Modulo de patrullajes

Modulo encargado de gestionar los patrullajes de cada proyecto del sistema. Cuenta con metodos tanto para gestionar las planificaciones de patrullaje, como para ejecutar los patrullajes que se encuentran planificados.

## 1. Crear una planificacion de patrullaje.

Nos permite planificar un patrullaje para un dia especifico, con una duracion especifica. Tambien se debe indicar la zona donde sera, y quien/es lo realizaran.

Método: POST
Ruta: /api/v1/proyectos/:id_proyecto/patrullajes
Autenticación: Requiere Token JWT
Roles permitidos: admin, supervisor
Parámetros de ruta (Path Params):
- id_proyecto: number (Identificador del proyecto)

Body requerido (JSON):

```json
{
  "hora_inicio": "2026-11-20 09:00:00",
  "hora_termino": "2026-11-20 17:00:00",
  "zona": "POLYGON((-71.625 -33.035, -71.615 -33.035, -71.615 -33.045, -71.625 -33.045, -71.625 -33.035))",
  "patrulleros": [
    "18222333-k"
  ]
}
```

Respuestas esperadas:

201 Created: Planificacion de patrullaje creada correctamente.
```json
{
    "ok": true,
    "message": "Planificacion de patrullaje creada correctamente.",
    "data": {
        "id_patrullaje": 13,
        "hora_inicio": "2026-11-20T12:00:00.000Z",
        "hora_termino": "2026-11-20T20:00:00.000Z",
        "zona": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        -71.625,
                        -33.035
                    ],
                    [
                        -71.615,
                        -33.035
                    ],
                    [
                        -71.615,
                        -33.045
                    ],
                    [
                        -71.625,
                        -33.045
                    ],
                    [
                        -71.625,
                        -33.035
                    ]
                ]
            ]
        },
        "id_proyecto": 1,
        "patrulleros": [
            "18222333-k"
        ]
    }
}
```

Casos de error:

400 Bad request: Faltan campos obligatorios, se asignaron mas de dos patrulleros, los ruts de los patrulleros no tienen formato valido, se ingreso el mismo rut para el encargado y el acompañante, o la zona del patrullaje no es valida.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 2. Obtener las planificaciones de patrullaje de un proyecto.

Permite listar todos los patrullajes planificados, en curso o finalizados de un proyecto específico, indicando su estado actual, horario, zona delimitada en formato GeoJSON y los patrulleros asignados.

Método: GET
Ruta: /api/v1/proyectos/:id_proyecto/patrullajes
Autenticación: Requiere Token JWT
Roles permitidos: admin, supervisor
Parámetros de ruta (Path Params):
- id_proyecto: number (Identificador del proyecto a consultar)

Respuestas esperadas:

200 OK: Patrullajes obtenidos correctamente.
```json
{
    "ok": true,
    "message": "Patrullajes obtenidos correctamente.",
    "data": [
        {
            "id_patrullaje": 1,
            "hora_inicio": "2026-06-05T08:00:00.000Z",
            "hora_termino": "2026-06-05T16:00:00.000Z",
            "zona": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-71.625, -33.035],
                        [-71.615, -33.035],
                        [-71.615, -33.045],
                        [-71.625, -33.045],
                        [-71.625, -33.035]
                    ]
                ]
            },
            "estado": "Finalizado",
            "patrulleros": [
                {
                    "rut": "18222333-k",
                    "nombre": "Carlos Gomez"
                }
            ]
        }
    ]
}
```

Casos de error:

400 Bad request: El ID del proyecto debe ser un número válido.
403 Forbidden: No tienes acceso a este proyecto.
404 Not found: El proyecto no existe o ha sido eliminado.
500 Internal server error: Error interno del servidor al procesar la petición.

## 3. Actualizar una planificación de patrullaje.

Permite modificar los datos de horario, zona o personal asignado a una planificación de patrullaje existente, siempre y cuando el patrullaje aún no haya sido iniciado.

Método: PUT
Ruta: /api/v1/proyectos/:id_proyecto/patrullajes/:id_patrullaje
Autenticación: Requiere Token JWT
Roles permitidos: admin, supervisor
Parámetros de ruta (Path Params):
- id_proyecto: number (Identificador del proyecto)
- id_patrullaje: number (Identificador de la planificación de patrullaje a actualizar)

Body requerido (JSON):

```json
{
  "hora_inicio": "2026-11-20 10:00:00",
  "hora_termino": "2026-11-20 18:00:00",
  "zona": "POLYGON((-71.625 -33.035, -71.615 -33.035, -71.615 -33.045, -71.625 -33.045, -71.625 -33.035))",
  "patrulleros": [
    "18222333-k",
    "21555666-8"
  ]
}
```

Respuestas esperadas:

200 OK: Planificación de patrullaje actualizada correctamente.
```json
{
    "ok": true,
    "message": "Planificación de patrullaje actualizada correctamente.",
    "data": {
        "id_patrullaje": 13,
        "hora_inicio": "2026-11-20T13:00:00.000Z",
        "hora_termino": "2026-11-20T21:00:00.000Z",
        "zona": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-71.625, -33.035],
                    [-71.615, -33.035],
                    [-71.615, -33.045],
                    [-71.625, -33.045],
                    [-71.625, -33.035]
                ]
            ]
        },
        "id_proyecto": 1,
        "patrulleros": [
            "18222333-k",
            "21555666-8"
        ]
    }
}
```

Casos de error:

400 Bad request: Faltan campos obligatorios, IDs inválidos, zona con formato inválido, o RUTs duplicados/inválidos.
403 Forbidden: No tienes acceso a este proyecto.
404 Not found: El patrullaje o proyecto solicitado no existe.
409 Conflict: Este patrullaje ya fue iniciado o finalizado.
500 Internal server error: Error interno del servidor al procesar la petición.

## 4. Iniciar ejecución de un patrullaje.

Permite a un patrullero asignado dar inicio a un patrullaje planificado, registrando la hora real de inicio, el vehículo que utilizará y el equipamiento personal que portará durante el turno.

Método: POST
Ruta: /api/v1/proyectos/:id_proyecto/patrullajes/:id_patrullaje/iniciar
Autenticación: Requiere Token JWT
Roles permitidos: patrullero
Parámetros de ruta (Path Params):
- id_proyecto: number (Identificador del proyecto)
- id_patrullaje: number (Identificador del patrullaje planificado a iniciar)

Body requerido (JSON):

```json
{
  "id_vehiculo": "VEH-001",
  "eq_personal": [
    "EQP-001",
    "EQP-002"
  ]
}
```

Respuestas esperadas:

201 Created: Patrullaje iniciado correctamente.
```json
{
    "ok": true,
    "message": "Patrullaje iniciado correctamente.",
    "data": {
        "id_patrullaje": 13,
        "hora_real_inicio": "2026-11-20T12:05:00.000Z",
        "hora_real_termino": null,
        "id_vehiculo": "VEH-001",
        "eq_personal": [
            "EQP-001",
            "EQP-002"
        ]
    }
}
```

Casos de error:

400 Bad request: ID inválido, no se especificó vehículo, o el equipamiento personal tiene elementos duplicados/inválidos.
403 Forbidden: No tienes permiso para iniciar este patrullaje porque no estás asignado a él.
404 Not found: El patrullaje solicitado no existe en este proyecto.
409 Conflict: Este patrullaje ya fue iniciado o finalizado.
500 Internal server error: Error interno del servidor al procesar la petición.

## 5. Finalizar ejecución de un patrullaje.

Permite a un patrullero asignado marcar el término del patrullaje que se encuentra actualmente en curso, registrando automáticamente la hora real de término en la base de datos.

Método: PATCH
Ruta: /api/v1/proyectos/:id_proyecto/patrullajes/:id_patrullaje/finalizar
Autenticación: Requiere Token JWT
Roles permitidos: patrullero
Parámetros de ruta (Path Params):
- id_proyecto: number (Identificador del proyecto)
- id_patrullaje: number (Identificador del patrullaje en curso a finalizar)

Body requerido (JSON):
No requiere body.

Respuestas esperadas:

200 OK: Patrullaje finalizado correctamente.
```json
{
    "ok": true,
    "message": "Patrullaje finalizado correctamente.",
    "data": {
        "id_patrullaje": 13,
        "hora_real_inicio": "2026-11-20T12:05:00.000Z",
        "hora_real_termino": "2026-11-20T20:00:00.000Z",
        "id_vehiculo": "VEH-001"
    }
}
```

Casos de error:

400 Bad request: El ID del patrullaje debe ser un número válido.
403 Forbidden: No tienes permiso para finalizar este patrullaje porque no estás asignado a él.
404 Not found: El patrullaje solicitado no existe en este proyecto.
409 Conflict: No se puede finalizar un patrullaje que aún no ha sido iniciado, o que ya fue finalizado anteriormente.
500 Internal server error: Error interno del servidor al procesar la petición.

## 6. Eliminar una planificación de patrullaje.

Permite eliminar una planificación de patrullaje del sistema, siempre y cuando no haya sido iniciada ni finalizada previamente.

Método: DELETE
Ruta: /api/v1/proyectos/:id_proyecto/patrullajes/:id_patrullaje
Autenticación: Requiere Token JWT
Roles permitidos: admin, supervisor
Parámetros de ruta (Path Params):
- id_proyecto: number (Identificador del proyecto)
- id_patrullaje: number (Identificador del patrullaje planificado a eliminar)

Body requerido (JSON):
No requiere body.

Respuestas esperadas:

200 OK: Planificación de patrullaje eliminada exitosamente.
```json
{
    "ok": true,
    "message": "Planificación de patrullaje eliminada exitosamente.",
    "data": {
        "id_patrullaje": 13
    }
}
```

Casos de error:

400 Bad request: El ID del patrullaje debe ser un número válido.
403 Forbidden: No tienes acceso a este proyecto.
404 Not found: El patrullaje solicitado no existe en este proyecto.
409 Conflict: No se puede eliminar un patrullaje que ya fue iniciado o finalizado.
500 Internal server error: Error interno del servidor al procesar la petición.

## Evidencia de pruebas en postman

### Evidencia de pruebas en Postman
![Evidencia patrulleros](./pruebas/capturas/evidencia-patrulleros.png)
![Evidencia patrulleros](./pruebas/capturas/evidencia-patrulleros2.png)

---
title: EstosSonMisEndpointsUsuarios

---

# Modulo de Usuarios

Modulo encargado de la administracion y gestion de usuarios en el sistema SIPPREM. Permite registrar nuevos colaboradores, consultar la lista y detalles de usuarios, gestionar su perfil personal, ver sus patrullajes y proyectos asignados, actualizar su informacion, restablecer sus credenciales de acceso y realizar el borrado o restauracion logica de sus cuentas.

## 1. Listar usuarios del sistema.

Permite al administrador obtener una lista de los usuarios registrados en el sistema, permitiendo filtrar opcionalmente por su estado (activos, eliminados o todos).

Método: GET
Ruta: /api/v1/usuarios
Autenticación: Requiere Token JWT
Roles permitidos: admin
Parámetros de consulta (Query Params):
- estado: string (Opcional: 'activos', 'eliminados' o 'todos'. Por defecto filtra solo activos)

Respuestas esperadas:

200 OK: Usuarios obtenidos correctamente.
```json
{
    "ok": true,
    "message": "Usuarios obtenidos correctamente.",
    "data": [
        {
            "rut": "12345678-9",
            "nombre": "Edgar De La Cruz",
            "correo": "lil.crux@procasting.cl",
            "telefono": "912345678",
            "foto": null,
            "tipo_rol": "Admin",
            "eliminado": false
        },
        {
            "rut": "98765432-1",
            "nombre": "Fernanda Barraza",
            "correo": "fer.barra@procasting.cl",
            "telefono": "987654321",
            "foto": null,
            "tipo_rol": "Supervisor",
            "eliminado": false
        }
    ]
}
```

Casos de error:

401 Unauthorized: Token JWT no proporcionado o invalido.
403 Forbidden: No tienes permisos para acceder a este recurso.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 2. Obtener mi perfil autenticado.

Permite a cualquier usuario autenticado en la plataforma consultar su propia informacion de perfil a traves de los datos contenidos en su token JWT.

Método: GET
Ruta: /api/v1/usuarios/me
Autenticación: Requiere Token JWT
Roles permitidos: admin, supervisor, patrullero

Respuestas esperadas:

200 OK: Se encontraron los datos del usuario.
```json
{
    "ok": true,
    "message": "Se encontraron los datos del usuario.",
    "data": {
        "rut": "12345678-9",
        "nombre": "Edgar De La Cruz",
        "correo": "lil.crux@procasting.cl",
        "telefono": "912345678",
        "foto": null,
        "id_rol": 1,
        "tipo_rol": "Admin",
        "fecha_registro": "2026-10-25T03:00:00.000Z"
    }
}
```

Casos de error:

401 Unauthorized: Token JWT no proporcionado o invalido.
404 Not found: El usuario autenticado no existe en la base de datos.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 3. Obtener mis patrullajes asignados.

Permite a un patrullero autenticado consultar todos los patrullajes a los que ha sido asignado a lo largo de los diferentes proyectos, detallando el estado, el horario planificado y la zona delimitada.

Método: GET
Ruta: /api/v1/usuarios/me/patrullajes
Autenticación: Requiere Token JWT
Roles permitidos: patrullero

Respuestas esperadas:

200 OK: Patrullajes del usuario obtenidos correctamente.
```json
{
    "ok": true,
    "message": "Patrullajes del usuario obtenidos correctamente.",
    "data": [
        {
            "nombre_proyecto": "Patrullaje Preventivo Plan Valparaíso",
            "id_proyecto": 1,
            "id_patrullaje": 1,
            "hora_inicio": "2026-06-05T08:00:00.000Z",
            "hora_termino": "2026-06-05T16:00:00.000Z",
            "zona": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-71.625, -33.035],
                        [-71.615, -33.035],
                        [-71.615, -33.045],
                        [-71.625, -33.045],
                        [-71.625, -33.035]
                    ]
                ]
            },
            "estado": "Finalizado"
        }
    ]
}
```

Casos de error:

401 Unauthorized: Token JWT no proporcionado o invalido.
403 Forbidden: No tienes rol de patrullero para realizar esta consulta.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 4. Obtener un usuario por ID (RUT o Correo).

Permite al administrador consultar los datos completos de un usuario registrado en el sistema mediante su RUT o su correo electronico.

Método: GET
Ruta: /api/v1/usuarios/:id_user
Autenticación: Requiere Token JWT
Roles permitidos: admin
Parámetros de ruta (Path Params):
- id_user: string (RUT o correo electronico del usuario a consultar)

Respuestas esperadas:

200 OK: Se encontraron los datos del usuario.
```json
{
    "ok": true,
    "message": "Se encontraron los datos del usuario.",
    "data": {
        "rut": "18222333-k",
        "nombre": "Carlos Gomez",
        "correo": "carlos.gomez@sipprem.com",
        "telefono": "999999999",
        "foto": null,
        "id_rol": 3,
        "tipo_rol": "Patrullero",
        "fecha_registro": "2026-10-25T03:00:00.000Z"
    }
}
```

Casos de error:

401 Unauthorized: Token JWT no proporcionado o invalido.
403 Forbidden: No tienes permisos para acceder a este recurso.
404 Not found: El usuario con id :id_user no se encontro.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 5. Obtener los proyectos a los que pertenece un usuario.

Permite al administrador consultar todos los proyectos a los que un determinado usuario tiene acceso o en los que se encuentra asignado como personal.

Método: GET
Ruta: /api/v1/usuarios/:id_user/proyectos
Autenticación: Requiere Token JWT
Roles permitidos: admin
Parámetros de ruta (Path Params):
- id_user: string (RUT del usuario a consultar)

Respuestas esperadas:

200 OK: Se encontraron los proyectos del usuario.
```json
{
    "ok": true,
    "message": "Se encontraron los proyectos del usuario.",
    "data": [
        {
            "id_proyecto": 1,
            "nombre_proyecto": "Patrullaje Preventivo Plan Valparaíso"
        }
    ]
}
```

Casos de error:

401 Unauthorized: Token JWT no proporcionado o invalido.
403 Forbidden: No tienes permisos para acceder a este recurso.
404 Not found: El usuario con id :id_user no se encontro.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 6. Crear un nuevo usuario en el sistema.

Permite al administrador registrar un nuevo usuario (supervisor, patrullero o administrador). El sistema genera de forma segura una clave temporal aleatoria de 12 caracteres hexadecimales, la cual es encriptada con bcrypt antes de ser almacenada, y deja la columna nuevo_user en true para forzar el cambio de clave en el primer inicio de sesion.

Método: POST
Ruta: /api/v1/usuarios
Autenticación: Requiere Token JWT
Roles permitidos: admin
Body requerido (JSON):

```json
{
  "rut": "15444333-2",
  "nombre": "Roberto Fuentes",
  "correo": "roberto.fuentes@sipprem.com",
  "telefono": "977889900",
  "foto": null,
  "id_rol": 3
}
```

Respuestas esperadas:

201 Created: El usuario se creo exitosamente.
```json
{
    "ok": true,
    "message": "El usuario se creo exitosamente.",
    "data": "a3f89c42b10e"
}
```
*(El campo data retorna la clave temporal generada en texto plano para que el administrador pueda entregarsela al usuario)*

Casos de error:

400 Bad request: Faltan campos obligatorios (rut, nombre, correo, id_rol), formato de RUT invalido, formato de correo invalido, o rol inexistente.
409 Conflict: El RUT, correo o telefono ingresado ya pertenece a otro usuario registrado.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 7. Actualizar datos de un usuario.

Permite al administrador modificar los datos basicos de un usuario registrado (nombre, correo, telefono, foto e id_rol).

Método: PUT
Ruta: /api/v1/usuarios/:id_user
Autenticación: Requiere Token JWT
Roles permitidos: admin
Parámetros de ruta (Path Params):
- id_user: string (RUT actual del usuario que se va a modificar)

Body requerido (JSON):

```json
{
  "nombre": "Roberto Fuentes Actualizado",
  "correo": "roberto.actualizado@sipprem.com",
  "telefono": "977889911",
  "foto": null,
  "id_rol": 2
}
```

Respuestas esperadas:

200 OK: El usuario se modifico exitosamente.
```json
{
    "ok": true,
    "message": "El usuario se modifico exitosamente.",
    "data": null
}
```

Casos de error:

400 Bad request: Campos obligatorios vacios, formato de correo invalido o rol no valido.
404 Not found: El usuario a modificar no se encontro o se encuentra eliminado.
409 Conflict: El nuevo correo o telefono ya se encuentra en uso por otra persona.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 8. Eliminar un usuario (Eliminación lógica).

Realiza el borrado logico de un usuario del sistema cambiando su campo eliminado a true. El sistema impide que un administrador elimine su propia cuenta activa o al Administrador root predefinido.

Método: DELETE
Ruta: /api/v1/usuarios/:id_user
Autenticación: Requiere Token JWT
Roles permitidos: admin
Parámetros de ruta (Path Params):
- id_user: string (RUT o correo del usuario a eliminar)

Body requerido (JSON):
No requiere body.

Respuestas esperadas:

200 OK: El usuario se elimino exitosamente.
```json
{
    "ok": true,
    "message": "El usuario se elimino exitosamente.",
    "data": null
}
```

Casos de error:

400 Bad request: Intento de eliminar la propia cuenta de usuario o intento de eliminar al Administrador root (00000000-0).
404 Not found: El usuario con id :id_user no se encontro.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 9. Restablecer contraseña de un usuario.

Permite al administrador resetear la contraseña de un usuario cuando este la ha olvidado. Genera una nueva clave aleatoria de 12 caracteres, actualiza el hash encriptado y coloca la columna nuevo_user en true para exigirle cambiarla al iniciar sesion.

Método: PATCH
Ruta: /api/v1/usuarios/:id_user/reestablecer-clave
Autenticación: Requiere Token JWT
Roles permitidos: admin
Parámetros de ruta (Path Params):
- id_user: string (RUT o correo del usuario)

Body requerido (JSON):
No requiere body.

Respuestas esperadas:

200 OK: Se reestablecio correctamente la clave del usuario.
```json
{
    "ok": true,
    "message": "Se reestablecio correctamente la clave del usuario.",
    "data": "7e49c1b3f92d"
}
```
*(El campo data entrega la nueva clave temporal generada)*

Casos de error:

404 Not found: El usuario no se encontro o se encuentra eliminado.
500 Internal server error: Error interno del servidor al procesar la peticion.

## 10. Restaurar un usuario eliminado.

Permite al administrador reactivar una cuenta de usuario que habia sido eliminada previamente (soft delete), cambiando su campo eliminado nuevamente a false.

Método: PATCH
Ruta: /api/v1/usuarios/:id_user/restaurar
Autenticación: Requiere Token JWT
Roles permitidos: admin
Parámetros de ruta (Path Params):
- id_user: string (RUT o correo del usuario a restaurar)

Body requerido (JSON):
No requiere body.

Respuestas esperadas:

200 OK: Se restauro correctamente el usuario.
```json
{
    "ok": true,
    "message": "Se restauro correctamente el usuario.",
    "data": null
}
```

Casos de error:

404 Not found: El usuario no se encontro en el sistema.
500 Internal server error: Error interno del servidor al procesar la peticion.

### Evidencia de pruebas en Postman
![Evidencia usuarios](./pruebas/capturas/evidencia-usuarios.png)
![Evidencia usuarios](./pruebas/capturas/evidencia-usuarios2.png)
