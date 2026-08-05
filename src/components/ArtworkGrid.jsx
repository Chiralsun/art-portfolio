import React from 'react';
import { Link } from 'react-router-dom';

const ArtworkGrid = ({ artworks, loading }) => {
    if (loading) {
        return <div className="loading">Loading artworks...</div>;
    }

    if (artworks.length === 0) {
        return (
            <div className="loading">
                <p>No artworks yet. Add your first piece!</p>
                <Link to="/add" className="btn-primary">Add Artwork</Link>
            </div>
        );
    }

    return (
        <div className="artwork-grid">
            {artworks.map(artwork => (
                <Link to={`/artwork/${artwork._id}`} key={artwork._id} className="artwork-card">
                    <div className="image-container">
                        <img 
                            src={`http://localhost:5000${artwork.thumbnailUrl || artwork.images?.[0]?.url}`}
                            alt={artwork.title}
                            loading="lazy"
                        />
                    </div>
                    <div className="info">
                        <h3>{artwork.title}</h3>
                        <p>{artwork.medium} {artwork.creationDate && `• ${new Date(artwork.creationDate).getFullYear()}`}</p>

                        {artwork.price && <p className="price">${artwork.price}</p>}
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ArtworkGrid;