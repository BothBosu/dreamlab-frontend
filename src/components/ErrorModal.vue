<template>
  <div class="modal-backdrop" v-if="show" @click="$emit('close')">
    <div class="error-modal" @click.stop>
      <div class="error-icon">!</div>
      <div class="error-content">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
      </div>
      <button @click="$emit('close')" class="close-button">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ErrorModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Error'
    },
    message: {
      type: String,
      required: true
    },
    buttonText: {
      type: String,
      default: 'OK'
    }
  },
  emits: ['close']
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.error-modal {
  background-color: rgba(15, 15, 15, 0.9);
  border: 1px solid rgba(50, 50, 50, 0.5);
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow:
    0 0 20px rgba(255, 50, 50, 0.3),
    0 0 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  text-align: center;
  animation: slideUp 0.3s ease-out;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
}

.error-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    rgba(255, 0, 50, 0.8),
    rgba(255, 50, 255, 0.8),
    rgba(255, 0, 50, 0.8)
  );
  animation: rgbBorder 5s linear infinite;
}

.error-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 50, 50, 0.2);
  border: 2px solid rgba(255, 50, 50, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  font-weight: bold;
  color: rgba(255, 100, 100, 1);
  text-shadow: 0 0 10px rgba(255, 50, 50, 0.8);
  box-shadow: 0 0 15px rgba(255, 50, 50, 0.3);
}

.error-content {
  margin-bottom: 1.5rem;
}

.error-content h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: rgba(255, 100, 100, 0.9);
  text-shadow: 0 0 5px rgba(255, 50, 50, 0.5);
  letter-spacing: 2px;
}

.error-content p {
  font-size: 1.1rem;
  line-height: 1.5;
  color: rgba(230, 230, 230, 0.9);
}

.close-button {
  background: linear-gradient(
    45deg,
    rgba(200, 50, 50, 0.8),
    rgba(255, 50, 100, 0.9)
  );
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.close-button::before {
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

.close-button:hover::before {
  left: 100%;
}

.close-button:hover {
  box-shadow:
    0 0 10px rgba(255, 50, 50, 0.5),
    0 0 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
