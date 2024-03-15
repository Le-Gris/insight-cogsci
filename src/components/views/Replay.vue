<script setup>
import { ref, reactive, watchEffect, computed, onMounted } from 'vue';
import {
    useFirestore,
    useFirebaseStorage,
    useStorageFileUrl,
} from 'vuefire';
import {
    getDocs,
    collection,
    query,
    where,
} from 'firebase/firestore';
import { ref as storageRef } from 'firebase/storage';


const db = useFirestore();
const storage = useFirebaseStorage();

// get list of levels from public data
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

const filters = reactive({
    insight: 0,
    level: '',
    won: true,
});

let videos = ref([]);
let sortedVideos = ref([]);
let paginatedVideos = ref([]);

const sortBy = ref('insight');
const perPage = ref(1);
const perPageOptions = [1, 2, 4, 8];
const currentPage = ref(1);

const fetchVideos = async () => {
    // check if level is null
    const q =
        filters.level === ''
            ? query(
                collection(db, 'replayDataInfo'),
                where(
                    'insight',
                    '>=',
                    parseInt(filters.insight),
                    where('won', '==', filters.won)
                )
            )
            : query(
                collection(db, 'replayDataInfo'),
                where('insight', '>=', parseInt(filters.insight)),
                where('level', '==', filters.level),
                where('won', '==', filters.won)
            );

    const querySnapshot = await getDocs(q);

    videos.value = [];
    querySnapshot.forEach((doc) => {
        videos.value.push(doc.data());
    });

    // reset current page to 1
    currentPage.value = 1;
};

const fetchStorageUrls = async () => {
    const promises = videos.value.map(async (video) => {
        const sRef = storageRef(storage, video.filename);
        const { url, refresh } = useStorageFileUrl(sRef);
        return { ...video, url };
    });
    sortedVideos.value = await Promise.all(promises);
};

watchEffect(() => {
    fetchVideos();
});

watchEffect(() => {
    fetchStorageUrls();
});

const sortVideos = () => {
    sortedVideos.value = videos.value.slice().sort((a, b) => {
        if (sortBy.value === 'insight') {
            return a.insight - b.insight;
        } else {
            // return random values
            return Math.random();
        }
    });
};

watchEffect(() => {
    sortVideos();
});

watchEffect(() => {
    const startIndex = (currentPage.value - 1) * perPage.value;
    const endIndex = startIndex + perPage.value;
    paginatedVideos.value = sortedVideos.value.slice(
        startIndex,
        endIndex
    );
});

const totalPages = computed(() =>
    Math.ceil(sortedVideos.value.length / perPage.value)
);

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const goToPage = (page) => {
    currentPage.value = page;
};

const playbackSpeed = ref('1'); // Default playback speed
const secondsFromEnd = ref('max'); // Default seconds from the end
const secondsOptions = [5, 10, 15, 20, 30, 'max']; // Options for seconds from the end

// Method to play all videos
const playAllVideos = () => {
    // Loop through paginatedVideos and play each video
    // get all video elements and play them
    var videoElements = document.getElementsByTagName('video');
    for (var i = 0; i < videoElements.length; i++) {
        videoElements[i].playbackRate = playbackSpeed.value;
        if (secondsFromEnd.value === 'max')
            videoElements[i].currentTime = 0.0;
        else
            videoElements[i].currentTime =
                videoElements[i].duration - secondsFromEnd.value;
        videoElements[i].play();
    }
};
onMounted(() => {
    console.log("replay mounted");
});
</script>

