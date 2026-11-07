import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { initializeScene, animateScene, handleWindowResize, loadModel, disposeModel } from '../utils/threeSetup';

// Import data
import { SKILLS } from '../data/skills';

// --- Forme de l'orbite (unités Three.js) ---
const ORBIT_RADIUS = 3.6;
// Inclinaison de l'anneau vers la caméra (vu légèrement du dessus) puis bascule latérale
const ORBIT_TILT = 0.24;
const ORBIT_ROLL = 0.05;
// Remonte l'orbite : les logos de devant, plus proches, paraissent plus grands et plus bas
const ORBIT_OFFSET_Y = 0.35;
// Taille de la plus grande dimension (largeur ou hauteur) de chaque logo une fois normalisé
const LOGO_SIZE = 0.75;

// --- Animation ---
const ORBIT_SPEED = 0.15; // rad/s
// Léger balancement de chaque logo sur lui-même pour laisser voir son volume
const SWAY_ANGLE = 0.35; // rad
const SWAY_SPEED = 0.8; // rad/s

// --- Caméra ---
// FOV serré et caméra éloignée : perspective modérée entre les logos de devant et du fond
const CAMERA_FOV = 20;
const CAMERA_DISTANCE = 11;

// Anneau elliptique sur lequel tournent les logos
const createRing = () => {
    const points = new THREE.EllipseCurve(0, 0, ORBIT_RADIUS, ORBIT_RADIUS)
        .getPoints(128)
        // La courbe est tracée dans le plan XY : on la couche dans le plan XZ de l'orbite
        .map(({ x, y }) => new THREE.Vector3(x, 0, y));

    return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0x161616, transparent: true, opacity: 0.2 }),
    );
};

// Retire les meshes indésirables, oriente le logo face caméra
// puis le centre à l'origine à taille fixe, quelle que soit son échelle dans le fichier
const prepareLogo = (model, { rotationY, exclude = [] }) => {
    const excluded = [];
    model.traverse((child) => {
        if (child.isMesh && exclude.includes(child.name)) excluded.push(child);
    });
    excluded.forEach((mesh) => {
        mesh.removeFromParent();
        disposeModel(mesh);
    });

    // Mesure faite hors de l'ancre : la boîte doit être calculée dans le repère du logo,
    // sans la position ni la rotation de l'orbite
    const anchor = model.parent;
    model.removeFromParent();
    model.rotation.y = rotationY;
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = LOGO_SIZE / Math.max(size.x, size.y);

    model.scale.setScalar(scale);
    model.position.copy(center).multiplyScalar(-scale);
    anchor.add(model);
};

// Orbite 3D des compétences : les logos tournent sur un anneau incliné en restant face à la caméra
const SkillsOrbit = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const models = [];
        let cancelled = false;

        // --- Scène, caméra, renderer et lumières (configuration partagée) ---
        const { scene, camera, renderer } = initializeScene(container);
        camera.fov = CAMERA_FOV;
        camera.position.set(0, 0, CAMERA_DISTANCE);
        camera.updateProjectionMatrix();

        // --- Orbite : inclinaison fixe > rotation animée > ancres des logos ---
        const tilt = new THREE.Group();
        tilt.rotation.set(ORBIT_TILT, 0, ORBIT_ROLL);
        tilt.position.y = ORBIT_OFFSET_Y;
        scene.add(tilt);

        const spin = new THREE.Group();
        tilt.add(spin);

        const ring = createRing();
        spin.add(ring);

        // Une ancre par logo, réparties à intervalles réguliers sur l'anneau
        const anchors = SKILLS.map((_, index) => {
            const angle = (index / SKILLS.length) * Math.PI * 2;
            const anchor = new THREE.Group();
            anchor.position.set(Math.sin(angle) * ORBIT_RADIUS, 0, Math.cos(angle) * ORBIT_RADIUS);
            spin.add(anchor);
            return anchor;
        });

        // --- Chargement des logos ---
        SKILLS.forEach((skill, index) => {
            loadModel(skill.src, anchors[index])
                .then((gltf) => {
                    const model = gltf.scene;

                    // Le composant a été démonté pendant le chargement
                    if (cancelled) {
                        disposeModel(model);
                        return;
                    }

                    prepareLogo(model, skill);
                    models.push(model);
                })
                .catch((error) => console.error(`Erreur lors du chargement du logo ${skill.label} :`, error));
        });

        // --- Animation ---
        // Mouvement réduit : l'orbite reste figée
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timer = new THREE.Timer();
        // Onglet masqué : le temps est mis en pause (pas de saut de l'orbite au retour)
        timer.connect(document);
        const counterRotation = new THREE.Quaternion();
        const sway = new THREE.Quaternion();
        const yAxis = new THREE.Vector3(0, 1, 0);

        const updateOrbit = () => {
            timer.update();
            const elapsed = reduceMotion ? 0 : timer.getElapsed();
            spin.rotation.y = elapsed * ORBIT_SPEED;

            // Annule la rotation de l'orbite : chaque logo reste droit et face à la caméra
            counterRotation.copy(tilt.quaternion).multiply(spin.quaternion).invert();

            anchors.forEach((anchor, index) => {
                // Balancement décalé d'un logo à l'autre
                sway.setFromAxisAngle(yAxis, Math.sin(elapsed * SWAY_SPEED + index) * SWAY_ANGLE);
                anchor.quaternion.copy(counterRotation).multiply(sway);
            });
        };

        const animation = animateScene(scene, camera, renderer, updateOrbit);

        const handleResize = () => handleWindowResize(camera, renderer);
        window.addEventListener('resize', handleResize);

        // --- Cleanup ---
        return () => {
            cancelled = true;
            window.removeEventListener('resize', handleResize);
            animation.stop();
            timer.dispose();
            models.forEach(disposeModel);
            ring.geometry.dispose();
            ring.material.dispose();
            container.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="skills-orbit"
            role="img"
            aria-label={`Compétences : ${SKILLS.map(({ label }) => label).join(', ')}`}
        />
    );
};

export default SkillsOrbit;
