import React, { useState } from 'react';

// Import components
import ThreeScene from '../components/ThreeScene';
import SocialLinks from '../components/SocialLinks';
import ContactModal from '../components/ContactModal';

// Import css
import '../styles/wip.css';

const WIP = () => {
    const [showContact, setShowContact] = useState(false);

    return (
        <div className="wip">
            <ThreeScene />
            <h1 className="wip-title">Work in progress</h1>
            <div className="wip-content">
                <p className="wip-text">My portfolio is currently under development.</p>
                <SocialLinks onContactClick={() => setShowContact(true)} />
            </div>
            {showContact && (
                <ContactModal onClose={() => setShowContact(false)} />
            )}
        </div>
    );
};

export default WIP;