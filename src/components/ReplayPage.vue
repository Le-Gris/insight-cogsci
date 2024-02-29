<script setup>
import { ref, onMounted } from 'vue'
import { ref as storageRef } from 'firebase/storage';
import { useFirebaseStorage, useStorageFileUrl } from 'vuefire'


const storage = useFirebaseStorage()
const replayVideoRef = storageRef(storage, '4A6jkZeYjATvk5zfelLR_level5.mp4')
const {
    url,
    refresh,
} = useStorageFileUrl(replayVideoRef)


</script>

<template>
    <video width="320" height="240" controls>
        <source v-if="url" :src="url" type="video/mp4" />
    </video>
</template>

<style scoped></style> 