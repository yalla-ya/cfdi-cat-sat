# cat-cfdi-sat

Catalogo de CFDI json y csv 

Este es un repositorio para obtener los ultimos catalogos del SAT, en diferente modos JSON y CSV

# Resultado del proceso

El proceso tomara el archivo catCFDI que esta en la carpeta con la version ultima, lo va procesar y va crear los siguientes archivos:

csv/*.csv - Exportacion de cada uno de los catalogos con el mismo titulos que lleva el excel
csv/*.sql.csv - Exportacion de cata uno de los catalogos con titulos traducidos, listos para cargar a un base de datos SQL ( no conitnen acentos ni espacios )
json/*.json - Array de objectos JSON con los nombres originales como vienen en el catalogo de SAT
json/*.t.json - Array de objectos JSON con los campos sin acentos, como estan en la exportacion de SQL.

# Traduccion/Transformacion de Campos

el archivo translations.json contiene los titulos como vienen en el catalogo de SAT en cado uno de los catalogos, y como seria la traduccion/transformacion del nombre de cada campo.

# Processar CatCFDI

npm install
npm run start

# Ajustes Manuales para el catCFDI que se descarga del SAT

Algunas de las pestañas tienen campos unidas, en este caso para no entrar a detalles en esto en el codigo, se requier los siguientes cambios
manuales en el archivo previo a correr el proceso ( y en caso que se requieren estos catalogos ):

c_UsoCFDI, c_TasaOCuota, c_CodigoPostal_Parte_1 &   c_CodigoPostal_Parte_2: Lineas 5 y 6 tienen celdas unidas, deuniar las celdas, y que las celdas de lineas 5 y 6 tengan el mismo valor del campo.
c_TasaOCuota: ti
c_TipoDeComprobante: En nomina y otras lineas tiene celdas unidas, reahcerle para que tenga solo una linea, celda separadas.


# Parametros avanzados process

./process.js --ver={numeric} --in={filepath}  --decamelize={boolean} --translate{true|filepath} --sufix={.sql|.t|string}

ver - version, carpeta que contiene el catCFD y donde sera la generacion de los catalogos procesados
in - el archivo de catCFDI - default {ver}/catCFDI/catCFDI.xls
decamelize - convertir los nombres de catalogos a lowercase y argregar _ ante cada letra grande
format - el formato requerido json o csv - default json
translate - si traducir los campos, o en su caso que archivo de traduccion usar
suffix - que sufijo poner a los archivos

# Parametros avanzados para importar a MySQL

Previo a importar los datos, se debe processar en el script anterior los csv en formato SQL

./import.js --host={host} --port={port} --username={username} --password={password} --db={db} --table={catalogo}

o en su caso utilizara los siguientes env parametros: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME

table - seria la tabla/catalogo a importar, ejemplor: c_aduana ( como estan nombrado los archivos en la carpeta /csv )