<template>
    <div id="viewer">
        <div class="user-controls">
            <div class="select">
                <select v-model="filters.insight">
                    <option value="0">Min insight reported</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>

            <div class="select">
                <select v-model="filters.level">
                    <option value="">Level</option>
                    <option value="">All</option>
                    <option v-for="level in levels" :key="level" :value="level">
                        {{ level }}
                    </option>
                </select>
            </div>

            <!-- <label>Sort By:</label>
            <select v-model="sortBy">
                <option value="insight">Insight</option>
                <option value="score">Random</option>
            </select> -->

            <div class="select">
                <select v-model="perPage">
                    <option value="1">Per page</option>
                    <option v-for="option in perPageOptions" :value="option">
                        {{ option }}
                    </option>
                </select>
            </div>

            <!-- <div>
                <span class="tag is-white is-large">Win:</span>
                <span>&nbsp;&nbsp;</span>
                <div class="checkbox is-medium"> <input type="checkbox" v-model="filters.won" /></div>
            </div> -->

        </div>

        <!-- New user controls -->
        <div class="user-controls">
            <!-- Play button -->
            <button class="button" @click="playAllVideos">Play</button>

            <!-- Speed control -->
            <div class="select">
                <select v-model="playbackSpeed">
                    <option value="1">Speed</option>
                    <option value="1">1x</option>
                    <option value="0.75">0.75x</option>
                    <option value="0.5">0.5x</option>
                    <option value="0.25">0.25x</option>
                </select>
            </div>


            <!-- Seconds from the end dropdown -->

            <div class="select">
                <select v-model="secondsFromEnd">
                    <option value="max">Seconds from end</option>
                    <option v-for="seconds in secondsOptions" :value="seconds">
                        {{ seconds }}
                    </option>
                </select>
            </div>

        </div>

        <div v-if="perPage > 1" class="grid">
            <div class="grid-item" v-for="video in paginatedVideos" :key="video.doc_id" :id="video.doc_id">
                <div class="video-container">
                    <video :src="video.url" controls width="100%">
                        Your browser does not support the video tag.
                    </video>
                    <div>
                        <p class="insight">Insight: {{ video.insight }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else>
            <div v-for="video in paginatedVideos" :key="video.doc_id" :id="video.doc_id">
                <div class="video-container">
                    <video :src="video.url" controls width="100%">
                        Your browser does not support the video tag.
                    </video>
                    <div>
                        <p class="insight">Insight: {{ video.insight }}</p>
                    </div>
                </div>
            </div>
        </div>

        <nav class="pagination is-centered" role="navigation" aria-label="pagination">
            <button class="pagination-previous" @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <button class="pagination-next" @click="nextPage" :disabled="currentPage === totalPages">Next page</button>
            <ul class="pagination-list">
                <li v-if="currentPage > 2"><button class="pagination-link" aria-label="Goto page 1"
                        @click="goToPage(1)">1</button></li>
                <li v-if="currentPage > 3"><span class="pagination-ellipsis">&hellip;</span></li>
                <li v-if="currentPage > 1"><button class="pagination-link" @click="goToPage(currentPage - 1)">{{
                    currentPage - 1 }}</button></li>
                <li><button class="pagination-link is-current" aria-current="page">{{ currentPage }}</button></li>
                <li v-if="currentPage < totalPages"><button class="pagination-link"
                        @click="goToPage(currentPage + 1)">{{ currentPage + 1 }}</button></li>
                <li v-if="currentPage < totalPages - 1"><span class="pagination-ellipsis">&hellip;</span></li>
                <li v-if="currentPage < totalPages"><button class="pagination-link" @click="goToPage(totalPages)">{{
                    totalPages }}</button></li>
            </ul>
        </nav>
    </div>
</template>

<style scoped>
#viewer {
    max-width: 1280px;
    margin: 0 auto;
    padding: 1rem;
    /* Reduced top padding */
    margin-bottom: 0%;
    text-align: center;
}

.user-controls {
    display: flex;
    justify-content: center;
    padding: 10px;
    background-color: #c4c4c4;
    color: #000;
    margin-bottom: 20px;
    border-radius: 10px;
    gap: 10px;
    /* Adjust the gap value as needed */
}

.insight {
    padding: 5px;
    color: rgb(37, 34, 34);
    font-size: 25px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
    grid-template-rows: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
}

.grid-item {
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.pagination {
    margin-top: 20px;
    text-align: center;
    color: #000;
}
</style>
