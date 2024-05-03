import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

const TReport = ({ report, setReport }) => {
    const [labels, setLabels] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [mtask, setMTask] = useState(null);

    const handleClose = () => setReport(false);
    const user = sessionStorage.getItem('guser') ? 
        JSON.parse(sessionStorage.getItem('guser'))
        : JSON.parse(sessionStorage.getItem('userInfo'))
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

    useEffect(() => {
        axios.post("http://localhost:5002/tasks", user)
            .then(result => { 
                setLabels(result.data.userTasks.map(i => i.date));
                const t = result.data.userTasks.map(i => i.tasks.reduce((total, t)  => {
                    return total += t.act*25
                }, 0))
                setTasks(t);

                const ml = result.data.userTasks.map(i => {
                    let total = 0
                    // tasks => j
                    for(let j=0; j<i.tasks.length; j++) {
                        total = total + i.tasks[j].act*25
                    }
                    return {
                        act: total,
                        month: i.date.split('/')[0]
                    }
                })
                const r = month.map((m, index) => {
                    let total = 0
                    ml.map(t => {
                        if(Number(t.month) === index+1) {
                            total += t.act
                        }
                    })
                    return total 
                });
                setMTask(r);
            })
    }, [])
    // const monthLabel = labels.map(i => i.split('/')[0])
    const data = {
        labels,
        datasets: [
            {
                label: 'Focus time',
                data: tasks,
                backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
        ]
    } 
    const mdata ={
        labels: month,
        datasets: [
            {
                label: 'Monhtly Focus time',
                data: mtask,
                backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'UserFocus report'
            }
        }
    }
    const showWeekly = () => {
        document.getElementById('weekly').style.display = 'block'
        document.getElementById('monthly').style.display = 'none'
    }
    const showMonthly = () => {
        document.getElementById('weekly').style.display = 'none'
        document.getElementById('monthly').style.display = 'block'
    }

    return (
        <>
            <Modal show={report} onHide={handleClose} id='report'>
                <section className='mt-3 w-75'>
                    <Modal.Header closeButton>
                        <Modal.Title>Report on your day's focus</Modal.Title>
                    </Modal.Header>
                    <div className='text-center my-4'>
                        <button className='btn btn-outline-danger me-3' onClick={showWeekly}>Weekly</button>
                        <button className='btn btn-outline-danger' onClick={showMonthly}>Monthly</button>
                    </div>
                    <Modal.Body id='weekly'>
                        <h4 className='mb-3 text-center text-decoration-underline text-danger fw-bold'>Weekly Report</h4>
                        <Bar options={options} data={data} className='mb-4'/>
                    </Modal.Body>

                    <Modal.Body id='monthly'>
                        <h4  className='mb-3 text-center text-decoration-underline text-danger fw-bold'>Monthly Report</h4>
                        <Bar options={options} data={mdata} className='mb-4'/>
                    </Modal.Body>
                </section>
                
            </Modal>
        </>
    )
}

export default TReport;