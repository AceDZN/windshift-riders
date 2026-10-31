import { defineConfig } from 'vite';
export default defineConfig({base:'./',build:{target:'es2022'},server:{port:5301,strictPort:true},preview:{port:4301,strictPort:true}});
