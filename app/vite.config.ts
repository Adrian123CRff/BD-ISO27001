import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// La app lee los scripts de sql/ y las salidas de evidencia/ directamente (import.meta.glob con ?raw), para que
// cada fila de la matriz muestre su evidencia real sin copiarla a mano. Por eso el servidor de desarrollo puede leer
// esas carpetas del proyecto, un nivel arriba de app/. base './' permite publicarla como sitio estático en cualquier ruta.
export default defineConfig({
  plugins: [react()],
  base: './',
  // Solo lo que la app lee: nunca toda la carpeta (materiales/clase/ y salidas/ no deben quedar al alcance del servidor).
  server: { fs: { allow: ['.', '../sql', '../evidencia', '../docs'] } },
  // El texto de los scripts y de su evidencia va en su propio fragmento, separado del código de la app.
  build: {
    rolldownOptions: {
      output: { codeSplitting: { groups: [{ name: 'evidencia', test: /[\\/](sql|evidencia|docs)[\\/]/ }] } },
    },
  },
})
