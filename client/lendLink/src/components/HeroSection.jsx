import React, { useEffect, useRef } from 'react';
import '../styles/HeroStyles.css';
import { gsap } from 'gsap';
import { useSelector } from "react-redux";
import AddBankModal from "../components/AddBankAc";
import Loader from "../components/Loader";
import { Link, useNavigate } from 'react-router-dom';

const Hero = () => {
   const user = useSelector((state) => state.user);
   const navigate = useNavigate()


  useEffect(() => {
    gsap.fromTo('.hero', {
      opacity:0.5,
      y:-window.innerWidth-100

    },{
      opacity:1,
      duration:2,
      ease: 'power4',
      y:0
    })

    gsap.fromTo(
      ".hero_title span",
      {
        opacity: 0,
        y: -window.innerHeight,
        scale: -3.8,
        rotationX: -90,
        textShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)", // Add shadow effect initially
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        color: "#fff", // Transition to white
        textShadow: "0px 0px 20px rgba(0, 255, 255, 0.8)", // Highlight effect
        ease: "elastic.out(1, 1.5)", // Elastic bounce effect
        stagger:.55, // Delay between each word
        duration: 2.5, // Animation duration
      }
    );


  
    gsap.fromTo(
      ".hero_description",
      { opacity: 0,   y:window.innerHeight, },
      {
        opacity: 1,
        y: -20,
        ease: "power3.out",
        delay: 2.5, 
        duration: 1.2,
      }
    );
    gsap.fromTo(
      '.hero_button',
      {
        opacity: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        scale: 1,
        ease: 'bounce.out',
        duration: 1.2,
        delay: 4.3, 
        onComplete: () => {
          gsap.to('.hero_button', {
            y: 10,
            duration: 1,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true, 
          });
        },
      }
    );

  }, []);
  
  // setTimeout(() => {
    // if(user) {
    //   navigate('/dashboard')
    //  }
  // }, 2000);

  const getFirstname = (nameString) => {
    const firstSpaceIndex = nameString.indexOf(' ');
    return firstSpaceIndex !== -1 ? nameString.substring(0, firstSpaceIndex) : nameString;
  };
  
  if(user) {
    const name = user.name;
    var firstName = getFirstname(name);
     
  }





 

  return (
    <section className="hero" id='home'>

      <video
        className="hero_video"
        autoPlay
        loop
        muted
      >
        <source
          src="/videos/hero1.mp4" 
          type="video/mp4"
        />
        Your browser does not support
      </video>
 
      <div className="hero_overlay"  >
        <div className="hero_container" >
          <h1 className="hero_title">
            <span> Hello </span> <span style={{textDecoration:'underline'}} > {user? firstName:''} </span> <span>  Empower</span> <span>Circle</span> <span>with </span> <span> Financial</span> <span>Support</span>
          </h1>
          <p className="hero_description">
            Join a community of trust and start lending or borrowing seamlessly.
          </p>
          {user?  <Link to="/dashboard">  <button className="hero_button">Dashboard</button> </Link>:
          <a href="#how-it-works"> <button className="hero_button">How it works</button> </a>}
          </div>
      </div>
    </section>
  );
};

export default Hero;