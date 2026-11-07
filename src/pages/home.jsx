// Import components
import ProfilePanel from '../components/ProfilePanel';
import SidePanel from '../components/SidePanel';

// Import css
import '../styles/home.css';

// Chemin affiché dans le fil d'Ariane
const PATH = [{ label: 'home', href: './' }];

const Home = () => {
    return (
        <div className="home">
            <ProfilePanel path={PATH} />
            {/* Contenu de la page d'accueil à venir */}
            <SidePanel currentPage="home" />
        </div>
    );
};

export default Home;
