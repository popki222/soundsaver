import React from 'react';
import classes from './Navbar.module.css';
import musicHeart from '../../assets/music_heart2.png';

function Header() {
  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <img src={musicHeart} alt="Logo" />
      </div>
      <nav>
        <ul className={classes.navLinks}>
          <li><a href="home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="profile">Profile</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
