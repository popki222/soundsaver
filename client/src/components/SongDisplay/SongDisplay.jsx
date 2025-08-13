import React, { useState, useEffect } from 'react';
import classes from './SongDisplay.module.css';
import axios from 'axios';
import { supabase } from '../../utils/supabase';

function SongDisplay() {
  const [data, setData] = useState([])
  const [filter, setFilter] = useState(true);
  const [click, setClick] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [scanMessage, setScanMessage] = useState('');
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
  
        if (session && session.user) {
          const response = await axios.get('http://localhost:5000/db', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          setData(response.data);
        } else {
          console.error('No session or user found!');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
  
    fetchData();
  }, [click]);

  const handleToggle = (type) => {
    setFilter(type);
  };

  const filteredData = data
    .filter((song) => song.active === filter)
    .filter ((song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()))

  const runScan = async () => {
    try{
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        setScanMessage('scanning...');
        const response = await axios.get(`http://localhost:5000/get/scan`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          }
        });

        if (response.status === 200) {
          setScanMessage('Songs fetched and stored successfully.');
          setClick(click+1);
        }

    } catch(err){
      if (err.response && err.response.status === 400) {
        setScanMessage('Cannot scan - User already scanned today.');
      } else {
        setScanMessage('An error occurred during the scan.');
        console.log(err)
      }
    }

    setTimeout(() => {
      setScanMessage('');
    }, 6000);
  };

  

  const removeTrack = async (songid) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await axios.delete(`http://localhost:5000/song/delete`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        data: {
          songId: songid,
        }
      });
      
    } catch (error) {
      console.error('Error Deleting song:', error);
    }
  }

  const reuploadTrack = async (songid) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await axios.get(`http://localhost:5000/song/download?songId=${songid}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });
      window.location.href = response.data.downloadUrl;
      
    } catch (error) {
      console.error('Error reuploading song:', error);
    }
  }

  return (
    <div>
      <h1>{filter? 'Current Soundcloud Library' : 'Missing Tracks'}</h1>
      <div className={classes.searchBar}>
        <input className={classes.searchBar2}
          type="text"
          placeholder="Search by title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className={classes.toggleButtons}>
        <button onClick={() => handleToggle(true)}>Current Library</button>
        <button onClick={() => handleToggle(false)}>Missing Tracks</button>
      </div>
      <div className={classes.tableContainer}>
      <div className={classes.scrollableContainer}>
        <table className={classes.songTable}>
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Artist</th>
              
            </tr>
          </thead>
          <tbody>
            {
              filteredData.map((user) => {
                return <tr key={user.id}>
                      <td>
                          <img src={user.artwork_url}></img>
                      </td>
                      <td>
                        <a href={user.permalink_url} target="_blank" rel="noopener noreferrer" className="customLink">
                          {user.title}
                        </a>
                      </td>
                      <td>{user.artist}</td>
                      {filter == false && 
                      <>
                      <button onClick={() => {removeTrack(user.id); setClick(click+1);}}>Remove</button> 
                      <button onClick={() => {reuploadTrack(user.id); setClick(click+1);}}>Reupload</button>
                      </>}
                </tr>
              })
            }
          </tbody>
        </table>
        </div>
      </div>
      <div className={classes.buttons}>
      <button className={classes.pushable} onClick={runScan}>
        <span className={classes.shadow}></span>
        <span className={classes.edge}></span>
        <span className={classes.front}>
            Run Scan
        </span>
      </button>
      </div>
      <div className={classes.messageContainer}>
        {scanMessage && <p className={classes.scanMessage}>{scanMessage}</p>}
        {scanMessage === 'scanning...' && <div className={classes.spinner}></div>}
      </div>
    </div>
  );
}

export default SongDisplay;
