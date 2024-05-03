import React, { useContext } from 'react'
import { MyContext } from '../Timer';
import TaskButtons from './TaskButtons';
import '../Timer.css';

const TaskForm = ({ form, setForm, isUpdate, setIsUpdate }) => {
    const { todo, setTodo } = useContext(MyContext);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let isTask = JSON.parse(sessionStorage.getItem('todo'));
        if(isTask){
            setTodo([...isTask, form]);  
            sessionStorage.setItem('todo', JSON.stringify([...isTask, form]));
        } else {
            setTodo([...todo, form]);  
            sessionStorage.setItem('todo', JSON.stringify([...todo, form]));
        }
        setForm({
            id: todo.length + 1,
            title: '',
            description: '',
            project_title: '',
            act: 0,
            checked: false
        });
    }

    const handleUpdate = (e) => {
        e.preventDefault();
        const newTodo = todo.map(i => {
            if(i.id === form.id) {
                const updateForm = form;
                return updateForm
            }
            return i
        })
        setTodo(newTodo)
        sessionStorage.setItem('todo', JSON.stringify(newTodo));
        setIsUpdate(false)
        setForm({
            id: todo.length + 1,
            title: '',
            description: '',
            project_title: '',
            act: 0,
            checked: false
        })
    }

    const handleCancel = (e) => {
        e.preventDefault();
        let taskform = document.getElementById('taskform');
        let addBtn = document.getElementById('addBtn');
        addBtn.style.display = 'block';
        taskform.style.display = 'none';
    }

    const handleEditInputChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    return (
            <div className='bg-light text-dark p-3 mb-3 rounded-2' id='taskform'>
                <form id='formElement'>
                    <input
                        className='form-control bg-secondary-subtle mb-3'
                        value={form.title}
                        name='title'
                        onChange={isUpdate ? handleEditInputChange : handleChange}
                        placeholder='What are you working for?'
                    />
                    {/* add acts */}
                    <div className='d-flex align-items-center'>
                        <input type='number' 
                            className='form-control w-25 me-2' name='act' 
                            value={Number(form.act) ? Number(form.act) : 0} 
                            placeholder={Number(0)}
                            onChange={isUpdate ? handleEditInputChange : handleChange} 
                        />
                        <span className='fs-3 me-2'> / </span>
                        <input type='number' className='form-control w-25 me-2' name='act-1' value={1} disabled />
                        <span className='me-2'>Act</span>
                    </div>

                    <TaskButtons 
                        form={form}
                        isUpdate={isUpdate}
                        handleChange={handleChange}
                        handleEditInputChange={handleEditInputChange}
                    />

                    {/* cancel, submit button */}
                    <div className='text-md-end mx-5 mt-3' id='task-btn'>
                        <button className='btn btn-light me-3' onClick={handleCancel}>Cancel</button>
                        <button className='btn btn-dark' type='submit' onClick={isUpdate ? handleUpdate : handleSubmit}>
                            {isUpdate ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
    )
}

export default TaskForm