<template>
  <div class="landing-container">
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

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="neon-header">
          <h1>DREAM LAB</h1>
          <div class="neon-line"></div>
        </div>
        <p class="tagline">Transform your imagination into stunning AI-generated art</p>

        <!-- Continuous Auto-Scrolling Slider -->
        <div class="slider-container">
          <div v-if="loading" class="loading-container">
            <div class="image-placeholder" v-for="i in 3" :key="i">
              <div class="placeholder-text">Loading...</div>
            </div>
          </div>
          <div v-else ref="sliderTrack" class="slider-track">
            <div
              class="slider-item"
              v-for="(image, index) in displayImages"
              :key="`${image.id}-${index}`"
            >
              <img
                :src="image.url"
                :alt="image.title || 'Gallery Image'"
                class="slider-img"
                @error="handleImageError($event, index, 'slider')"
              />
            </div>
          </div>
        </div>

        <!-- Generate Button -->
        <div class="action-buttons">
          <router-link to="/imagegen" class="action-button generate-btn">Start Generating</router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2>Features</h2>
        <div class="neon-line"></div>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <div class="icon-placeholder">🎨</div>
          </div>
          <h3>Generate Unique AI Images</h3>
          <p>Create stunning visuals from text prompts powered by state-of-the-art AI</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <div class="icon-placeholder">🖼️</div>
          </div>
          <h3>Community Gallery</h3>
          <p>Browse a vast collection of AI creations from users around the world</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <div class="icon-placeholder">❤️</div>
          </div>
          <h3>Like Favorites</h3>
          <p>Show appreciation for images that inspire you with likes</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <div class="icon-placeholder">🔄</div>
          </div>
          <h3>Share Your Creations</h3>
          <p>Publish your best generations to the community gallery</p>
        </div>
      </div>
    </section>

    <!-- Section divider -->
    <div class="section-divider"></div>

    <!-- Gallery Preview Section -->
    <section class="gallery-preview-section">
      <div class="section-header">
        <h2>Community Creations</h2>
        <div class="neon-line"></div>
      </div>

      <div class="gallery-grid">
        <template v-if="loading">
          <div class="gallery-item" v-for="i in 4" :key="i">
            <div class="gallery-image-placeholder">
              <div class="placeholder-text">Loading...</div>
            </div>
            <div class="image-meta">
              <span class="image-prompt">"Loading..."</span>
              <span class="image-likes">❤️ 0</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="gallery-item" v-for="(image, i) in galleryImages" :key="i">
            <img
              :src="image.url"
              :alt="image.title || 'Gallery Image'"
              class="gallery-img"
              @error="handleImageError($event, i, 'gallery')"
            >
            <div class="image-meta">
              <span class="image-prompt">"{{ image.title || 'Untitled' }}"</span>
              <span class="image-likes">❤️ {{ image.likes || 0 }}</span>
            </div>
          </div>
        </template>
      </div>

      <div class="view-more-container">
        <router-link to="/gallery" class="view-more-btn">Explore Full Gallery</router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-content">
        <div class="footer-logo">DREAM LAB</div>
        <p class="footer-tagline">Where AI brings imagination to life</p>
        <div class="footer-links">
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </div>
      </div>
      <div class="copyright">© 2025 Dream Lab. All rights reserved. <router-link to="/secret" class="easter-egg">🥚</router-link></div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import axios from 'axios';

