'use client';
import React, {useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import ToDo from "@/app/components/toDo";
import List, {TodoList} from "@/app/components/list";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";

export default function Home() {
    const [selectedList, setSelectedList] = useState<TodoList | null>(null);
    const [showTodo, setShowTodo] = useState(false);

    const listQuery = useQuery({
        queryKey: ['ListFetch'],
        queryFn: () =>
            fetch('https://66957a8e4bd61d8314cb68d0.mockapi.io/api/todo/todoList').then((res) =>
                res.json(),
            ),
    });

    if (listQuery.isLoading) return 'Loading...';

    if (listQuery.isError) return 'An error has occurred: ' + listQuery.error.message;

    const handleListClick = (list: TodoList) => {
        setSelectedList(list);
        setShowTodo(true);
    };

    const handleBackClick = () => {
        setShowTodo(false);
    };

    return (
        <main className="max-w-4xl mx-auto mt-5">
            <div className='w-80 md:w-full lg:w-full min-h-96 mt-5 mx-auto px-2 lg:px-0'>
                <h1 className='text-center font-bold'>My todo</h1>
                <div className='flex w-full h-full border-black mt-5'>
                    <div
                        className={`mx-auto w-full md:w-1/2 md:min-w-[304px] lg:w-1/4 bg-[#aaaaaa] border-[#3a4664] border-2 lg:border-r-0 rounded-2xl lg:rounded-r-none ${
                            showTodo ? 'hidden lg:block' : 'block'
                        }`}>
                        <List lists={listQuery.data} setSelectedList={handleListClick} selectedList={selectedList}/>
                    </div>
                    <div
                        className={`mx-auto w-full md:min-w-[304px] lg:w-3/4 bg-[#ffdbdc] border-[#3a4664] border-2 rounded-2xl lg:rounded-l-none p-2 ${
                            showTodo ? 'block' : 'hidden lg:block'
                        }`}>
                        <button
                            onClick={handleBackClick}
                            className='lg:hidden text-[#3a4664] pl-2 transform transition-transform duration-1000 hover:scale-125'>
                            <FontAwesomeIcon icon={faArrowLeft}/>
                        </button>
                        {selectedList && <ToDo todoList={selectedList}/>}
                    </div>
                </div>
            </div>
        </main>
    );
}
