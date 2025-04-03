<template>
  <div class="dashboard-container">
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
          <router-link to="/profile" class="username">{{ userDisplayName }}</router-link>
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
        <router-link to="/profile" class="mobile-username" @click="toggleMobileMenu">{{ userDisplayName }}</router-link>
        <button @click="logout" class="mobile-logout-btn">Logout</button>
      </template>
      <template v-else>
        <router-link to="/login" class="mobile-nav-link" @click="toggleMobileMenu">Login</router-link>
        <router-link to="/register" class="mobile-nav-link register" @click="toggleMobileMenu">Register</router-link>
      </template>
    </div>

    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <div class="neon-header">
        <h1>DASHBOARD</h1>
        <div class="neon-line"></div>
      </div>

      <div class="image-gallery">
        <div v-if="images.length === 0" class="dashboard-placeholder">
          <p>You haven't generated any images yet.</p>
        </div>

        <div v-else class="gallery-grid">
          <div v-for="image in images" :key="image.id" class="gallery-item">
            <div class="image-container" @click="openImageModal(image)">
              <img :src="image.url" :alt="image.inputPrompt" />
              <!-- Like button in corner -->
              <div class="like-button">
                <span class="heart-icon">❤️</span>
                <span class="like-count">{{ image.likes || 0 }}</span>
              </div>
              <div class="image-overlay">
                <span>Open</span>
              </div>
            </div>
            <p class="image-caption">"{{ image.inputPrompt }}"</p>
            <div class="image-actions">
              <button @click="toggleShare(image)" class="share-btn">
                {{ image.public ? "Unpublish" : "Publish" }}
              </button>
              <button @click="confirmDelete(image)" class="delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="delete-modal-overlay">
      <div class="delete-modal">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this image? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteImage" class="confirm-delete-btn">Delete</button>
          <button @click="cancelDelete" class="cancel-delete-btn">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Full Image Modal -->
    <div class="full-image-modal-overlay" v-if="showImageModal" @click="closeImageModal">
      <div class="full-image-modal" @click.stop>
        <button class="close-modal-btn" @click="closeImageModal">×</button>
        <div class="full-image-container">
          <img :src="selectedImage.url" :alt="selectedImage.inputPrompt" class="modal-image" />
        </div>
        <div class="full-image-info">
          <div class="title-with-actions">
            <h3>"{{ selectedImage.inputPrompt }}"</h3>
            <div class="modal-actions">
              <div class="like-count-display">
                <span class="heart-icon">❤️</span>
                <span class="like-count">{{ selectedImage.likes || 0 }}</span>
              </div>
              <button @click="toggleShare(selectedImage)" class="modal-share-btn">
                {{ selectedImage.public ? "Unpublish" : "Publish" }}
              </button>
              <button @click="confirmDeleteFromModal" class="modal-delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

