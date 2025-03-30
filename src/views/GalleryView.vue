<template>
  <div class="image-gallery-container">
    <!-- Navbar -->
    <div class="navbar">
      <div class="navbar-logo">
        <router-link to="/" class="logo-link">
          <span class="logo-text">DREAM LAB</span>
        </router-link>
      </div>
      <div class="navbar-links">
        <router-link to="/gallery" class="nav-link">Gallery</router-link>
        <router-link to="/imagegen" class="nav-link">Generate</router-link>
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
      </div>
      <div class="navbar-user-manage">
        <template v-if="isAuthenticated">
          <span class="username">{{ userDisplayName }}</span>
          <button @click="logout" class="logout-btn">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="auth-link">Login</router-link>
          <router-link to="/register" class="auth-link register">Register</router-link>
        </template>
      </div>
      <div class="mobile-menu-toggle" @click="toggleMobileMenu">
        <div>≡</div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ 'active': mobileMenuOpen }">
      <router-link to="/gallery" class="mobile-nav-link" @click="toggleMobileMenu">Gallery</router-link>
      <router-link to="/imagegen" class="mobile-nav-link" @click="toggleMobileMenu">Generate</router-link>
      <router-link to="/dashboard" class="mobile-nav-link" @click="toggleMobileMenu">Dashboard</router-link>
      <template v-if="isAuthenticated">
        <span class="mobile-username">{{ userDisplayName }}</span>
        <button @click="logout" class="mobile-logout-btn">Logout</button>
      </template>
      <template v-else>
        <router-link to="/login" class="mobile-nav-link" @click="toggleMobileMenu">Login</router-link>
        <router-link to="/register" class="mobile-nav-link register" @click="toggleMobileMenu">Register</router-link>
      </template>
    </div>

    <!-- Error Modal -->
    <error-modal
      :show="showErrorModal"
      :title="errorTitle"
      :message="errorMessage"
      :button-text="errorButtonText"
      @close="showErrorModal = false"
    />

    <div class="gallery-content">
      <h1>Image Gallery</h1>
      <!-- Gallery -->
      <div class="gallery">
        <div class="gallery-item" v-for="image in images" :key="image.id">
          <div class="image-container" @click="openImageModal(image)">
            <img :src="image.url" :alt="image.title" />
            <button
              @click.stop="handleLikeClick(image)"
              class="like-button"
              :class="{ 'disabled': !isAuthenticated }"
            >
              <span class="heart-icon">❤️</span>
              <span class="like-count">{{ image.likes }}</span>
            </button>
            <div class="image-overlay">
              <span>Open</span>
            </div>
          </div>
          <p>"{{ image.title }}"</p>
        </div>
      </div>
    </div>

    <!-- Full Image Modal -->
    <div class="full-image-modal-overlay" v-if="showImageModal" @click="closeImageModal">
      <div class="full-image-modal" @click.stop>
        <button class="close-modal-btn" @click="closeImageModal">×</button>
        <div class="full-image-container">
          <img :src="selectedImage.url" :alt="selectedImage.title" class="modal-image" />
        </div>
        <div class="full-image-info">
          <div class="title-with-like">
            <h3>"{{ selectedImage.title }}"</h3>
            <button
              @click="handleLikeClick(selectedImage)"
              class="modal-like-button"
              :class="{ 'disabled': !isAuthenticated }"
            >
              <span class="heart-icon">❤️</span>
              <span class="like-count">{{ selectedImage.likes }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from "axios";
import ErrorModal from '@/components/ErrorModal.vue';

export default defineComponent({
  name: "ImageGalleryView",
  components: {
    ErrorModal
  },
  setup() {
    const mobileMenuOpen = ref(false);
    const router = useRouter();
    const authStore = useAuthStore();

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const userDisplayName = computed(() => authStore.user?.username || 'User');

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
    };

    const logout = async () => {
      await authStore.logout();
      router.push('/login');
    };

    return {
      isAuthenticated,
      userDisplayName,
      mobileMenuOpen,
      toggleMobileMenu,
      logout
    };
  },
  data() {
    return {
      images: [] as Array<{ id: number; url: string; title: string; likes: number }>,
      showErrorModal: false,
      errorTitle: 'Authentication Required',
      errorMessage: 'Please log in to like images.',
      errorButtonText: 'OK',
      showImageModal: false,
      selectedImage: { id: 0, url: '', title: '', likes: 0 }
    };
  },
  methods: {
    async fetchImages() {
      const response = await axios.get("http://localhost:8080/api/images/all");
      this.images = await Promise.all(response.data.map(async (img: any) => {
        const likeCountRes = await axios.get(`http://localhost:8080/api/likes/${img.id}/count`);
        return {
          id: img.id,
          url: img.url,
          title: img.inputPrompt || `Image ${img.id}`,
          likes: likeCountRes.data
        };
      }));
    },
    handleLikeClick(image: any) {
      if (!this.isAuthenticated) {
        this.errorTitle = 'Authentication Required';
        this.errorMessage = 'Please log in to like images.';
        this.errorButtonText = 'OK';
        this.showErrorModal = true;
        return;
      }

      this.toggleLike(image);
    },
    async toggleLike(image: any) {
      try {
        await axios.post(`http://localhost:8080/api/likes/${image.id}/toggle`, {}, {
          withCredentials: true
        });
        const res = await axios.get(`http://localhost:8080/api/likes/${image.id}/count`);

        // Update the like count for this image
        image.likes = res.data;

        // Update the selected image like count if it's the same image
        if (this.selectedImage.id === image.id) {
          this.selectedImage.likes = res.data;
        }

        // Also update the corresponding image in the images array
        // This ensures thumbnail updates when like button is clicked in modal
        const thumbnailImage = this.images.find(img => img.id === image.id);
        if (thumbnailImage) {
          thumbnailImage.likes = res.data;
        }
      } catch (error) {
        this.errorTitle = 'Operation Failed';
        this.errorMessage = 'Failed to like image. Please try again.';
        this.showErrorModal = true;
      }
    },
    openImageModal(image: any) {
      this.selectedImage = { ...image };
      this.showImageModal = true;
      // Add body class to prevent scrolling
      document.body.classList.add('modal-open');
    },
    closeImageModal() {
      this.showImageModal = false;
      // Remove body class to restore scrolling
      document.body.classList.remove('modal-open');
    }
  },
  mounted() {
    this.fetchImages();
  },
});
</script>

