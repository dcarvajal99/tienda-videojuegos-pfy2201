import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// La aplicación se publica en una subcarpeta de GitHub Pages, por eso la base
// no es "/": los archivos quedan en /tienda-videojuegos-pfy2201/react/.
export default defineConfig({
    base: '/tienda-videojuegos-pfy2201/react/',
    plugins: [react()],
});
