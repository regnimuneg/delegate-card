import './ThemePrimitives.css';

export function IconBadge({ children, tone = 'pink', className = '' }) {
    return <span className={`jn-icon-badge jn-icon-badge--${tone} ${className}`}>{children}</span>;
}

export function PageHeader({ eyebrow, title, subtitle, sticker = null, children }) {
    return (
        <section className={`jn-page-header ${!sticker ? 'jn-page-header--no-sticker' : ''}`}>
            <div className="jn-page-heading-copy">
                {eyebrow && <span className="jn-page-eyebrow">{eyebrow}</span>}
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {children}
            {sticker && (
                <img
                    className="jn-page-header-sticker"
                    src={`/assets/jnimun/stickers/${sticker}.png`}
                    alt=""
                    aria-hidden="true"
                />
            )}
        </section>
    );
}

export function CouncilPills({ activeCouncil }) {
    const councils = [
        ['UNSC', 'unsc'], ['CRISIS', 'crisis'], ['UNODC', 'unodc'],
        ['IMO', 'imo'], ['UNHCR', 'unhcr'], ['PRESS', 'press']
    ];
    return (
        <div className="jn-council-pills" aria-label="Conference councils">
            <strong>Councils:</strong>
            {councils.map(([name, icon]) => (
                <span key={name} className={activeCouncil?.toUpperCase().includes(name) ? 'is-active' : ''}>
                    <img src={`/assets/jnimun/councils/${icon}.png`} alt="" />
                    {name}
                </span>
            ))}
        </div>
    );
}

export function SectionTitle({ icon, title, subtitle, tone = 'pink' }) {
    return (
        <div className="jn-section-title">
            {icon && <IconBadge tone={tone}>{icon}</IconBadge>}
            <div>
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
        </div>
    );
}

export function Sticker({ name, src, className = '' }) {
    const stickerSrc = src || `/assets/jnimun/stickers/${name}.png`;
    return <img className={`jn-sticker ${className}`} src={stickerSrc} alt="" aria-hidden="true" />;
}
