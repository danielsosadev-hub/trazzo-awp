# TRAZZO

Sistema de gestión de unidades, rutas, operadores, prestadores y clientes de transporte de carga (PWA).

## Estructura
```
index.html        Estructura de la página (encabezado, menú, contenedor de páginas, pie)
css/styles.css    Estilos y colores (variables al inicio)
js/app.js         Datos, páginas, enrutador y eventos
manifest.json     Datos de instalación de la PWA
sw.js             Service worker (uso sin conexión)
icons/            Íconos de la app
media/            1.mp4 (video) y 1.jpg, 2.jpg, 3.jpg (imágenes)  <- coloca aquí tus archivos
```

## Probar en local
El service worker solo funciona con http://localhost o https, no abriendo el archivo con doble clic:
```
python3 -m http.server 8000
```
y abre http://localhost:8000

## Publicar
Sube la carpeta completa a Netlify Drop, GitHub Pages o Vercel. Obtendrás una URL https desde la que la app se puede instalar.
