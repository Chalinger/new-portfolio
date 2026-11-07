// Fil d'Ariane au format d'un chemin Windows (C:\ home\projects)
// path : liste de segments { label, href? }, le dernier étant la page courante
const Breadcrumb = ({ path }) => {
    return (
        <nav className="breadcrumb" aria-label="Fil d'Ariane">
            <span className="breadcrumb-root" aria-hidden="true">C:\</span>
            <ol className="breadcrumb-list">
                {path.map(({ label, href }, index) => {
                    const isCurrent = index === path.length - 1;

                    return (
                        <li key={label} className="breadcrumb-item">
                            {href && !isCurrent ? (
                                <a href={href} className="breadcrumb-link">{label}</a>
                            ) : (
                                <span aria-current={isCurrent ? 'page' : undefined}>{label}</span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
