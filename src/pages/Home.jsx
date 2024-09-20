import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import LandingLogin from '../components/LandingLogin/LandingLogin';

const Home = () => {
  return (
    <div>
      <Navbar />
      <LandingLogin />
      <Footer />
    </div>
  );
}

export default Home;
