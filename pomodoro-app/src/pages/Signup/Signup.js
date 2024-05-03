import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';


const Signup = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState(false);
    const [userDetails, setUserDetails] = useState({
        displayName: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setUserDetails({
            ...userDetails,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:5000/user/signup", {
            method: 'POST',
            body: JSON.stringify(userDetails),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (res.status === 200) return res.json()
                throw new Error("Not registered")
            })
            .then(data => {
                setStatus(data);
                navigate("/login")
            });

        setUserDetails({
            displayName: '',
            email: '',
            password: ''
        })
    }

    const registerGoogle = () => {
        window.open('http://localhost:5000/auth/google', "_self");
    }

    const inlineStyle = {
        backgroundColor: getColor(),
        color: 'white',
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
                    <h3 className='m-3'>SIGN UP FORM</h3>
                    {status ? <p style={inlineStyle}>{status.message}</p> : null}

                    <form onSubmit={handleSubmit}>
                        <div className='w-75 mx-auto'>
                            <input
                                type='text'
                                name='displayName'
                                value={userDetails.displayName}
                                onChange={handleChange}
                                className='form-control mb-3 border border-secondary rounded-1'
                                placeholder='Your Full name'
                                required
                            />
                            <input
                                type='email'
                                name='email'
                                value={userDetails.email}
                                onChange={handleChange}
                                className='form-control mb-3 border border-secondary rounded-1'
                                placeholder='Enter your email'
                                required
                            />
                            <input
                                type='password'
                                name='password'
                                value={userDetails.password}
                                onChange={handleChange}
                                className='form-control mb-3 border border-secondary rounded-1'
                                placeholder='Enter your email'
                                required
                            />
                            <p className='text-start' style={{ fontSize: '12px' }}>
                                By signing up, I accept the DevOpsDock <Link to='/termsConditions'>Terms of Service </Link>
                                and acknowledge the <Link to='/privacyPolicy'>Privacy Policy.</Link>
                            </p>
                            <button className='btn btn-primary w-100'>Sign up</button>
                        </div>
                    </form>

                    <p className='m-3'>Or continue with:</p>

                    <div className='w-75 mx-auto'>
                        <button className='btn btn-outline-secondary w-100 mb-3 social-btn' onClick={registerGoogle}>
                            <i className="bi bi-google text-danger me-2"></i> Google
                        </button>
                    </div>

                    <p>Already have an account ? <Link to='/login'>Login here</Link></p>

                    <hr className='w-50 mx-auto' />

                    <div>
                        <h4 className='mb-3 fw-bold'>DevOpsDock</h4>
                        <p className='mb-1 small'>One account for DevOpsCube Group</p>
                        <p className='small'>Privacy Policy <span>.</span> User Notice</p>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Signup