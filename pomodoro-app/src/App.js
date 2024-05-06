import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Timer from './pages/Timer/Timer';
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
  const [ user, setUser ] = useState(null);
  const corrId = `transaction-${Math.floor(Math.random()*100)}`


  const userItem = JSON.parse(sessionStorage.getItem('userInfo'));
  let usersession = userItem ? userItem : false;

  useEffect(() => {
    const userFunction = async(usersession) => {
      if(usersession) {
        setUser(usersession)
      } else {
        try {
          const response = await fetch('http://localhost:7000/auth/login/success', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'x-correlation-id': corrId,
              "Content-Type": "application/json",
              "Access-Control-Allow-Credentials": true
            }
          });
          const data = await response.json();
          const guser = {
            displayName: data.user.displayName,
            email: data.user.email
          }
          sessionStorage.setItem('guser', JSON.stringify(guser))
          setUser(data.user)
          console.log(data.user)
        }
        catch(err) {
          console.log(err.message)
        }
      } 
    }

    userFunction(usersession)
  },[])



  return (
    <Router>
      <UserContext.Provider value={{user, corrId}}>
        <div className='App'>
          <Header />
          <Routes>
            <Route exact path='/' Component={Timer} />
            {user && <Route path="/:username/settings" Component={Settings} /> }
            <Route path='/login' Component={Login} />
            <Route path='/signup' Component={Signup} />
            <Route path='*' Component={ErrorPage} />
          </Routes>
          <Footer />
        </div>
      </UserContext.Provider>
    </Router>
  );
}

export default App;
