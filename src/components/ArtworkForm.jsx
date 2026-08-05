import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ArtworkForm = ({ artwork, onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: artwork?.title || '',
        description: artwork?.description || '',

    creationDate: artwork?.creationDate ? new Date(artwork.creationDate).toISOString().split('T')[0] : '',






        medium: artwork?.medium || '',
        style: artwork?.style || '',
        price: artwork?.price || '',
        dimensions: {
            height: artwork?.dimensions?.height || '',
            width: artwork?.dimensions?.width || '',
            unit: artwork?.dimensions?.unit || 'cm'
        },
        tags: artwork?.tags?.join(', ') || '',
        isAvailable: artwork?.isAvailable !== undefined ? artwork.isAvailable : true
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(artwork?.images?.[0]?.url || '');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            
            // Append all fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('creationDate', formData.creationDate);
            formDataToSend.append('medium', formData.medium);
            formDataToSend.append('style', formData.style);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('isAvailable', formData.isAvailable);
            formDataToSend.append('dimensions', JSON.stringify(formData.dimensions));
            
            if (formData.tags) {
                const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
                formDataToSend.append('tags', JSON.stringify(tagsArray));
            }

            if (image) {
                formDataToSend.append('images', image);
            }

            const url = artwork 
                ? `http://localhost:5000/api/artworks/${artwork._id}`
                : 'http://localhost:5000/api/artworks';
            
            const method = artwork ? 'put' : 'post';

            const response = await axios[method](url, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (onSuccess) onSuccess(response.data);
            navigate('/');
            
        } catch (error) {
            console.error('Error saving artwork:', error);
            alert('Error: ' + error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    const mediums = ['Oil', 'Acrylic', 'Watercolor', 'Digital', 'Photography', 'Sculpture', 'Mixed Media', 'Other'];
    const styles = ['Abstract', 'Realism', 'Impressionism', 'Modern', 'Contemporary', 'Minimalist', 'Other'];

    return (
        <form onSubmit={handleSubmit} className="artwork-form">
            <h2>{artwork ? 'Edit Artwork' : 'Add New Artwork'}</h2>

            <div className="form-group">
                <label>Title *</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                />
            </div>

            <div className="image-upload">
                <label>Image *</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!artwork}
                />
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>creationDate</label>
                    <input
                        type="date"
                        value={formData.creationDate}
                        onChange={(e) => setFormData({...formData, creationDate: e.target.value})}
                    />
                </div>

                <div className="form-group">
                    <label>Medium</label>
                    <select
                        value={formData.medium}
                        onChange={(e) => setFormData({...formData, medium: e.target.value})}
                    >
                        <option value="">Select medium</option>
                        {mediums.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Style</label>
                    <select
                        value={formData.style}
                        onChange={(e) => setFormData({...formData, style: e.target.value})}
                    >
                        <option value="">Select style</option>
                        {styles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Price ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="landscape, nature, colorful"
                />
            </div>

            <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : artwork ? 'Update Artwork' : 'Add Artwork'}
            </button>
        </form>
    );
};

export default ArtworkForm;