# 🚀 AR Space Placer

A beginner-friendly Augmented Reality (AR) mobile application built using **React Native**, **Expo Development Clients**, and **ViroReact** (`@reactvision/react-viro`). This app allows users to scan real-world environments, detect flat horizontal surfaces (planes), and tap to place fixed, realistic 3D objects (Cubes, Spheres, or Chairs) in physical space.

---

## 📂 Project Structure

```
viro-ar-app/
├── package.json               # Project scripts and library dependencies
├── app.json                   # Expo configs & Viro Config Plugin integrations
├── App.js                     # Root layout, Camera permissions, UI overlays & Navigator
├── metro.config.js            # Extends Metro to bundle 3D file formats (.glb, .gltf, .obj)
└── src/
    ├── assets/
    │   ├── models/            # 3D assets (e.g., chair.glb)
    │   └── styles/
    │       └── theme.js       # Color tokens, shadows, and design guidelines
    ├── components/
    │   ├── ARScene.js         # Core ViroARScene rendering 3D models and detected planes
    │   ├── ObjectSelector.js  # Sleek bottom object choice panel
    │   ├── StatusBar.js       # Top bar signaling scanning and tracking status
    │   └── ControlButtons.js  # Quick-action floaters (e.g. Clear Scene)
    └── utils/
        └── modelLoader.js     # Helper organizing PBR materials and model scale configurations
```

---

## 🛠️ Prerequisites & Setup

Augmented Reality utilizes camera feeds and physical hardware sensors (gyroscope, accelerometer, magnetometer). Because of this:
*   **Physical Device Required**: You **cannot** test AR features on standard iOS Simulators or Android Emulators. You must use a physical device.
    *   **Android**: Must support **Google Play Services for AR** (ARCore).
    *   **iOS**: Must be an iPhone 6s or newer (ARKit compatible).

### 1. Installation

Clone this repository or move to this directory, then run:

```bash
npm install
```

### 2. Configure Native Code (Prebuild)

Since ViroReact utilizes custom C++ rendering engines, it cannot be run inside the standard Expo Go client app. You must compile a custom **Development Build**.

Generate the `/android` and `/ios` directories using Expo Prebuild:

```bash
npx expo prebuild
```

### 3. Running the App on Devices

Ensure your physical phone is connected via USB debugging (Android) or set up in Xcode (iOS).

*   **For Android**:
    ```bash
    npx expo run:android
    ```
*   **For iOS**:
    ```bash
    npx expo run:ios
    ```

---

## 📦 Suggestions for Free 3D Model Resources

When importing custom models into your AR application, you should look for the `.glb` (binary GLTF) or `.gltf` formats. Here are excellent platforms to acquire free assets:

1.  **Sketchfab** ([sketchfab.com](https://sketchfab.com)): The largest library of 3D models. Filter searches by selecting "Downloadable" and "Creative Commons".
2.  **Poly Pizza** ([poly.pizza](https://poly.pizza)): A great repository of low-poly, lightweight models that are perfect for mobile AR performance.
3.  **CGTrader** ([cgtrader.com](https://www.cgtrader.com)): Offers a filter for free models. Verify that the file format is `.glb` or `.gltf`.
4.  **Google Poly Archives**: Archives of Google's low-poly models (available on sites like [poly.google.com](https://poly.google.com) mirroring services).

> [!TIP]
> Always place downloaded files under `src/assets/models/` and name them consistently (e.g., `chair.glb`). Make sure they match the name required in [modelLoader.js](file:///D:/viro-ar-app/src/utils/modelLoader.js).

---

## ⚡ Basic AR Performance Optimization Tips

To maintain a fluid 60 FPS on mobile devices:

*   **Low Polygon Count**: Keep models under **10,000 polygons** (triangles). High-poly models will cause frame rate drops and overheat the mobile GPU.
*   **Texture Dimensions**: Limit texture resolutions to **1024x1024** or **2048x2048** pixels maximum. Mobile devices don't need 4K textures, which saturate memory.
*   **PBR Materials**: Use PBR (Physically Based Rendering) lighting model wisely. If you notice frame drops, switch components to Blinn or Lambert lighting models (configured in `modelLoader.js`).
*   **Light Count**: Restrict your active lights. One `<ViroAmbientLight>` and one `<ViroDirectionalLight>` (for shadows) is usually optimal. Avoid adding multiple directional lights or spot lights.

---

## 👥 Collaborative Git/GitHub Workflow

If you are working in a team of two:

### Person 1 (Main Development) Workflow
1. Initialize the git repository and make the initial commit:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of AR application foundation"
   ```
2. Create a GitHub Repository and push the code.
3. Create feature branches for improvements (e.g., `feature/plane-detection-refinement`).

### Person 2 (Support & Assets) Workflow
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Find, resize, and optimize models (e.g., using Blender to compress/decimate models).
3. Create a branch: `git checkout -b feature/optimize-chair-model`.
4. Place the optimized `chair.glb` into `src/assets/models/` and commit the changes.
5. Push the branch and open a **Pull Request** on GitHub for Person 1 to review and merge.

### Crucial Git Note for React Native/Expo
Always ensure your `.gitignore` includes the following files to prevent uploading gigabytes of compiled files to GitHub:
```
node_modules/
.expo/
android/
ios/
*.log
```
*(Run `npx expo prebuild` locally on each collaborator's machine; do not commit the native `android` and `ios` folders to git unless you are using a bare workflow layout).*
