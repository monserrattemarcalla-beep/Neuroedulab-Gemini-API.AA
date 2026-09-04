# NEUROEDULAB + GEMINI API

## Qué incluye
- Ecosistema educativo digital completo y responsive.
- Gamificación, recursos multimedia, DUA y los 4 productos del documento base.
- Tutor Pedagógico IA conectado realmente a la Gemini API.
- Backend Node.js que mantiene la clave de Gemini fuera del navegador.
- Preparado para funcionar en computadora y para publicarse en un servicio que ejecute Node.js.

## 1. Ejecutarlo en la computadora
Requisitos: Node.js 18 o superior.

1. Copia `.env.example` como `.env`.
2. Coloca tu clave real en `GEMINI_API_KEY`.
3. Abre una terminal en esta carpeta y ejecuta:
   `npm start`
4. En el navegador abre:
   `http://localhost:3000`

Importante: no abras `public/index.html` con doble clic si quieres usar Gemini; el tutor IA necesita el servidor.

## 2. Publicarlo para que el profesor entre por un enlace
Este proyecto necesita un hosting que ejecute Node.js y permita configurar variables de entorno.

En el servicio de publicación:
- sube esta carpeta/proyecto;
- configura `GEMINI_API_KEY` como secreto/variable de entorno;
- configura opcionalmente `GEMINI_MODEL=gemini-3.8-flash`;
- usa el comando de inicio `npm start`.

Después el hosting entregará un enlace HTTPS que podrás enviar al profesor.

## 3. Seguridad
NO coloques la clave de Gemini dentro de `public/index.html`, JavaScript del navegador, README ni el repositorio público.
La clave debe permanecer como secreto del servidor.

## 4. Nota sobre Gemini
La interfaz ya no genera una respuesta fija/simulada. Al pulsar “Generar guía”, el navegador llama a `/api/gemini`, y el servidor realiza la solicitud a la Gemini API.

El proyecto usa la API de Interactions de Gemini, recomendada actualmente por la documentación oficial de Google para proyectos nuevos.

## 5. Entrega académica
Nombre sugerido del archivo:
`Neuroedulab_Gemini_API.zip`

Antes de entregar:
- configura la clave;
- prueba una consulta del Tutor Pedagógico IA;
- prueba el enlace público desde otro dispositivo;
- revisa que los recursos externos de los cuatro productos sigan accesibles;
- conserva las atribuciones/licencias indicadas en el documento base.
