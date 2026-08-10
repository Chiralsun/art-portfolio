// my-react-app/src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ setIsAdmin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // ✅ Set your admin password here
        const ADMIN_PASSWORD = 'artadmin2026'; // Change this to your own password!
        
        if (password === ADMIN_PASSWORD) {
            setIsAdmin(true);
            // Save login status in localStorage (so it persists)
            localStorage.setItem('isAdmin', 'true');
            navigate('/');
        } else {
            setError('Incorrect password. Please try again.');
            setPassword('');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <h2>🔐 Admin Login</h2>
                <p className="login-subtitle">Enter the admin password to manage artworks</p>
                
                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password..."
                            required
                            autoFocus
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <button type="submit" className="login-btn">
                        Login
                    </button>
                    
                    <button 
                        type="button" 
                        className="back-btn"
                        onClick={() => navigate('/')}
                    >
                        ← Back to Gallery
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;