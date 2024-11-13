import React, { useState, useEffect } from 'react';
import musicHeart from '../../assets/music_heart.png';
import classes from './SongDisplay.module.css';
import axios from 'axios';

function SongDisplay({ userid }) {
  const [data, setData] = useState([])
  const [filter, setFilter] = useState(true);
  const [click, setClick] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [scanMessage, setScanMessage] = useState('');

  useEffect(()=>{
    axios.get(`http://localhost:5000/db?userid=${userid}`)
    .then(res => setData(res.data))
    .catch(err => console.log(err))
  }, [click])

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
        const response = await axios.get(`http://localhost:5000/get/scan?userid=${userid}`);

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


  return (
    <div>
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
              filteredData.map((user, index) => {
                return <tr key={index}>
                      <td>
                        <a href={user.permalink_url}>
                          <img src={user.artwork_url}></img>
                        </a>
                      </td>
                      <td>
                        <a href={user.permalink_url} target="_blank" rel="noopener noreferrer" className="customLink">
                          {user.title}
                        </a>
                      </td>
                      <td>{user.artist}</td>
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
    {scanMessage && <p className={classes.scanMessage}>{scanMessage}</p>}
    </div>
  );
}

export default SongDisplay;
