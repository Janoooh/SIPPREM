# Como crear la base de datos

En este documento markdown se procede a explicar paso a paso como crear la base de datos con el archivo schema.sql presente en la carpeta database.

## Proceso paso a paso

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