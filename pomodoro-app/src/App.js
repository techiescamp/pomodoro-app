import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Timer from './pages/Timer/Timer';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ErrorPage from './ErrorPage';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import React, { useEffect, useState } from 'react';

function App() {
  const [ user, setUser ] = useState(null);
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
      <div className='App'>
        <Header user={user} />
        <Routes>
          <Route exact path='/' Component={Timer} />
          {user && <Route path="/:username/settings" Component={Settings} /> }
          <Route path='/login' Component={Login} />
          <Route path='/signup' Component={Signup} />
          <Route path='*' Component={ErrorPage} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