axios.defaults.withCredentials = true
export default defineComponent({
  name: 'LandingView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const mobileMenuOpen = ref(false);
    const loading = ref(true);

    // Data for images
    const allImages = ref<any[]>([]);
    const galleryImages = ref<any[]>([]);
    const failedGalleryImages = ref<number[]>([]);
    const failedSliderImages = ref<number[]>([]);

    // Slider references and animation
    const sliderTrack = ref<HTMLElement | null>(null);
    const animationFrame = ref<number | null>(null);
    const scrollPosition = ref(0);
    const scrollSpeed = 1.2;

    const displayImages = computed(() => {
      if (allImages.value.length === 0) return [];

      return [...allImages.value, ...allImages.value, ...allImages.value];
    });

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const userDisplayName = computed(() => authStore.user?.username || 'User');

    // Animation function for continuous scrolling
    const animateScroll = () => {
      if (!sliderTrack.value) return;

      scrollPosition.value += scrollSpeed;

      const trackWidth = sliderTrack.value.scrollWidth / 3;

      if (scrollPosition.value >= trackWidth) {
        scrollPosition.value = 0;
      }

      sliderTrack.value.style.transform = `translateX(-${scrollPosition.value}px)`;
      animationFrame.value = requestAnimationFrame(animateScroll);
    };

    // Start the animation
    const startScrollAnimation = () => {
      if (animationFrame.value) {
        cancelAnimationFrame(animationFrame.value);
      }
      animationFrame.value = requestAnimationFrame(animateScroll);
    };

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
    };

    const logout = async () => {
      await authStore.logout();
      router.push('/login');
    };

    // Fetch images from your existing API
    const fetchImages = async () => {
      try {
        loading.value = true;

        // Fetch all images from your existing endpoint
        const response = await axios.get(
          // local
          // "http://localhost:8080/api/images/all",
          // deploy
          "https://dreamlab-ai.online/api/images/all"
        );

        // Process images with like counts
        const processedImages = await Promise.all(response.data.map(async (img: any) => {
          try {
            const likeCountRes = await axios.get(
              // local
              // `http://localhost:8080/api/likes/${img.id}/count`,
              // deploy
              `https://dreamlab-ai.online/api/likes/${img.id}/count`
            );
            return {
              id: img.id,
              url: img.url,
              title: img.inputPrompt || `Image ${img.id}`,
              likes: likeCountRes.data
            };
          } catch (error) {
            console.error(`Error fetching likes for image ${img.id}:`, error);
            return {
              id: img.id,
              url: img.url,
              title: img.inputPrompt || `Image ${img.id}`,
              likes: 0
            };
          }
        }));

        if (processedImages.length > 0) {
          // Store all images for the slider
          allImages.value = processedImages;

          // Get top-liked images for gallery preview
          const sortedByLikes = [...processedImages].sort((a, b) => b.likes - a.likes);
          galleryImages.value = sortedByLikes.slice(0, 4);

          if (galleryImages.value.length < 4) {
            const remaining = 4 - galleryImages.value.length;
            galleryImages.value = [
              ...galleryImages.value,
              ...sortedByLikes.slice(0, remaining)
            ];
          }

          // Start the animation after images load
          setTimeout(() => {
            startScrollAnimation();
          }, 500);
        } else {
          // Fallback for no images
          allImages.value = Array(6).fill(null).map((_, i) => ({
            id: i,
            url: '',
            title: 'Sample Image',
            likes: 0
          }));

          galleryImages.value = Array(4).fill(null).map((_, i) => ({
            id: i,
            url: '',
            title: 'Gallery Image',
            likes: 0
          }));
        }
      } catch (error) {
        console.error('Error fetching images:', error);

        // Fallback for error state
        allImages.value = Array(6).fill(null).map((_, i) => ({
          id: i,
          url: '',
          title: 'Sample Image',
          likes: 0
        }));

        galleryImages.value = Array(4).fill(null).map((_, i) => ({
          id: i,
          url: '',
          title: 'Gallery Image',
          likes: 0
        }));
      } finally {
        loading.value = false;
      }
    };

    // Handle image loading errors
    const handleImageError = (event: Event, index: number, type: 'slider' | 'gallery') => {
      const img = event.target as HTMLImageElement;
      img.style.display = 'none';

      // Create a placeholder div
      const placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder';
      placeholder.innerHTML = '<div class="placeholder-text">Image unavailable</div>';

      // Replace the image with the placeholder
      img.parentNode?.appendChild(placeholder);

      // Track failed images
      if (type === 'slider') {
        failedSliderImages.value.push(index);
      } else {
        failedGalleryImages.value.push(index);
      }
    };

    // Pause animation when tab is not visible to save resources
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Stop animation when tab is not visible
        if (animationFrame.value) {
          cancelAnimationFrame(animationFrame.value);
          animationFrame.value = null;
        }
      } else {
        // Resume animation when tab becomes visible
        if (!animationFrame.value) {
          startScrollAnimation();
        }
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      fetchImages();

      // Add visibility change listener
      document.addEventListener('visibilitychange', handleVisibilityChange);
    });

    onUnmounted(() => {
      // Clean up
      if (animationFrame.value) {
        cancelAnimationFrame(animationFrame.value);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

    return {
      mobileMenuOpen,
      toggleMobileMenu,
      isAuthenticated,
      userDisplayName,
      logout,
      loading,
      allImages,
      galleryImages,
      handleImageError,
      displayImages,
      sliderTrack
    };
  }
});
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  background-color: #0a0a0a;
  background-image:
    radial-gradient(circle, rgba(25, 25, 25, 0.8) 0%, rgba(5, 5, 5, 0.9) 100%),
    linear-gradient(45deg, rgba(0, 0, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
}

/* Hero Section Styles */
.hero-section {
  padding-top: 100px;
  padding-right: 1.5rem;
  padding-bottom: 1.5rem;
  padding-left: 1.5rem;
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  max-width: 1200px;
  width: 100%;
  z-index: 2;
}

.neon-header {
  margin-bottom: 2rem;
  text-align: center;
}

.neon-header h1 {
  font-size: 4.5rem;
  letter-spacing: 10px;
  margin-bottom: 0.5rem;
  color: rgba(240, 240, 240, 0.9);
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.5),
    0 0 10px rgba(0, 150, 255, 0.5),
    0 0 20px rgba(0, 100, 255, 0.4);
  text-transform: uppercase;
  font-weight: 500;
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

.tagline {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: rgba(200, 200, 200, 0.9);
  letter-spacing: 1px;
}

/* Slider Styles for continuous scrolling */
.slider-container {
  position: relative;
  width: 100%;
  max-width: 1000px;
  height: 220px;
  margin: 0 auto 2rem;
  overflow: hidden;
  border-radius: 10px;
  box-shadow:
    0 0 20px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(0, 150, 255, 0.2);
}

.loading-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  min-height: 220px;
}