axios.defaults.withCredentials = true
export default defineComponent({
  name: 'DashboardView',
  setup() {
    const mobileMenuOpen = ref(false);
    const router = useRouter();
    const authStore = useAuthStore();

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const userDisplayName = computed(() => authStore.user?.username || 'User');

    const images = ref<Array<{ id: number; url: string; inputPrompt: string; public: boolean; likes?: number }>>([]);
    const showDeleteModal = ref(false);
    const imageToDelete = ref<{ id: number; url: string; inputPrompt: string; public: boolean; likes?: number } | null>(null);

    // For full image modal
    const showImageModal = ref(false);
    const selectedImage = ref<{ id: number; url: string; inputPrompt: string; public: boolean; likes?: number }>({
      id: 0,
      url: '',
      inputPrompt: '',
      public: false,
      likes: 0
    });

    // fetchUserImages function
    const fetchUserImages = async () => {
      try {
        if (authStore.isAuthenticated) {
          const response = await axios.get(
            // local
            // 'http://localhost:8080/api/images/user',
            // deploy
            'https://dreamlab-ai.online/api/images/user',
            { withCredentials: true }
          );

          const imagesWithLikes = await Promise.all(response.data.map(async (img: any) => {
            try {
              const likeResponse = await axios.get(
                // local
                // `http://localhost:8080/api/likes/${img.id}/count`
                // deploy
                `https://dreamlab-ai.online/api/likes/${img.id}/count`
              );
              return { ...img, likes: likeResponse.data };
            } catch (error) {
              return { ...img, likes: 0 };
            }
          }));

          images.value = imagesWithLikes;
        } else {
          images.value = [];
        }
      } catch (error) {
        console.error('Failed to fetch user images:', error);
        images.value = [];
      }
    };

    // toggleShare function
    const toggleShare = async (image: { id: number; public: boolean }) => {
      try {
        const newSharedStatus = !image.public;
        await axios.patch(
          // local
          // `http://localhost:8080/api/images/${image.id}/share?isPublic=${newSharedStatus}`,
          // deploy
          `https://dreamlab-ai.online/api/images/${image.id}/share?isPublic=${newSharedStatus}`,
          {},
          { withCredentials: true }
        );

        image.public = newSharedStatus;

        if (selectedImage.value && selectedImage.value.id === image.id) {
          selectedImage.value.public = newSharedStatus;
        }

        const thumbnailImage = images.value.find(img => img.id === image.id);
        if (thumbnailImage) {
          thumbnailImage.public = newSharedStatus;
        }

      } catch (error) {
        console.error("Failed to update share status:", error);
      }
    };

    const confirmDelete = (image: { id: number; url: string; inputPrompt: string; public: boolean; likes?: number }) => {
      imageToDelete.value = image;
      showDeleteModal.value = true;
    };

    const confirmDeleteFromModal = () => {
      imageToDelete.value = selectedImage.value;
      closeImageModal();
      showDeleteModal.value = true;
    };

    const cancelDelete = () => {
      imageToDelete.value = null;
      showDeleteModal.value = false;
    };

    const deleteImage = async () => {
      if (!imageToDelete.value) return;

      try {
        await axios.delete(
          // local
          // `http://localhost:8080/api/images/${imageToDelete.value.id}`,
          // deploy
          `https://dreamlab-ai.online/api/images/${imageToDelete.value.id}`,
          { withCredentials: true }
        );

        // Remove the image from the local array
        images.value = images.value.filter(img => img.id !== imageToDelete.value!.id);

        // Close the modal
        showDeleteModal.value = false;
        imageToDelete.value = null;

        // If the deleted image was being viewed in modal, close that too
        if (showImageModal.value && selectedImage.value.id === imageToDelete.value.id) {
          closeImageModal();
        }
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    };

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
    };

    const logout = async () => {
      await authStore.logout();
      // Clear the images when logging out
      images.value = [];
      router.push('/login');
    };

    // Functions for full image modal
    const openImageModal = (image: { id: number; url: string; inputPrompt: string; public: boolean; likes?: number }) => {
      selectedImage.value = { ...image };
      showImageModal.value = true;
      // Add body class to prevent scrolling
      document.body.classList.add('modal-open');
    };

    const closeImageModal = () => {
      showImageModal.value = false;
      // Remove body class to restore scrolling
      document.body.classList.remove('modal-open');
    };

    // Watch for authentication changes
    watch(() => authStore.isAuthenticated, (isAuthenticated) => {
      if (isAuthenticated) {
        fetchUserImages();
      } else {
        // Clear images when user logs out
        images.value = [];
      }
    });

    onMounted(() => {
      fetchUserImages();
    });

    return {
      isAuthenticated,
      userDisplayName,
      mobileMenuOpen,
      toggleMobileMenu,
      logout,
      images,
      toggleShare,
      confirmDelete,
      cancelDelete,
      deleteImage,
      showDeleteModal,
      imageToDelete,
      showImageModal,
      selectedImage,
      openImageModal,
      closeImageModal,
      confirmDeleteFromModal
    };
  }
});
</script>

<style scoped>
.image-gallery {
  margin-top: 0.5rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.gallery-item {
  background-color: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(70, 70, 70, 0.5);
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.1);
  transition: transform 0.3s;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  height: 140px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(10, 10, 10, 0.8);
}

.gallery-item img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.03);
}

/* Like button in corner */
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

.heart-icon {
  font-size: 1rem;
}

.like-count {
  color: white;
  font-size: 0.9rem;
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

.image-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.share-btn, .delete-btn {
  flex: 1;
  border: none;
  padding: 0.5rem 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s;
}

.share-btn {
  background-color: #007bff;
  color: white;
}

.share-btn:hover {
  background-color: #0056b3;
}

.delete-btn {
  background-color: rgba(255, 50, 50, 0.8);
  color: white;
}

.delete-btn:hover {
  background-color: rgba(255, 30, 30, 1);
}

.image-caption {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: rgba(200, 200, 200, 0.85);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 0.25rem;
}

/* Delete Confirmation Modal */
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
  backdrop-filter: blur(5px);
}

