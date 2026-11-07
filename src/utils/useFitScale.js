import { useLayoutEffect, useRef, useState } from 'react';

// Espace minimal (px) entre un panneau et les bords haut/bas de l'écran
const PANEL_MARGIN = 32;

// Réduit un panneau fixe pour qu'il tienne toujours en entier dans l'écran (pas de scroll).
// Recalculé au redimensionnement de la fenêtre et quand la hauteur du panneau change
// (ex. chargement de la police qui modifie le retour à la ligne d'un texte).
// offsetHeight ignore le scale appliqué : on mesure toujours la taille réelle.
export const useFitScale = () => {
    const ref = useRef(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const panel = ref.current;

        const updateScale = () => {
            const available = window.innerHeight - PANEL_MARGIN * 2;
            setScale(Math.min(1, available / panel.offsetHeight));
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        const observer = new ResizeObserver(updateScale);
        observer.observe(panel);

        return () => {
            window.removeEventListener('resize', updateScale);
            observer.disconnect();
        };
    }, []);

    return [ref, scale];
};
