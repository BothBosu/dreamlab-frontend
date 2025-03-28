<template>
  <div class="imagegen-container">
    <!-- Navbar -->
    <div class="navbar">
      <div class="navbar-logo">
        <span class="logo-text">IM-GEN-SSC</span>
      </div>
      <div class="navbar-links">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/gallery" class="nav-link">Gallery</router-link>
        <router-link to="/imagegen" class="nav-link active">Generate</router-link>
      </div>
      <div class="navbar-user-manage">
        <!-- TODO: User Management -->
        <!--<router-link to="/login" class="auth-link">Login</router-link>-->
      </div>
      <div class="mobile-menu-toggle" @click="toggleMobileMenu">
        <div class="hamburger-icon">≡</div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ 'active': mobileMenuOpen }">
      <router-link to="/dashboard" class="mobile-nav-link" @click="toggleMobileMenu">Dashboard
      </router-link>
      <router-link to="/gallery" class="mobile-nav-link" @click="toggleMobileMenu">Gallery
      </router-link>
      <router-link to="/imagegen" class="mobile-nav-link" @click="toggleMobileMenu">Generate
      </router-link>

      <!-- TODO: User Management -->
      <!--<router-link to="/login" class="mobile-nav-link" @click="toggleMobileMenu">Login</router-link>-->
    </div>

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

        <div class="generate-button-container">
          <button
            @click="generateImage"
            class="generate-button"
            :disabled="isGenerating"
          >
            <span v-if="isGenerating" class="loader"></span>
            <span v-else>Generate</span>
          </button>
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
          <button class="action-button" title="Save image" @click="saveImage">
            <i class="icon-save">💾</i>
          </button>
          <button class="action-button" title="Copy to clipboard" @click="copyImage">
            <i class="icon-copy">📋</i>
          </button>
          <button class="action-button" title="Share image" @click="shareImage">
            <i class="icon-share">🔗</i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

export default defineComponent({
  inputPrompt: 'ImageGenView',
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

        // Assuming the API returns the image URL in the response
        generatedImage.value = response.data.imageUrl
      } catch (error) {
        console.error('Error generating image:', error)
        alert('Failed to generate image. Please try again.')
      } finally {
        isGenerating.value = false
      }
    }

    const saveImage = async () => {
      if (!generatedImage.value) return

      try {
        const response = await axios.post('/api/images/save', {
          imageUrl: generatedImage.value,
          inputPrompt: prompt.value.substring(0, 30) // Use part of the prompt as the name
        })

        alert('Image saved successfully!')
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          const message = error.response.data.message || error.response.data || 'Unknown error';

          if (message.includes("User not found")) {
            alert("You must be logged in to save images.");
          } else {
            alert("Error: " + message);
          }
        } else {
          alert("Something went wrong. Please try again later.");
        }
      }
    }

    const copyImage = async () => {
      if (!generatedImage.value) {
        alert('No image to copy. Please generate an image first.')
        return
      }

      try {
        const response = await fetch(generatedImage.value)
        const blob = await response.blob()

        // Check if Clipboard API with ClipboardItem is supported
        if (navigator.clipboard && window.ClipboardItem) {
          const item = new ClipboardItem({ [blob.type]: blob })
          await navigator.clipboard.write([item])
          alert('Image copied to clipboard!')
        } else {
          alert('Copy to clipboard is not supported in this browser. Creating a download link instead.')
        }
      } catch (error) {
        console.error('Error copying image to clipboard:', error)
        alert('Failed to copy image to clipboard. ' + error.message)
      }
    }

    const shareImage = () => {
      // Implementation for sharing image
      alert('Share functionality will be implemented with the actual API')
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
      saveImage,
      copyImage,
      shareImage
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

/* Navbar Styles */
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

/* Main Layout */
.imagegen-layout {
  display: flex;
  width: 100%;
  max-width: 1400px;
  min-height: calc(100vh - 80px);
  gap: 1.5rem;
  padding: 1rem;
  margin: 0 auto;
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

  /* Fixed size */
  height: 700px;
  min-height: 700px;

  /* Remove scrollbar */
  overflow-y: hidden;
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

.generate-button-container {
  margin-top: 1rem;
  padding-top: 0.25rem;
  margin-bottom: 0;
}

.generate-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(
    45deg,
    rgba(0, 100, 255, 0.8),
    rgba(0, 150, 255, 0.9)
  );
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
  margin-bottom: 0.5rem;
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
  min-height: 600px;
  max-height: 600px;
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
  width: 40px;
  height: 40px;
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(60, 60, 60, 0.5);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-button:hover {
  background-color: rgba(50, 50, 50, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 0 8px rgba(0, 150, 255, 0.3);
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

/* Media Queries for Responsiveness */
@media (max-width: 1200px) {
  .image-preview-container {
    height: 500px;
    min-height: 500px;
    max-height: 500px;
  }

  .preview-panel {
    height: 600px;
  }
}

@media (max-width: 768px) {
  .image-preview-container {
    height: 400px;
    min-height: 400px;
    max-height: 400px;
  }

  .preview-panel {
    height: 500px;
  }
}

@media (max-width: 600px) {
  .image-preview-container {
    height: 300px;
    min-height: 300px;
    max-height: 300px;
  }

  .preview-panel {
    height: 400px;
  }
}
</style>
