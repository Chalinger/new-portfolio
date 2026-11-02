// =============================================
// Shaders du fond interactif "fluide / nuage"
// =============================================

// Vertex shader commun : un simple quad plein écran
export const fullscreenVertex = /* glsl */ `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;

/**
 * Passe de simulation (ping-pong, basse résolution)
 * Texture stockée :
 *   rg = vitesse du fluide (en unités UV / seconde)
 *   b  = densité ("encre" laissée par la souris), utilisée pour la teinte
 */
export const simulationFragment = /* glsl */ `
    precision highp float;

    uniform sampler2D uPrev;
    uniform vec2 uTexel;        // 1 / résolution de la simulation
    uniform vec2 uMouse;        // position actuelle de la souris (UV)
    uniform vec2 uMousePrev;    // position à la frame précédente (UV)
    uniform vec2 uMouseVel;     // vitesse lissée de la souris (UV / s)
    uniform float uAspect;      // largeur / hauteur
    uniform float uRadius;      // rayon d'influence de la souris
    uniform float uDt;          // delta time (s)
    uniform float uVelDecay;    // dissipation de la vitesse (par frame à 60fps)
    uniform float uDensDecay;   // dissipation de la densité (par frame à 60fps)

    varying vec2 vUv;

    // Distance d'un point au segment [a, b] (en espace corrigé par l'aspect)
    float segmentDistance(vec2 p, vec2 a, vec2 b) {
        vec2 pa = p - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
        return length(pa - ba * h);
    }

    void main() {
        // --- Advection semi-lagrangienne : le fluide se transporte lui-même ---
        vec2 vel = texture2D(uPrev, vUv).xy;
        vec2 back = vUv - vel * uDt;

        // Légère diffusion : moyenne avec les voisins pour un rendu vaporeux
        vec4 center = texture2D(uPrev, back);
        vec4 around = (
            texture2D(uPrev, back + vec2(uTexel.x, 0.0)) +
            texture2D(uPrev, back - vec2(uTexel.x, 0.0)) +
            texture2D(uPrev, back + vec2(0.0, uTexel.y)) +
            texture2D(uPrev, back - vec2(0.0, uTexel.y))
        ) * 0.25;
        vec4 state = mix(center, around, 0.6);

        // Dissipation indépendante du framerate
        float frames = uDt * 60.0;
        state.xy *= pow(uVelDecay, frames);
        state.z  *= pow(uDensDecay, frames);

        // --- Injection de la souris le long de son trajet ---
        vec2 aspect = vec2(uAspect, 1.0);
        float d = segmentDistance(vUv * aspect, uMousePrev * aspect, uMouse * aspect);
        float falloff = exp(-(d * d) / uRadius);

        float speed = length(uMouseVel);
        float moving = smoothstep(0.0, 0.08, speed);

        // La vitesse du fluide tend vers celle de la souris sous le curseur
        state.xy = mix(state.xy, uMouseVel, falloff * moving * 0.18);
        state.z += falloff * moving * min(speed, 2.0) * 0.035;

        state.xy = clamp(state.xy, vec2(-3.0), vec2(3.0));
        state.z = clamp(state.z, 0.0, 1.5);

        gl_FragColor = vec4(state.xyz, 1.0);
    }
`;

/**
 * Passe de rendu : nuages pastel (fbm + domain warping)
 * déformés par le champ de vitesse de la simulation
 */
export const renderFragment = /* glsl */ `
    precision highp float;

    uniform sampler2D uSim;
    uniform vec2 uResolution;
    uniform float uTime;

    uniform vec3 uBase;   // blanc cassé
    uniform vec3 uBlue;
    uniform vec3 uPink;
    uniform vec3 uGreen;

    varying vec2 vUv;

    // --- Simplex noise 2D (Ashima Arts / Stefan Gustavson, licence MIT) ---
    vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x  = a0.x  * x0.x   + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    // Fractional Brownian Motion : superposition d'octaves de bruit
    // 3 octaves à gain faible : formes larges et douces, peu de détails fins
    float fbm(vec2 p) {
        float value = 0.0;
        float amp = 0.55;
        mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
        for (int i = 0; i < 3; i++) {
            value += amp * snoise(p);
            p = rot * p * 1.9;
            amp *= 0.42;
        }
        return value;
    }

    // Masque doux et circulaire en espace UV (comme les radial-gradient CSS d'origine)
    float blob(vec2 uv, vec2 center, float radius) {
        return smoothstep(radius, 0.0, length(uv - center));
    }

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec4 sim = texture2D(uSim, vUv);
        vec2 vel = sim.xy;
        float density = sim.z;

        float aspect = uResolution.x / uResolution.y;

        // Les UV sont poussées par le fluide : c'est ce qui "déforme" le nuage
        vec2 uv = vUv - vel * 0.025;
        vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 0.85;
        float t = uTime * 0.03;

        // Domain warping : on déforme le bruit par du bruit pour un aspect nuageux
        vec2 q = vec2(
            fbm(p + vec2(0.0, t)),
            fbm(p + vec2(5.2, 1.3) - t * 0.8)
        );
        vec2 r = vec2(
            fbm(p + 0.9 * q + vec2(1.7, 9.2) + t * 0.6 + vel * 0.3),
            fbm(p + 0.9 * q + vec2(8.3, 2.8) - t * 0.5 - vel * 0.3)
        );
        float n = fbm(p * 1.3 + 0.9 * r);
        float cloud = smoothstep(-0.5, 0.55, n);

        // UV déformées utilisées pour placer les grandes zones de couleur
        vec2 w = uv + r * 0.16;

        // --- Composition reprenant le fond CSS d'origine ---
        vec3 col = uBase;

        // Diagonale 135° : bleu en haut à gauche, rose en bas à droite
        float diag = (w.x + (1.0 - w.y)) * 0.5;
        col = mix(col, uBlue, smoothstep(0.55, 0.0, diag) * 0.5);
        col = mix(col, uPink, smoothstep(0.45, 1.0, diag) * 0.5);

        // Trois nappes de couleur modulées par le nuage
        float mGreen = blob(w, vec2(0.5, 0.5), 0.5);
        float mBlue  = blob(w, vec2(0.2, 0.7), 0.55);
        float mPink  = blob(w, vec2(0.8, 0.3), 0.55);

        col = mix(col, uGreen, mGreen * 0.7  * (0.45 + 0.55 * cloud));
        col = mix(col, uBlue,  mBlue  * 0.85 * (0.45 + 0.55 * smoothstep(-0.4, 0.5, q.x)));
        col = mix(col, uPink,  mPink  * 0.85 * (0.45 + 0.55 * smoothstep(-0.4, 0.5, q.y)));

        // Relief du nuage : volutes plus claires, creux très légèrement ombrés
        col = mix(col, vec3(1.0), smoothstep(0.45, 1.0, cloud) * 0.3);
        col -= smoothstep(0.35, 0.0, cloud) * 0.025;

        // --- Trace de la souris : léger reflet irisé pastel ---
        float glow = smoothstep(0.0, 0.8, density);
        vec3 iri = 0.5 + 0.5 * cos(6.28318 * (n * 0.8 + vec3(0.0, 0.33, 0.67)) + uTime * 0.25);
        vec3 pastel = iri * 0.2 + 0.8;
        col = mix(col, pastel, glow * 0.06);

        // Grain très fin pour éviter le banding des dégradés
        col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.012;

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
`;
