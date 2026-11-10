# 🎵 EchoPrint — Frontend

Interfaz web de **EchoPrint**, una app para **reconocer canciones** (audio o tarareo/canto), guardar el historial y abrir los temas en Spotify.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

## Funciones

- Descubrir: identificar una canción o **tararear/cantar**.
- Historial de reconocimientos y detalle por canción.
- Conexión con **Spotify** (flujo OAuth con banner de estado) y enlaces directos a Spotify.
- Autenticación contra el backend ([EchoPrint-Backend](https://github.com/JSRT23/EchoPrint-Backend)).

## Variables de entorno

Copia `.env.example` a `.env`.

| Variable | Descripción | Por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API del backend | `http://127.0.0.1:8000/api` |

## Cómo correrlo

### Con Docker

```bash
git clone https://github.com/JSRT23/EchoPrint-Music.git
cd EchoPrint-Music
docker compose up --build web            # producción -> http://localhost:8080
docker compose --profile dev up dev      # desarrollo  -> http://localhost:5173
```

### Sin Docker

```bash
cd echoprint
npm ci
npm run dev
```

> El código de la app está en la carpeta `echoprint/`; el `docker-compose.yml` de la raíz usa esa carpeta como contexto.
