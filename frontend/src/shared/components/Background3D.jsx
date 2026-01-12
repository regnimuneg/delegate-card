import './Background3D.css';

/**
 * Background3D Component
 * Displays 3D metallic elements in the background
 * Static, non-interactive decoration
 */
export function Background3D() {
    return (
        <div className="background-3d">
            <img src="/31.png" alt="" className="background-3d-element background-3d-1" />
            <img src="/35.png" alt="" className="background-3d-element background-3d-2" />
            <img src="/37.png" alt="" className="background-3d-element background-3d-3" />
            <img src="/39.png" alt="" className="background-3d-element background-3d-4" />
            <img src="/40.png" alt="" className="background-3d-element background-3d-5" />
            <img src="/44.png" alt="" className="background-3d-element background-3d-6" />
        </div>
    );
}

export default Background3D;

