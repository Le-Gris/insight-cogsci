import { createApp } from 'vue';
import { initializeApp } from 'firebase/app';
import App from './App.vue';
import config from './config';
import { VueFire, VueFireAuth } from 'vuefire';
import VueGtag from 'vue-gtag'; // google analytics
// import router from './router';
import './style.css';

// Initialize Firebase
const firebaseApp = initializeApp(config.firebaseConfig);

// Create the app
const app = createApp(App);

// Use the VueGtag plugin
app.use(VueGtag, {
  disableScriptLoad: import.meta.env.MODE === 'development', // disable script load in development
  pageTrackerExcludedRoutes: ['config'], // ignore the config route
  config: { id: import.meta.env.VITE_GOOGLE_ANALYTICS },
});

// Use the VueFire plugin
app.use(VueFire, {
  // imported above but could also just be created here
  firebaseApp,
  modules: [
    // we will see other modules later on
    // VueFireAuth(),
  ],
});

app.mount('#app');
