import React, { useState } from 'react';
import '../styles/HeaderStyles.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '../redux/state';

const Header = () => {
    const user = useSelector((state) => state.user);
    const [isNavOpen, setIsNavOpen] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(setLogout());
        navigate("/login");
    };

    const toggleNav = () => setIsNavOpen((prev) => !prev);

    return (
        <header className="nav-h">
            <div className="nav-h_container">
                <h1 className="nav-h_logo" onClick={() => navigate("/")}>LendLink</h1>
                <nav className={`nav-h_nav ${isNavOpen ? 'nav-h_nav--open' : ''}`}>
                    <a href="/" className="nav-h_link">Home</a>
                    <a href="#features" className="nav-h_link">Features</a>
                    <a href="#how-it-works" className="nav-h_link">How It Works</a>
                    <Link to="/dashboard" className="nav-h_link">Dashboard</Link>
                </nav>
                <div className="nav-h_buttons">
                    {user ? (
                        <button className="nav-h_button nav-h_button--primary" onClick={handleLogout}>Log Out</button>
                    ) : (
                        <>
                            <Link to="/login"><button className="nav-h_button">Login</button></Link>
                            <Link to="/register"><button className="nav-h_button nav-h_button--primary">Sign Up</button></Link>
                        </>
                    )}
                </div>
                <div className="nav-h_hamburger" onClick={toggleNav}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </header>
    );
};

export default Header;
