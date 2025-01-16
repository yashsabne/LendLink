import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Contact.css'

const Contact = () => {

    const backendUrl = import.meta.env.VITE_FRONTEND_URL


    const [messageData, setMessageData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMessageData({ ...messageData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${backendUrl}/contact-me/contact-me-form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });

            if (response.ok) {
                alert('Message sent successfully!');
                setMessageData({ name: '', email: '', message: '' });
            } else {
                alert('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <section className="contact-section">
            <div className="contact-container">
                <div className="contact-content">
                    <h2 className="contact-header">Get in Touch</h2>
                    <p className="contact-description">
                        We'd love to hear from you. Fill out the form below to get in touch with us.
                    </p>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter your name"
                                value={messageData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={messageData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                placeholder="Enter your message"
                                value={messageData.message}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <div className="button-div">
                            <button type="submit" className="contact-submit-button">
                                Submit
                            </button>
                            <Link to="/">
                                <button type="button" className="get-back-button">
                                    ← Back to Home
                                </button>
                            </Link>
                        </div>
                    </form>
                </div>
                <div className="contact-img">
                    <img src="images/contact.webp" alt="Contact us" />
                </div>
            </div>
        </section>
    );
};

export default Contact;
