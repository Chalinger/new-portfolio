// Import images
import githubIcon from '/src/assets/github-logo.svg';
import linkedinIcon from '/src/assets/linkedin-logo.png';
import contactIcon from '/src/assets/email-logo.svg';
import oldPortfolioIcon from '/src/assets/old-portfolio.png';
import cvFile from '/src/assets/CV - LE CLAIRE Victor.pdf';

// Liens externes partagés entre la page WIP et le panneau latéral
export const LINKS = [
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
