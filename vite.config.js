import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages publica el repositorio en /tienda-videojuegos-pfy2201/, no en la raíz
// del dominio: la base le indica a Vite desde qué ruta se sirven los archivos.
export default defineConfig({
    base: '/tienda-videojuegos-pfy2201/',
    plugins: [react()],
});
