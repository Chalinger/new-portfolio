// Import components
import ModelViewer from './ModelViewer';

// Import css (la structure de la pop-up reprend celle du contact)
import '../styles/contact.css';
import '../styles/file-preview.css';

// Pop-up d'aperçu d'un fichier de la nav-tree : image ou modèle 3D
const FilePreviewModal = ({ file, onClose }) => {
    return (
        <div className="contact-popup-overlay" onClick={onClose}>
            <div className="contact-popup file-preview" onClick={(e) => e.stopPropagation()}>
                <button
                    className="contact-popup-close"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    ✕
                </button>
                <h2>{file.name}</h2>

                {file.preview === 'image' && (
                    <img className="file-preview-image" src={file.src} alt={file.name} />
                )}

                {file.preview === 'model' && (
                    <>
                        <ModelViewer src={file.src} />
                        <p className="file-preview-hint">Glisser pour tourner · Molette pour zoomer</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default FilePreviewModal;
