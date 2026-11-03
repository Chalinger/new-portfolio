// Import components
import SidePanel from '../components/SidePanel';

// Import css
import '../styles/home.css';

const Home = () => {
    return (
        <div className="home">
            {/* Contenu de la page d'accueil à venir */}
            <SidePanel currentPage="home" />
        </div>
    );
};

export default Home;
