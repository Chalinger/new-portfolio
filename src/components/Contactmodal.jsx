import React, { useState } from 'react';

const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback pour les environnements sans clipboard API
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            className="contact-copy-btn"
            onClick={handleCopy}
            aria-label={copied ? 'Copié !' : `Copier ${text}`}
            title={copied ? 'Copié !' : 'Copier'}
        >
            {copied ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <polyline points="2,7 5.5,10.5 12,3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="4.5" y="1" width="8" height="9.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M9.5 10.5V12A1.2 1.2 0 0 1 8.3 13H2.2A1.2 1.2 0 0 1 1 11.8V4.7A1.2 1.2 0 0 1 2.2 3.5H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
            )}
        </button>
    );
};

const ContactModal = ({ onClose }) => {
    return (
        <div className="contact-popup-overlay" onClick={onClose}>
            <div className="contact-popup" onClick={(e) => e.stopPropagation()}>
                <button
                    className="contact-popup-close"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    ✕
                </button>
                <h2>Contact Me</h2>
                <div className="contact-info">
                    <div className="contact-item">
                        <strong>Email</strong>
                        <div className="contact-item-value">
                            <a href="mailto:victor.le.claire.pro@gmail.com">
                                victor.le.claire.pro@gmail.com
                            </a>
                            <CopyButton text="victor.le.claire.pro@gmail.com" />
                        </div>
                    </div>
                    <div className="contact-item">
                        <strong>Phone</strong>
                        <div className="contact-item-value">
                            <a href="tel:+33783453732">+33 7 83 45 37 32</a>
                            <CopyButton text="+33783453732" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactModal;