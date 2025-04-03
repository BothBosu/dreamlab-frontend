<template>
  <div class="profile-picture-selector">
    <h3 class="selector-label">{{ label }}</h3>

    <div class="avatars-container">
      <div
        v-for="avatar in avatars"
        :key="avatar"
        class="avatar-item"
        :class="{ 'selected': selectedAvatar === avatar }"
        @click="selectAvatar(avatar)"
      >
        <img :src="getAvatarSrc(avatar)" :alt="`Avatar ${avatar}`" class="avatar-image" />
        <div class="selection-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'ProfilePictureSelector',
  props: {
    label: {
      type: String,
      default: 'Select Profile Picture'
    },
    value: {
      type: String,
      default: ''
    }
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const avatars = ref(['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png', 'avatar6.png', 'avatar7.png', 'avatar8.png']);
    const selectedAvatar = ref(props.value || 'avatar1.png');

    const fetchAvatars = async () => {
      try {
        const response = await axios.get('/api/users/profile-pictures');
        if (response.data.success && response.data.profilePictures) {
          avatars.value = response.data.profilePictures;
        }
      } catch (error) {
        console.error('Failed to fetch avatar options:', error);
      }
    };

    const selectAvatar = (avatar: string) => {
      selectedAvatar.value = avatar;
      emit('update:value', avatar);
    };

    const getAvatarSrc = (avatar: string) => {
      return `/assets/avatars/${avatar}`;
    };

    // Watch for external value changes
    watch(() => props.value, (newValue) => {
      if (newValue && newValue !== selectedAvatar.value) {
        selectedAvatar.value = newValue;
      }
    });

    onMounted(() => {
      fetchAvatars();

      // If no value was provided, emit the default selection
      if (!props.value) {
        emit('update:value', selectedAvatar.value);
      }
    });

    return {
      avatars,
      selectedAvatar,
      selectAvatar,
      getAvatarSrc
    };
  }
});
</script>

<style scoped>
.profile-picture-selector {
  margin-bottom: 1.5rem;
}

.selector-label {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  letter-spacing: 1px;
  color: rgba(200, 200, 200, 0.8);
}

.avatars-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.avatar-item {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.avatar-item:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.3);
}

.avatar-item.selected {
  border-color: rgba(0, 150, 255, 0.9);
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.5);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selection-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: transparent;
  transition: background-color 0.3s;
}

.avatar-item.selected .selection-indicator {
  background-color: rgba(0, 150, 255, 0.9);
}

@media (max-width: 768px) {
  .avatars-container {
    gap: 0.5rem;
  }

  .avatar-item {
    width: 48px;
    height: 48px;
  }
}
</style>
