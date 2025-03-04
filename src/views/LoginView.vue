<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Login</h1>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="Enter your username"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Enter your password"
          />
        </div>
        <div class="form-group">
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'LoginView',
  setup() {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const isLoading = ref(false);
    const router = useRouter();
    const authStore = useAuthStore();

    const handleLogin = async () => {
      errorMessage.value = '';
      isLoading.value = true;

      try {
        const result = await authStore.login(username.value, password.value);
        if (result.success) {
          router.push('/dashboard');
        } else {
          errorMessage.value = result.message || 'Login failed. Please try again.';
        }
      } catch (error) {
        errorMessage.value = error.message || 'An error occurred. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      username,
      password,
      errorMessage,
      isLoading,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  text-align: center;
}
</style>
