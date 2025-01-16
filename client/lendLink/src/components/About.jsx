import React, { Suspense, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas } from '@react-three/fiber';
import '../styles/About.css';
import AboutFeatureModel from '../threeDModels/About_features';
import { PerspectiveCamera } from '@react-three/drei';
import { useMediaQuery } from 'react-responsive';


const About = () => {
  const aboutRef = useRef();
  const isMobile = useMediaQuery({ maxWidth: 600 });


  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      aboutRef.current.querySelectorAll('.about_section'),
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        stagger: 0.3,
        scrollTrigger: {
          trigger: aboutRef.current,
          start: 'top 90%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  return (
    <section className="about" ref={aboutRef}>
      <div className="about_container">
        <div className="about_section about_intro">
          <div className="about_content">
            <h2 className="about_header">About LendLink</h2>
            <p>
              Welcome to <strong>LendLink</strong>, a platform revolutionizing financial collaboration. We enable users
              to form lending circles of up to 10 members, where members contribute a fixed amount of money regularly
              and benefit from a rotational borrowing system.
            </p>
            <p>
              Our platform empowers users to pool resources, build trust, and access funds easily. Inspired by the
              traditional Rotating Savings and Credit Associations (ROSCAs), LendLink brings this concept into the
              digital age with secure, user-friendly technology.
            </p>
          </div>
          <div className="about_media">
            <img src="/images/aboutLendLink.webp" alt="Lending Circle" className="about_image" />
          </div>
        </div>

        <div className="about_section about_features" id='features'>
          <div className="about_media model_media">
          <Suspense fallback={<div>Loading 3D Model...</div>}>
          <Canvas style={{ height: '300px', width: '400px' }} className="about_model">
  <PerspectiveCamera makeDefault position={[0, 0.05, 1.1]} />
  <ambientLight intensity={0.5} /> 
  <AboutFeatureModel scale={isMobile ? 1.5 : 1.8} />
</Canvas>

            </Suspense>
          </div>
          <div className="about_content">
            <h3>Why Choose LendLink?</h3>
            <ul>
              <li>🤝 <strong>Collaborative Savings:</strong> Build trust within your community while growing your financial safety net.</li>
              <li>🔄 <strong>Rotational Lending:</strong> Fair and structured borrowing opportunities for all members.</li>
              <li>📅 <strong>Monthly Periods:</strong> Monthly contribution intervals to suit your group's needs.</li>
              <li>🔒 <strong>Secure & Transparent:</strong> Our platform ensures data security and transaction transparency.</li>
            </ul>
          </div>
        </div>

        <div className="about_section about_how-it-works" id='how-it-works'>
          <div className="about_media">
            <p>
              This transparent and collaborative approach not only fosters trust but also ensures everyone benefits equitably. LendLink's platform makes this process seamless and secure with modern technology.
            </p>
          </div>
          <div className="about_content">
            <h3>How It Works</h3>
            <div className="about_steps">
              <div className="about_step">
                <img src="/images/step-1.png" alt="Step 1" className="about_step-image" />
                <p><strong>Step 1:</strong> Form a group with up to 10 trusted members.</p>
              </div>
              <div className="about_step">
                <img src="/images/step-2.png" alt="Step 2" className="about_step-image" />
                <p><strong>Step 2:</strong> Decide on a contribution amount and interval.</p>
              </div>
              <div className="about_step">
                <img src="/images/step3.png" alt="Step 3" className="about_step-image" />
                <p><strong>Step 3:</strong> Rotate borrowing opportunities within the group.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
