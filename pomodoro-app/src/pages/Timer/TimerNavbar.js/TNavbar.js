import React, { useEffect, useState, useContext } from 'react'
import Nav from 'react-bootstrap/Nav';
import axios from 'axios';
import TList from './TList';
import TReport from './TReport';
import { UserContext } from '../../../App';
import { MyContext } from '../Timer';

const TNavbar = () => {
    // context
    const { user, xCorrId } = useContext(UserContext)
    const { count } = useContext(MyContext)

    // list modal
    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const [list, setList] = useState(null);

    // report modal
    const [report, setReport] = useState(false)
    const handleReport = () => setReport(true);

    useEffect(() => {
        if (user) {
            console.log('navbar-list')
            console.log(xCorrId);
            axios.post("http://localhost:7000/tasks", user, {
                headers: {
                    'x-correlation-id': xCorrId
                }
            })
                .then(res => {
                    setList(res.data)
                })
        }
    }, [user, count])

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
            <TList user={user} show={show} setShow={setShow} list={list} />

            {/* modal report */}
            <TReport user={user} report={report} setReport={setReport} list={list} />
        </div>
    )
}

export default TNavbar