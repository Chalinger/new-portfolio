import React from 'react';

const PROJECTS = [
    {
        id: 'project-1',
        title: 'Polynotes.fr',
        description: 'Full responsibility and development of the website, including design, front-end and back-end.',
        href: 'https://polynotes.fr/',
    },
    {
        id: 'project-2',
        title: 'Kheti',
        description: 'Front-end development of the website and participation in the back-end architecture.',
        href: 'https://kheti.roynajarian.fr/',
    },
];

const MyWorks = () => {
    return (
        <div className="wip-panel-col my-works">
            <h2 className="wip-panel-title">My recent works</h2>
            <div className="my-works-container">
                {PROJECTS.map(({ id, title, description, href }) => (
                    <a
                        key={id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="my-work-item"
                    >
                        <h3 className="my-work-title">{title}</h3>
                        <p className="my-work-description">{description}</p>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default MyWorks;
