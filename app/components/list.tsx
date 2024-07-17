'use client';

import Modal from "@/app/components/modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRemove, faSpinner} from "@fortawesome/free-solid-svg-icons";
import React, {Dispatch, SetStateAction, useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {TodoType} from "@/app/components/toDo";


export interface TodoList {
    id: number;
    title: string;
}

interface ListProps {
    lists: TodoList[];
    setSelectedList: Dispatch<SetStateAction<TodoList | null>>
    selectedList: TodoList;
}

const List = ({lists, setSelectedList, selectedList}: ListProps) => {
    const safeLists = Array.isArray(lists) ? lists : [];
    const [isOpen, setIsOpen] = useState(false);
    const [newList, setNewList] = useState('New List');
    const [isLoading, setIsLoading] = useState<number | false>(false)
    const queryClient = useQueryClient();

    const addListMutation = useMutation({
        mutationKey: ['listPost'],
        mutationFn: async ({list}: { list: string }) => {
            const postData = {
                title: list,
                activeStatus: false,
            }
            const res = await fetch('https://66957a8e4bd61d8314cb68d0.mockapi.io/api/todo/todoList', {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(postData)
            });
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['ListFetch']});
        }
    })

    const removeListMutation = useMutation({
        mutationKey: ['deletePost'],
        mutationFn: ({listId}: {
            listId: number
        }) => fetch(`https://66957a8e4bd61d8314cb68d0.mockapi.io/api/todo/todoList/${listId}`, {
            method: 'DELETE',
        }).then((res) =>
            res.json(),
        ),
        onSuccess: (data, variables) => {
            setSelectedList(null);
            queryClient.setQueryData(['ListFetch'], (oldData: TodoList[]) => {
                return oldData.filter(list => {
                    return list.id !== variables.listId
                })
            })
        }
    })

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

    async function deleteList(listID: number) {
        setIsLoading(listID);
        try {
            const response: TodoType[] = await queryClient.fetchQuery({
                queryKey: ['todosFetch', listID],
                queryFn: ({queryKey}) =>
                    fetch(`https://66957a8e4bd61d8314cb68d0.mockapi.io/api/todo/todoList/${queryKey[1]}/todos`).then((res) =>
                        res.json()
                    ),
            })
            await Promise.all(response.map(async (todo) => {
                await removeTodoMutation.mutateAsync({id: todo.id, todoListId: listID})
            }));
            await removeListMutation.mutateAsync({listId: listID})
            setIsLoading(false)
        } catch (e) {
            console.error(e)
            setIsLoading(false)
        }
    }

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }

    function handleListClick(list: TodoList) {
        setSelectedList(list);
    }

    return (
        <div className='min-h-80'>
            <div className='flex justify-between p-2 items-center'>
                <h3 className='font-semibold'>
                    My Lists
                </h3>
                <button
                    type="button"
                    onClick={openModal}
                    className="flex gap-x-2 items-center text-[#eaa0a2] bg-[#3a4664] rounded-md px-4 py-2 text-sm font-medium hover:bg-[#eaa0a2] hover:text-[#3a4664] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                    Add
                    <FontAwesomeIcon icon={faPlus}/>
                </button>
            </div>
            <div className='overflow-auto max-h-96 p-2'>
                <div className='w-full mb-2'>
                    <div>
                        {safeLists.toReversed().map((list) => (
                            <div key={list.id} onClick={() => handleListClick(list)}
                                 className={`flex justify-between p-1 align-middle cursor-pointer border-2 ${selectedList?.id === list.id ? 'shadow-md shadow-[#fff1ff]/30 border-[#fff1ff] bg-[#fff1ff] rounded-lg' : 'border-black/0'}`}>
                                <p className=' my-auto'>{list.title}</p>
                                <button onClick={() => {
                                    deleteList(list.id)
                                }}>
                                    <FontAwesomeIcon className='my-auto'
                                                     icon={(isLoading === list.id) ? faSpinner : faRemove}
                                                     spin={(isLoading === list.id)}
                                                     color='red'/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isOpen}
                closeModal={closeModal}
                title={'Add new List'}>
                <div className="mt-3">
                    <div>
                        <input type="text" value={newList} onChange={event => setNewList(event.target.value)}
                               placeholder='add new List'
                               className='border-2 border-[#3a4664] rounded-md text-[#3a4664] pl-1 w-full'/>
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        type="button"
                        className="text-[#eaa0a2] bg-[#3a4664] rounded-md px-4 py-2 text-sm font-medium hover:bg-[#eaa0a2] hover:text-[#3a4664] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                        onClick={() => {
                            addListMutation.mutate({
                                list: newList
                            })
                            closeModal()
                        }}
                    >Confirm
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default List;
