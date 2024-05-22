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
import axios from 'axios';


export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [xCorrId, setXCorrId] = useState(null);

  const loc = useLocation();
  const getUser = JSON.parse(sessionStorage.getItem('userinfo')) || null;

  useEffect(() => {
    const getUserInfo = async() => {
      try {
        if (getUser) {
          setUser(getUser);
          setXCorrId(getUser.xCorrId);
        } else {
          const correlationId = `transaction-${Math.ceil(Math.random() * 500)}`;
          const response = await axios.get('http://localhost:7000/auth/login/success', {
            withCredentials: 'include',
            headers: {
              'x-correlation-id': correlationId,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Credentials': true
            }
          })
          const { data } = response;
          const guser = {
            displayName: data.user.displayName,
            email: data.user.email
          }
          sessionStorage.setItem('guser', JSON.stringify(guser))
          setUser(data.user)
          setXCorrId(data.corrId);
        }
      } catch(err) {
        console.error('Network error: ', err)
      }
    }
    getUserInfo()
  }, [loc])

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
