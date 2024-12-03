import React from 'react';
import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Card from '../components/Card/Card';
import axios from 'axios';
import { supabase } from '../utils/supabase';



export default function Home() {
  const [session, setSession] = useState(null);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [scUser, setScUser] = useState("");
  

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const addUser = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/user/addUser', userData)
      console.log('User added successfully:', response.data);
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };
  
  const checkUserExists = async (email) => {
    try {
      const response = await axios.get(`http://localhost:5000/user/checkUser?email=${email}`);
      return response.data;
    } catch (err) {
      console.error('Error checking user:', err);
      return false;
    }
  };
  
  useEffect(() => {
    const handleUser = async () => {
      console.log("handleUser ran: checked if user already exists")
      if (session && !isUserChecked) {
        const userExists = await checkUserExists(session.user.email);
        if (!userExists) {
          await addUser(session.user);
        }
        setIsUserChecked(true);
      }
    };

    if (session && !isUserChecked) {
      handleUser();
    }
  }, [session]);

  useEffect(() => {
    if (session){
      (async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          const response = await axios.get(`http://localhost:5000/getUser/`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (response) {
            setScUser(response.data.username);
            console.log(response.data.username)
          }
        } catch (error) {
          console.error("Error fetching SoundCloud user:", error);
        }
      })();
    }
}, [session]);
  

  if (!session) {
    return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
  }
  else {
    return (
      <>
        <Navbar />
        <p className="scUserText">{scUser ? `Welcome back, ${scUser}!` : 'Input soundcloud user in Profile tab'}</p>
        <Card />
        <Footer />
        
      </>
  )
  }
}

