// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <div className="about-container">
                <h1>About Me</h1>
                
                <div className="about-content">
                    <div className="about-image-placeholder">
                        <div className="placeholder-avatar">
                            🎨
                        </div>
                    </div>

                    <div className="about-text">
                        <h2>Artist Statement</h2>
                        <p>
                            Welcome to my art portfolio! 
                        </p>
                        
                        <p>
                            this is a resume website for instagram user @//kkanaries as a software engineering student with a passion for art and fangirling on the side
                        </p>

                        <h2>Tools and whatnot</h2>
                        <p>
                            I mainly work in digital (like 99.99% of the time). My main program for art is procreate, with default brushes. 
                            the default brushes i tend to use the most are the technical pen, round brush and gesinski ink. 
                            Occassionally i will use blender for rigged pose assets i make myself + I use adobe photoshop sometimes (rarely)
                        </p>

                        <h2>Contact</h2>

                        <p>
                            📷 <a href="https://www.instagram.com/kkanaries/" target="_blank" rel="noopener noreferrer">
                                @your-handle on Instagram
                            </a>
                        </p>

                        <Link to="/" className="back-to-gallery">
                            ← Back to Gallery
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;