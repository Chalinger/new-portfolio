import { useState } from 'react';

// Import components
import Breadcrumb from './Breadcrumb';
import ImageLightbox from './ImageLightbox';
import SkillsOrbit from './SkillsOrbit';

// Import utils
import { useFitScale } from '../utils/useFitScale';

// Import images
import pfpVictor from '../assets/pfp-victor.jpg';

// Import css
import '../styles/profile-panel.css';

// Emplacements réservés de la grille sous les compétences (contenu à définir)
const GRID_CELLS = 6;

// Photo de profil, ouverte en grand dans une pop-up au clic
const PROFILE_PICTURE = {
    src: pfpVictor,
    alt: 'Victor Le Claire, debout sur une plage au coucher du soleil',
};

const ProfilePanel = ({ path }) => {
    const [showPicture, setShowPicture] = useState(false);
    const [panelRef, scale] = useFitScale();

    return (
        <>
            <aside
                ref={panelRef}
                className="profile-panel"
                style={{ '--panel-scale': scale }}
            >
                <Breadcrumb path={path} />
                <div className="profile-card">
                    <header className="profile-header">
                        <button
                            type="button"
                            className="profile-picture-btn"
                            aria-haspopup="dialog"
                            aria-label="Agrandir la photo de profil"
                            onClick={() => setShowPicture(true)}
                        >
                            <img
                                src={PROFILE_PICTURE.src}
                                alt={PROFILE_PICTURE.alt}
                                className="profile-picture"
                            />
                        </button>
                        <h1 className="profile-name">
                            Victor
                            <br />
                            LE CLAIRE
                        </h1>
                    </header>

                    <section className="profile-section" aria-labelledby="profile-about-title">
                        <h2 id="profile-about-title" className="profile-title">Qui suis-je ?</h2>
                        <p className="profile-text">
                            Actuellement en deuxième année de BUT MMI (Métiers du Multimédia et de
                            l'Internet), je suis passionné de développement et ai comme ambition de
                            créer mon propre jeu vidéo. J'aime résoudre des problèmes de code, et
                            apprendre de nouvelles techniques et langages de programmation.
                        </p>
                    </section>

                    <section className="profile-section" aria-labelledby="profile-skills-title">
                        <h2 id="profile-skills-title" className="profile-subtitle">Mes compétences</h2>
                        <div className="profile-skills">
                            <SkillsOrbit />
                        </div>
                    </section>

                    <div className="profile-grid" aria-hidden="true">
                        {Array.from({ length: GRID_CELLS }, (_, index) => (
                            <div key={index} className="profile-grid-cell" />
                        ))}
                    </div>
                </div>
            </aside>
            {/* Hors de l'aside : son transform casserait le position: fixed de la modale */}
            {showPicture && (
                <ImageLightbox
                    src={PROFILE_PICTURE.src}
                    alt={PROFILE_PICTURE.alt}
                    onClose={() => setShowPicture(false)}
                />
            )}
        </>
    );
};

export default ProfilePanel;
