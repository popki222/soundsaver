import { useState } from 'react';
import { supabase } from '../../pages/Home'; 
import { Navigate, useNavigate } from 'react-router-dom';

function Logout() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      <button onClick={handleSignOut}>Sign Out</button>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Logout;
