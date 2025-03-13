<template>
  <div class="image-gallery-container">
    <h1>Image Gallery</h1>
    <div class="gallery">
      <div v-for="image in images" :key="image.id" class="gallery-item">
        <img :src="image.url" :alt="image.title" />
        <p>{{ image.title }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ImageGalleryView',
  data() {
    return {
      images: [
        { id: 1, url: 'https://via.placeholder.com/150', title: 'Image 1' },
        { id: 2, url: 'https://via.placeholder.com/150', title: 'Image 2' },
        { id: 3, url: 'https://via.placeholder.com/150', title: 'Image 3' },
      ],
    };
  },
});
</script>

<style scoped>
.image-gallery-container {
  padding: 2rem;
  text-align: center;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.gallery-item {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}

.gallery-item img {
  max-width: 100%;
  height: auto;
  display: block;
  margin-bottom: 0.5rem;
}
</style>
