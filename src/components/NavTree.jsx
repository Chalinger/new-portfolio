import { useState } from 'react';

// Import css
import '../styles/nav-tree.css';

// Arborescence affichée dans la nav.
// - Dossier : "children" (repliable) + "open" pour l'état initial
// - Fichier : "preview" (image | model) + "src" pour l'ouvrir dans une pop-up d'aperçu
// - Page : "page" (id de la page) + "href" quand la page existe
const PROJECT_TREE = [
    { name: 'dist' },
    { name: 'node_modules' },
    {
        name: 'public',
        open: true,
        children: [
            { name: 'fonts' },
            { name: 'favicon-3d.glb', file: true, preview: 'model', src: import.meta.env.BASE_URL + 'favicon-3d.glb' },
            { name: 'favicon.svg', file: true, preview: 'image', src: import.meta.env.BASE_URL + 'favicon.svg' },
        ],
    },
    {
        name: 'src',
        open: true,
        children: [
            { name: 'assets' },
            { name: 'components' },
            {
                name: 'pages',
                open: true,
                children: [
                    { name: 'home.jsx', file: true, page: 'home', href: './' },
                    { name: 'projects.jsx', file: true, page: 'projects' },
                    { name: 'contact.jsx', file: true, page: 'contact' },
                    { name: 'about.jsx', file: true, page: 'about' },
                ],
            },
            { name: 'utils' },
            { name: 'App.css', file: true },
            { name: 'App.jsx', file: true },
            { name: 'index.css', file: true },
            { name: 'main.jsx', file: true },
        ],
    },
    { name: '.gitignore', file: true },
    { name: 'eslint.config.js', file: true },
    { name: 'index.html', file: true },
    { name: 'package-lock.json', file: true },
    { name: 'package.json', file: true },
    { name: 'README.md', file: true },
    { name: 'vite.config.js', file: true },
];

// Nombre de lignes de l'arbre entièrement déplié (sert à fixer la hauteur de la nav)
const countRows = (nodes) =>
    nodes.reduce((total, node) => total + 1 + (node.children ? countRows(node.children) : 0), 0);

// +1 pour la racine "."
const TREE_ROWS = countRows(PROJECT_TREE) + 1;

const Chevron = () => (
    <svg className="nav-tree-chevron" width="14" height="14" viewBox="0 0 8 8" fill="none" aria-hidden="true">
        <polyline points="2.5,1 5.5,4 2.5,7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FileNode = ({ node, currentPage, onPreview }) => {
    const { name, page, href, preview } = node;

    if (page && href) {
        return (
            <a
                href={href}
                className="nav-tree-label nav-tree-page"
                aria-current={page === currentPage ? 'page' : undefined}
            >
                {name}
            </a>
        );
    }

    if (page) {
        // Page listée mais pas encore développée
        return (
            <span className="nav-tree-label nav-tree-page is-unavailable" aria-disabled="true" title="Bientôt disponible">
                {name}
            </span>
        );
    }

    if (preview) {
        return (
            <button
                type="button"
                className="nav-tree-label nav-tree-preview"
                aria-haspopup="dialog"
                onClick={() => onPreview(node)}
            >
                {name}
            </button>
        );
    }

    return <span className="nav-tree-label is-muted">{name}</span>;
};

const FolderNode = ({ node, currentPage, onPreview }) => {
    const [open, setOpen] = useState(Boolean(node.open));
    const label = (
        <>
            <Chevron />
            {node.name}\
        </>
    );

    // Dossier sans contenu détaillé : affiché replié, non cliquable
    if (!node.children) {
        return <span className="nav-tree-label nav-tree-folder is-muted">{label}</span>;
    }

    return (
        <>
            <button
                type="button"
                className={`nav-tree-label nav-tree-folder${open ? ' is-open' : ''}`}
                aria-expanded={open}
                onClick={() => setOpen(!open)}
            >
                {label}
            </button>
            {open && <TreeList nodes={node.children} currentPage={currentPage} onPreview={onPreview} />}
        </>
    );
};

const TreeList = ({ nodes, currentPage, onPreview }) => (
    <ul className="nav-tree-list">
        {nodes.map((node) => (
            <li key={node.name} className="nav-tree-item">
                {node.file ? (
                    <FileNode node={node} currentPage={currentPage} onPreview={onPreview} />
                ) : (
                    <FolderNode node={node} currentPage={currentPage} onPreview={onPreview} />
                )}
            </li>
        ))}
    </ul>
);

const NavTree = ({ currentPage, onPreview }) => {
    return (
        <nav className="nav-tree" aria-label="Navigation principale" style={{ '--rows': TREE_ROWS }}>
            <p className="nav-tree-hint">Cliquez pour naviguer entre les pages</p>
            <span className="nav-tree-root" aria-hidden="true">.</span>
            <TreeList nodes={PROJECT_TREE} currentPage={currentPage} onPreview={onPreview} />
        </nav>
    );
};

export default NavTree;
