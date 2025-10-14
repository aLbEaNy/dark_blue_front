# Dark Blue

![Logo de Dark Blue](/public/images/logoMini.png) <!-- Espacio reservado para tu logo -->

**Dark Blue** es un juego web que reversiona el clásico **Hundir la Flota**, ofreciendo una experiencia moderna, interactiva y visualmente atractiva directamente desde el navegador.

## Autor

**Alberto Tabernero Valle**

## Tecnologías

![Angular](https://img.shields.io/badge/Angular-19-red?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue?logo=tailwind-css&logoColor=white)

El frontend está desarrollado con:

- **Angular 19**  
- **Tailwind CSS 4** para estilos y diseño responsivo  
- **RxJS** para programación reactiva  
- **STOMP / SockJS** para comunicación en tiempo real  
- **SweetAlert2** para alertas y notificaciones visuales  

Otras dependencias y herramientas incluyen PostCSS, Zone.js y TypeScript 5.

## Características principales

- Interfaz moderna y responsive  
- Turnos y disparos gestionados en tiempo real  
- Animaciones y efectos de audio  
- Alertas interactivas con SweetAlert2  
- Escalado y rotación de los submarinos en el tablero  

## Cómo jugar

1. Regístrate e inicia sesión.
2. En el menu principal elige la opción de:
    - Nueva partida (Modo Historia, player vs IA).
    - Continuar (en construcción...).
    - Online (en construcción...).
    - Opciones (en construcción...).

 

## Instalación y uso

1. Clona el repositorio del frontend:

   ```bash
   git clone https://github.com/tu-usuario/dark-blue.git
   cd dark-blue/dark-blue-front

2. Clona el repositorio del backend:

    ```bash
   git clone https://github.com/tu-usuario/dark-blue.git
   cd dark-blue/dark-blue-back
   
   ⚠️ Nota: Los archivos con credenciales y claves secretas no se publican en los repositorios por motivos de seguridad. Estos se guardan en el archivo application-secrets.properties, ubicado en la carpeta resources del backend, el cual no está versionado en GitHub.
    #API GOOGLE PARA LOGIN CON CUENTA DE GOOGLE GOOGLE_CLIENT_ID=XXXXXXXXXX.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXX
    #CREDENCIALES PARA ENVIAR EMAIL Y VALIDAR LA CUENTA GOOGLE_USERNAME=XXXXXXXX@gmail.com
    GOOGLE_APP_PASS=contraseña_de_aplicación