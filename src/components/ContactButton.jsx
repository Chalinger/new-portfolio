// Import css
import '../styles/contact.css';

const ContactButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="contact-btn"
            title="Contact"
        >
            Contact
        </button>
    );
};

export default ContactButton;
