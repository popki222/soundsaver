import React, { useState, useEffect } from 'react';
import musicHeart from '../../assets/music_heart.png';
import classes from './SongDisplay.module.css';
import axios from 'axios';

function SongDisplay() {
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('true');
  const [click, setClick] = useState(0)

  useEffect(()=>{
    axios.get('http://localhost:5000/db')
    .then(res => setData(res.data))
    .catch(err => console.log(err))
  }, [click])

  const handleToggle = (type) => {
    setFilter(type); // Update the filter state based on button clicked
  };

  const filteredData = data.filter(song => song.active === filter);

  const runScan = async () => {
    try{
        await axios.get('http://localhost:5000/test/scan')
        setClick(click+1);
    } catch(err){
        console.log(err)
    }
  };


  return (
    <div>
      <div className={classes.toggleButtons}>
        <button onClick={() => handleToggle('true')}>Current Library</button>
        <button onClick={() => handleToggle('false')}>Missing Tracks</button>
      </div>
      <div className={classes.table}>
        <table>
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
                      <td>{user.title}</td>
                      <td>{user.artist}</td>
                </tr>
              })
            }
          </tbody>
        </table>
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
    </div>
  );
}

export default SongDisplay;
