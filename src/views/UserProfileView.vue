<template>
  <div class="profile-container">
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
          <div class="user-with-avatar">
            <img :src="getAvatarSrc(userProfilePicture)" alt="User Avatar" class="navbar-avatar" />
            <router-link to="/profile" class="username">{{ userDisplayName }}</router-link>
          </div>
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
        <div class="mobile-user-with-avatar">
          <img :src="getAvatarSrc(userProfilePicture)" alt="User Avatar" class="mobile-navbar-avatar" />
          <router-link to="/profile" class="mobile-username" @click="toggleMobileMenu">{{ userDisplayName }}</router-link>
        </div>
        <button @click="logout" class="mobile-logout-btn">Logout</button>
      </template>
      <template v-else>
        <router-link to="/login" class="mobile-nav-link" @click="toggleMobileMenu">Login</router-link>
        <router-link to="/register" class="mobile-nav-link register" @click="toggleMobileMenu">Register</router-link>
      </template>
    </div>

    <div class="profile-card">
      <div class="neon-header">
        <h1>USER PROFILE</h1>
        <div class="neon-line"></div>
      </div>

      <div v-if="successMessage && !errorMessage" class="success-message">
        <div class="success-icon">✓</div>
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="error-message">
        <div class="error-icon">!</div>
        {{ errorMessage }}
      </div>

      <!-- User Info Section -->
      <div class="user-info-section">
        <div class="user-avatar-section">
          <div class="avatar-container">
            <img :src="getAvatarSrc(profilePicture)" alt="User Avatar" class="user-avatar" />
          </div>
          <div class="avatar-actions">
            <button @click="isChangingAvatar = true" class="change-avatar-btn">
              Change Avatar
            </button>
          </div>
        </div>

        <div class="user-details">
          <div class="info-label">USERNAME</div>
          <div class="info-value">{{ userDisplayName }}</div>
          <div class="info-label">MEMBER SINCE</div>
          <div class="info-value">{{ formatDate(createdAt) }}</div>
        </div>
      </div>

      <!-- Avatar Selection Section (shown when changing avatar) -->
      <div v-if="isChangingAvatar" class="avatar-selection-section">
        <h3>Select New Avatar</h3>
        <ProfilePictureSelector
          v-model:value="profilePicture"
          label="Choose your new avatar"
        />
        <div class="avatar-selection-actions">
          <button @click="cancelAvatarChange" class="cancel-btn">Cancel</button>
          <button @click="saveAvatarChange" class="save-btn">Save Avatar</button>
        </div>
      </div>

      <!-- Change Password Section -->
      <div v-if="!isChangingAvatar" class="change-password-section">
        <h2>Change Password</h2>
        <form @submit.prevent="handleUpdatePassword">
          <div class="form-group">
            <label for="currentPassword">CURRENT PASSWORD</label>
            <div class="input-container">
              <input
                type="password"
                id="currentPassword"
                v-model="currentPassword"
                required
                placeholder="Enter your current password"
              />
              <div class="input-glow"></div>
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">NEW PASSWORD</label>
            <div class="input-container">
              <input
                type="password"
                id="newPassword"
                v-model="newPassword"
                required
                placeholder="Enter your new password"
              />
              <div class="input-glow"></div>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmNewPassword">CONFIRM NEW PASSWORD</label>
            <div class="input-container">
              <input
                type="password"
                id="confirmNewPassword"
                v-model="confirmNewPassword"
                required
                placeholder="Confirm your new password"
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
              <span v-else>UPDATE PASSWORD</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import ProfilePictureSelector from '@/views/ProfilePictureSelector.vue';

