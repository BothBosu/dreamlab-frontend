<template>
  <div class="register-container">
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

    <div class="register-card">
      <div class="neon-header">
        <h1>REGISTER</h1>
        <div class="neon-line"></div>
      </div>

      <div v-if="errorMessage" class="error-message">
        <div class="error-icon">!</div>
        {{ errorMessage }}
      </div>

      <!-- Profile Picture Selector -->
      <div class="form-group profile-picture-section">
        <label>PROFILE PICTURE</label>
        <ProfilePictureSelector
          v-model:value="profilePicture"
          label="Choose your avatar"
        />
        <div class="preview-container">
          <div class="preview-label">Preview:</div>
          <div class="avatar-preview">
            <img :src="getAvatarSrc(profilePicture)" alt="Selected Avatar" />
          </div>
        </div>
      </div>


      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">USERNAME</label>
          <div class="input-container">
            <input
              type="text"
              id="username"
              v-model="username"
              required
              placeholder="Enter your username"
              autocomplete="off"
            />
            <div class="input-glow"></div>
          </div>
        </div>

        <div class="form-group">
          <label for="password">PASSWORD</label>
          <div class="input-container">
            <input
              type="password"
              id="password"
              v-model="password"
              required
              placeholder="Enter your password"
            />
            <div class="input-glow"></div>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">CONFIRM PASSWORD</label>
          <div class="input-container">
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              required
              placeholder="Confirm your password"
            />
            <div class="input-glow"></div>
          </div>
        </div>

        <div class="form-group">
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            :class="{'button-disabled': !isFormValid, 'button-loading': isLoading}"
          >
            <span v-if="isLoading" class="loader"></span>
            <span v-else>CREATE ACCOUNT</span>
          </button>
        </div>
      </form>

      <div class="register-footer">
        <p>Already have an account?</p>
        <router-link to="/login" class="login-link">LOGIN</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import ProfilePictureSelector from '@/views/ProfilePictureSelector.vue';

export default defineComponent({
  name: 'RegisterView',
  components: {
    ProfilePictureSelector
  },
  setup() {
    const username = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const profilePicture = ref('avatar1.png');
    const errorMessage = ref('');
    const isLoading = ref(false);
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

    const isFormValid = computed(() => {
      return username.value.length >= 3 &&
        password.value.length >= 6 &&
        password.value === confirmPassword.value &&
        profilePicture.value !== '';
    });

    const getAvatarSrc = (avatar: string) => {
      return `/assets/avatars/${avatar}`;
    };

    const handleRegister = async () => {
      if (!isFormValid.value) {
        if (password.value !== confirmPassword.value) {
          errorMessage.value = 'Passwords do not match';
        } else if (username.value.length < 3) {
          errorMessage.value = 'Username must be at least 3 characters';
        } else if (password.value.length < 6) {
          errorMessage.value = 'Password must be at least 6 characters';
        }
        return;
      }

      errorMessage.value = '';
      isLoading.value = true;

      try {
        const result = await authStore.register(
          username.value,
          password.value,
          profilePicture.value
        );

        if (result.success) {
          // Show success message and redirect to login
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } else {
          errorMessage.value = result.message || 'Registration failed. Please try again.';
        }
      } catch (error: any) {
        errorMessage.value = error.message || 'An error occurred. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      username,
      password,
      confirmPassword,
      profilePicture,
      errorMessage,
      isLoading,
      isFormValid,
      handleRegister,
      isAuthenticated,
      userDisplayName,
      mobileMenuOpen,
      toggleMobileMenu,
      logout,
      getAvatarSrc
    };
  }
});
</script>

<style scoped>
.register-container {
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
  padding-top: 60px; /* Added to account for fixed navbar */
}

.register-card {
  background-color: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(50, 50, 50, 0.5);
  border-radius: 8px;
  box-shadow:
    0 0 15px rgba(0, 150, 255, 0.2),
    0 0 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
}

.register-card::before {
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

.neon-header {
  margin-bottom: 2rem;
  text-align: center;
}

.neon-header h1 {
  font-size: 2.2rem;
  letter-spacing: 3px;
  margin-bottom: 0.5rem;
  color: rgba(240, 240, 240, 0.9);
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.5),
    0 0 10px rgba(0, 150, 255, 0.5);
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
  width: 80%;
  animation: rgbPulse 3s ease-in-out infinite;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  letter-spacing: 1.5px;
  color: rgba(200, 200, 200, 0.8);
}

.input-container {
  position: relative;
  margin-bottom: 0.25rem;
}

input {
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(60, 60, 60, 0.5);
  border-radius: 4px;
  color: #f0f0f0;
  font-family: 'Rajdhani', 'Roboto', sans-serif;
  font-size: 1rem;
  transition: all 0.3s;
}

input:focus {
  outline: none;
  border-color: rgba(0, 150, 255, 0.7);
  box-shadow: 0 0 5px rgba(0, 150, 255, 0.5);
}

.input-glow {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 0, 128, 0.8),
    rgba(0, 255, 255, 0.8),
    rgba(128, 0, 255, 0.8)
  );
  transition: width 0.3s ease;
}

input:focus + .input-glow {
  width: 100%;
  animation: rgbBorder 5s linear infinite;
}

button {
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
  font-size: 1rem;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

button::before {
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

button:hover:not(:disabled)::before {
  left: 100%;
}

button:hover:not(:disabled) {
  box-shadow:
    0 0 10px rgba(0, 150, 255, 0.5),
    0 0 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.button-disabled {
  background: linear-gradient(
    45deg,
    rgba(70, 70, 70, 0.8),
    rgba(100, 100, 100, 0.9)
  );
  cursor: not-allowed;
}

.button-loading {
  background: linear-gradient(
    45deg,
    rgba(30, 80, 150, 0.8),
    rgba(30, 110, 150, 0.9)
  );
  cursor: wait;
}

.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.error-message {
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  background-color: rgba(200, 30, 30, 0.1);
  border-left: 3px solid rgba(255, 50, 50, 0.7);
  color: rgba(255, 100, 100, 1);
  border-radius: 3px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255, 50, 50, 0.8);
  color: white;
  font-weight: bold;
  margin-right: 10px;
}

.register-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(180, 180, 180, 0.7);
}

.login-link {
  display: inline-block;
  margin-top: 0.5rem;
  color: rgba(0, 150, 255, 0.9);
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
}

.login-link:hover {
  color: rgba(0, 200, 255, 1);
  text-shadow: 0 0 5px rgba(0, 150, 255, 0.5);
}

/* Profile Picture Styles */
.profile-picture-section {
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  flex-direction: column;
}

.preview-label {
  font-size: 0.9rem;
  color: rgba(200, 200, 200, 0.7);
  margin-bottom: 0.5rem;
}

.avatar-preview {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(0, 150, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.3);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
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
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
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

  .register-card {
    margin: 2rem 1rem;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
