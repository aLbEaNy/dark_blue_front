![Logo de Dark Blue](/public/images/logoMini.png)
# **Dark Blue: Mar de Acero**
### *Batallas de submarinos en un futuro distópico — campaña vs IA y modo online 1v1 en tiempo real*
---
## 🧭 Descripción del Proyecto

**Dark Blue: Mar de Acero** es un videojuego web inspirado en el clásico *Hundir la Flota*, reinventado y ambientado en un futuro distópico dominado por una guerra eterna entre humanos y máquinas.

El jugador puede enfrentarse a:

- 🤖 **Una IA avanzada en modo campaña**
- 🌐 **Otros jugadores en tiempo real (1vs1) mediante WebSockets**

El título ofrece:

- Tableros dinámicos
- Ataques especiales
- Chat integrado
- Animaciones
- Progresión completa del perfil
- Tienda online con créditos virtuales

El proyecto está dividido en:

- **Backend**: Spring Boot 3.5 + WebSockets + MongoDB
- **Frontend**: Angular 19 + Tailwind + Signals + RxJS

---

# 🚀 Tecnologías Principales

## 🛠 Backend
- **Java 17**
- **Spring Boot 3.5**
- Spring Security + JWT
- Spring WebSocket (STOMP)
- Spring Data MongoDB
- WebFlux
- Jakarta Validation
- Spring Mail
- Maven

## 🎨 Frontend
- **Angular 19**
- Angular Signals
- RxJS
- Tailwind CSS 4
- SweetAlert2
- STOMP + SockJS
- Audio + animaciones CSS

---

# 🎮 Funcionalidades Principales

## 🔐 Autenticación y Seguridad
- Registro con **doble factor de autenticación (2FA)**
- Login con JWT
- Recuperación de contraseña
- Eliminación de cuenta
- Protección de endpoints REST y WebSocket con roles

---

## 🧑‍💻 Perfil del Jugador
- Nivel y experiencia
- Créditos virtuales
- Estadísticas completas
- Equipamiento, skins, inventario
- Historial de partidas

---

## 🤖 Modo Campaña (Player vs IA)
- IA inteligente con priorización de objetivos
- Disparos progresivos
- Uso de ataques especiales por la IA
- Recompensas de créditos para el jugador
- Tablero autogenerado con submarinos aleatorios

---

## 🌐 Modo Online 1 vs 1 en Tiempo Real
- Sincronización mediante WebSockets (STOMP)
- Turnos, impactos y fallos en tiempo real
- Ataques especiales completamente sincronizados
- Chat interactivo dentro de la partida
- Sistema de abandono y compensación

---

## 🔫 Sistema de Ataques Especiales
- **x2Shot** → doble disparo
- **MultiShot** → varios impactos simultáneos
- **LaserShot** → disparo en línea recta que revela/impacta casillas

Incluye efectos visuales, animaciones y sonidos exclusivos.

---

## 💬 Chat Integrado
- Mensajería instantánea en partidas online
- Envío de logs del sistema al usuario

---

## 💰 Tienda Online
- Compras con créditos virtuales y moneda real
- Items: ataques especiales, skins, mejoras
- Donaciones integradas

---

## 🗃️ Persistencia Completa en MongoDB
Colecciones utilizadas:

- `users`
- `games`
- `perfiles`
- `items`

---

# 🧱 Arquitectura del Proyecto

## 📦 Colecciones MongoDB
| Colección | Contenido |
|----------|-----------|
| **users** | credenciales, 2FA, recuperación, email |
| **games** | partidas online y campaña |
| **perfiles** | estadísticas, nivel, inventario |
| **items** | artículos de tienda |

---

## 🧩 Controladores REST principales

| Controlador | Funcionalidad |
|-------------|---------------|
| `/auth`     | Registro, login, 2FA, recuperación |
| `/game`     | Partidas campaña y online |
| `/perfil`   | Perfil, XP, skins |
| `/shop`     | Tienda virtual |
| Otros       | Utilidades internas |

---

## 📡 WebSocket Topics
- `/topic/game/{gameId}`

---
## 🎨 Multimedia, Recursos y Licencias

### El proyecto utiliza:

 🖼️ Recursos gráficos y sonidos

1.[x] Imágenes libres de derechos obtenidas de Pixabay
2.[x] Pistas de audio libres de derechos obtenidas de Pixabay
3.[x] Edición personalizada realizada por el desarrollador
4.[x] Generación de materiales mediante IA:
5.[x] Gemini 
6.[x] ChatGPT

🔊 Efectos de sonido

1.[x] Archivos propios

2.[x] Recursos libres de derechos

Todos los materiales cumplen las licencias correspondientes.
---
# 🖥️ Instalación y Uso

## 📌 Frontend

```bash
git clone https://github.com/tu_usuario/dark-blue.git
cd dark-blue/dark-blue-front
npm install
ng serve

```
--- 
### 💙 ¡Gracias por probar Dark Blue: Mar de Acero!
---
### 👨‍💻 Autor:
### Alberto Tabernero Valle

Desarrollador Fullstack (junior) 15/12/2025

### 🔗 Contacto

📧 Email: atabernerovalle@gmail.com

💼 LinkedIn: https://www.linkedin.com/in/tu-perfil

🐙 GitHub: https://github.com/albeany

--- 