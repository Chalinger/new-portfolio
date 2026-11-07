import { useState } from 'react';

// Import components
import NavTree from './NavTree';
import OtherLinks from './OtherLinks';
import ContactModal from './Contactmodal';
import FilePreviewModal from './FilePreviewModal';

// Import utils
import { useFitScale } from '../utils/useFitScale';

// Import css
import '../styles/side-panel.css';

const SidePanel = ({ currentPage }) => {
    const [showContact, setShowContact] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [panelRef, scale] = useFitScale();

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
