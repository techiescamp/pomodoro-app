import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { jsPDF } from 'jspdf';

const TList = ({show, setShow, list}) => {
    const handleClose = () => setShow(false);

    const downloadbtn = () => {
        const tb = document.getElementById('tableList');
        var doc = new jsPDF('p', 'pt', 'a4');
        doc.html(tb, {
            callback: function(doc) {
                doc.save('focus_report.pdf');
            },
            margin: [20, 40, 20, 40],
            x: 32,
            y: 32
        });
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Your tasks list</Modal.Title>
                <Button variant='none' className='mx-5 btn-outline-primary' onClick={downloadbtn}>Download</Button>
            </Modal.Header>
            <Modal.Body id='tableList'>
                <h4 className='text-center text-decoration-underline mb-4'>Focus Report</h4>
                <Table striped bordered responsive>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Focus time</th>
                            <th>Project</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list && list.userTasks.map(t => {
                            return (
                                <tr key={t.date}>
                                    <td>{t.date}</td>
                                    <td>
                                        <ul style={{listStyle: 'none', padding: 0}}>
                                            {t.tasks.map(task => {
                                                return (
                                                    <li key={task.id}>{task.title ? task.title : '-'}</li>
                                                )
                                            })}
                                        </ul>
                                    </td><td>
                                        <ul style={{listStyle: 'none', padding: 0}}>
                                            {t.tasks.map(task => {
                                                return (
                                                    <li key={task.id}>{task.act ? task.act*25 : 0}<span> min</span></li>
                                                )
                                            })}
                                        </ul>
                                    </td>
                                    <td>
                                        <ul style={{listStyle: 'none'}}>
                                            {t.tasks.map(task => {
                                                return (
                                                    <li key={task.id}>{task.project_title ? task.project_title : '-'}</li>
                                                )
                                            })}
                                        </ul>
                                    </td>
                                </tr>
                            )

                        })}
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>
    )
}

export default TList