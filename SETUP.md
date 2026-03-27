# 🏠 CRM Inmobiliario — Guía de Arranque Completa

## Índice
1. [Instalar Docker](#1-instalar-docker)
2. [Conceptos mínimos](#2-conceptos-mínimos)
3. [Descargar y preparar el proyecto](#3-descargar-y-preparar-el-proyecto)
4. [Configurar variables de entorno](#4-configurar-variables-de-entorno)
5. [Levantar la base de datos](#5-levantar-la-base-de-datos)
6. [Migraciones y seed](#6-migraciones-y-seed)
7. [Levantar el backend](#7-levantar-el-backend)
8. [Levantar el frontend](#8-levantar-el-frontend)
9. [Opción todo-en-uno con Docker](#9-opción-todo-en-uno-con-docker)
10. [Errores comunes](#10-errores-comunes)

---

## 1. Instalar Docker

Docker es la única herramienta externa que necesitas instalar. Incluye todo lo necesario.

### Windows
1. Ve a https://www.docker.com/products/docker-desktop
2. Descarga **Docker Desktop for Windows**
3. Ejecuta el instalador (siguiente → siguiente → instalar)
4. Reinicia el ordenador cuando lo pida
5. Abre Docker Desktop desde el menú inicio → espera a que el icono de la ballena esté en verde

> ⚠️ En Windows necesitas WSL2. Si el instalador lo pide, sigue las instrucciones en pantalla (es automático en versiones recientes).

### macOS
1. Ve a https://www.docker.com/products/docker-desktop
2. Descarga la versión según tu chip:
   - **Apple Silicon (M1/M2/M3)** → "Mac with Apple chip"
   - **Intel** → "Mac with Intel chip"
3. Abre el `.dmg` y arrastra Docker a Aplicaciones
4. Abre Docker desde Aplicaciones → acepta los permisos

### Linux (Ubuntu/Debian)
Abre una terminal y ejecuta estos comandos uno a uno:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
```

Cierra y abre la terminal para que el último comando tenga efecto.

### ✅ Verificar que Docker funciona

Abre una terminal (o PowerShell en Windows) y ejecuta:

```bash
docker --version
docker compose version
```

Deberías ver algo como:
```
Docker version 26.1.0, build ...
Docker Compose version v2.27.0
```

Si aparece `command not found`, Docker no se instaló correctamente. Repite los pasos anteriores.

---

## 2. Conceptos mínimos

Solo necesitas entender 3 cosas:

| Concepto | Qué es | Analogía |
|----------|--------|---------|
| **Imagen** | Una "receta" para crear un programa | Como un ISO de Windows |
| **Contenedor** | Un programa corriendo, creado desde una imagen | Como una instalación de Windows en marcha |
| **docker-compose** | Un archivo que levanta varios contenedores a la vez | Como un "play" que arranca toda la orquesta |

En este proyecto, `docker compose up` levantará 3 contenedores: PostgreSQL, el backend y el frontend.

---

## 3. Descargar y preparar el proyecto

### Opción A — Tienes Git instalado

```bash
git clone https://github.com/tu-org/crm-inmobiliario.git
cd crm-inmobiliario
```

### Opción B — Sin Git

1. Descarga el ZIP del repositorio
2. Descomprímelo
3. Abre una terminal **dentro de esa carpeta**

### Instalar Node.js (necesario para desarrollo local)

Descarga Node.js 20 LTS desde https://nodejs.org → instala con las opciones por defecto.

Verifica:
```bash
node --version   # debe mostrar v20.x.x
npm --version    # debe mostrar 10.x.x
```

### Instalar dependencias del proyecto

Con la terminal en la carpeta raíz del proyecto:

```bash
npm install
```

Esto instala todas las dependencias de `server/` y `client/` automáticamente. Tardará 1-2 minutos.

---

## 4. Configurar variables de entorno

Las variables de entorno le dicen al proyecto cómo conectarse a la base de datos, qué secretos usar, etc.

### Paso 1 — Crear el archivo .env

```bash
cp .env.example .env
```

Esto copia la plantilla. Ahora edita el archivo `.env` con cualquier editor de texto (Notepad, VS Code, etc.).

### Paso 2 — Variables que DEBES cambiar

Abre `.env` y cambia estas líneas:

```env
# ── Base de datos ─────────────────────────────────
POSTGRES_PASSWORD=pon_aqui_una_contraseña_segura
DATABASE_URL=postgresql://crm_user:pon_aqui_una_contraseña_segura@localhost:5432/crm_db
#                                  ↑ misma contraseña que arriba

# ── Seguridad JWT ──────────────────────────────────
# Genera secretos largos y aleatorios. Puedes usar este comando:
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=pega_aqui_el_resultado_del_comando_anterior
JWT_REFRESH_SECRET=pega_aqui_otro_resultado_diferente
```

### Paso 3 — Variables que puedes dejar como están (para desarrollo local)

```env
PORT=4000               # Puerto del backend
NODE_ENV=development    # Modo desarrollo
CLIENT_URL=http://localhost:5173   # URL del frontend
VITE_API_URL=http://localhost:4000/api
```

### Paso 4 — Crear el .env del servidor

```bash
cp .env server/.env
```

> El servidor necesita su propio `.env` en la carpeta `server/`.

### Verificación rápida

Tu `.env` debería tener estas líneas sin valores vacíos:
- `POSTGRES_PASSWORD=` ✅ tiene valor
- `DATABASE_URL=` ✅ tiene valor (con la misma contraseña)
- `JWT_SECRET=` ✅ tiene valor (largo)
- `JWT_REFRESH_SECRET=` ✅ tiene valor (diferente al anterior)

---

## 5. Levantar la base de datos

Aquí usamos Docker para tener PostgreSQL funcionando sin instalarlo en tu máquina.

### Iniciar solo PostgreSQL

```bash
docker compose up postgres -d
```

- `postgres` → nombre del servicio definido en `docker-compose.yml`
- `-d` → corre en segundo plano (no bloquea la terminal)

Verás algo como:
```
[+] Running 2/2
 ✔ Network crm_network   Created
 ✔ Container crm_postgres  Started
```

### Verificar que PostgreSQL está funcionando

```bash
docker compose ps
```

Debes ver:

```
NAME           STATUS          PORTS
crm_postgres   Up 30 seconds   0.0.0.0:5432->5432/tcp
```

El estado debe decir **Up**, no **Exited**.

### Verificar la conexión a la base de datos

```bash
docker exec -it crm_postgres psql -U crm_user -d crm_db -c "SELECT version();"
```

Si responde con la versión de PostgreSQL, ¡todo funciona!

Si da error, comprueba que `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` en tu `.env` coincidan exactamente.

---

## 6. Migraciones y seed

Las **migraciones** crean las tablas en la base de datos.
El **seed** rellena esas tablas con datos de ejemplo para poder probar la app.

### Ejecutar migraciones

```bash
npm run db:migrate
```

Verás Prisma aplicando migraciones. Al finalizar:
```
✔ Generated Prisma Client
✔ Applied X migration(s)
```

### Ejecutar el seed (datos de ejemplo)

```bash
npm run db:seed
```

Al terminar verás:
```
✅  Seed completed successfully!

   Credentials:
   👤 admin@crminmobiliario.es  / Admin1234!  (ADMIN)
   👤 agente@crminmobiliario.es / Agent1234!  (AGENT)
```

Guarda esas credenciales: las usarás para entrar al CRM.

### Verificar que los datos se crearon

```bash
docker exec -it crm_postgres psql -U crm_user -d crm_db -c "SELECT email, role FROM users;"
```

Debes ver los 2 usuarios del seed.

### (Opcional) Abrir Prisma Studio — interfaz visual de la base de datos

```bash
npm run db:studio
```

Abre http://localhost:5555 en el navegador. Puedes ver y editar tablas visualmente.

---

## 7. Levantar el backend

### Iniciar el servidor de desarrollo

Abre una **nueva terminal** (deja la anterior con la base de datos funcionando):

```bash
npm run dev:server
```

Verás:
```
✅  Database connected
🚀  Server running on http://localhost:4000
    Environment : development
    Health      : http://localhost:4000/health
    API base    : http://localhost:4000/api
```

### Verificar que el backend funciona

Abre en tu navegador: http://localhost:4000/health

Debe responder:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "environment": "development"
  }
}
```

### Probar el login con curl (opcional)

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crminmobiliario.es","password":"Admin1234!"}'
```

Debe devolver un JSON con `access_token` y `refresh_token`.

---

## 8. Levantar el frontend

Abre otra **nueva terminal** (ahora tienes 3 abiertas: BD, backend, frontend):

```bash
npm run dev:client
```

Verás:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

### Acceder a la aplicación

Abre en tu navegador: **http://localhost:5173**

Verás la **web pública** (página de inicio con propiedades).

Para acceder al **CRM (panel admin)**:

1. Ve a http://localhost:5173/login
2. Introduce las credenciales del seed:
   - Email: `admin@crminmobiliario.es`
   - Contraseña: `Admin1234!`
3. Serás redirigido al dashboard

### ✅ Checklist de verificación

- [ ] http://localhost:5173 → muestra la web pública
- [ ] http://localhost:5173/login → muestra el formulario de login
- [ ] Login con `admin@crminmobiliario.es` / `Admin1234!` → accede al dashboard
- [ ] http://localhost:5173/admin/properties → muestra las propiedades del seed
- [ ] http://localhost:4000/health → responde `ok`

---

## 9. Opción todo-en-uno con Docker

Si quieres levantar **todo** (BD + backend + frontend) con un solo comando sin instalar Node.js:

### Primer arranque

```bash
docker compose up --build -d
```

- `--build` → construye las imágenes (necesario la primera vez, tarda 3-5 minutos)
- `-d` → corre en segundo plano

### Ejecutar migraciones y seed (solo la primera vez)

```bash
# Migraciones
docker exec crm_server npx prisma migrate deploy

# Seed
docker exec crm_server npx tsx prisma/seed.ts
```

### Ver el estado de los servicios

```bash
docker compose ps
```

Debes ver 3 contenedores en estado **Up**:

```
NAME           STATUS    PORTS
crm_postgres   Up        0.0.0.0:5432->5432/tcp
crm_server     Up        0.0.0.0:4000->4000/tcp
crm_client     Up        0.0.0.0:5173->80/tcp
```

### Ver los logs en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Solo el backend
docker compose logs -f server

# Solo el frontend
docker compose logs -f client

# Solo la base de datos
docker compose logs -f postgres
```

Presiona `Ctrl+C` para dejar de ver los logs (los servicios siguen corriendo).

### Acceder a la aplicación

- **Web pública**: http://localhost:5173
- **CRM Admin**: http://localhost:5173/login
- **API**: http://localhost:4000/api
- **Health**: http://localhost:4000/health

### Parar todos los servicios

```bash
docker compose down
```

Los datos de la base de datos se conservan en un volumen Docker. La próxima vez que hagas `docker compose up -d`, todo estará igual.

### Parar y eliminar todos los datos (reset completo)

```bash
docker compose down -v
```

> ⚠️ El flag `-v` elimina los volúmenes (incluida la base de datos). Úsalo solo si quieres empezar desde cero.

### Reiniciar un servicio específico

```bash
# Reiniciar solo el backend
docker compose restart server

# Reconstruir y reiniciar solo el backend
docker compose up --build -d server
```

---

## 10. Errores comunes

### ❌ Error: Puerto 5432 ya en uso

```
Error: port is already allocated
```

**Causa**: Tienes PostgreSQL instalado localmente y usa el mismo puerto.

**Solución A** — Para PostgreSQL local temporalmente:
```bash
# macOS
brew services stop postgresql

# Linux
sudo systemctl stop postgresql

# Windows: Busca "Servicios" en el menú inicio → PostgreSQL → Detener
```

**Solución B** — Cambiar el puerto en `docker-compose.yml`:
```yaml
ports:
  - '5433:5432'   # ← cambia 5432 por 5433
```
Y actualiza `DATABASE_URL` en `.env`:
```env
DATABASE_URL=postgresql://crm_user:tu_password@localhost:5433/crm_db
#                                                         ↑ 5433
```

---

### ❌ Error: Puerto 4000 o 5173 ya en uso

```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solución** — Encuentra y mata el proceso que usa ese puerto:

```bash
# macOS / Linux
lsof -ti:4000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows (PowerShell)
netstat -ano | findstr :4000
taskkill /PID <numero_del_pid> /F
```

---

### ❌ Error: No se puede conectar a la base de datos

```
Error: Can't reach database server at localhost:5432
```

**Causa más común**: El contenedor de PostgreSQL no está corriendo.

**Diagnóstico**:
```bash
docker compose ps
```

Si `crm_postgres` dice **Exited** en lugar de **Up**:

```bash
# Ver qué pasó
docker compose logs postgres

# Reiniciarlo
docker compose up postgres -d
```

**Causa 2**: `DATABASE_URL` en `.env` tiene la contraseña incorrecta.

Verifica que `POSTGRES_PASSWORD` y la contraseña en `DATABASE_URL` son **exactamente iguales**.

---

### ❌ Error: Variables de entorno no encontradas

```
❌  Invalid environment variables:
  • JWT_SECRET: JWT_SECRET must be at least 32 chars
```

**Causa**: El archivo `server/.env` no existe o está incompleto.

**Solución**:
```bash
cp .env server/.env
```

Verifica que `server/.env` existe y tiene `JWT_SECRET` con un valor largo.

---

### ❌ Error al ejecutar migraciones

```
Error: P1001: Can't reach database server
```

**Causa**: PostgreSQL no está corriendo todavía.

**Solución**:
```bash
# 1. Verifica que la BD está up
docker compose ps

# 2. Si no está, levántala
docker compose up postgres -d

# 3. Espera 5 segundos y vuelve a intentarlo
sleep 5 && npm run db:migrate
```

---

### ❌ Error: npm install falla

```
npm error ERESOLVE unable to resolve dependency tree
```

**Solución**:
```bash
npm install --legacy-peer-deps
```

---

### ❌ Docker Desktop no arranca en Windows

- Asegúrate de que **WSL2** está instalado:
  ```powershell
  wsl --install
  ```
- Reinicia el ordenador
- Abre Docker Desktop como administrador (clic derecho → "Ejecutar como administrador")

---

### ❌ El frontend carga pero no puede conectar con el API

Síntoma: el login no funciona, las propiedades no cargan.

**Diagnóstico**: Abre DevTools en el navegador (F12) → pestaña **Network** → mira si hay errores rojos.

**Causas y soluciones**:

1. **El backend no está corriendo** → verifica http://localhost:4000/health
2. **`VITE_API_URL` incorrecto** → debe ser `http://localhost:4000/api` en `.env`
3. **CORS bloqueado** → verifica que `CLIENT_URL=http://localhost:5173` en `.env`

---

## Resumen de comandos

```bash
# ── Setup inicial (una sola vez) ──────────────────────────────────
cp .env.example .env                    # Crear configuración
cp .env server/.env                     # Copiar al servidor
npm install                             # Instalar dependencias
docker compose up postgres -d           # Arrancar base de datos
npm run db:migrate                      # Crear tablas
npm run db:seed                         # Poblar datos de ejemplo

# ── Desarrollo día a día ──────────────────────────────────────────
docker compose up postgres -d           # Terminal 1: BD
npm run dev:server                      # Terminal 2: Backend
npm run dev:client                      # Terminal 3: Frontend

# ── Todo con Docker ───────────────────────────────────────────────
docker compose up --build -d            # Arrancar todo
docker compose ps                       # Ver estado
docker compose logs -f                  # Ver logs
docker compose down                     # Parar todo

# ── Utilidades ────────────────────────────────────────────────────
npm run db:studio                       # Interfaz visual de la BD
docker compose restart server           # Reiniciar backend
```

---

## URLs de la aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Web pública | http://localhost:5173 | Portal de propiedades |
| CRM Login | http://localhost:5173/login | Acceso al panel admin |
| CRM Dashboard | http://localhost:5173/admin/dashboard | Panel principal |
| API Health | http://localhost:4000/health | Verificar backend |
| API Base | http://localhost:4000/api | Endpoints REST |
| Prisma Studio | http://localhost:5555 | Gestor visual de BD |

**Credenciales de acceso:**
- Admin: `admin@crminmobiliario.es` / `Admin1234!`
- Agente: `agente@crminmobiliario.es` / `Agent1234!`
