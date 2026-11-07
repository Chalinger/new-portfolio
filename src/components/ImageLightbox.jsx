import { useEffect } from 'react';

// Import css
import '../styles/image-lightbox.css';

// Image affichée en grand sur un fond assombri, sans boîte ni bouton :
// un clic en dehors de l'image (ou Échap) ferme la pop-up
const ImageLightbox = ({ src, alt, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
            <img
                className="image-lightbox-image"
                src={src}
                alt={alt}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default ImageLightbox;
