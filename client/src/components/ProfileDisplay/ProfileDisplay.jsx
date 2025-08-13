import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';
import classes from './ProfileDisplay.module.css';
import axios from 'axios';

function ProfileDisplay() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState('');
  const [click, setClick] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session && session.user) {
          const response = await axios.get('http://localhost:5000/me', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          setProfile(response.data.user[0]);
          setUrl(response.data.user[0].permalink_url || '');
        } else {
          console.error('No session or user found!');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [click]);

  const sendUserUrl = async (url) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await axios.post(
        'http://localhost:5000/getUser/id',
        { url },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
    } catch (err) {
      console.error('Error sending user URL:', err);
    }
  };

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

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className={classes.error}>{error}</p>;
  if (!profile) return <p>No profile found</p>;
  if (!profile.soundcloud_id) {
    return (
      <div className={classes['profile-card']}>
        <div className={classes['profile-header']}>
          <div className={classes['profile-info']}>
            <h2>Welcome!</h2>
            <p>You haven’t linked your SoundCloud account yet.</p>
          </div>
        </div>
  
        <input
          type="text"
          className={classes['profile-input']}
          placeholder="Your Profile URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
  
        <div>
          <button
            className={classes.button}
            onClick={() => {
              sendUserUrl(url);
              setClick(click + 1);
            }}
          >
            Link Account
          </button>
        </div>
      </div>
    );
  }
  return (

    <div className={classes['profile-card']}>
      <div className={classes['profile-header']}>
        {profile.avatar_url && (
          <a href={profile.permalink_url} target="_blank" rel="noopener noreferrer">
            <img
              src={profile.avatar_url}
              alt={`${profile.username}'s avatar`}
              className={classes['profile-avatar']}
            />
          </a>
        )}
        <div className={classes['profile-info']}>
          <h2>{profile.username}</h2>
          {typeof profile.likes_count === 'number' && (
            <p>{profile.likes_count.toLocaleString()} likes</p>
          )}
        </div>
      </div>

      <input
        type="text"
        className={classes['profile-input']}
        placeholder="Your Profile URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <div>
        <button
          className={classes.button}
          onClick={() => sendUserUrl(url)}
        >
          Save URL
        </button>
        <button
          className={`${classes.button} ${classes['button-outline']}`}
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default ProfileDisplay;