export default defineComponent({
  name: 'UserProfileView',
  components: {
    ProfilePictureSelector
  },
  setup() {
    const currentPassword = ref('');
    const newPassword = ref('');
    const confirmNewPassword = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);
    const mobileMenuOpen = ref(false);
    const router = useRouter();
    const authStore = useAuthStore();

    // User info
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const userDisplayName = computed(() => authStore.user?.username || 'User');
    const userProfilePicture = computed(() => authStore.user?.profilePicture || 'avatar1.png');
    const createdAt = ref(new Date());

    // Profile picture management
    const profilePicture = ref(userProfilePicture.value);
    const isChangingAvatar = ref(false);
    const originalProfilePicture = ref(userProfilePicture.value);

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
    };

    const logout = async () => {
      await authStore.logout();
      router.push('/login');
    };

    const isFormValid = computed(() => {
      return currentPassword.value.length >= 6 &&
        newPassword.value.length >= 6 &&
        newPassword.value === confirmNewPassword.value;
    });

    const getAvatarSrc = (avatar: string) => {
      return `/assets/avatars/${avatar}`;
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/users/profile', {
          withCredentials: true
        });

        if (response.data) {
          if (response.data.profilePicture) {
            profilePicture.value = response.data.profilePicture;
            originalProfilePicture.value = response.data.profilePicture;
          }

          if (response.data.createdAt) {
            createdAt.value = new Date(response.data.createdAt);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    const cancelAvatarChange = () => {
      profilePicture.value = originalProfilePicture.value;
      isChangingAvatar.value = false;
    };

    const saveAvatarChange = async () => {
      // Clear both messages before starting
      errorMessage.value = '';
      successMessage.value = '';
      isLoading.value = true;

      try {
        const response = await axios.post(
          '/api/users/update-profile-picture',
          { profilePicture: profilePicture.value },
          { withCredentials: true }
        );

        if (response.data.success) {
          // Update the original profile picture reference
          originalProfilePicture.value = profilePicture.value;

          try {
            // Update the auth store
            authStore.updateProfilePicture(profilePicture.value);

            // Only set success message if everything worked
            successMessage.value = 'Avatar updated successfully!';

            // Wait a bit to show success message before closing the section
            setTimeout(() => {
              isChangingAvatar.value = false;
            }, 1500);
          } catch (storeError) {
            console.error('Error updating auth store:', storeError);
            errorMessage.value = 'Avatar updated but session not refreshed. Please log out and back in.';
          }
        } else {
          // Clear any potential success message
          successMessage.value = '';
          errorMessage.value = response.data.message || 'Failed to update avatar';
        }
      } catch (error: any) {
        // Clear any potential success message
        successMessage.value = '';
        errorMessage.value = error.response?.data?.message || 'An error occurred while updating your avatar';
      } finally {
        isLoading.value = false;
      }
    };

    const handleUpdatePassword = async () => {
      if (!isFormValid.value) {
        if (newPassword.value !== confirmNewPassword.value) {
          errorMessage.value = 'New passwords do not match';
        } else if (newPassword.value.length < 6) {
          errorMessage.value = 'Password must be at least 6 characters';
        }
        return;
      }

      errorMessage.value = '';
      successMessage.value = '';
      isLoading.value = true;

      try {
        const response = await axios.post(
          // local
          'http://localhost:8080/api/users/update-password',
          // deploy
          // 'https://dreamlab-ai.online/api/users/update-password',
          {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
            confirmNewPassword: confirmNewPassword.value
          },
          {
            withCredentials: true
          }
        );

        if (response.data.success) {
          successMessage.value = response.data.message || 'Password updated successfully!';
          // Clear form fields
          currentPassword.value = '';
          newPassword.value = '';
          confirmNewPassword.value = '';
        } else {
          errorMessage.value = response.data.message || 'Failed to update password. Please try again.';
        }
      } catch (error: any) {
        errorMessage.value = error.response?.data?.message || 'An error occurred. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      fetchUserProfile();
    });

    return {
      currentPassword,
      newPassword,
      confirmNewPassword,
      errorMessage,
      successMessage,
      isLoading,
      isFormValid,
      handleUpdatePassword,
      isAuthenticated,
      userDisplayName,
      userProfilePicture,
      mobileMenuOpen,
      toggleMobileMenu,
      logout,
      profilePicture,
      isChangingAvatar,
      originalProfilePicture,
      getAvatarSrc,
      formatDate,
      createdAt,
      cancelAvatarChange,
      saveAvatarChange
    };
  }
});
</script>

