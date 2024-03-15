<script setup>
import { ref, onMounted } from 'vue'
</script>

<template>
    <div id="home" class="center">
        <img src="../../assets/lightbulb.svg" width="350" alt=""></img>
        <br>
        <h1 class="title">Insight viewer</h1>
    </div>
</template>

<style scoped>
#home {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
}
</style>