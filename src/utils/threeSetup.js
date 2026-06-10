import * as THREE from 'three';

// Import statique du GLTFLoader : évite de recréer le loader à chaque appel de loadModel
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Instance unique du loader, partagée entre tous les appels
const gltfLoader = new GLTFLoader();

/**
 * Initialise la scène Three.js : caméra, renderer, lumières
 * @param {HTMLElement} container - L'élément DOM dans lequel on injecte le canvas
 * @returns {{ scene, camera, renderer }}
 */
export const initializeScene = (container) => {
    // --- Scène ---
    const scene = new THREE.Scene();
    scene.background = null; // Fond transparent (le CSS gère le visuel derrière)

    // --- Caméra ---
    const width = container.clientWidth;
    const height = container.clientHeight;

    // FOV réduit à 50° (moins de déformation que 75° pour un petit objet centré)
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5; // Distance ajustée en cohérence avec le FOV

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
        // antialias actif seulement si le pixel ratio est bas (sinon le x2 suffit)
        antialias: window.devicePixelRatio < 2,
        alpha: true, // Permet la transparence du fond
    });
    renderer.setSize(width, height);

    // Pixel ratio capé à 2 : au-delà (écrans x3, x4) le gain visuel est nul
    // mais le coût GPU est multiplié par 9 ou 16
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setClearColor(0x000000, 0); // Fond entièrement transparent
    container.appendChild(renderer.domElement);

    // --- Lumières ---

    // Lumière ambiante : éclaire tout uniformément, pas d'ombres
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Lumière principale (key light) : vient du dessus-avant, crée le volume
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 2, 5);
    scene.add(directionalLight);

    // Lumière de remplissage (fill light) : adoucit les ombres côté opposé
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(0, -1, -3);
    scene.add(fillLight);

    return { scene, camera, renderer };
};

/**
 * Boucle d'animation principale
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {THREE.WebGLRenderer} renderer
 * @returns {{ stop: Function }} - Objet avec une méthode stop() pour arrêter la boucle
 */
export const animateScene = (scene, camera, renderer) => {
    let animationId; // On stocke l'ID pour pouvoir annuler la boucle

    const animate = () => {
        animationId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate(); // Premier appel pour démarrer la boucle

    // On retourne un objet { stop() } plutôt que l'ID brut :
    // c'est plus lisible et évite le bug où animate() retournait undefined
    return {
        stop: () => cancelAnimationFrame(animationId),
    };
};

/**
 * Met à jour la caméra et le renderer lors d'un redimensionnement de la fenêtre
 * @param {THREE.Camera} camera
 * @param {THREE.WebGLRenderer} renderer
 */
export const handleWindowResize = (camera, renderer) => {
    const container = renderer.domElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Mise à jour du ratio d'aspect de la caméra
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Mise à jour de la taille du renderer
    renderer.setSize(width, height);
};

/**
 * Charge un modèle GLTF/GLB et l'ajoute à la scène
 * @param {string} modelPath - Chemin vers le fichier .glb
 * @param {THREE.Scene} scene
 * @returns {Promise<Object>} - L'objet GLTF complet (gltf.scene contient le modèle 3D)
 */
export const loadModel = async (modelPath, scene) => {
    // loader est maintenant une instance partagée définie en haut du fichier
    const gltf = await gltfLoader.loadAsync(modelPath);
    scene.add(gltf.scene);
    return gltf;
};

/**
 * Libère la mémoire GPU occupée par un modèle 3D
 * À appeler au cleanup du composant pour éviter les fuites mémoire,
 * notamment si le composant se monte/démonte plusieurs fois (SPA, navigation)
 * @param {THREE.Object3D} object - La scène ou le groupe à disposer
 */
export const disposeModel = (object) => {
    object.traverse((child) => {
        if (!child.isMesh) return; // On s'intéresse uniquement aux Mesh

        // Libération de la géométrie (vertices, UVs, normales...)
        child.geometry.dispose();

        // Un mesh peut avoir un seul matériau ou un tableau de matériaux
        const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

        materials.forEach((material) => {
            // Libération de toutes les textures du matériau
            material.map?.dispose();
            material.normalMap?.dispose();
            material.roughnessMap?.dispose();
            material.metalnessMap?.dispose();
            material.aoMap?.dispose();
            material.emissiveMap?.dispose();

            // Libération du matériau lui-même
            material.dispose();
        });
    });
};