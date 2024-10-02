import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Logout from '../components/LogoutButton/LogoutButton';

const Profile = () => {
  return (
    <div>
      <Navbar />
        <Logout />
      <Footer />
    </div>
  );
}

export default Profile;
