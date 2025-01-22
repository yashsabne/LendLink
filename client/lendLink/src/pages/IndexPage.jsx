import React from 'react'
import Header from '../components/Header';
import Hero from '../components/HeroSection';
import About from '../components/About'; 
import Footer from '../components/Footer';
import DetailedInfo from '../components/DetailedInfo';


const IndexPage = () => {
  return (
    <>
    <Header/>
    <Hero/>
    <About/>
    <DetailedInfo/>
    <Footer />
    </>
  )
}

export default IndexPage;

