// Import modèles 3D (?url : Vite renvoie l'URL du fichier, chargé ensuite par le GLTFLoader)
import wordpressModel from '/src/assets/skill-logo-glb/logo-WordPress.glb?url';
import figmaModel from '/src/assets/skill-logo-glb/logo-Figma.glb?url';
import adobeModel from '/src/assets/skill-logo-glb/logo-Adobe.glb?url';
import reactModel from '/src/assets/skill-logo-glb/logo-React.glb?url';
import htmlModel from '/src/assets/skill-logo-glb/logo-HTML.glb?url';
import cssModel from '/src/assets/skill-logo-glb/logo-CSS.glb?url';
import javascriptModel from '/src/assets/skill-logo-glb/logo-JavaScript.glb?url';
import githubModel from '/src/assets/skill-logo-glb/logo-Github.glb?url';
import claudeModel from '/src/assets/skill-logo-glb/claude.glb?url';

// Les modèles n'ont pas tous la même orientation dans leur fichier
const FACING_X = -Math.PI / 2; // Face avant vers +X : quart de tour pour la tourner vers la caméra
const FACING_Z = 0; // Face avant déjà vers la caméra

// Compétences affichées sur l'orbite, dans l'ordre de placement autour de l'anneau
// - rotationY : remet la face avant du logo vers la caméra
// - exclude : meshes à retirer du modèle (ex. fond de rendu laissé dans le fichier)
export const SKILLS = [
    { id: 'wordpress', label: 'WordPress', src: wordpressModel, rotationY: FACING_X, exclude: ['Plane'] },
    { id: 'figma', label: 'Figma', src: figmaModel, rotationY: FACING_X },
    { id: 'adobe', label: 'Adobe', src: adobeModel, rotationY: FACING_Z },
    { id: 'react', label: 'React', src: reactModel, rotationY: FACING_X },
    { id: 'html', label: 'HTML', src: htmlModel, rotationY: FACING_X },
    { id: 'css', label: 'CSS', src: cssModel, rotationY: FACING_X },
    { id: 'javascript', label: 'JavaScript', src: javascriptModel, rotationY: FACING_X },
    { id: 'github', label: 'GitHub', src: githubModel, rotationY: FACING_X, exclude: ['Plane'] },
    { id: 'claude', label: 'Claude', src: claudeModel, rotationY: FACING_Z },
];
