import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LandingLogin from './components/LandingLogin/LandingLogin'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <LandingLogin />
    </>
  )
}

export default App
