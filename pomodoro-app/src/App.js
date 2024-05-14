import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ErrorPage from './ErrorPage';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import React, { createContext, useEffect, useState } from 'react';
// import {v4 as uuidv4 } from 'uuid';

export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [xCorrId, setXCorrId] = useState(null);

  const loc = useLocation();
  
  useEffect(() => {
    const getUser = JSON.parse(sessionStorage.getItem('userinfo')) || null;
    if(getUser) {
      setUser(getUser);
      setXCorrId(getUser.xCorrId);
    }
  },[loc])

  return (
    <UserContext.Provider value={{ user, setUser, xCorrId, setXCorrId }}>
      <div className='App'>
        <Header />
        <Routes>
          <Route exact path='/' Component={Home} />
          <Route path="/:username/settings" Component={Settings} />
          <Route path='/login' Component={Login} />
          <Route path='/signup' Component={Signup} />
          <Route path='*' Component={ErrorPage} />
        </Routes>
        <Footer />
      </div>
    </UserContext.Provider>
  );
}

export default App;
