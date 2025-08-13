import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Logout from '../components/LogoutButton/LogoutButton';
import ProfileDisplay from '../components/ProfileDisplay/ProfileDisplay';

const Profile = () => {
  return (
    <div>
      <Navbar />
        <ProfileDisplay />
      <Footer />
    </div>
  );
}

export default Profile;