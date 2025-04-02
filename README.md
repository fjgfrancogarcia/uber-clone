# Uber Clone

Un clon de Uber desarrollado con Next.js, React, TailwindCSS y Leaflet para la funcionalidad de mapas.

## Características

- Interfaz de usuario moderna y responsive
- Selección de ubicaciones de origen y destino en el mapa
- Cálculo de precios basado en la distancia
- Visualización de viajes realizados
- Sistema de autenticación

## Tecnologías utilizadas

- Next.js 14
- React 18
- TailwindCSS
- Leaflet / React-Leaflet para mapas
- Prisma como ORM
- PostgreSQL como base de datos

## Cómo ejecutar

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Copia `.env.example` a `.env` y configura las variables de entorno
4. Ejecuta las migraciones de la base de datos: `npx prisma migrate dev`
5. Inicia el servidor de desarrollo: `npm run dev`

## Desplegado en Vercel

Esta aplicación está desplegada en Vercel y puedes acceder a ella [aquí](https://tu-url-de-vercel.vercel.app). 