<style scoped>
.profile-container {
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

.profile-card {
  background-color: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(50, 50, 50, 0.5);
  border-radius: 8px;
  box-shadow:
    0 0 15px rgba(0, 150, 255, 0.2),
    0 0 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  padding: 2.5rem;
  width: 100%;
  max-width: 550px;
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
}

.profile-card::before {
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

/* User Info Section */
.user-info-section {
  display: flex;
  margin-bottom: 2rem;
  background-color: rgba(30, 30, 30, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(50, 50, 50, 0.6);
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 1.5rem;
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(0, 150, 255, 0.5);
  margin-bottom: 1rem;
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.3);
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  margin-top: 0.5rem;
}

.change-avatar-btn {
  background: linear-gradient(
    45deg,
    rgba(0, 100, 255, 0.5),
    rgba(0, 150, 255, 0.6)
  );
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.change-avatar-btn:hover {
  background: linear-gradient(
    45deg,
    rgba(0, 120, 255, 0.6),
    rgba(0, 170, 255, 0.7)
  );
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-label {
  font-size: 0.8rem;
  letter-spacing: 1.5px;
  color: rgba(160, 160, 160, 0.8);
  margin-bottom: 0.2rem;
}

.info-value {
  font-size: 1.2rem;
  color: rgba(0, 150, 255, 0.9);
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

/* Avatar Selection Section */
.avatar-selection-section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: rgba(30, 30, 30, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(50, 50, 50, 0.6);
}

.avatar-selection-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: rgba(240, 240, 240, 0.9);
  text-align: center;
}

.avatar-selection-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
  background: rgba(70, 70, 70, 0.7);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: rgba(90, 90, 90, 0.8);
}

.save-btn {
  background: linear-gradient(
    45deg,
    rgba(0, 180, 100, 0.7),
    rgba(0, 200, 120, 0.8)
  );
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.save-btn:hover {
  background: linear-gradient(
    45deg,
    rgba(0, 200, 120, 0.8),
    rgba(0, 220, 140, 0.9)
  );
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

/* Change Password Section */
.change-password-section {
  margin-top: 1.5rem;
}

.change-password-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: rgba(240, 240, 240, 0.9);
  text-shadow: 0 0 5px rgba(0, 150, 255, 0.3);
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

.success-message {
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  background-color: rgba(30, 200, 30, 0.1);
  border-left: 3px solid rgba(50, 255, 50, 0.7);
  color: rgba(100, 255, 100, 1);
  border-radius: 3px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(50, 200, 50, 0.8);
  color: white;
  font-weight: bold;
  margin-right: 10px;
}

/* Navbar with Avatars */
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
  align-items: center;
}

.user-with-avatar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(40, 40, 40, 0.4);
  padding: 0.2rem 0.5rem 0.2rem 0.2rem;
  border-radius: 50px;
  transition: all 0.3s;
}

.user-with-avatar:hover {
  background-color: rgba(40, 40, 40, 0.7);
}

.navbar-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(0, 150, 255, 0.5);
}

.mobile-navbar-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(0, 150, 255, 0.5);
}

.mobile-user-with-avatar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(50, 50, 50, 0.5);
  background-color: rgba(30, 30, 30, 0.5);
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

  .profile-card {
    margin: 2rem 1rem;
    padding: 1.5rem;
  }

  .user-info-section {
    flex-direction: column;
    align-items: center;
  }

  .user-avatar-section {
    margin-right: 0;
    margin-bottom: 1.5rem;
  }

  .user-details {
    text-align: center;
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
