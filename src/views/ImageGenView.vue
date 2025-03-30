<template>
  <div class="imagegen-container">
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

    <div class="content-wrapper">
      <div class="imagegen-layout">
        <!-- Left Panel - Controls -->
        <div class="control-panel">
          <div class="panel-section">
            <h2>Prompt</h2>
            <div class="prompt-container">
              <textarea
                v-model="prompt"
                placeholder="Enter your image prompt here..."
                :maxlength="promptMaxLength"
                class="prompt-input"
                @input="updateCharCount"
              ></textarea>
              <div class="char-counter">{{ charCount }}/{{ promptMaxLength }}</div>
            </div>
          </div>

          <div class="panel-section">
            <h2>Negative Prompt</h2>
            <div class="prompt-container">
              <textarea
                v-model="negativePrompt"
                placeholder="Enter things to avoid in the image..."
                :maxlength="negativePromptMaxLength"
                class="prompt-input"
                @input="updateNegativeCharCount"
              ></textarea>
              <div class="char-counter">{{ negativeCharCount }}/{{ negativePromptMaxLength }}</div>
            </div>
          </div>

          <div class="panel-section">
            <div class="setting-group">
              <label for="width">Width: {{ settings.width }}px</label>
              <div class="slider-container">
                <input
                  type="range"
                  id="width"
                  v-model.number="settings.width"
                  min="512"
                  max="1024"
                  step="8"
                  class="slider"
                />
                <input
                  type="number"
                  v-model.number="settings.width"
                  min="512"
                  max="1024"
                  step="8"
                  class="numeric-input"
                />
              </div>
            </div>

            <div class="setting-group">
              <label for="height">Height: {{ settings.height }}px</label>
              <div class="slider-container">
                <input
                  type="range"
                  id="height"
                  v-model.number="settings.height"
                  min="512"
                  max="1024"
                  step="8"
                  class="slider"
                />
                <input
                  type="number"
                  v-model.number="settings.height"
                  min="512"
                  max="1024"
                  step="8"
                  class="numeric-input"
                />
              </div>
            </div>

            <div class="setting-group">
              <label for="steps">Steps: {{ settings.steps }}</label>
              <div class="slider-container">
                <input
                  type="range"
                  id="steps"
                  v-model.number="settings.steps"
                  min="1"
                  max="100"
                  class="slider"
                />
              </div>
            </div>

            <div class="setting-group">
              <label for="seed">Seed</label>
              <div class="seed-container">
                <input
                  type="number"
                  id="seed"
                  v-model.number="settings.seed"
                  min="1"
                  max="2147483647"
                  class="seed-input"
                />
                <button @click="randomizeSeed" class="seed-random">
                  <i class="icon-random">🔄</i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Image Preview -->
        <div class="preview-panel">
          <div class="image-preview-container">
            <div v-if="isGenerating" class="generating-overlay">
              <div class="loader"></div>
              <div class="generation-status">Generating image...</div>
            </div>

            <!-- If image is generated, show the image -->
            <div v-if="generatedImage" class="image-container">
              <img :src="generatedImage" alt="Generated image" class="generated-image" />
            </div>

            <div v-else class="empty-preview">
              <div class="placeholder-message">
                Your generated image will appear here
              </div>
            </div>
          </div>

          <div class="image-actions">
            <button
              class="action-button retry-button"
              title="Retry prompt"
              @click="retryPrompt"
              :disabled="!prompt.trim() || isGenerating"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              <span>Retry</span>
            </button>

            <button
              class="action-button download-button"
              title="Download image"
              @click="downloadImage"
              :disabled="!generatedImage"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download</span>
            </button>
            <button
              class="action-button save-button"
              title="Save to account"
              @click="saveImage"
              :disabled="!generatedImage || !isAuthenticated"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{{ isAuthenticated ? 'Save' : 'Login to Save' }}</span>
            </button>
            <button
              class="action-button share-button"
              title="Share image"
              @click="openShareModal"
              :disabled="!generatedImage"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Generate Button Section (Moved outside of panels) -->
      <div class="panel-buttons-container">
        <div class="generate-button-container">
          <button
            @click="generateImage"
            class="generate-button"
            :disabled="isGenerating"
          >
            <span v-if="isGenerating" class="loader"></span>
            <span v-else>GENERATE</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div class="share-modal-overlay" v-if="shareModalOpen" @click="closeShareModal">
      <div class="share-modal" @click.stop>
        <div class="share-modal-header">
          <h3>Share image</h3>
          <button class="close-modal-btn" @click="closeShareModal">×</button>
        </div>
        <div class="share-modal-content">
          <div class="share-image-preview">
            <img v-if="generatedImage" :src="generatedImage" alt="Generated image" />
          </div>
          <div class="share-options">
            <div class="social-share-buttons">
              <button class="social-btn twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </button>
              <button class="social-btn facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </button>
              <button class="social-btn reddit">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 12h.01M16 12h.01M12 16c2.5 0 4.5-1.5 5-3"></path>
                  <path d="M9 15c.83.67 1.5 1 3 1"></path>
                </svg>
              </button>
              <button class="social-btn pinterest">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2H6a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4z"></path>
                  <path d="M12 15 9 12l-3 3M10 9h4v4"></path>
                </svg>
              </button>
            </div>
            <div class="share-link-container">
              <span class="or-divider">or copy link</span>
              <div class="input-with-button">
                <input type="text" v-model="shareLink" readonly class="share-link-input"/>
                <button class="copy-link-btn" @click="copyShareLink">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'ImageGenView',
  setup() {
    const prompt = ref('')
    const promptMaxLength = 200
    const charCount = ref(0)

    const negativePrompt = ref('')
    const negativePromptMaxLength = 200
    const negativeCharCount = ref(0)

    const isGenerating = ref(false)
    const generatedImage = ref('')
    const mobileMenuOpen = ref(false)
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    // Auth computed properties
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const userDisplayName = computed(() => authStore.user?.username || 'User')

    // Logout function
    const logout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    const shareModalOpen = ref(false)
    const shareLink = ref('https://getimg.ai/img/img-MTXWp2lPrHZI')

    const settings = reactive({
      width: 1024,
      height: 1024,
      steps: 20,
      seed: 1
    })

    const updateCharCount = () => {
      charCount.value = prompt.value.length
    }

    const updateNegativeCharCount = () => {
      negativeCharCount.value = negativePrompt.value.length
    }

    const randomizeSeed = () => {
      settings.seed = Math.floor(Math.random() * 2147483647) + 1
    }

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
    }

    const generateImage = async () => {
      if (!prompt.value.trim()) {
        alert('Please enter a prompt before generating an image.')
        return
      }

      isGenerating.value = true

      try {
        const response = await axios.post('/api/images/generate', {
          prompt: prompt.value,
          negative_prompt: negativePrompt.value,
          settings: {
            width: settings.width,
            height: settings.height,
            steps: settings.steps,
            seed: settings.seed
          }
        })

        // Log the response to inspect its structure
        console.log('API Response:', response)

        // Handle different response formats
        let imageUrl

        if (typeof response.data === 'string') {
          // If the response is directly a string (URL)
          imageUrl = response.data
        } else if (typeof response.data === 'object') {
          // If the response is a JSON object
          if (response.data.imageUrl) {
            imageUrl = response.data.imageUrl
          } else if (response.data.url) {
            imageUrl = response.data.url
          } else {
            // Try to find any property that looks like a URL
            const possibleUrlProps = Object.entries(response.data)
              .find(([_, value]) =>
                typeof value === 'string' &&
                (value.startsWith('http://') || value.startsWith('https://'))
              )

            if (possibleUrlProps) {
              imageUrl = possibleUrlProps[1]
            } else {
              throw new Error('Could not find image URL in the response')
            }
          }
        }

        // Check if we have a valid URL and it's not an error message
        if (!imageUrl || (typeof imageUrl === 'string' && imageUrl.startsWith('Error:'))) {
          throw new Error(imageUrl || 'Invalid response from server')
        }

        // Store the image URL
        generatedImage.value = imageUrl

        // Set share link to the same URL
        shareLink.value = imageUrl

        console.log('Image URL set to:', imageUrl)

      } catch (error) {
        console.error('Error generating image:', error)
        alert('Failed to generate image. Please try again: ' + (error.message || 'Unknown error'))
      } finally {
        isGenerating.value = false
      }
    }

    // Download image function
    const downloadImage = async () => {
      if (!generatedImage.value) return

      try {
        // Create an anchor element and trigger download
        const response = await fetch(generatedImage.value)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `dreamlab-${prompt.value.substring(0, 20).replace(/[^a-z0-9]/gi, '-')}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Error downloading image:', error)
        alert('Failed to download image. Please try again.')
      }
    }

    // Save image to S3 function (from original implementation)
    const saveImage = async () => {
      if (!generatedImage.value) return

      // Check if user is authenticated before allowing image save
      if (!isAuthenticated.value) {
        alert('You must be logged in to save images.');
        return;
      }

      try {
        const response = await axios.post('/api/images/save', {
          imageUrl: generatedImage.value,
          inputPrompt: prompt.value.substring(0, 30) // Use part of the prompt as the name
        }, {
          withCredentials: true // Ensure cookies are sent with the request
        });

        alert('Image saved successfully!');
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          const message = error.response.data.message || error.response.data || 'Unknown error';

          if (message.includes("User not found")) {
            alert("You must be logged in to save images.");
          } else {
            alert("Error: " + message);
          }
        } else if (error.response && error.response.status === 403) {
          alert("You must be logged in to save images.");
        } else {
          alert("Something went wrong. Please try again later.");
        }
      }
    }

    const openShareModal = () => {
      if (!generatedImage.value) return
      shareModalOpen.value = true
    }

    const closeShareModal = () => {
      shareModalOpen.value = false
    }

    const copyShareLink = async () => {
      try {
        await navigator.clipboard.writeText(shareLink.value)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        // Fallback for browsers that don't support clipboard API
        const el = document.createElement('textarea')
        el.value = shareLink.value
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        alert('Link copied to clipboard!')
      }
    }

    const retryPrompt = () => {
      if (prompt.value.trim()) {
        generateImage();
      }
    }

    return {
      prompt,
      promptMaxLength,
      charCount,
      updateCharCount,
      negativePrompt,
      negativePromptMaxLength,
      negativeCharCount,
      updateNegativeCharCount,
      settings,
      isGenerating,
      generatedImage,
      mobileMenuOpen,
      toggleMobileMenu,
      randomizeSeed,
      generateImage,
      downloadImage,
      saveImage,
      shareModalOpen,
      openShareModal,
      closeShareModal,
      shareLink,
      copyShareLink,
      isAuthenticated,
      userDisplayName,
      logout,
      retryPrompt
    }
  }
})
</script>

<style scoped>
.imagegen-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0a0a0a;
  background-image: radial-gradient(circle, rgba(25, 25, 25, 0.8) 0%, rgba(5, 5, 5, 0.9) 100%),
  linear-gradient(45deg, rgba(0, 0, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
}

.content-wrapper {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: rgba(15, 15, 15, 0.9);
  border-bottom: 1px solid rgba(50, 50, 50, 0.5);
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.2);
  position: relative;
  z-index: 100;
  width: 100%;
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

/* Main Layout */
.imagegen-layout {
  display: flex;
  width: 100%;
  gap: 1.5rem;
  padding: 1rem;
  padding-bottom: 0;
}

.control-panel {
  flex: 0 0 30%;
  background-color: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(50, 50, 50, 0.5);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.2),
  0 0 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 700px;
  overflow-y: visible;
}

.control-panel::before {
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

.preview-panel {
  flex: 1;
  background-color: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(50, 50, 50, 0.5);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.2),
  0 0 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  max-width: 100%;
  height: 700px;
}

.preview-panel::before {
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

.panel-section {
  margin-bottom: 1rem;
}

.panel-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: rgba(240, 240, 240, 0.9);
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5),
  0 0 5px rgba(0, 150, 255, 0.5);
}

.prompt-container {
  position: relative;
  margin-bottom: 1rem;
}

.prompt-input {
  width: 100%;
  height: 80px;
  max-height: 80px;
  padding: 0.75rem 0.9rem;
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(60, 60, 60, 0.5);
  border-radius: 4px;
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  font-size: 0.95rem;
  resize: none;
  overflow-y: auto;
  transition: all 0.3s;
}

.prompt-input:focus {
  outline: none;
  border-color: rgba(0, 150, 255, 0.7);
  box-shadow: 0 0 5px rgba(0, 150, 255, 0.5);
}

.char-counter {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.8rem;
  color: rgba(180, 180, 180, 0.7);
}

.settings-tabs {
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(60, 60, 60, 0.5);
}

.tab {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: rgba(0, 150, 255, 0.9);
  border-bottom: 2px solid rgba(0, 150, 255, 0.9);
}

.tab:hover:not(.active) {
  color: rgba(0, 200, 255, 1);
}

.setting-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  align-content: normal;
  letter-spacing: 1px;
  color: rgba(200, 200, 200, 0.8);
}

.select-container {
  position: relative;
}

select {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(60, 60, 60, 0.5);
  border-radius: 4px;
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  font-size: 1rem;
  appearance: none;
  cursor: pointer;
}

.select-container::after {
  content: '▼';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(200, 200, 200, 0.8);
  font-size: 0.8rem;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(60, 60, 60, 0.7);
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(0, 150, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.5);
}

.numeric-input {
  width: 70px;
  padding: 0.5rem;
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(60, 60, 60, 0.5);
  border-radius: 4px;
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  font-size: 0.9rem;
  text-align: center;
}

.seed-container {
  display: flex;
  gap: 0.5rem;
}

.seed-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(60, 60, 60, 0.5);
  border-radius: 4px;
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  font-size: 1rem;
}

.seed-random {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
  background-color: rgba(40, 40, 40, 0.7);
  border: 1px solid rgba(60, 60, 60, 0.5);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.seed-random:hover {
  background-color: rgba(50, 50, 50, 0.9);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
}

.checkbox-group label {
  margin: 0;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  letter-spacing: 1px;
  color: rgba(200, 200, 200, 0.8);
}

/* Generate Button Container */
.panel-buttons-container {
  display: flex;
  width: 100%;
  padding: 0 1rem;
}

.generate-button-container {
  width: 30%;
  margin-top: 12px;
}

.generate-button {
  width: 100%;
  padding: 1rem;
  background: #1a75ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  font-size: 1.1rem;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  font-weight: bold;
}

.generate-button::before {
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

.generate-button:hover:not(:disabled)::before {
  left: 100%;
}

.generate-button:hover:not(:disabled) {
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.5),
  0 0 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.generate-button:disabled {
  background: linear-gradient(
    45deg,
    rgba(30, 80, 150, 0.8),
    rgba(30, 110, 150, 0.9)
  );
  cursor: not-allowed;
}

.image-preview-container {
  width: 100%;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(10, 10, 10, 0.5);
  border: 1px solid rgba(40, 40, 40, 0.5);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.empty-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.placeholder-message {
  color: rgba(150, 150, 150, 0.6);
  font-size: 1.1rem;
}

.generating-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(10, 10, 10, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.retry-button {
  background-color: #2c7a7b;
  color: white;
  border: none;
}

.retry-button:hover {
  background-color: #38a3a5;
}

.generation-status {
  margin-top: 1rem;
  color: rgba(200, 200, 200, 0.9);
  font-size: 1.1rem;
}

.loader {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.generated-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}

.image-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 14px;
}

.download-button {
  background-color: #1a1a1a;
  color: white;
  border: 1px solid #333;
}

.download-button:hover {
  background-color: #2a2a2a;
}

.save-button {
  background-color: #087ea4;
  color: white;
  border: none;
}

.save-button:hover {
  background-color: #0a96c2;
}

.share-button {
  background-color: #5b3cc4;
  color: white;
  border: none;
}

.share-button:hover {
  background-color: #6f48e3;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.share-modal {
  background-color: #1a1a1a;
  width: 90%;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
  animation: modalFadeIn 0.3s ease-out;
}

.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
}

.share-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.close-modal-btn {
  background: transparent;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  transition: color 0.3s;
}

.close-modal-btn:hover {
  color: white;
}

.share-modal-content {
  padding: 20px;
}

.share-image-preview {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #121212;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.share-image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.share-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.social-share-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.social-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.social-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}

.twitter {
  background-color: #000;
  color: white;
}

.facebook {
  background-color: #1877f2;
  color: white;
}

.reddit {
  background-color: #ff4500;
  color: white;
}

.pinterest {
  background-color: #e60023;
  color: white;
}

.or-divider {
  display: block;
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 10px 0;
  position: relative;
}

.share-link-container {
  margin-top: 5px;
}

.input-with-button {
  display: flex;
  width: 100%;
}

.share-link-input {
  flex: 1;
  padding: 10px 12px;
  background-color: #333;
  border: 1px solid #444;
  border-right: none;
  border-radius: 4px 0 0 4px;
  color: white;
  font-size: 14px;
}

.copy-link-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background-color: #5b3cc4;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-link-btn:hover {
  background-color: #6f48e3;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

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

/* Media Queries for Responsiveness */
@media (max-width: 1200px) {
  .control-panel, .preview-panel {
    height: 600px;
  }

  .image-preview-container {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .imagegen-layout {
    flex-direction: column;
  }

  .control-panel, .preview-panel {
    height: auto;
    width: 100%;
  }

  .generate-button-container {
    width: 100%;
  }

  .image-preview-container {
    height: 350px;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .navbar-links {
    display: none;
  }

  .mobile-menu {
    display: flex;
  }

  .action-button {
    padding: 8px 16px;
  }
}

@media (max-width: 600px) {
  .image-preview-container {
    height: 300px;
  }

  .share-modal {
    width: 95%;
  }

  .social-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
