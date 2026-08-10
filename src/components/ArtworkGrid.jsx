import React from 'react';
import { Link } from 'react-router-dom';

const ArtworkGrid = ({ artworks, loading, isAdmin, onDelete }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    if (loading) {
        return <div className="loading">Loading artworks...</div>;
    }

    if (artworks.length === 0) {
        return (
            <div className="loading">
                <p>No artworks yet. Add your first piece!</p>
                {isAdmin && (
                    <Link to="/add" className="btn-primary">Add Artwork</Link>
                )}
                {!isAdmin && (
                    <p style={{ color: '#aaa', marginTop: '1rem' }}>
                        (Admin login required to add artworks)
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="artwork-grid">
            {artworks.map(artwork => (
                <div key={artwork._id} className="artwork-card-wrapper">
                    <Link to={`/artwork/${artwork._id}`} className="artwork-card">
                        <div className="image-container">
                            <img 
                                src={`${API_URL}${artwork.thumbnailUrl || artwork.images?.[0]?.url}`}
                                alt={artwork.title}
                                loading="lazy"
                            />
                        </div>
                        <div className="info">
                            <h3>{artwork.title}</h3>
                            <p>
                                {artwork.medium} 
                                {artwork.creationDate && `• ${new Date(artwork.creationDate).getFullYear()}`}
                            </p>
                            {artwork.price && <p className="price">${artwork.price}</p>}
                        </div>
                    </Link>
                    
                    {/* Admin Actions - Only visible to admin */}
                    {isAdmin && onDelete && (
                        <div className="admin-grid-actions">
                            <Link 
                                to={`/edit/${artwork._id}`} 
                                className="grid-edit-btn"
                                title="Edit artwork"
                            >
                                ✏️ Edit
                            </Link>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (window.confirm(`Delete "${artwork.title}"?`)) {
                                        onDelete(artwork._id);
                                    }
                                }}
                                className="grid-delete-btn"
                                title="Delete artwork"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ArtworkGrid;