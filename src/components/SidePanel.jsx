import { useLayoutEffect, useRef, useState } from 'react';

// Import components
import NavTree from './NavTree';
import OtherLinks from './OtherLinks';
import ContactModal from './Contactmodal';
import FilePreviewModal from './FilePreviewModal';

// Import css
import '../styles/side-panel.css';

// Espace minimal (px) entre le panneau et les bords haut/bas de l'écran
const PANEL_MARGIN = 32;

const SidePanel = ({ currentPage }) => {
    const [showContact, setShowContact] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [scale, setScale] = useState(1);
    const panelRef = useRef(null);

    // Réduit le panneau pour qu'il tienne toujours en entier dans l'écran (pas de scroll).
    // Sa hauteur est fixe : seul le redimensionnement de la fenêtre la remet en cause.
    useLayoutEffect(() => {
        const panel = panelRef.current;

        const updateScale = () => {
            const available = window.innerHeight - PANEL_MARGIN * 2;
            setScale(Math.min(1, available / panel.offsetHeight));
        };

        updateScale();
        window.addEventListener('resize', updateScale);

        return () => window.removeEventListener('resize', updateScale);
    }, []);

    return (
        <>
            <aside
                ref={panelRef}
                className="side-panel"
                style={{ '--panel-scale': scale }}
            >
                <NavTree currentPage={currentPage} onPreview={setPreviewFile} />
                <hr className="side-panel-separator" />
                <OtherLinks onContactClick={() => setShowContact(true)} />
            </aside>
            {/* Hors de l'aside : son transform casserait le position: fixed des modales */}
            {showContact && (
                <ContactModal onClose={() => setShowContact(false)} />
            )}
            {previewFile && (
                <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
            )}
        </>
    );
};

export default SidePanel;
