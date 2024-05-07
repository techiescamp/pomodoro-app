import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../App';

const Login = () => {
    const { corrId } = useContext(UserContext);

    const navigate = useNavigate();
    const [status, setStatus] = useState(false);
    const [userLogin, setUserLogin] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setUserLogin({
            ...userLogin,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const cid = corrId || `(transaction-${Math.ceil(Math.random()*10)})`;
        axios.post("http://localhost:7000/user/login", userLogin, {
            headers: {
                'x-correlation-id': cid
            }
        })
        .then(res => {
            // sessionStorage.setItem('token', JSON.stringify(res.data));
            //
            console.log(res.data.token)
            axios.post('http://localhost:7000/user/verifyUser', res.data, {
                headers: {
                    'x-correlation-id': cid,
                    'x-access-token': res.data.token
                }
            })
            .then(res => {
                setStatus(res.data)
                navigate('/', {state: res.data})
            })
        })
        .catch(err => {
            setStatus(err.response.data)
        })
        setUserLogin({
            email: '',
            password: ''
        });
    }

    // const user = (usertoken) => {
    //     axios.post("http://localhost:7000/user/userInfo", usertoken, {
    //         headers: {
    //             'x-correlation-id': corrId,
    //             "x-access-token": usertoken.token,
    //         }
    //     }).then(res => {
    //         const result = res.data.result
    //         const login = {
    //             userId: result.userId,
    //             displayName: result.displayName,
    //             avatar: result.avatar,
    //             email: result.email
    //         }
    //         sessionStorage.setItem('userInfo', JSON.stringify(login));
    //         navigate('/')
    //     });
    // }

    const loginGoogle = () => {
        window.open("http://localhost:7000/auth/google", "_self")
    }

    const inlineStyle = {
        color: getColor(),
        borderRadius: '10px',
        padding: '5px'
    }
    function getColor() {
        if (status.success) {
            return '#83f28f'
        } else {
            return '#FFC1C3'
        }
    }

    return (
        <main className='main-container text-center'>
            <div className="form-container mx-auto pt-5">
                <div className='form-wrapper mx-auto border border-outline-secondary p-2 bg-light'>
                    <h3 className='m-3'>LOGIN FORM</h3>
                    {status ? <p style={inlineStyle}>{status.message}</p> : null}

                    <form onSubmit={handleSubmit}>
                        <div className='w-75 mx-auto'>
                            <input
                                type='email'
                                name='email'
                                value={userLogin.email}
                                onChange={handleChange}
                                className='form-control mb-3 border border-secondary rounded-1'
                                placeholder='Enter your email'
                                required
                            />
                            <input
                                type='password'
                                name='password'
                                value={userLogin.password}
                                onChange={handleChange}
                                className='form-control mb-3 border border-secondary rounded-1'
                                placeholder='Enter your password'
                                required
                            />
                            <button className='btn btn-primary w-100'>Continue</button>
                        </div>
                    </form>
                    <p className='m-3'>Or continue with:</p>
                    <div className='w-75 mx-auto'>
                        <button className='btn btn-outline-secondary w-100 mb-3 social-btn' onClick={loginGoogle}>
                            <i className="bi bi-google text-danger me-2"></i> Google
                        </button>

                    </div>
                    <p>Can't Login ? <Link to='/signup'>Create Account</Link></p>
                    <hr className='w-50 mx-auto' />
                    <div>
                        <h4 className='mb-3 text-danger fw-bold'>Pomodoro</h4>
                        <p className='small'>Privacy Policy <span>.</span> User Notice</p>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Login