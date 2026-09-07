import React, { useState } from 'react';

// Import components
import ThreeScene from '../components/ThreeScene';
import SocialLinks from '../components/SocialLinks';
import ContactModal from '../components/Contactmodal';
import MyWorks from '../components/Myworks';

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
                <div className="wip-content_container">
                    <div className="wip-panel">
                        <SocialLinks onContactClick={() => setShowContact(true)} />
                        <MyWorks />
                    </div>
                </div>
            </div>
            {showContact && (
                <ContactModal onClose={() => setShowContact(false)} />
            )}
        </div>
    );
};

export default WIP;