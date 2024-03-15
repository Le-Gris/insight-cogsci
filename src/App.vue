<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import ReplayPage from './components/pages/ReplayPage.vue'
</script>

<template>
  <ReplayPage />
</template>

<style>
/* global fonts **/
:root {
  --vp-font-family-base: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  --vp-font-family-mono: Menlo, Monaco, Consolas, "Courier New", monospace;
  /* fontkit overrides */
  --fk-color-primary: #48c78e;
}

.router {
  height: 100vh;
  background-color: v-bind(smilestore.global.page_bg_color);
}

#app {
  font-family: var(--vp-font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

}
</style>
