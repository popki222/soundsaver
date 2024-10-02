import React from 'react';
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Card from '../components/Card/Card';
import axios from 'axios';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [session, setSession] = useState(null);
  const [isUserAdded, setIsUserAdded] = useState(false);

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
  }

  useEffect(() => {
    if (session && !isUserAdded) {
      addUser(session.user);
      setIsUserAdded(true);
      console.log("user added")
    }
  }, [session, isUserAdded]);
  

  if (!session) {
    return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
  }
  else {
    return (
      <>
        <Navbar />
        <Card />
        <Footer />
        
      </>
  )
  }
}

