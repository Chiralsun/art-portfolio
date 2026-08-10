import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ArtworkDetail = ({ artwork, onDelete ,isAdmin }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [artworkData, setArtworkData] = useState(null);

    useEffect(() => {
        if (artwork) {
            setArtworkData(artwork);
            setLoading(false);
        } else {
            fetchArtwork();
        }
    }, [id, artwork]);

    const fetchArtwork = async () => {
        try {
const res = await axios.get(`${API_URL}/api/artworks/${id}`);


            setArtworkData(res.data);
        } catch (error) {
            console.error('Error fetching artwork:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this artwork?')) return;
        
        try {
await axios.delete(`${API_URL}/api/artworks/${id}`);

            if (onDelete) onDelete(id);
            navigate('/');
        } catch (error) {
            console.error('Error deleting artwork:', error);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!artworkData) return <div className="loading">Artwork not found</div>;

    return (
        <div className="artwork-detail">
            <div className="detail-image">
                <img 
                src={`${API_URL}${artworkData.images?.[0]?.url || artworkData.thumbnailUrl}`}


                    alt={artworkData.title}
                />
            </div>
            <div className="detail-info">
                <h1>{artworkData.title}</h1>
                <div className="meta">
                    {artworkData.medium && <span>{artworkData.medium}</span>}
                    
                    
                    {artworkData.creationDate && (
    <span>{new Date(artworkData.creationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</span>
)}

                    {artworkData.dimensions?.height && (
                        <span>{artworkData.dimensions.height} × {artworkData.dimensions.width} {artworkData.dimensions.unit}</span>
                    )}
                </div>
                <p className="description">{artworkData.description}</p>
                {artworkData.price && (
                    <div className="price-section">
                        <span className="price">${artworkData.price}</span>
                        <span className={`availability ${artworkData.isAvailable ? 'available' : 'sold'}`}>
                            {artworkData.isAvailable ? 'Available' : 'Sold'}
                        </span>
                    </div>
                )}
                {artworkData.tags?.length > 0 && (
                    <div className="tags">
                        {artworkData.tags.map(tag => (
                            <span key={tag} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}
<div className="actions">

            <Link to={`/edit/${artworkData._id}`} className="edit-btn">Edit</Link>
            <button onClick={handleDelete} className="delete-btn">Delete</button>

    <Link to="/" className="back-btn">Back to Gallery</Link>
</div>

            </div>
        </div>
    );
};

export default ArtworkDetail;