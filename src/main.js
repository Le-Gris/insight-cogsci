import { createApp } from 'vue';
import { initializeApp } from 'firebase/app';
import App from './App.vue';
import firebaseConfig from './config';
import { VueFire, VueFireAuth } from 'vuefire';
import VueGtag from 'vue-gtag'; // google analytics
// import router from './router';
import './style.css';

const firebaseApp = initializeApp({ firebaseConfig });
const app = createApp(App);

app.use(VueGtag, {
  disableScriptLoad: import.meta.env.MODE === 'development', // disable script load in development
  pageTrackerExcludedRoutes: ['config'], // ignore the config route
  config: { id: import.meta.env.VITE_GOOGLE_ANALYTICS },
});

app.use(VueFire, {
  // imported above but could also just be created here
  firebaseApp,
  modules: [
    // we will see other modules later on
    // VueFireAuth(),
  ],
});

app.mount('#app');
