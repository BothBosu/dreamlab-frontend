<template>
  <div class="image-gallery-container">
    <h1>Image Gallery</h1>

    <!-- Upload Form -->
    <div class="upload-container">
      <input type="file" @change="handleFileChange" accept="image/*" />
      <button @click="uploadImage" :disabled="!selectedFile">Upload</button>
    </div>

    <!-- Gallery -->
    <div class="gallery">
      <div v-for="image in images" :key="image.id" class="gallery-item">
        <img :src="image.url + '?t=' + new Date().getTime()" :alt="image.title" />
        <p>{{ image.title }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "ImageGalleryView",
  data() {
    return {
      images: [] as Array<{ id: number; url: string; title: string }>,
      selectedFile: null as File | null
    };
  },
  methods: {
    async fetchImages() {
      try {
        const response = await axios.get("http://localhost:8080/api/images");
        console.log("Fetched images:", response.data);

        this.images = response.data.map((img: any) => ({
          id: img.id,
          url: img.url, // Ensure this URL is an S3 link
          title: `Image ${img.id}`,
        }));
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    },
    handleFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.selectedFile = target.files[0];
      }
    },
    async uploadImage() {
      if (!this.selectedFile) return;

      const formData = new FormData();
      formData.append("file", this.selectedFile);

      try {
        const response = await axios.post("http://localhost:8080/api/images/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("Upload response:", response.data);

        // Add the new image to the gallery (from S3)
        this.images.push({
          id: response.data.id,
          url: response.data.url + "?t=" + new Date().getTime(), // Prevent caching
          title: `Image ${response.data.id}`,
        });

        this.selectedFile = null;
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    },
  },
  mounted() {
    this.fetchImages();
  },
});
</script>

<style scoped>
.image-gallery-container {
  padding: 2rem;
  text-align: center;
}

.upload-container {
  margin-bottom: 1rem;
}

button {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
  max-width: 150px;
  height: auto;
  display: block;
  margin-bottom: 0.5rem;
}
</style>
