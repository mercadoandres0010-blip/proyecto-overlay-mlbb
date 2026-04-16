# 🌅 MLBB Professional Overlay M7 - Amanecer eSports

Este es un sistema de overlays profesionales inspirado en el estilo de la M7 (Mobile Legends World Championship), diseñado para streamers y organizadores de torneos. El proyecto incluye 3 overlays dinámicos y un potente panel de administración.

## 🚀 Cómo empezar

### 1. Abrir el proyecto
El proyecto es estático (HTML/JS), por lo que no requiere instalación de servidor para funcionar de forma básica.
- Simplemente abre `admin.html` en tu navegador para controlar todo.
- Abre `index.html`, `ingame.html` o `intermission.html` en otras pestañas o ventanas.

### 2. Conectando el Admin con los Overlays
El sistema utiliza **BroadcastChannel API** y **LocalStorage**, lo que permite que los cambios realizados en el panel de administración se reflejen en tiempo real en los overlays **siempre que estén abiertos en el mismo navegador o perfil de usuario**.

### 3. Configuración en OBS Studio
Para usar estos overlays en tus transmisiones:
1. Agrega una nueva **Fuente de Navegador (Browser Source)** en OBS.
2. Selecciona **Archivo Local** y busca el overlay que desees (ej: `ingame.html`).
3. Ajusta la resolución a **1920x1080**.
4. Repite el proceso para los otros overlays.

> [!IMPORTANT]
> **Para conectar el Admin con OBS:**
> Dado que OBS usa instancias aisladas, la mejor forma de que el Admin y los Overlays se comuniquen es a través de una URL pública (GitHub Pages). Una vez subido a GitHub, usa la URL de GitHub Pages en OBS en lugar de archivos locales.

## 📂 Estructura del Proyecto

- `/` (Raíz): Encontrarás los archivos HTML principales (`admin.html`, `index.html`, `ingame.html`, `intermission.html`).
- `/css`: Estilos visuales de cada sección.
- `/js`: Lógica de comunicación y base de datos de héroes.
- `/assets`: Iconos y recursos gráficos.
- `/assets/heroes`: Retratos de los héroes de Mobile Legends.

## 🌐 Despliegue en GitHub Pages

Este proyecto está optimizado para funcionar directamente en **GitHub Pages**:
1. Sube todos los archivos a un repositorio de GitHub.
2. Ve a **Settings > Pages**.
3. Selecciona la rama `main` y la carpeta `/root`.
4. Una vez publicado, tus URLs serán:
   - `https://tu-usuario.github.io/tu-repo/admin.html` (Control)
   - `https://tu-usuario.github.io/tu-repo/index.html` (Draft)
   - ...etc.

## 🛠️ Herramientas Locales (Opcional)

- `server.js`: Servidor Node.js para comunicación avanzada (Socket.io) necesaria si usas el detector de IA por Python.
- `detector_picks.py`: Script de Python para detección automática de héroes mediante IA.

---
*Desarrollado para la comunidad de Amanecer eSports.*
