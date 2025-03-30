Enne projekti seadistamist veenduge, et teil on installitud järgmine:
Java 21 - Spring Boot taustaprogrammi käitamiseks;
Gradle 8.x - Backendi ehitamiseks;
PostgreSQL 15.x või uuem - andmebaasi jaoks;
Node.js 18.x või uuem - Vue.js kasutajaliidese käitamiseks;
npm 8.x või uuem - kaasas Node.js kasutajaliidese haldamiseks;
Git - hoidla kloonimiseks;
Kaasaegne veebibrauser;
IntelliJ IDEA.

Hoidla kloonimine:
https://github.com/JyriSem/flightreservation-ui.git

Node.js ja npm kontroll / bash:
node -v
npm -v

Installi sõltuvused / bash:
npm install
npm install vue vue-router axios @vuepic/vue-datepicker
npm install --save-dev @vitejs/plugin-vue vite

Käivitage Spring Boot rakendus enne Vite/Vue kasutajaliidest,
veenduge andmebaasi kättesaadavuses ja käivitage "flightreservation-ui" rakendus.