.slider-track {
  display: flex;
  flex-wrap: nowrap;
  width: fit-content; /* Allow the track to expand based on content */
}

.slider-item {
  flex: 0 0 250px; /* Fixed width for each slide */
  padding: 0.5rem;
  box-sizing: border-box;
}

.slider-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(50, 100, 150, 0.4);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.slider-img:hover {
  transform: scale(1.03);
  border-color: rgba(0, 150, 255, 0.6);
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.4);
}

.image-placeholder {
  width: 100%;
  height: 200px;
  background: linear-gradient(
    45deg,
    rgba(30, 30, 60, 0.8),
    rgba(60, 30, 90, 0.8)
  );
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.placeholder-text {
  font-size: 1.2rem;
  color: rgba(200, 200, 255, 0.7);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.action-button {
  padding: 1rem 2.5rem;
  font-size: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s;
  text-decoration: none;
  position: relative;
  overflow: hidden;
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

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  background: linear-gradient(45deg, #00ccff, #ff00aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(0, 150, 255, 0.3);
}

.logo-link {
  text-decoration: none;
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
  padding: 0.3rem 0.3rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.username:hover {
  color: rgba(0, 150, 255, 1);
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
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.mobile-username:hover {
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

@media (max-width: 768px) {
  .navbar-links, .navbar-user-manage {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
  }

  /* Fix the mobile menu */
  .mobile-menu {
    display: flex;
    position: fixed; /* Fixed position instead of absolute */
    top: 60px; /* Position it right below the navbar */
    left: 0;
    right: 0;
    background-color: rgba(15, 15, 15, 0.95);
    border-bottom: 1px solid rgba(50, 50, 50, 0.5);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 99;
    transform: translateY(-100%); /* Start above the viewport */
    opacity: 0; /* Start invisible */
    transition: transform 0.3s ease, opacity 0.3s ease;
    flex-direction: column;
  }

  /* When active, show the menu */
  .mobile-menu.active {
    transform: translateY(0); /* Move to its proper position */
    opacity: 1;
  }

  .hero-section {
    padding-top: 5rem;
  }

  .slider-item {
    flex: 0 0 200px; /* Smaller slide width on tablets */
  }
}

@media (max-width: 480px) {
  .slider-item {
    flex: 0 0 160px; /* Even smaller slide width on phones */
  }

  .neon-header h1 {
    font-size: 3rem;
    letter-spacing: 5px;
  }

  .tagline {
    font-size: 1.2rem;
  }
}

.login-btn {
  background: linear-gradient(
    45deg,
    rgba(0, 100, 255, 0.8),
    rgba(0, 150, 255, 0.9)
  );
  color: white;
  border: none;
}

.register-btn {
  background: transparent;
  color: rgba(0, 150, 255, 0.9);
  border: 1px solid rgba(0, 150, 255, 0.7);
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: all 0.5s;
}

.action-button:hover::before {
  left: 100%;
}

.generate-btn {
  background: linear-gradient(
    45deg,
    rgba(0, 100, 255, 0.8),
    rgba(0, 150, 255, 0.9)
  );
  color: white;
  border: none;
}

.generate-btn:hover {
  box-shadow:
    0 0 10px rgba(0, 150, 255, 0.5),
    0 0 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* Features Section Styles */
.features-section {
  padding: 3rem 2rem;
  background-color: rgba(10, 10, 15, 0.9);
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 2.2rem;
  letter-spacing: 5px;
  margin-bottom: 0.5rem;
  color: rgba(240, 240, 240, 0.9);
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.3),
    0 0 10px rgba(0, 150, 255, 0.3);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background-color: rgba(15, 15, 20, 0.7);
  border: 1px solid rgba(50, 50, 70, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
  box-shadow:
    0 0 15px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 0 15px rgba(0, 150, 255, 0.2),
    0 0 30px rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 150, 255, 0.3);
}

.feature-icon {
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  background: rgba(20, 20, 40, 0.7);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.3);
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: rgba(220, 220, 255, 0.9);
}

.feature-card p {
  color: rgba(180, 180, 200, 0.8);
  line-height: 1.6;
}

/* Section divider */
.section-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0),
    rgba(0, 150, 255, 0.3),
    rgba(0, 0, 0, 0)
  );
  margin: 1rem auto;
  width: 80%;
}

/* Gallery Preview Section */
.gallery-preview-section {
  padding: 3rem 2rem;
  background-color: rgba(10, 10, 15, 0.9);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.gallery-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    0 0 15px rgba(0, 0, 0, 0.4);
  transition: all 0.3s;
  background-color: rgba(20, 20, 30, 0.7);
  border: 1px solid rgba(40, 40, 60, 0.5);
}

.gallery-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow:
    0 0 15px rgba(0, 150, 255, 0.2),
    0 0 30px rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 150, 255, 0.3);
}

