import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { initializeScene, animateScene, handleWindowResize, loadModel, disposeModel } from '../utils/threeSetup';

// Taille (unités Three.js) de la plus grande dimension du modèle une fois normalisé
const MODEL_SIZE = 2;

// Scène 3D interactive : glisser pour tourner autour du modèle, molette pour zoomer
const ModelViewer = ({ src }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        let model = null;
        let cancelled = false;

        // --- Scène, caméra, renderer et lumières (configuration partagée) ---
        const { scene, camera, renderer } = initializeScene(container);

        // --- Contrôles orbitaux ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 2.5;
        controls.maxDistance = 10;

        // Rotation automatique jusqu'à la première interaction
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;
        const stopAutoRotate = () => { controls.autoRotate = false; };
        controls.addEventListener('start', stopAutoRotate);

        // --- Chargement du modèle ---
        loadModel(src, scene)
            .then((gltf) => {
                model = gltf.scene;

                // Le composant a été démonté pendant le chargement
                if (cancelled) {
                    disposeModel(model);
                    return;
                }

                // Normalisation : modèle centré à l'origine et à taille fixe,
                // quelle que soit son échelle dans le fichier
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const scale = MODEL_SIZE / Math.max(size.x, size.y, size.z);

                model.scale.setScalar(scale);
                model.position.copy(center).multiplyScalar(-scale);
            })
            .catch((error) => console.error('Erreur lors du chargement du modèle :', error));

        // --- Boucle de rendu (update des contrôles pour l'inertie) ---
        const animation = animateScene(scene, camera, renderer, () => controls.update());

        const handleResize = () => handleWindowResize(camera, renderer);
        window.addEventListener('resize', handleResize);

        // --- Cleanup ---
        return () => {
            cancelled = true;
            window.removeEventListener('resize', handleResize);
            animation.stop();
            controls.removeEventListener('start', stopAutoRotate);
            controls.dispose();
            if (model) disposeModel(model);
            container.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [src]);

    return <div ref={containerRef} className="model-viewer"></div>;
};

export default ModelViewer;
