# Audio Aula

Aplicación web para grabar notas de voz para profesores, con transcripción automática y categorización inteligente.

## Características

- Grabación de notas de voz desde el navegador
- Transcripción automática usando OpenAI Whisper
- Análisis y categorización automática del contenido
- Identificación de alumnos mencionados en las notas
- Almacenamiento organizado en Google Sheets
- Interfaz responsive para uso en dispositivos móviles
- Autenticación segura con Google

## Tecnologías

### Frontend
- React.js con TypeScript
- Tailwind CSS para el diseño
- Firebase Authentication
- Web Audio API para grabación de audio
- Progressive Web App (PWA)

### Backend
- Node.js con Express y TypeScript
- OpenAI API (Whisper y GPT)
- Google Sheets API
- Firebase Storage

## Requisitos previos

- Node.js (v14 o superior)
- Cuenta de Firebase
- Cuenta de OpenAI
- Cuenta de Google Cloud con Google Sheets API habilitada

## Configuración

### Backend

1. Navega al directorio del backend:
   ```
   cd audio_aula_cline/backend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Copia el archivo `.env.example` a `.env` y configura las variables de entorno:
   ```
   cp .env.example .env
   ```

4. Edita el archivo `.env` con tus credenciales:
   - Clave API de OpenAI
   - Configuración de Firebase
   - Credenciales de Google Sheets

### Frontend

1. Navega al directorio del frontend:
   ```
   cd audio_aula_cline/frontend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Copia el archivo `.env.example` a `.env` y configura las variables de entorno:
   ```
   cp .env.example .env
   ```

4. Edita el archivo `.env` con tus credenciales de Firebase.

## Ejecución

### Backend

1. Navega al directorio del backend:
   ```
   cd audio_aula_cline/backend
   ```

2. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

El servidor se ejecutará en `http://localhost:5000`.

### Frontend

1. Navega al directorio del frontend:
   ```
   cd audio_aula_cline/frontend
   ```

2. Inicia el servidor de desarrollo:
   ```
   npm start
   ```

La aplicación se abrirá en `http://localhost:3000`.

## Despliegue

### Backend

1. Compila el código TypeScript:
   ```
   npm run build
   ```

2. El código compilado estará en el directorio `dist/`.

### Frontend

1. Crea una versión de producción:
   ```
   npm run build
   ```

2. Los archivos estáticos estarán en el directorio `build/`.

## Desarrollo del MVP

Este proyecto sigue un enfoque de desarrollo de MVP (Producto Mínimo Viable) para probar su funcionamiento básico antes de escalar con características adicionales.

## Depuración y Manejo de Errores

La aplicación incluye un sistema robusto de manejo de errores y logging para facilitar la depuración:

### Logging

- Todos los servicios del backend incluyen logging detallado de sus operaciones
- Los mensajes de log incluyen información sobre:
  - Inicio y finalización de operaciones
  - Parámetros importantes
  - Resultados de operaciones
  - Errores y excepciones

### Manejo de Errores

- Cada servicio implementa manejo de errores específico para su dominio
- Los errores incluyen mensajes descriptivos para facilitar la identificación del problema
- Se implementan verificaciones previas para evitar errores comunes:
  - Validación de parámetros de entrada
  - Verificación de existencia de archivos
  - Comprobación de configuración de APIs externas

### Estructura de Errores

Los errores devueltos por la API siguen una estructura consistente:

```json
{
  "error": "Mensaje descriptivo del error"
}
```

Para errores más específicos, se incluyen detalles adicionales cuando es posible.

### Lista de Tareas

El archivo `TODO.md` contiene una lista completa de tareas organizadas por secciones para el desarrollo del MVP. Utiliza este archivo para:

- Seguir el progreso del desarrollo
- Marcar tareas completadas
- Documentar problemas encontrados
- Registrar notas para cada sesión de desarrollo

Para actualizar el estado de una tarea, modifica los marcadores:
- [ ] Tarea pendiente
- [x] Tarea completada
- [!] Tarea con problemas o bloqueada

### Registro de Progreso

Al final de cada sesión de desarrollo, actualiza la sección "Registro de Progreso" en `TODO.md` con:
- Fecha de la sesión
- Tareas completadas
- Tareas en progreso
- Problemas encontrados
- Notas adicionales

Este registro ayudará a mantener la continuidad entre diferentes sesiones o días de desarrollo.

## Licencia

Este proyecto es software privado y no está licenciado para uso público.
