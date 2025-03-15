<template>
  <div class="imagegen-container">
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

        <div class="settings-tabs">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
          >
            {{ tab.name }}
          </div>
        </div>

        <!-- Generation Settings -->
        <div v-if="activeTab === 'generation'" class="panel-section">
          <div class="setting-group">
            <label for="samplingMethod">Sampling method</label>
            <div class="select-container">
              <select id="samplingMethod" v-model="settings.samplingMethod">
                <option value="dpm++">DPM++ 2M Karras</option>
                <option value="euler">Euler a</option>
                <option value="ddim">DDIM</option>
              </select>
            </div>
          </div>

          <div class="setting-group">
            <label for="samplingSteps">Sampling steps: {{ settings.samplingSteps }}</label>
            <div class="slider-container">
              <input
                type="range"
                id="samplingSteps"
                v-model.number="settings.samplingSteps"
                min="1"
                max="50"
                class="slider"
              />
            </div>
          </div>

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
            <label for="cfgScale">CFG Scale: {{ settings.cfgScale }}</label>
            <div class="slider-container">
              <input
                type="range"
                id="cfgScale"
                v-model.number="settings.cfgScale"
                min="1"
                max="20"
                step="0.5"
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
                class="seed-input"
              />
              <button @click="randomizeSeed" class="seed-random">
                <i class="icon-random">🔄</i>
              </button>
            </div>
          </div>
        </div>

        <!-- Extra Settings Tab -->
        <div v-if="activeTab === 'advanced'" class="panel-section">
          <div class="setting-group">
            <label for="batchCount">Batch count</label>
            <input type="number" id="batchCount" v-model.number="settings.batchCount" min="1" max="4" class="numeric-input" />
          </div>

          <div class="setting-group">
            <label for="batchSize">Batch size</label>
            <input type="number" id="batchSize" v-model.number="settings.batchSize" min="1" max="4" class="numeric-input" />
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="refiner" v-model="settings.refiner" />
            <label for="refiner">Refiner</label>
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
import { defineComponent, ref, reactive } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'ImageGenView',
  setup() {
    const prompt = ref('');
    const promptMaxLength = 500;
    const charCount = ref(0);
    const isGenerating = ref(false);
    const generatedImage = ref('');
    const activeTab = ref('generation');

    const tabs = [
      { id: 'generation', name: 'Generation' },
      { id: 'advanced', name: 'Advanced' }
    ];

    const settings = reactive({
      samplingMethod: 'dpm++',
      samplingSteps: 20,
      width: 1024,
      height: 1024,
      cfgScale: 7,
      seed: -1,
      batchCount: 1,
      batchSize: 1,
      refiner: false
    });

    const updateCharCount = () => {
      charCount.value = prompt.value.length;
    };

    const randomizeSeed = () => {
      settings.seed = Math.floor(Math.random() * 2147483647);
    };

    const generateImage = async () => {
      if (!prompt.value.trim()) {
        alert('Please enter a prompt before generating an image.');
        return;
      }

      isGenerating.value = true;

      try {
        const response = await axios.post('/api/images/generate', {
          prompt: prompt.value,
          settings: settings
        });

        // Assuming the API returns the image URL in the response
        generatedImage.value = response.data.imageUrl;
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. Please try again.');
      } finally {
        isGenerating.value = false;
      }
    };

    const saveImage = async () => {
      if (!generatedImage.value) return;

      try {
        const response = await axios.post('/api/images/save', {
          imageUrl: generatedImage.value,
          name: prompt.value.substring(0, 30) // Use part of the prompt as the name
        });

        alert('Image saved successfully!');
      } catch (error) {
        console.error('Error saving image:', error);
        alert('Failed to save image.');
      }
    };

    const copyImage = () => {
      // Implementation for copying image to clipboard
      alert('Copy to clipboard functionality will be implemented with the actual API');
    };

    const shareImage = () => {
      // Implementation for sharing image
      alert('Share functionality will be implemented with the actual API');
    };

    return {
      prompt,
      promptMaxLength,
      charCount,
      updateCharCount,
      settings,
      isGenerating,
      generatedImage,
      activeTab,
      tabs,
      randomizeSeed,
      generateImage,
      saveImage,
      copyImage,
      shareImage
    };
  }
});
</script>

<style scoped>
.imagegen-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #0a0a0a;
  background-image:
    radial-gradient(circle, rgba(25, 25, 25, 0.8) 0%, rgba(5, 5, 5, 0.9) 100%),
    linear-gradient(45deg, rgba(0, 0, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  padding: 1rem;
}

.imagegen-layout {
  display: flex;
  width: 100%;
  max-width: 1400px;
  height: calc(100vh - 2rem);
  gap: 1.5rem;
}

.control-panel {
  flex: 0 0 30%;
  background-color: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(50, 50, 50, 0.5);
  border-radius: 8px;
  box-shadow:
    0 0 15px rgba(0, 150, 255, 0.2),
    0 0 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
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
  box-shadow:
    0 0 15px rgba(0, 150, 255, 0.2),
    0 0 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
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
  margin-bottom: 1.5rem;
}

.panel-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: rgba(240, 240, 240, 0.9);
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.5),
    0 0 10px rgba(0, 150, 255, 0.5);
}

.prompt-container {
  position: relative;
  margin-bottom: 1rem;
}

.prompt-input {
  width: 100%;
  height: 100px;
  padding: 0.9rem 1rem;
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(60, 60, 60, 0.5);
  border-radius: 4px;
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  font-size: 1rem;
  resize: vertical;
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
  margin-bottom: 1.25rem;
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
  margin-top: auto;
  padding-top: 1rem;
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
  box-shadow:
    0 0 10px rgba(0, 150, 255, 0.5),
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
  flex: 1;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
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
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 1rem;
}

.generated-image {
  max-width: 100%;
  max-height: 100%;
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
  .imagegen-layout {
    flex-direction: column;
    height: auto;
  }

  .control-panel, .preview-panel {
    flex: none;
    width: 100%;
  }

  .image-preview-container {
    height: 500px;
  }
}

@media (max-width: 600px) {
  .image-preview-container {
    height: 300px;
  }

  .slider-container {
    flex-direction: column;
    align-items: stretch;
  }

  .numeric-input {
    width: 100%;
  }
}
</style>
