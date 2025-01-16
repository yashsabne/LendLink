import React from "react";
import "../styles/YashDevelopersPage.css";
import Footer from "../components/Footer";

const YashDevelopersPage = () => {
 

  return (
    <>
<div >
  <h2>LendLink Project Overview</h2>
  <p><strong>Project Name:</strong> LendLink</p>
  <p><strong>Description:</strong> LendLink is a lending circle platform designed to facilitate peer-to-peer loans within trusted communities. Users can contribute to a collective pool of funds, which is then lent out to members in need.</p>
</div>

<div >
  <h2>Features</h2>
  <ul>
    <li><strong>Lending Circles:</strong> Users can join or create groups to contribute funds and support each other financially.</li>
    <li><strong>Automated Processes:</strong> Money distribution are managed automatically for convenience <b>(not getting the payout api for now )</b> .</li>
    <li><strong>Periodic Contributions:</strong> The platform sends reminders for regular contributions payments.</li>
    <li><strong>User-Friendly Design:</strong> The interface is simple and intuitive, making it accessible to all users.</li>
  </ul>
</div>

<div >
  <h2>Technologies Used</h2>
  <ul>
    <li><strong>Frontend:</strong> Built with modern web technologies to ensure a responsive and accessible interface.</li>
    <li><strong>Backend:</strong> Developed using Express.js and MongoDB for a scalable backend infrastructure.</li>
    <li><strong>Payment Integration:</strong> Secure payment gateways handle financial transactions efficiently.</li>
    <li><strong>Security Measures:</strong> Emphasis on data security and user privacy throughout the platform.</li>
  </ul>
</div>

<div >
  <h2>Impact</h2>
  <p>LendLink aims to promote financial inclusion by providing an easy and secure way for users to access loans, fostering trust and mutual support within communities.</p>
</div>

    
  <Footer/>
  </>
  );
};

export default YashDevelopersPage;
