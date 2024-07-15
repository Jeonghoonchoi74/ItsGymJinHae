import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '../components/UserLogin.vue';
import UserRegister from '../components/UserRegister.vue';
import SeatReservation from '../components/SeatReservations.vue';
import MyPage from '../components/MyPage.vue';
import AdminPage from '../components/AdminPage.vue';
import axios from 'axios';

const routes = [
  { path: '/', component: UserLogin },
  { path: '/register', component: UserRegister },
  { path: '/reservations', component: SeatReservation },
  { path: '/mypage', component: MyPage },
  {
    path: '/cGFnZWFkbWlu',
    component: AdminPage,
    beforeEnter: async (to, from, next) => {
      try {
        const response = await axios.get('/api/checkAdmin', { withCredentials: true });
        if (response.data.isAdmin) {
          next();
        } else {
          next('/');
        }
      } catch (error) {
        next('/');
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
