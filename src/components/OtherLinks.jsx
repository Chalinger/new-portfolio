import { Fragment } from 'react';

// Import components
import ContactButton from './ContactButton';

// Import data
import { LINKS } from '../data/links';

// Liens affichés dans le panneau latéral (le CV n'en fait pas partie)
const OTHER_LINKS = LINKS.filter(({ id }) => id !== 'cv');

const OtherLinks = ({ onContactClick }) => {
    return (
        <section className="other-links" aria-labelledby="other-links-title">
            <h2 id="other-links-title" className="other-links-title">Autres liens :</h2>
            <div className="other-links-list">
                {OTHER_LINKS.map(({ id, href, label }, index) => (
                    <Fragment key={id}>
                        {index > 0 && <span className="other-links-sep" aria-hidden="true" />}
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="other-links-link"
                        >
                            {label}
                        </a>
                    </Fragment>
                ))}
            </div>
            <ContactButton onClick={onContactClick} />
        </section>
    );
};

export default OtherLinks;
