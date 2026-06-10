import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { initializeScene, animateScene, handleWindowResize, loadModel, disposeModel } from '../utils/threeSetup';
import '../styles/three.css';

const ThreeScene = () => {
    const containerRef = useRef(null);

    // On stocke toutes les refs Three.js ici pour pouvoir y accéder au cleanup
    const sceneRef = useRef({
        scene: null,
        camera: null,
        renderer: null,
        animation: null, // Objet { stop() } retourné par animateScene
        model: null,     // Référence au modèle chargé, pour le disposal
        timeline: null,  // Timeline GSAP d'intro, pour la killer au démontage
        idleAnimation: null, // Tween GSAP de l'animation infinie, séparé de l'intro
    });

    useEffect(() => {
        if (!containerRef.current) return;

        // --- Initialisation de la scène Three.js ---
        const { scene, camera, renderer } = initializeScene(containerRef.current);
        sceneRef.current.scene = scene;
        sceneRef.current.camera = camera;
        sceneRef.current.renderer = renderer;

        // --- Chargement du modèle GLB ---
        const loadModelAsync = async () => {
            try {
                const modelPath = new URL('/favicon-3d.glb', import.meta.url).href.replace(import.meta.url, import.meta.env.BASE_URL);
                const gltf = await loadModel(import.meta.env.BASE_URL + 'favicon-3d.glb', scene);

                if (gltf.scene) {
                    // On stocke le modèle pour pouvoir le disposer au cleanup
                    sceneRef.current.model = gltf.scene;

                    // Point de départ : modèle invisible (scale à 0)
                    gltf.scene.scale.set(0, 0, 0);

                    // --- ANIMATION D'INTRO ---
                    // Timeline qui joue une seule fois au chargement
                    const timeline = gsap.timeline({
                        // Une fois l'intro terminée, on démarre l'animation idle
                        onComplete: () => startIdleAnimation(gltf.scene),
                    });
                    sceneRef.current.timeline = timeline;

                    // Apparition du modèle (scale 0 → 0.5)
                    timeline.to(gltf.scene.scale, {
                        x: 0.18,
                        y: 0.18,
                        z: 0.18,
                        duration: 1.5,
                        ease: 'back.out',
                    });

                    // Rotation d'entrée en parallèle (démarre en même temps grâce à la position 0)
                    timeline.to(gltf.scene.rotation, {
                        y: Math.PI * 1.5,
                        duration: 2,
                        ease: 'power1.inOut',
                    }, 0);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du modèle :', error);
            }
        };

        // --- ANIMATION IDLE INFINIE ---
        // Démarre juste après la fin de l'intro (appelée via onComplete ci-dessus)
        const startIdleAnimation = (model) => {
            // On récupère la rotation finale de l'intro comme point de départ de l'idle
            // pour éviter un saut brusque entre les deux animations
            const baseY = model.rotation.y;

            // Oscillation sur Y : leger balancement gauche/droite (~20°)
            // yoyo: true = l'animation fait l'aller puis revient automatiquement
            // repeat: -1 = boucle infinie
            const tweenY = gsap.to(model.rotation, {
                y: baseY + Math.PI * 0.11, // ~20° de rotation max
                duration: 3.5,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });

            // Oscillation sur X : très légère inclinaison haut/bas (~8°)
            // Durée différente de Y (4.2s vs 3.5s) pour éviter un mouvement
            // trop mécanique/répétitif — les deux axes se désynchronisent naturellement
            const tweenX = gsap.to(model.rotation, {
                x: Math.PI * 0.045, // ~8° d'inclinaison verticale max
                duration: 4.2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });

            // On stocke les deux tweens dans un seul objet pour pouvoir les killer au cleanup
            sceneRef.current.idleAnimation = { tweenX, tweenY };
        };

        loadModelAsync();

        // --- Écouteur de redimensionnement ---
        const handleResize = () => handleWindowResize(
            sceneRef.current.camera,
            sceneRef.current.renderer
        );
        window.addEventListener('resize', handleResize);

        // --- Démarrage de la boucle de rendu Three.js ---
        sceneRef.current.animation = animateScene(scene, camera, renderer);

        // --- Cleanup au démontage du composant ---
        return () => {
            window.removeEventListener('resize', handleResize);

            // Arrêt de la boucle de rendu
            sceneRef.current.animation?.stop();

            // Kill de la timeline d'intro
            sceneRef.current.timeline?.kill();

            // Kill des deux tweens de l'animation idle
            sceneRef.current.idleAnimation?.tweenY?.kill();
            sceneRef.current.idleAnimation?.tweenX?.kill();

            // Libération mémoire GPU
            if (sceneRef.current.model) {
                disposeModel(sceneRef.current.model);
            }

            // Suppression du canvas du DOM + dispose du renderer
            const renderer = sceneRef.current.renderer;
            if (renderer) {
                if (
                    containerRef.current &&
                    renderer.domElement.parentNode === containerRef.current
                ) {
                    containerRef.current.removeChild(renderer.domElement);
                }
                renderer.dispose();
            }
        };
    }, []);

    return <div ref={containerRef} className="three-scene-container"></div>;
};

export default ThreeScene;