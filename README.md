# Dream Lab — Frontend

Dream Lab is a community-driven AI image generation platform. This is the frontend repo built with Vue.js and TypeScript, offering a smooth and interactive interface for users to create and share AI-generated images.

<p align="center">
  <img src="![0406](https://github.com/user-attachments/assets/42a04200-761a-4714-9495-eec24b5b3dfd)" alt="Dream Lab Preview" />
</p>

## 🚀 Features

- 🧠 **AI Image Generation**
  - Prompt-based image generation
  - Style customization (Photorealistic, Oil Painting, Anime, etc.)
  - Aspect ratio selection

- 🖼 **Image Management**
  - Personal dashboard to manage your creations
  - Image download functionality
  - Uploads stored securely with metadata

- 🫂 **Community Gallery**
  - Public gallery for discovering AI art
  - Like feature to show appreciation
  - Share creations with the world

- 👤 **User Management**
  - Registration, login, and secure authentication
  - Password changing
  - Profile picture selection

## 🔧 Tech Stack

- ⚙️ Framework: Vue.js 3
- 💬 Language: TypeScript
- 🧠 State Management: Pinia
- 🌐 Styling: CSS3 

## 📁 Folder Structure

```bash
src/
├── assets/        # Static assets like images or icons
├── components/    # Reusable Vue components
├── router/        # Vue Router config
├── stores/        # Pinia stores for global state
├── types/         # TypeScript type definitions
├── views/         # Route-based Vue pages
├── App.vue        # Main Vue app wrapper
└── main.ts        # App entry point
```

## 🧑‍💻 Developer Contributions

- **Pitipat**: Project management, landing page, login & register page, deployment
- **Pawin**: Image generation page, user management system
- **Szuchihsu**: Gallery, dashboard, AWS S3 integration

## 🔗 Backend
Connects to dreamlab-backend for authentication, image services, and gallery APIs.

## 🛠 Project Setup

```bash
npm install
npm run dev
```

### Compile and Minify for Production

```bash
npm run build
```
