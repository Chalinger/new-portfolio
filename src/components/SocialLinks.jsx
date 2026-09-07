import React from 'react';

// Import images
import githubIcon from '/src/assets/github-logo.svg';
import linkedinIcon from '/src/assets/linkedin-logo.png';
import contactIcon from '/src/assets/email-logo.svg';
import oldPortfolioIcon from '/src/assets/old-portfolio.png';
import cvFile from '/src/assets/CV - LE CLAIRE Victor.pdf';

const LINKS = [
    {
        id: 'github',
        href: 'https://github.com/Chalinger',
        icon: githubIcon,
        label: 'GitHub',
    },
    {
        id: 'old_portfolio',
        href: 'https://chalinger.github.io/Portfolio-Victor-LE-CLAIRE/',
        icon: oldPortfolioIcon,
        label: 'Old Portfolio',
    },
    {
        id: 'linkedin',
        href: 'https://www.linkedin.com/in/victor-le-claire-95a5872ba/',
        icon: linkedinIcon,
        label: 'LinkedIn',
    },
    {
        id: 'cv',
        href: cvFile,
        icon: contactIcon,
        label: 'CV',
        download: 'CV - LE CLAIRE Victor.pdf',
    },
];

const SocialLinks = ({ onContactClick }) => {
    return (
        <div className="wip-panel-col wip-links-container">
            <h2 className="wip-panel-title">About me</h2>
            {/* Text links section */}
            <div className="wip-links">
                {LINKS.map(({ id, href, icon, label, download }) => (
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
                <button
                    onClick={onContactClick}
                    className="wip-contact-btn"
                    title="Contact"
                >
                    Contact
                </button>
            </div>
        </div>
    );
};

export default SocialLinks;