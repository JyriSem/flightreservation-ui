//Vue-router-i funktsiooni ruuteri eksemplari loomine ja konfiguratsioon HTML5 ajaloo režiimi kasutamiseks.
import {createRouter, createWebHistory} from 'vue-router';

//Komponendi importimine vaadete kataloogist.
import HomeView from '../views/HomeView.vue';

//Komponendi importimine komponentide kataloogist / kasutatakse töökoha valimiseks.
import SeatSelection from '../components/SeatSelection.vue';

//Rakenduse marsruutide määramine.
const routes = [
    {path: '/', component: HomeView},
    {path: '/seats/:flightId', component: SeatSelection, props: true}
];

//Määratud konfiguratsiooniga ruuteri eksemplar - ajaloo režiim.
const router = createRouter({
    history: createWebHistory(),
    routes,
});

//Ruuteri eksemplari eksportimine võimaldab importida ja kasutada põhirakenduses (main.js) / võimaldab marsruutimist kogu rakenduses.
export default router;
