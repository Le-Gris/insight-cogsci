<script setup>
import { get, update } from 'firebase/database';
import { ref, onMounted, reactive, watchEffect } from 'vue'
import {
    useFirestore,
    useFirebaseStorage,
    useStorageFileUrl,
} from 'vuefire';
import { ref as storageRef, listAll } from 'firebase/storage';
import { stringifyQuery } from 'vue-router';

const db = useFirestore();
const storage = useFirebaseStorage();

const levels = [
    "level12",
    "level10",
    "level20",
    "level22",
    "level4",
    "level26",
    "level14",
    "level8",
    "level5",
    "level18",
    "level23",
    "level27",
    "level3",
    "level2",
    "level13"
]

// sort levels
levels.sort(
    (a, b) => parseInt(a.replace('level', '')) - parseInt(b.replace('level', ''))
);

const level = ref(10);

const imageSequence1 = ref([]);
const imageSequence2 = ref([]);

const pathsToImages1 = ref([]);
const pathsToImages2 = ref([]);

const currentIndex1 = ref(0);
const currentIndex2 = ref(0);

const maxIndex1 = ref(imageSequence1.value.length);
const maxIndex2 = ref(imageSequence2.value.length);

const canvas1 = ref(null);
const ctx1 = ref(null);

const canvas2 = ref(null);
const ctx2 = ref(null);

const isPlaying = ref(false);
const speed = ref(5);

const both = ref(true);
const insight = ref(false);
const noinsight = ref(false);

const choices = reactive({
    both: {
        label: 'Both',
        value: true
    },
    insight: {
        label: 'Insight',
        value: false
    },
    noinsight: {
        label: 'No Insight',
        value: false
    }
});

async function getPathToImages(level, insight) {
    try {
        const res = await listAll(storageRef(storage, `traces/aligned_first_static_won_${insight ? 'insight' : 'noinsight'}/level${level}`));
        const itemRefs = res.items;
        itemRefs.sort((a, b) => {
            const aNum = parseInt(a.name.split('_')[1]);
            const bNum = parseInt(b.name.split('_')[1]);
            return aNum - bNum;
        });
        const paths = [];
        itemRefs.forEach((itemRef) => {
            paths.push(itemRef.fullPath);
        });
        return paths;
    }
    catch (error) {
        console.log(error);
    }
    return [];
}


const updateImageSequences = async () => {
    const promises1 = pathsToImages1.value.map(async (path) => {
        const sRef = storageRef(storage, path);
        const { url, refresh } = useStorageFileUrl(sRef);
        return url;
    });

    const promises2 = pathsToImages2.value.map(async (path) => {
        const sRef = storageRef(storage, path);
        const { url, refresh } = useStorageFileUrl(sRef);
        return url;
    });

    imageSequence1.value = await Promise.all(promises1);
    imageSequence2.value = await Promise.all(promises2);
    console.log('image sequences updated');
};

function resetIndex() {
    currentIndex1.value = 0;
    currentIndex2.value = 0;
}

watchEffect(() => {
    changeLevel();
});

async function changeLevel() {
    console.log('level changed');
    pathsToImages1.value = (await getPathToImages(level.value, true)).slice(0, 1000);
    pathsToImages2.value = (await getPathToImages(level.value, false)).slice(0, 1000);

    maxIndex1.value = pathsToImages1.value.length;
    maxIndex2.value = pathsToImages2.value.length;

    await updateImageSequences();
    resetIndex();
    updateCanvas1();
    updateCanvas2();
}

function updateCanvas1() {
    const img = new Image();
    img.onload = function () {
        ctx1.value.clearRect(0, 0, canvas1.value.width, canvas1.value.height);
        ctx1.value.drawImage(img, 0, 0, canvas1.value.width, canvas1.value.height);
        if (isPlaying.value) {
            currentIndex1.value = (currentIndex1.value) % imageSequence1.value.length;
            setTimeout(updateCanvas1, 1000 / speed.value);
        }
    };
    img.src = imageSequence1.value[currentIndex1.value].value;
}

