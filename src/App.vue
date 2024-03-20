<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/organisms/NavBar.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <NavBar />
  <div class="router">
    <router-view></router-view> <!-- the router loads here -->
  </div>
</template>

<style></style>
