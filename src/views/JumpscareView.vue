<template>
  <div class="comedy-container">
    <img
      src="../assets/kekw.jpg"
      alt="Laughing Man"
      class="spinning-image"
    />
    <div class="message">YOU FOUND THE SECRET PAGE!</div>
    <div class="submessage">Congratulations! You're too curious for your own good!</div>
    <router-link to="/" class="return-link">Return to sanity</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'JumpscareView',
  setup() {
    let audio: HTMLAudioElement | null = null;

    onMounted(() => {
      // Set document title
      document.title = "ERROR";

      // Flash the screen
      const flashInterval = setInterval(() => {
        document.body.style.backgroundColor =
          document.body.style.backgroundColor === 'black' ? 'red' : 'black';
      }, 100);

      // Clean up interval on unmount
      onUnmounted(() => {
        clearInterval(flashInterval);
        if (audio) {
          audio.pause();
          audio = null;
        }
        document.title = "DREAM LAB"; // Reset title
        document.body.style.backgroundColor = ''; // Reset background
      });
    });

    const playSound = () => {
      // You can add a scary sound here
      audio = new Audio();
      audio.src = "/scream.mp3"; // Add a scary sound file to your assets
      audio.volume = 0.7;
      audio.play().catch(e => console.log("Audio play prevented by browser policy"));
    };

    return {
      playSound
    };
  }
});
</script>

<style scoped>
.comedy-container {
  background: radial-gradient(circle, #5d26c1, #a17fe0, #59c173);
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.spinning-image {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  object-fit: cover;
  animation: spin 4s linear infinite, bounce 2s ease-in-out infinite alternate;
  box-shadow: 0 0 30px rgba(255, 255, 0, 0.7);
  margin-bottom: 2rem;
}

.message {
  margin-top: 1rem;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
  font-size: 3rem;
  font-weight: bold;
  color: #ffff00;
  text-shadow: 4px 4px 0px #ff00ff, 7px 7px 0px rgba(0, 0, 0, 0.5);
  text-align: center;
  animation: colorChange 3s infinite;
}

.submessage {
  margin-top: 1rem;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
  font-size: 1.5rem;
  color: white;
  text-shadow: 2px 2px 0px #000000;
  text-align: center;
}

.return-link {
  position: absolute;
  bottom: 40px;
  background-color: #ff00ff;
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  text-decoration: none;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.3s;
  animation: pulse 1.5s infinite alternate;
}

.return-link:hover {
  transform: scale(1.1) rotate(-5deg);
  background-color: #00ff00;
  color: #000000;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.7);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(180deg) translateY(-20px); }
  100% { transform: rotate(360deg) translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

@keyframes colorChange {
  0% { color: #ffff00; }
  25% { color: #ff00ff; }
  50% { color: #00ffff; }
  75% { color: #00ff00; }
  100% { color: #ffff00; }
}

/* Add some floating emojis for extra fun */
.comedy-container::before,
.comedy-container::after {
  content: "😂";
  position: absolute;
  font-size: 4rem;
  animation: float 15s linear infinite;
  z-index: -1;
}

.comedy-container::before {
  left: 10%;
  top: 20%;
  animation-duration: 11s;
}

.comedy-container::after {
  right: 15%;
  bottom: 25%;
  animation-duration: 17s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(100px, 50px) rotate(90deg);
  }
  50% {
    transform: translate(50px, 100px) rotate(180deg);
  }
  75% {
    transform: translate(-50px, 50px) rotate(270deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}
</style>
