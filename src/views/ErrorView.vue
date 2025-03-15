<!-- src/views/ErrorView.vue -->
<template>
  <div class="error-container" :style="{ backgroundImage: `url(${selectedBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }">
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
import { ref, onMounted } from 'vue';

const router = useRouter();

const backgroundOptions = [
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXc5bGhvZGFqMDZheG5iMDU4eGx2Zzd6ZTd6aHJxb3JoODM5Zjl1byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yAjIXTFgZtfn6ix3Wt/giphy.gif',
  'https://64.media.tumblr.com/7ba22a54cb8886b38546cfa4455b1818/4a6d13ca78b9a465-d8/s540x810/13d4e445e1f92d4b4515a3dc898f8688b7dbc347.gifv',
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHNzemZreW51NmpibTllbHdobnJ2NXprb2ZjN21tbm5zcjk4OHJtcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7sUM9x7DkMVoW8WC8Y/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnI1ZHp3MHFtYWplaXY2ODliOHUyNGU4YzNzNGVmZGQ2NGtvaXhmZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YWQWLMNzjBwnahnr63/giphy.gif'
];

// Reactive reference to hold the selected background
const selectedBackground = ref('');

// Function to select a random background
const selectRandomBackground = () => {
  // Generate a random index between 0 and the length of backgroundOptions - 1
  const randomIndex = Math.floor(Math.random() * backgroundOptions.length);
  // Set the selected background to the URL at the random index
  selectedBackground.value = backgroundOptions[randomIndex];
};

// When the component mounts, select a random background
onMounted(() => {
  selectRandomBackground();
});

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
  /* Gradient background as fallback if background image fails to load */
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
  position: relative;
  overflow: hidden; /* Prevents background from causing scrollbars */
}

/* Background overlay to improve content readability */
.error-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
  z-index: 1;
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
  position: relative;
  z-index: 2; /* Ensures content appears above the overlay */
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