<style scoped>
.image-gallery-container {
  min-height: 100vh;
  background-color: #0a0a0a;
  background-image:
    radial-gradient(circle, rgba(25, 25, 25, 0.8) 0%, rgba(5, 5, 5, 0.9) 100%),
    linear-gradient(45deg, rgba(0, 0, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
}

.gallery-content {
  padding: 2rem;
  text-align: center;
  padding-top: 80px; /* Space for the fixed navbar */
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.gallery-item {
  background-color: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(50, 50, 50, 0.5);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.2);
  border-color: rgba(0, 150, 255, 0.3);
}

.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
}

.gallery-item img {
  max-width: 200px;
  height: auto;
  display: block;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.03);
}

.like-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 20px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(2px);
  z-index: 2;
}

.like-button:hover:not(.disabled) {
  background: rgba(50, 50, 50, 0.8);
  transform: scale(1.1);
}

.like-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.heart-icon {
  font-size: 1rem;
}

.like-count {
  color: white;
  font-size: 0.9rem;
}

.gallery-item p {
  color: rgba(200, 200, 200, 0.9);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

h1 {
  font-size: 2.2rem;
  letter-spacing: 3px;
  margin-bottom: 2rem;
  color: rgba(240, 240, 240, 0.9);
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.3),
    0 0 10px rgba(0, 150, 255, 0.3);
}

/* Image Overlay */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 0.9rem;
  border-radius: 4px;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

/* Full Image Modal */
.full-image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.full-image-modal {
  background-color: rgba(20, 20, 20, 0.9);
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  width: auto;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  animation: modalFadeIn 0.3s ease-out;
}

.close-modal-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.close-modal-btn:hover {
  background: rgba(50, 50, 50, 0.8);
  transform: scale(1.1);
}

.full-image-container {
  overflow: auto;
  max-height: 75vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.full-image-container img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 4px;
}

.full-image-info {
  padding: 15px 20px;
  border-top: 1px solid rgba(50, 50, 50, 0.5);
  background-color: rgba(15, 15, 15, 0.9);
}

