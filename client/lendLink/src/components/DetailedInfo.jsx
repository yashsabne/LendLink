import React, { useEffect, useRef }  from 'react';
import '../styles/DetailedInfo.css'; 
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { steps } from '../constants/const';
const DetailedInfo = () => {

    const detailedInfoRef  =useRef();
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
      
        gsap.fromTo(
          detailedInfoRef.current,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            scrollTrigger: {
              trigger: detailedInfoRef.current,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
 
      }, []);
      
 

  return (
    <section className="detailed-info" ref={detailedInfoRef}  >
      <div className="info-container">
        <h2 className="info-header">Getting Started with LendLink</h2>
        <div className="info-grid">
          {steps.map((step, index) => (
            <div className="info-card" key={index}>
              <div className="info-icon">
                {step.stepNo}   
              </div>
              <h3 className="info-title">{step.title}</h3>
              <p className="info-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetailedInfo;
