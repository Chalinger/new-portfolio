import React from 'react';

// Import components
import ContactButton from './ContactButton';

// Import data
import { LINKS } from '../data/links';

const SocialLinks = ({ onContactClick }) => {
    return (
        <div className="wip-panel-col wip-links-container">
            <h2 className="wip-panel-title">About me</h2>
            {/* Text links section */}
            <div className="wip-links">
                {LINKS.map(({ id, href, label, download }) => (
                    <div key={id} className={`wip-link wip-${id}`}>
                        <a
                            href={href}
                            {...(download
                                ? { download }
                                : { target: '_blank', rel: 'noopener noreferrer' })}
                            className="wip-link-content"
                        >
                            <span className="wip-link-text">{label}</span>
                        </a>
                    </div>
                ))}
            </div>
            {/* Contact button section */}
            <div className="wip-contact-section">
                <ContactButton onClick={onContactClick} />
            </div>
        </div>
    );
};

export default SocialLinks;
