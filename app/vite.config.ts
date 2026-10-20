import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// La app lee los scripts de sql/ y las salidas de evidencia/ directamente (import.meta.glob con ?raw), para que
// cada fila de la matriz muestre su evidencia real sin copiarla a mano. Por eso el servidor de desarrollo puede leer
// la carpeta del proyecto, un nivel arriba de app/. base './' permite publicarla como sitio estático en cualquier ruta.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { fs: { allow: ['..'] } },
})
