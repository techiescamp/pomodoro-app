import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ErrorPage from './ErrorPage';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import config from './config';

export const UserContext = createContext();
const apiUrl = config.development.apiUrl;

function App() {
  const [user, setUser] = useState(() => {
    const getUser = JSON.parse(sessionStorage.getItem('userinfo')) || null;
    return getUser ? getUser : null
  });
  const [xCorrId, setXCorrId] = useState(null);
  const [ loginType, setLoginType ] = useState(() => {
    return sessionStorage.getItem('loginType') || 'custom';
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        setXCorrId(user.xCorrId);
      }
      const correlationId = `transaction-${Math.ceil(Math.random() * 500)}`;
      if(loginType === 'google') {
          const response = await axios.get(`${apiUrl}/auth/login/success`, {
            withCredentials: 'include',
            headers: {
              'x-correlation-id': correlationId,
              'Content-Type': 'application/json',
              "Access-Control-Allow-Credentials": true
            }
          })
          if(response.status !== 200) {
            return;
          } else {
            const guser = {
              displayName: response.data.user.displayName,
              email: response.data.user.email
            }
            sessionStorage.setItem('guser', JSON.stringify(guser))
            setUser(response.data.user)
            setXCorrId(response.data.corrId);
          }
        }
    }
  
    fetchUser();
  },[user, loginType])

  return (
    <UserContext.Provider value={{ user, setUser, xCorrId, setXCorrId, setLoginType }}>
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
