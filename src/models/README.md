# 3D Models

Place your 3D model files here (GLTF, GLB, OBJ, etc.)

## Supported Formats
- `.glb` / `.gltf` - Recommended (binary/text formats)
- `.obj` / `.mtl`
- `.fbx` - Requires FBXLoader

## Usage

To load a model in your scene, use the `loadModel` function from `src/utils/threeSetup.js`:

```jsx
import { loadModel } from '../utils/threeSetup';

const handleLoadModel = async () => {
    const model = await loadModel('/models/your-model.glb', scene);
};
```

Or directly in the `threeSetup.js` initialization:

```javascript
const gltf = await loadModel('/models/your-model.glb', scene);
gltf.scene.scale.set(1, 1, 1);
```

## Resources
- Three.js Loaders: https://threejs.org/docs/#manual/en/introduction/Loading-3D-models
- Free Models: Sketchfab, TurboSquid, CGTrader
