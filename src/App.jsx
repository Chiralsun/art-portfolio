import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import components (create these next)
import ArtworkGrid from './components/ArtworkGrid';
import ArtworkForm from './components/ArtworkForm';
import ArtworkDetail from './components/ArtworkDetail';

function App() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load artworks on startup
    useEffect(() => {
        loadArtworks();
    }, []);

    const loadArtworks = async () => {
        try {

        const res = await axios.get(`${API_URL}/api/artworks`);


            setArtworks(res.data);
        } catch (error) {
            console.error('Failed to load artworks:', error);
        } finally {
            setLoading(false);
        }
    };

    // CRUD operations
    const handleAddArtwork = (newArtwork) => {
        setArtworks([newArtwork, ...artworks]);
    };

    const handleUpdateArtwork = (updated) => {
        setArtworks(artworks.map(a => a._id === updated._id ? updated : a));
    };

    const handleDeleteArtwork = (id) => {
        setArtworks(artworks.filter(a => a._id !== id));
    };

    return (
        <Router>
            <div className="App">
                {/* Header/Nav */}
                <header className="app-header">
                    <Link to="/" className="logo">🎨 Art Portfolio</Link>
                    <nav>
                        <Link to="/">Gallery</Link>
                        <Link to="/add" className="btn-primary">+ Add</Link>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="app-main">
                    <Routes>
                        <Route path="/" element={
                            <ArtworkGrid 
                                artworks={artworks} 
                                loading={loading} 
                            />
                        } />
                        
                        <Route path="/add" element={
                            <ArtworkForm onSuccess={handleAddArtwork} />
                        } />
                        
                        <Route path="/edit/:id" element={
                            <ArtworkForm 
                                artwork={artworks.find(a => a._id === window.location.pathname.split('/')[2])}
                                onSuccess={handleUpdateArtwork}
                            />
                        } />
                        
                        <Route path="/artwork/:id" element={
                            <ArtworkDetail 
                                artwork={artworks.find(a => a._id === window.location.pathname.split('/')[2])}
                                onDelete={handleDeleteArtwork}
                            />
                        } />
                    </Routes>
                </main>

                {/* Footer */}
                <footer className="app-footer">
                    <p>© 2026 Art Portfolio</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;