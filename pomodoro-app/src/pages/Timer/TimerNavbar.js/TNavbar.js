import React, { useEffect, useState, useContext } from 'react'
import { MyContext } from '../Timer';
import Nav from 'react-bootstrap/Nav';
import axios from 'axios';
import TList from './TList';
import TReport from './TReport';

const TNavbar = () => {
    // context
    const { count } = useContext(MyContext);
    // modal state
    // list modal
    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const [list, setList] = useState(null);

    // report modal
    const [report, setReport] = useState(false)
    const handleReport = () => setReport(true);

    const user = sessionStorage.getItem('userInfo') ?
        JSON.parse(sessionStorage.getItem('userInfo'))
        : (sessionStorage.getItem('guser')) ?
            JSON.parse(sessionStorage.getItem('guser'))
            : null

    useEffect(() => {
        const getTasks = async () => {
            try {
                const { data } = await axios.post("http://localhost:5002/tasks", user)
                setList(data)
            } catch (err) {
                console.log(err.message)
            }
        }
        getTasks()
    }, [count, user])

    return (
        <div className='mb-4'>
            <Nav className='container-fluid justify-content-md-center flex-nowrap position-absolute top-0 start-0' id='timerNavigation'>
                <Nav.Item>
                    <Nav.Link className='text-white rounded-pill py-1 px-5' onClick={handleShow}>
                        Completed List
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link className='text-white rounded-pill py-1 px-5' onClick={handleReport}>
                        Report
                    </Nav.Link>
                </Nav.Item>
            </Nav> 

            {/* modal */}
            <TList show={show} setShow={setShow} list={list}/>

            {/* modal report */}
            <TReport report={report} setReport={setReport} />
        </div>
    )
}

export default TNavbar