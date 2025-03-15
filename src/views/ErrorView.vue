<!-- src/views/ErrorView.vue -->
<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-logo">
        <img src="@/assets/ERROR-404-Logo.jpg" alt="ERROR 404" class="error-image" />
      </div>
      <h2 class="error-message">Oops! Page Not Found</h2>
      <p class="error-details">
        The page you are looking for doesn't exist.
      </p>
      <div class="error-actions">
        <button @click="goBack" class="btn-primary">Go Back</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// Function to navigate back to the previous page
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  background-image: url('@/assets/VaporWaveBG.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  position: relative;
}

.error-content {
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.error-logo {
  margin-bottom: 30px;
}

.error-image {
  max-width: 100%;
  height: auto;
  filter: drop-shadow(0 0 15px rgba(142, 68, 173, 0.7));
}

.error-message {
  font-size: 28px;
  color: #fff;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(142, 68, 173, 0.8);
}

.error-details {
  font-size: 18px;
  color: #ddd;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-primary {
  display: inline-block;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.3);
}

.btn-primary:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(50, 50, 93, 0.2);
}

@media (max-width: 768px) {
  .error-content {
    padding: 30px 20px;
  }

  .error-message {
    font-size: 24px;
  }

  .error-details {
    font-size: 16px;
  }

  .error-actions {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
