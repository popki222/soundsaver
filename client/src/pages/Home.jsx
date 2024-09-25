import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import LandingLogin from '../components/LandingLogin/LandingLogin';
import SongDisplay from '../components/SongDisplay/SongDisplay';

const Home = () => {
  return (
    <div>
      <Navbar />
      < SongDisplay />
      <Footer />
    </div>
  );
}

export default Home;
