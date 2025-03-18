import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SeatSelection from '../components/SeatSelection.vue';

const routes = [
    { path: '/', component: HomeView },
    { path: '/seats/:flightId', component: SeatSelection, props: true }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
