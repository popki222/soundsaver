import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import {  useNavigate } from 'react-router-dom';
import axios from 'axios';

function Logout() {
  const [error, setError] = useState(null);
  const [url, setUrl] = useState('')
  const navigate = useNavigate();
  

  async function sendUserUrl(url) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await axios.post('http://localhost:5000/getUser/id', {
        url: url,
        supaUser: user.id,
      });
    } catch (err) {
      console.error("Error sending user URL:", err);
    }
  }


  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('User signed out successfully');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <input
      type="text"
      placeholder='Your Profile URL'
      onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={() => sendUserUrl(url)}>Save URL</button>
      <button onClick={handleSignOut}>Sign Out</button>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Logout;