.gallery-image-placeholder {
  width: 100%;
  height: 180px;
  background: linear-gradient(
    45deg,
    rgba(40, 40, 80, 0.8),
    rgba(80, 40, 100, 0.8)
  );
  display: flex;
  justify-content: center;
  align-items: center;
}

.gallery-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.image-meta {
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.image-prompt {
  color: rgba(200, 200, 220, 0.9);
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.image-likes {
  color: rgba(255, 100, 150, 0.9);
}

.view-more-container {
  text-align: center;
  margin-top: 2rem;
}

.view-more-btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  background: transparent;
  color: rgba(0, 150, 255, 0.9);
  border: 1px solid rgba(0, 150, 255, 0.7);
  border-radius: 4px;
  font-size: 1rem;
  letter-spacing: 1.5px;
  text-decoration: none;
  transition: all 0.3s;
}

.view-more-btn:hover {
  background-color: rgba(0, 150, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.3);
  transform: translateY(-2px);
}

/* Footer */
.landing-footer {
  background-color: rgba(5, 5, 10, 0.95);
  padding: 2rem 2rem 1rem;
  text-align: center;
  border-top: 1px solid rgba(40, 40, 60, 0.5);
}

.footer-content {
  max-width: 800px;
  margin: 0 auto;
}

.footer-logo {
  font-size: 1.8rem;
  letter-spacing: 5px;
  margin-bottom: 0.5rem;
  color: rgba(240, 240, 240, 0.8);
  text-shadow:
    0 0 5px rgba(0, 150, 255, 0.3);
}

.footer-tagline {
  font-size: 1rem;
  color: rgba(180, 180, 200, 0.7);
  margin-bottom: 1.5rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.footer-links a {
  color: rgba(150, 150, 200, 0.8);
  text-decoration: none;
  transition: all 0.3s;
}

.footer-links a:hover {
  color: rgba(0, 180, 255, 1);
  text-shadow: 0 0 5px rgba(0, 150, 255, 0.5);
}

.copyright {
  font-size: 0.8rem;
  color: rgba(150, 150, 170, 0.6);
}

/* Animations */
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

.easter-egg {
  opacity: 0.75;
  font-size: 10px;
  margin-left: 8px;
  color: rgba(100, 100, 130, 0.6) !important;
  text-decoration: none;
  transition: all 0.3s;
}

.easter-egg:hover {
  opacity: 0.4;
  color: rgba(255, 0, 0, 0.7) !important;
  text-shadow: none !important;
}
</style>
