import React from 'react';
import '../styles/Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer_content">
        <div className="footer_section footer_about">
          <h3 className="footer_title">LendLink</h3>
          <p className="footer_description">
            LendLink is a personal project built to explore web development. A place to practice skills, experiment with ideas, and learn by building.
          </p>
        </div>
        <div className="footer_section footer_links">
          <h4 className="footer_section-title">Quick Links</h4>
          <ul className="footer_list">
            <li><Link to="/YashDevelopersPage" className="footer_link">For developers</Link></li>
            <li><a href="#features" className="footer_link">Features</a></li>
            <li><Link to="/contact" className="footer_link">Contact Me</Link></li> 
          </ul>
        </div>
        <div className="footer_section footer_contact">
          <h4 className="footer_section-title">Contact Me</h4>
          <p>Email: <a href="mailto:yashsabne39@gmail.com" className="footer_link">yashsabne39@gmail.com  </a></p>
          <p>GitHub: <a href="https://github.com/yashsabne" className="footer_link" target='_blank' >github.com/yashsabne</a></p>
          <p>LinkedIn: <a href="https://www.linkedin.com/in/yash-sabne-77239b287/" className="footer_link">linkedin.com/in/yashsabne</a></p>
        </div>
        <div className="footer_section imageLogo">

          <img src="/images/logo.webp" alt="logo company" />
           </div>
      </div>
      <div className="footer_bottom">
        <p>&copy; 2025 LendLink. Made with ❤️ by a yash sabne exploring advanced web-D.</p>
      </div>
    </footer>
  );
};

export default Footer;