.delete-modal {
  background-color: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(70, 70, 70, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.delete-modal h3 {
  color: rgba(255, 60, 60, 0.9);
  margin-top: 0;
  font-size: 1.2rem;
}

.delete-modal p {
  color: rgba(220, 220, 220, 0.9);
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.confirm-delete-btn, .cancel-delete-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.confirm-delete-btn {
  background-color: rgba(255, 50, 50, 0.8);
  color: white;
}

.confirm-delete-btn:hover {
  background-color: rgba(255, 20, 20, 1);
}

.cancel-delete-btn {
  background-color: rgba(50, 50, 50, 0.8);
  color: white;
}

.cancel-delete-btn:hover {
  background-color: rgba(70, 70, 70, 1);
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
  max-height: 120vh;
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

.title-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.full-image-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: rgba(240, 240, 240, 0.9);
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Like display in modal */
.like-count-display {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0.5rem 0.75rem;
  background-color: rgba(40, 40, 40, 0.3);  /* More transparent */
  border-radius: 20px;
  margin-right: 0.5rem;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.modal-share-btn, .modal-delete-btn {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.modal-share-btn {
  background-color: #007bff;
  color: white;
}

.modal-share-btn:hover {
  background-color: #0056b3;
}

.modal-delete-btn {
  background-color: rgba(255, 50, 50, 0.8);
  color: white;
}

.modal-delete-btn:hover {
  background-color: rgba(255, 30, 30, 1);
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

.dashboard-container {
  min-height: 100vh;
  background-color: #0a0a0a;
  background-image:
    radial-gradient(circle, rgba(25, 25, 25, 0.8) 0%, rgba(5, 5, 5, 0.9) 100%),
    linear-gradient(45deg, rgba(0, 0, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.dashboard-content {
  padding: 0.5rem;
  text-align: center;
  padding-top: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-content {
  padding: 0.5rem;
  text-align: center;
  padding-top: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.neon-header {
  margin-bottom: 1rem;
  margin-top: -5px;
  text-align: center;
}

.neon-header h1 {
  font-size: 2.5rem;
  letter-spacing: 5px;
  margin-top: 0;
  margin-bottom: 0.25rem;
  line-height: 1;
  color: rgba(240, 240, 240, 0.9);
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.3),
    0 0 10px rgba(0, 150, 255, 0.3);
}

.neon-line {
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(255, 0, 128, 0.2),
    rgba(0, 255, 255, 0.7),
    rgba(128, 0, 255, 0.2)
  );
  margin: 0 auto;
  width: 60%;
  animation: rgbPulse 3s ease-in-out infinite;
}

.dashboard-placeholder {
  background-color: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(50, 50, 50, 0.5);
  border-radius: 8px;
  box-shadow:
    0 0 15px rgba(0, 150, 255, 0.2),
    0 0 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  padding: 2.5rem;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.dashboard-placeholder::before {
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

.dashboard-placeholder p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  color: rgba(200, 200, 200, 0.9);
  line-height: 1.6;
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
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.username:hover {
  color: rgba(0, 150, 255, 1);
  background-color: rgba(255, 255, 255, 0.05);
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
  width: auto;
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
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
}

.mobile-username:hover {
  background-color: rgba(30, 30, 30, 0.9);
  color: rgba(0, 150, 255, 1);
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

  .dashboard-content {
    padding: 60px 1rem 2rem;
  }

  .dashboard-placeholder {
    padding: 1.5rem;
  }

  .image-actions {
    flex-direction: column;
  }

  .full-image-container {
    max-height: 65vh;
  }

  .full-image-container img {
    max-height: 65vh;
  }

  .title-with-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .title-with-actions h3 {
    max-width: 100%;
  }

  .modal-actions {
    display: flex;
    width: 100%;
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

@keyframes rgbPulse {
  0% {
    opacity: 0.7;
    box-shadow: 0 0 5px rgba(0, 150, 255, 0.3);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 15px rgba(0, 150, 255, 0.5);
  }
  100% {
    opacity: 0.7;
    box-shadow: 0 0 5px rgba(0, 150, 255, 0.3);
  }
}
</style>
