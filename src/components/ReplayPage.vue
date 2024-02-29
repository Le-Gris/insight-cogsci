<script setup>
import { ref, reactive, watchEffect, computed } from 'vue'
import { useFirestore, useFirebaseStorage, useStorageFileUrl } from 'vuefire'
import { getDocs, collection, query, where, } from 'firebase/firestore'
import { ref as storageRef } from 'firebase/storage';

const db = useFirestore()
const storage = useFirebaseStorage()

const levels = ['level26', 'level23', 'level20', 'level22']
const filters = reactive({
    insight: 0,
    level: "",
    won: true
})

let videos = ref([])
let sortedVideos = ref([])
let paginatedVideos = ref([])

const sortBy = ref('insight')
const perPage = ref(2)
const perPageOptions = [1, 2, 4, 8]
const currentPage = ref(1)

const fetchVideos = async () => {
    console.log('fetchVideos', filters)
    // check if level is null
    const q = filters.level === "" ? query(collection(db, 'replayDataInfo'), where('insight', '>=', parseInt(filters.insight), where('won', '==', filters.won))) : query(collection(db, 'replayDataInfo'), where('insight', '>=', parseInt(filters.insight)), where('level', '==', filters.level), where('won', '==', filters.won))

    const querySnapshot = await getDocs(q);
    console.log('querySnapshot', querySnapshot)

    videos.value = []
    querySnapshot.forEach(doc => {
        videos.value.push(doc.data())
    })

    // reset current page to 1
    currentPage.value = 1
}

const fetchStorageUrls = async () => {
    const promises = videos.value.map(async video => {
        const sRef = storageRef(storage, video.filename)
        const { url, refresh } = useStorageFileUrl(sRef)
        return { ...video, url }
    })
    sortedVideos.value = await Promise.all(promises)
}

watchEffect(() => {
    fetchVideos()
})

watchEffect(() => {
    fetchStorageUrls()
})

const sortVideos = () => {
    sortedVideos.value = videos.value.slice().sort((a, b) => {
        if (sortBy.value === 'insight') {
            return a.insight - b.insight
        } else {
            // return random values
            return Math.random() - 0.5
        }
    })
}

watchEffect(() => {
    sortVideos()
})

watchEffect(() => {
    const startIndex = (currentPage.value - 1) * perPage.value
    const endIndex = startIndex + perPage.value
    paginatedVideos.value = sortedVideos.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => Math.ceil(sortedVideos.value.length / perPage.value))

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const playbackSpeed = ref("1"); // Default playback speed
const secondsFromEnd = ref(5); // Default seconds from the end
const secondsOptions = [5, 10, 15, 20, "max"]; // Options for seconds from the end

// Method to play all videos
const playAllVideos = () => {
    // Loop through paginatedVideos and play each video
    // get all video elements and play them
    var videoElements = document.getElementsByTagName("video");
    for (var i = 0; i < videoElements.length; i++) {
        videoElements[i].playbackRate = playbackSpeed.value;
        videoElements[i].currentTime = videoElements[i].duration - secondsFromEnd.value;
        videoElements[i].play();
    }
};
</script>

<template>
    <div>
        <div class="user-controls">
            <label>Minimum insight reported:</label>
            <select v-model="filters.insight">
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>

            <label>Level:</label>
            <select v-model="filters.level">
                <option value="">All</option>
                <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
            </select>

            <label>Win:</label>
            <input type="checkbox" v-model="filters.won">

            <!-- <label>Sort By:</label>
            <select v-model="sortBy">
                <option value="insight">Insight</option>
                <option value="score">Random</option>
            </select> -->

            <label>Videos Per Page:</label>
            <select v-model="perPage">
                <option v-for="option in perPageOptions" :value="option">{{ option }}</option>
            </select>
        </div>

        <!-- New user controls -->
        <div class="additional-controls">
            <!-- Play button -->
            <button @click="playAllVideos">Play All</button>

            <!-- Horizontal space -->
            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>

            <!-- Speed control -->
            <label>Speed:</label>
            <select v-model="playbackSpeed">
                <option value="1">1x</option>
                <option value="0.75">0.75x</option>
                <option value="0.5">0.5x</option>
            </select>

            <!-- Horizontal space -->
            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>

            <!-- Seconds from the end dropdown -->
            <label>Seconds from end:</label>
            <select v-model="secondsFromEnd">
                <option v-for="seconds in secondsOptions" :value="seconds">{{ seconds }}</option>
            </select>

            <!-- Horizontal space -->
            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
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

        <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <br>
            <span>
                <b>{{ currentPage }}</b> / <b>{{ totalPages }}</b>
            </span>
            <br>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
    </div>
</template>
  
<style scoped>
.user-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #c4c4c4;
    color: #000;
    margin-bottom: 20px;
    border-radius: 10px;
}

.additional-controls {
    align-items: center;
    justify-content: space-between;
    padding: 5px;
    background-color: #c4c4c4;
    color: #000;
    margin-bottom: 20px;
    border-radius: 10px;
}

.insight {
    color: rgb(37, 34, 34);
    font-size: large;
}

.user-controls label {
    margin-right: 5px;
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

  