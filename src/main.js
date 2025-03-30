//Funktsiooni importimine Vue teegist, mida kasutatakse Vue rakenduse eksemplari loomiseks.
import {createApp} from 'vue';

//Rakenudse juurkomponendi importimine.
import App from './App.vue';

//Marsruuteri eksemplari importimine.
import router from './router';

//Globaalse CSS-faili importimine.
import './style.css';

//Loob uue Vue rakenduse eksemplari.
//Integreerib ruuteri Vue eksemplariga.
//Ühendab Vue rakenduse ID-rakendusega HTML-elemendiga.
createApp(App).use(router).mount('#app');
