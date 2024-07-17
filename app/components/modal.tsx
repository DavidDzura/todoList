import {Dialog, Transition} from '@headlessui/react'
import {Fragment, ReactNode} from 'react'
import {faRemove} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface ModalProps {
    title: string;
    children: ReactNode;
    isOpen: boolean;
    closeModal: () => void;
}

export default function Modal({title, children, isOpen = false, closeModal}: ModalProps) {

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/25"/>
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95">
                                <Dialog.Panel
                                    className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#fff1ff] p-6 text-left align-middle shadow-xl transition-all">
                                    <FontAwesomeIcon icon={faRemove} color='black'
                                                     className='absolute right-3 top-3 border-black border-2 rounded-full size-4 cursor-pointer'
                                                     onClick={closeModal}
                                    />
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-[#3a4664]">
                                        {title}
                                    </Dialog.Title>
                                    {children}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
