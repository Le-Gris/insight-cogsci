<script setup>
import { ref, onMounted } from 'vue'
</script>

<template>
    <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
        <div id="navbarBasicExample" class="navbar-menu">
            <div class="navbar-start">
                <router-link class="navbar-item" to="/">Home</router-link>
                <router-link class="navbar-item" to="/replays">Replays</router-link>
                <router-link class="navbar-item" to="/traces">Traces</router-link>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.navbar {
    height: 60px;
    font-size: x-large;
    /* Change the height value as per your requirement */
}
</style>