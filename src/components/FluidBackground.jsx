import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { fullscreenVertex, simulationFragment, renderFragment } from '../utils/fluidShaders';
import '../styles/fluid-background.css';

// Résolution de la simulation par rapport à l'écran (le fluide est flou, 1/4 suffit)
const SIM_SCALE = 0.25;
const SIM_MAX_SIZE = 512;

// Couleurs reprises du fond CSS d'origine (valeurs sRGB 0-1)
const rgb = (r, g, b) => new THREE.Vector3(r / 255, g / 255, b / 255);
const COLORS = {
    base: rgb(242, 240, 239),  // --broken-white
    blue: rgb(220, 235, 255),
    pink: rgb(255, 220, 240),
    green: rgb(230, 255, 230),
};

/**
 * Fond plein écran : nuages pastel animés, déformés comme un fluide
 * au passage de la souris (ou du doigt sur mobile).
 */
const FluidBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // --- Renderer ---
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: false,
                alpha: false,
                powerPreference: 'low-power',
            });
        } catch (error) {
            // Pas de WebGL : on garde le fond CSS de secours
            console.warn('Fond interactif désactivé (WebGL indisponible) :', error);
            return;
        }

        // Le rendu est très doux : un pixel ratio de 1 suffit et économise le GPU
        renderer.setPixelRatio(1);
        container.appendChild(renderer.domElement);
        document.documentElement.classList.add('has-fluid-bg');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const geometry = new THREE.PlaneGeometry(2, 2);

        // --- Simulation (ping-pong entre deux render targets) ---
        const targetOptions = {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            depthBuffer: false,
            stencilBuffer: false,
        };
        let simRead = new THREE.WebGLRenderTarget(1, 1, targetOptions);
        let simWrite = new THREE.WebGLRenderTarget(1, 1, targetOptions);

        const simMaterial = new THREE.ShaderMaterial({
            vertexShader: fullscreenVertex,
            fragmentShader: simulationFragment,
            uniforms: {
                uPrev: { value: null },
                uTexel: { value: new THREE.Vector2() },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uMousePrev: { value: new THREE.Vector2(0.5, 0.5) },
                uMouseVel: { value: new THREE.Vector2() },
                uAspect: { value: 1 },
                uRadius: { value: 0.003 },
                uDt: { value: 1 / 60 },
                uVelDecay: { value: 0.975 },
                uDensDecay: { value: 0.965 },
            },
            depthTest: false,
            depthWrite: false,
        });
        const simScene = new THREE.Scene();
        simScene.add(new THREE.Mesh(geometry, simMaterial));

        // --- Rendu final ---
        const renderMaterial = new THREE.ShaderMaterial({
            vertexShader: fullscreenVertex,
            fragmentShader: renderFragment,
            uniforms: {
                uSim: { value: null },
                uResolution: { value: new THREE.Vector2() },
                uTime: { value: 0 },
                uBase: { value: COLORS.base },
                uBlue: { value: COLORS.blue },
                uPink: { value: COLORS.pink },
                uGreen: { value: COLORS.green },
            },
            depthTest: false,
            depthWrite: false,
        });
        const renderScene = new THREE.Scene();
        renderScene.add(new THREE.Mesh(geometry, renderMaterial));

        // Remise à zéro d'une render target (vitesse et densité nulles)
        const clearTarget = (target) => {
            renderer.setRenderTarget(target);
            renderer.setClearColor(0x000000, 0);
            renderer.clear();
            renderer.setRenderTarget(null);
        };

        // --- Redimensionnement ---
        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height, false);

            const simWidth = Math.max(32, Math.min(SIM_MAX_SIZE, Math.round(width * SIM_SCALE)));
            const simHeight = Math.max(32, Math.min(SIM_MAX_SIZE, Math.round(height * SIM_SCALE)));
            simRead.setSize(simWidth, simHeight);
            simWrite.setSize(simWidth, simHeight);
            clearTarget(simRead);
            clearTarget(simWrite);

            simMaterial.uniforms.uTexel.value.set(1 / simWidth, 1 / simHeight);
            simMaterial.uniforms.uAspect.value = width / height;
            renderMaterial.uniforms.uResolution.value.set(width, height);
        };
        resize();

        // --- Suivi de la souris / du doigt ---
        const pointer = {
            target: new THREE.Vector2(0.5, 0.5),  // dernière position reçue
            current: new THREE.Vector2(0.5, 0.5), // position utilisée à cette frame
            previous: new THREE.Vector2(0.5, 0.5),
            velocity: new THREE.Vector2(),
            hasPosition: false,
        };

        const onPointerMove = (event) => {
            const x = event.clientX / window.innerWidth;
            const y = 1 - event.clientY / window.innerHeight; // UV : y vers le haut
            pointer.target.set(x, y);

            // Premier mouvement : pas de "saut" depuis le centre de l'écran
            if (!pointer.hasPosition) {
                pointer.current.copy(pointer.target);
                pointer.previous.copy(pointer.target);
                pointer.hasPosition = true;
            }
        };

        // Quand la souris quitte la fenêtre, on oublie sa position
        const onPointerLeave = () => {
            pointer.hasPosition = false;
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onPointerLeave);
        window.addEventListener('resize', resize);

        // --- Boucle d'animation ---
        let lastTime = performance.now();
        const rawVelocity = new THREE.Vector2();
        let elapsed = 0;
        let animationId;

        const tick = () => {
            animationId = requestAnimationFrame(tick);

            // dt borné : évite les sauts après un changement d'onglet
            const now = performance.now();
            const dt = Math.min((now - lastTime) / 1000, 1 / 30);
            lastTime = now;
            if (!reduceMotion) elapsed += dt;

            // Vitesse de la souris (UV / s), lissée pour un mouvement fluide
            pointer.previous.copy(pointer.current);
            if (pointer.hasPosition) {
                rawVelocity.subVectors(pointer.target, pointer.previous).divideScalar(Math.max(dt, 1e-4));
                pointer.current.copy(pointer.target);
            } else {
                rawVelocity.set(0, 0);
            }
            pointer.velocity.lerp(rawVelocity, 0.35);
            if (pointer.velocity.length() > 4) pointer.velocity.setLength(4);

            // Passe de simulation
            const simUniforms = simMaterial.uniforms;
            simUniforms.uPrev.value = simRead.texture;
            simUniforms.uDt.value = dt;
            simUniforms.uMouse.value.copy(pointer.current);
            simUniforms.uMousePrev.value.copy(pointer.previous);
            simUniforms.uMouseVel.value.copy(pointer.velocity);

            renderer.setRenderTarget(simWrite);
            renderer.render(simScene, camera);
            renderer.setRenderTarget(null);

            // Échange des buffers ping-pong
            [simRead, simWrite] = [simWrite, simRead];

            // Passe de rendu
            renderMaterial.uniforms.uSim.value = simRead.texture;
            renderMaterial.uniforms.uTime.value = elapsed;
            renderer.render(renderScene, camera);
        };
        tick();

        // --- Cleanup ---
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('pointermove', onPointerMove);
            document.documentElement.removeEventListener('pointerleave', onPointerLeave);
            window.removeEventListener('resize', resize);
            document.documentElement.classList.remove('has-fluid-bg');

            simRead.dispose();
            simWrite.dispose();
            simMaterial.dispose();
            renderMaterial.dispose();
            geometry.dispose();
            renderer.dispose();

            if (renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className="fluid-background" aria-hidden="true" />;
};

export default FluidBackground;
