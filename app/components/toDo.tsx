'use client';

import Modal from "@/app/components/modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarXmark, faCheck, faEdit, faFlag, faPlus, faRemove} from "@fortawesome/free-solid-svg-icons";
import React, {FormEvent, useEffect, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Checkbox} from "@headlessui/react";
import {TodoList} from "@/app/components/list";

export interface TodoType {
    todoListId: number;
    id: number;
    title: string;
    activeStatus: boolean;
    priority: TodoPriority;
    deadline: Date;
}

interface TodosProps {
    todoList: TodoList;
}

enum TodoPriority {
    'low' = 'Low',
    'medium' = 'Medium',
    'high' = 'High',
}

const ToDo = ({todoList}: TodosProps) => {
    const [isOpen, setIsOpen] = useState({add: false, edit: false});
    const [modalType, setModalType] = useState<'add' | 'edit'>('add');
    const [todoTitle, setTodoTitle] = useState('');
    const [currentTodo, setCurrentTodo] = useState<TodoType | null>(null);
    const queryClient = useQueryClient();
    const [checked, setChecked] = useState<{ [key: number]: boolean }>({});
    const [priority, setPriority] = useState<TodoPriority | null>(null)
    const [date, setDate] = useState<Date | null>(null)

    console.log(date)

    const handleCheckboxChange = (todoId: number) => {
        setChecked((prevCheckedState) => {
            setCheckedStatusTodoMutation.mutate({
                id: todoId,
                todoListId: todoList.id,
                checked: !prevCheckedState[todoId]
            })

            return {
                ...prevCheckedState,
                [todoId]: !prevCheckedState[todoId],
            }
        });
    };

    const todoQuery = useQuery<TodoType[] | 'Not found'>({
        queryKey: ['todosFetch', todoList.id],
        queryFn: () =>
            fetch(`https://66957a8e4bd61d8314cb68d0.mockapi.io/api/todo/todoList/${todoList.id}/todos`).then((res) =>
                res.json()
            ),
    });

    const addTodoMutation = useMutation({
        mutationKey: ['todoPost'],
        mutationFn: async () => {
            console.log(todoTitle)
            const postData = {
                deadline: date?.toISOString() || '',
                priority: priority,
                title: todoTitle,
                activeStatus: false,
            };
            console.log(postData)
            const res = await fetch(`https://66957a8e4bd61d8314cb68d0.mockapi.io/api/todo/todoList/${todoList.id}/todos`, {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(postData),
            });
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['todosFetch']});
            closeModal()
        },
    });

    const removeTodoMutation = useMutation({
        mutationKey: ['deletePost'],
        mutationFn: ({id, todoListId}: { id: number; todoListId: number }) =>
            fetch(`https://66957a8e4bd61d8314cb68d0.mockapi.io/api/todo/todoList/${todoListId}/todos/${id}`, {
                method: 'DELETE',
            }).then((res) => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['todosFetch']});
        },
    });

    const updateTodoMutation = useMutation({
        mutationKey: ['updatePost'],
        mutationFn: () =>
            fetch(`https://66957a8e4bd61d8314cb68d0.mockapi.io/api/todo/todoList/${todoList.id}/todos/${currentTodo?.id}`, {
                method: 'PUT',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify({title: todoTitle, priority, deadline: date?.toISOString()}),
            }).then((res) => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['todosFetch']});
            closeModal()
        },
    });

    const setCheckedStatusTodoMutation = useMutation({
        mutationKey: ['setCheckedStatusTodoMutation'],
        mutationFn: ({id, checked, todoListId}: { id: number; checked: boolean; todoListId: number }) => {
            const postData = {
                activeStatus: checked,
            };
            return fetch(`https://66957a8e4bd61d8314cb68d0.mockapi.io/api/todo/todoList/${todoListId}/todos/${id}`, {
                method: 'PUT',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(postData),
            }).then((res) => res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['todosFetch']});
        },
    });

    useEffect(() => {
        todoQuery.refetch();
    }, [todoList]);

    function closeModal() {
        setIsOpen({add: false, edit: false});
        setTodoTitle('')
        setPriority(null)
        setDate(null)
    }

    function openModal(type: 'add' | 'edit', todo?: TodoType) {
        setModalType(type);
        setCurrentTodo(todo || null);
        setTodoTitle(type === 'edit' && todo ? todo.title : '');
        setIsOpen({...isOpen, [type]: true});
        todo && setPriority(todo.priority);
        todo?.deadline && todo.deadline.toString().length > 0 && setDate(new Date(todo?.deadline));
    }

    const handleConfirm = (e: FormEvent) => {
        const postData = {
            deadline: date,
            priority: priority,
            title: todoTitle,
            activeStatus: false,
        };
        console.log(postData)
        e.preventDefault()
        if (modalType === 'add') {
            addTodoMutation.mutate();
        } else if (modalType === 'edit' && currentTodo) {
            updateTodoMutation.mutate();
        }
    };

    useEffect(() => {
        todoQuery.data !== "Not found" && todoQuery.data?.forEach(todo => {
            setChecked((prevCheckedState) => {
                return {
                    ...prevCheckedState,
                    [todo.id]: todo.activeStatus,
                }
            })
        })
    }, [todoQuery.data]);


    if (todoQuery.isLoading) return 'Loading...';

    if (todoQuery.isError) return 'An error has occurred: ' + todoQuery.error.message;

    return (
        <div>
            <div className='flex justify-between px-2 mb-2 pt-1 items-center'>
                <h3 className='font-semibold'>
                    {todoList.title}
                </h3>
                <button
                    type="button"
                    onClick={() => openModal('add')}
                    className="flex gap-x-2 items-center text-[#eaa0a2] bg-[#3a4664] rounded-md px-4 py-2 text-sm font-medium hover:bg-[#eaa0a2] hover:text-[#3a4664] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                    Add
                    <FontAwesomeIcon icon={faPlus}/>
                </button>
            </div>
            <div className='w-full'>
                {todoQuery.data && todoQuery.data !== "Not found" && todoQuery.data?.toReversed().map((todo: TodoType) => (
                    <div key={todo.id}>
                        <div className='flex justify-between px-3 py-2'>
                            <h4 className={`${checked[todo.id] ? 'line-through' : ''}`}>
                                {todo.title}
                            </h4>
                            <div className='flex gap-x-5 justify-end '>
                                <Checkbox
                                    checked={checked[todo.id]}
                                    onChange={() => handleCheckboxChange(todo.id)}
                                    className={`border-2 border-[#3a4664]/75 size-4 my-auto flex justify-center`}>
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        className={`${checked[todo.id] ? 'opacity-100' : 'opacity-0'} size-3 text-green-500`}/>
                                </Checkbox>
                                <button onClick={() => openModal('edit', todo)}>
                                    <FontAwesomeIcon icon={faEdit} color='blue'/>
                                </button>
                                <button onClick={() => {
                                    removeTodoMutation.mutate({id: todo.id, todoListId: todo.todoListId});
                                }}>
                                    <FontAwesomeIcon icon={faRemove} color='red'/>
                                </button>
                            </div>
                        </div>
                        <p className='px-3 font-bold flex gap-x-2'>{
                            todo.priority && <span><FontAwesomeIcon
                                icon={faFlag}/> {todo.priority}</span>}{(todo.deadline && todo.deadline.toString().length > 0) &&
                            <span>
                            <FontAwesomeIcon
                                icon={faCalendarXmark}/>&nbsp;{new Date(todo.deadline).toLocaleDateString()}</span>}</p>
                    </div>
                ))}
                {(todoQuery.isError || !todoQuery.data?.length || todoQuery.data === "Not found") &&
                    <h3 className='pl-5 pt-2'>
                        Add new task :)
                    </h3>
                }
            </div>
            <Modal
                isOpen={isOpen[modalType]}
                closeModal={closeModal}
                title={modalType === 'add' ? 'Add new Task' : 'Edit Task'}>
                <form onSubmit={handleConfirm}>
                    <div className="mt-3">
                        <div>
                            <input
                                type="text"
                                required={true}
                                minLength={3}
                                value={todoTitle}
                                onChange={event => setTodoTitle(event.target.value)}
                                placeholder={modalType === 'add' ? 'Name your new task' : currentTodo?.title}
                                className='border-2 border-[#3a4664] rounded-md text-[#3a4664] pl-1 w-full'/>
                        </div>
                    </div>
                    <div className='flex gap-x-3 py-3'>
                        <button
                            type='button'
                            onClick={() => setPriority(TodoPriority.low)}
                            className={`${priority === TodoPriority.low ? 'bg-[#3a4664] text-[#eaa0a2]' : 'bg-[#fff1ff]'} text-[#3a4664] bg-[#3a4664] rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 `}>
                            Low <FontAwesomeIcon icon={faFlag}/>
                        </button>
                        <button
                            type='button'
                            onClick={() => setPriority(TodoPriority.medium)}
                            className={`${priority === TodoPriority.medium ? 'bg-[#3a4664] text-[#eaa0a2]' : 'bg-[#fff1ff]'} text-[#3a4664] bg-[#3a4664] rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 `}>
                            Medium <FontAwesomeIcon icon={faFlag}/>
                        </button>
                        <button
                            type='button'
                            onClick={() => setPriority(TodoPriority.high)}
                            className={`${priority === TodoPriority.high ? 'bg-[#3a4664] text-[#eaa0a2]' : 'bg-[#fff1ff]'} text-[#3a4664] bg-[#3a4664] rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 `}>
                            High <FontAwesomeIcon icon={faFlag}/>
                        </button>
                        {priority &&
                            <button onClick={() => {
                                setPriority(null)
                            }}>
                                <FontAwesomeIcon className='my-auto'
                                                 icon={faRemove}
                                                 color='red'/>
                            </button>
                        }
                    </div>
                    <div>
                        <input type="date" value={date ? date.toISOString().split('T')[0] : undefined}
                               onChange={event => setDate(new Date(event.target.value))}/>
                        {date &&
                            <button onClick={() => {
                                setDate(null)
                            }}>
                                <FontAwesomeIcon className='my-auto'
                                                 icon={faRemove}
                                                 color='red'/>
                            </button>
                        }
                    </div>
                    <div className="mt-4">
                        <button
                            type="submit"
                            className="text-[#eaa0a2] bg-[#3a4664] rounded-md px-4 py-2 text-sm font-medium hover:bg-[#eaa0a2] hover:text-[#3a4664] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ToDo;
