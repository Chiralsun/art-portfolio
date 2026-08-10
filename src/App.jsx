// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import components
import ArtworkGrid from './components/ArtworkGrid';
import ArtworkForm from './components/ArtworkForm';
import ArtworkDetail from './components/ArtworkDetail';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Check if admin is already logged in (from localStorage)
    useEffect(() => {
        const adminStatus = localStorage.getItem('isAdmin');
        if (adminStatus === 'true') {
            setIsAdmin(true);
        }
    }, []);

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

    // Logout function
    const handleLogout = () => {
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
    };

    return (
        <Router>
            <div className="App">
                {/* Header/Nav */}
                <header className="app-header">
                    <Link to="/" className="logo">🎨 Art Portfolio</Link>
                    <nav>
                        <Link to="/">Gallery</Link>
                        
                        {/* Show Admin links only if logged in */}
                        {isAdmin ? (
                            <>
                                <Link to="/add" className="btn-primary">+ Add</Link>
                                <button onClick={handleLogout} className="btn-logout">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/admin/login" className="btn-login">Admin Login</Link>
                        )}
                    </nav>
                </header>

                {/* Main Content */}
                <main className="app-main">
                    <Routes>
                        {/* Public Routes */}
<Route path="/" element={
    <ArtworkGrid 
        artworks={artworks} 
        loading={loading}
        isAdmin={isAdmin}
        onDelete={handleDeleteArtwork}
    />
} />

                        
<Route path="/artwork/:id" element={
    <ArtworkDetail 
        artwork={artworks.find(a => a._id === window.location.pathname.split('/')[2])}
        onDelete={handleDeleteArtwork}
        isAdmin={isAdmin}
    />
} />

                        
                        <Route path="/admin/login" element={
                            <AdminLogin setIsAdmin={setIsAdmin} />
                        } />
                        
                        {/* Protected Routes (Admin Only) */}
                        <Route path="/add" element={
                            <ProtectedRoute isAdmin={isAdmin}>
                                <ArtworkForm onSuccess={handleAddArtwork} />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/edit/:id" element={
                            <ProtectedRoute isAdmin={isAdmin}>
                                <ArtworkForm 
                                    artwork={artworks.find(a => a._id === window.location.pathname.split('/')[2])}
                                    onSuccess={handleUpdateArtwork}
                                />
                            </ProtectedRoute>
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