<script setup>
import { ref, onMounted } from 'vue'

const imageSequence = ref([]);
const pathToImages = '../../data/aggregate_trace_images_real2/aligned_first_static_won_insight/level27';
const currentIndex = ref(0);
const isPlaying = ref(false);
const speed = ref(5);
const canvas = ref(null);
const ctx = ref(null);

// add image URLs from local directory
for (let i = 1; i < 713; i++) {
    imageSequence.value.push(`${pathToImages}/lookforward_${i}_trace.png`);
}

// function updateCanvas() {
//     const img = new Image();
//     img.onload = function () {
//         ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
//         ctx.drawImage(img, 0, 0, canvas.value.width, canvas.value.height);
//         if (isPlaying.value) {
//             currentIndex.value = (currentIndex.value + 1) % imageSequence.value.length;
//             setTimeout(updateCanvas, 1000 / speed.value);
//         }
//     };
//     img.src = imageSequence.value[currentIndex.value];
// }

function playPause() {
    isPlaying.value = !isPlaying.value;
    if (isPlaying.value) {
        updateCanvas();
    }
}

function changeSpeed(event) {
    speed.value = event.target.value;
}

onMounted(() => {
    canvas = document.getElementById('animationCanvas');
    console.log("Component now mounted!");
    // let ctx = document.getElementById('animationCanvas').getContext('2d');
    updateCanvas(); // Start animation by default
});

</script>

<template>
    <canvas id="animationCanvas" width="1080" height="675"></canvas>
    <div class="container">
        <div class="controls">
            <button class="button" @click="playPause">{{ isPlaying ? 'Pause' : 'Play' }}</button>
            <input type="range" min="1" max="20" :value="speed" @input="changeSpeed" />
            <input type="range" min="1" max="1514" :value="currentIndex + 1"
                @input="currentIndex = $event.target.value - 1; updateCanvas()" />
        </div>
    </div>
</template>

<style scoped>
canvas {
    margin-top: 5%;
    margin-bottom: 5%;
    border: 1px solid black;
}

.controls {
    margin-top: 20px;
    display: flex;
    align-items: center;
}

.controls button {
    margin: 0 5px;
    padding: 5px 10px;
}

.controls input[type='range'] {
    margin: 0 10px;
    width: 200px;
}
</style>