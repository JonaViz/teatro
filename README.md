
```
```
Descargar el codigo
Crear el archivo .env en la carpeta /server
```
ejemplo de la configuracion del archivo .env
PORT=8080
DATABASE=mongodb://127.0.0.1:27017/
JWT_SECRET=mongodb://user:password@127.0.0.1:27017/
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```
    Iniciar el back
```
cd server
npm install
npm start
```
    iniciar el front
```
cd client
npm install
npm run dev
```
	correr las migraciones
	
```
npm run migrate-dev
```

para ingresar a la aplicacion luego de ejecutar la migracion
Admin
Username:pedro
password:Password1

User
Username:jona
password:Password1