.full-image-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: rgba(240, 240, 240, 0.9);
}

.title-with-like {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.modal-like-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(40, 40, 40, 0.7);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 8px 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(2px);
}

.modal-like-button:hover:not(.disabled) {
  background: rgba(50, 50, 50, 0.9);
  transform: scale(1.05);
}

.modal-like-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animation */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Navbar Styles */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: rgba(15, 15, 15, 0.9);
  border-bottom: 1px solid rgba(50, 50, 50, 0.5);
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.navbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    rgba(255, 0, 128, 0.8),
    rgba(0, 255, 255, 0.8),
    rgba(128, 0, 255, 0.8)
  );
  animation: rgbBorder 5s linear infinite;
}

.navbar-logo {
  display: flex;
  align-items: center;
}

.logo-link {
  text-decoration: none;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  background: linear-gradient(45deg, #00ccff, #ff00aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(0, 150, 255, 0.3);
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: rgba(200, 200, 200, 0.9);
  text-decoration: none;
  font-size: 1rem;
  letter-spacing: 1px;
  transition: all 0.3s;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border-bottom: 2px solid transparent;
}

.nav-link:hover, .nav-link.router-link-active {
  color: rgba(0, 150, 255, 1);
  border-bottom: 2px solid rgba(0, 150, 255, 0.9);
}

.navbar-user-manage {
  display: flex;
  gap: 1rem;
}

.auth-link {
  color: rgba(200, 200, 200, 0.9);
  text-decoration: none;
  font-size: 0.9rem;
  letter-spacing: 1px;
  transition: all 0.3s;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.auth-link:hover {
  color: white;
}

.auth-link.register {
  background: linear-gradient(
    45deg,
    rgba(0, 100, 255, 0.8),
    rgba(0, 150, 255, 0.9)
  );
  color: white;
}

.auth-link.register:hover {
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.5);
  transform: translateY(-2px);
}

.username {
  color: rgba(200, 200, 255, 0.9);
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.logout-btn {
  background: transparent;
  color: rgba(255, 100, 100, 0.9);
  border: 1px solid rgba(255, 100, 100, 0.5);
  border-radius: 4px;
  padding: 0.3rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 100, 100, 0.1);
  color: rgba(255, 120, 120, 1);
  box-shadow: 0 0 10px rgba(255, 100, 100, 0.3);
}

.mobile-menu-toggle {
  display: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: rgba(200, 200, 200, 0.9);
}

.mobile-menu {
  display: none;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: rgba(15, 15, 15, 0.95);
  border-bottom: 1px solid rgba(50, 50, 50, 0.5);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 99;
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
}

.mobile-menu.active {
  transform: translateY(0);
}

.mobile-nav-link {
  color: rgba(200, 200, 200, 0.9);
  text-decoration: none;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(50, 50, 50, 0.5);
  transition: all 0.3s;
}

.mobile-nav-link:hover, .mobile-nav-link.router-link-active {
  background-color: rgba(30, 30, 30, 0.9);
  color: rgba(0, 150, 255, 1);
}

.mobile-nav-link.register {
  background: linear-gradient(
    45deg,
    rgba(0, 100, 255, 0.5),
    rgba(0, 150, 255, 0.6)
  );
}

.mobile-username {
  color: rgba(200, 200, 255, 0.9);
  font-size: 0.9rem;
  letter-spacing: 1px;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(50, 50, 50, 0.5);
}

.mobile-logout-btn {
  background: transparent;
  color: rgba(255, 100, 100, 0.9);
  border: 1px solid rgba(255, 100, 100, 0.5);
  margin: 0.75rem 1.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.mobile-logout-btn:hover {
  background-color: rgba(255, 100, 100, 0.1);
}

/* Add this to prevent body scrolling when modal is open */
:global(body.modal-open) {
  overflow: hidden;
}

@media (max-width: 768px) {
  .navbar-links, .navbar-user-manage {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .mobile-menu {
    display: flex;
  }

  .gallery-content {
    padding: 80px 1rem 2rem;
  }

  .gallery-item img {
    max-width: 150px;
  }

  .full-image-modal {
    width: 95%;
  }

  .full-image-container {
    max-height: 60vh;
  }
}

@keyframes rgbBorder {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