function updateCanvas2() {
    const img = new Image();
    img.onload = function () {
        ctx2.value.clearRect(0, 0, canvas2.value.width, canvas2.value.height);
        ctx2.value.drawImage(img, 0, 0, canvas2.value.width, canvas2.value.height);
        if (isPlaying.value) {
            currentIndex2.value = (currentIndex2.value) % imageSequence2.value.length;
            setTimeout(updateCanvas2, 1000 / speed.value);
        }
    };
    img.src = imageSequence2.value[currentIndex2.value].value;
}

function playPause() {
    isPlaying.value = !isPlaying.value;
    if (isPlaying.value) {
        updateCanvas1();
        updateCanvas2();
    }
}

function changeSpeed(event) {
    speed.value = event.target.value;
}

onMounted(() => {
    canvas1.value = document.getElementById('animationCanvas1');
    canvas2.value = document.getElementById('animationCanvas2');
    ctx1.value = document.getElementById('animationCanvas1').getContext('2d');
    ctx2.value = document.getElementById('animationCanvas2').getContext('2d');

});

</script>

<template>
    <div class="container">
        <div class="user-controls">

            <!-- Play button -->
            <button class="button" @click="playPause">{{ isPlaying ? 'Pause' : 'Play' }}</button>

            <!-- Reset button -->
            <button class="button"
                @click="currentIndex1 = 0; updateCanvas1(); currentIndex2 = 0; updateCanvas2()">Reset</button>

            <!-- Speed control -->
            <div class="has-text-centered">
                <input type="range" min="1" max="25" :value="speed" @input="changeSpeed" />
                <br>
                <span>{{ speed }}x</span>
            </div>

            <!-- Both/Insight/No Insight dropdown -->

            <!-- Level -->
            <div class="select">
                <select v-model="level">
                    <option v-for="level in levels" :value="level.replace('level', '')">
                        {{ level.replace('level', '') }}
                    </option>
                </select>
            </div>

        </div>
    </div>
    <div id="canvas_container" class="container">
        <div v-if="both || insight" class="has-text-centered" style="margin-right:1%">
            <h3 class="title is-4">Insight</h3>
            <canvas id="animationCanvas1" :width="both ? 680 : 1080" :height="both ? 425 : 675"></canvas>
            <div id="controls_container" class="container">
                <div class="controls">
                    <input type="range" min="0" :max="maxIndex1 + 1" :value="currentIndex1"
                        @input="currentIndex1 = $event.target.value; updateCanvas1()" style="width: 425px;" />
                    <span>{{ currentIndex1 }}</span>
                </div>
            </div>
        </div>

        <div v-if="both || noinsight" class="has-text-centered" style="margin-left:1%">
            <h3 class="title is-4">No Insight</h3>
            <canvas id="animationCanvas2" :width="both ? 680 : 1080" :height="both ? 425 : 675"></canvas>
            <div id="controls_container" class="container">
                <div class="controls">
                    <input type="range" min="0" :max="maxIndex2 + 1" :value="currentIndex2"
                        @input="currentIndex2 = $event.target.value; updateCanvas2()" style="width: 425px;" />
                    <span>{{ currentIndex2 }}</span>
                </div>
            </div>
        </div>

    </div>

    <div class="container has-text-centered" style="margin-top: 5%;">
        <p>
            If the images don't change when changing level, try clicking on the reset button.
        </p>
    </div>


</template>

<style scoped>
canvas {
    border: 1px solid black;
}

#canvas_container {
    display: flex;
    justify-content: center;
    align-items: center;
}

#controls_container {
    display: flex;
    justify-content: center;
    align-items: center;
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

.user-controls {
    display: flex;
    justify-content: center;
    padding: 10px;
    background-color: #c4c4c4;
    color: #000;
    margin-bottom: 20px;
    border-radius: 10px;
    gap: 1%;
    margin-top: 1%;
    /* Adjust the gap value as needed */
}
</style>