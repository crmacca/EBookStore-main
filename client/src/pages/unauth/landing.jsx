import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LandingPage = ({ user }) => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/books`);
                setBooks(response.data);
            } catch (error) {
                console.error('Error loading books:', error);
            }
        };
        loadBooks();
    }, []);

    return (
        <div className="bg-orange-50 w-full min-h-screen">
            <div className="max-w-full md:max-w-7xl m-auto h-screen p-4 md:p-20 flex flex-col">
                <div className="flex items-center justify-start gap-2">
                    <img alt='CornerOfBooks Logo' src='/logoSM.png' className="w-40 hidden md:block"/>
                    <div>
                        <h1 className='text-zinc-900 font-merriweather text-5xl font-bold'>
                            E-Book
                        </h1>
                        <h1 className='text-zinc-900 font-merriweather text-3xl font-regular'>
                            Corner Store
                        </h1>
                    </div>
                    {user === null ? (
                        <div className="ml-auto flex flex-col gap-y-2 h-full font-merriweather text-2xl font-bold">
                            <button onClick={() => window.location.pathname = '/login'} className="bg-zinc-900 flex-grow rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                                Log In
                            </button>
                            <button onClick={() => window.location.pathname = '/signup'} className="flex-grow bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                                Sign Up
                            </button>
                        </div>
                    ) : (
                        <div className="ml-auto flex flex-col gap-y-2 h-full font-merriweather text-2xl font-bold">
                            <button onClick={() => window.location.pathname = '/app'} className="bg-zinc-900 flex-grow rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                                My Bookshelf
                            </button>
                            <button onClick={() => axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`).then((res) => window.location.reload())} className="flex-grow bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-2xl pt-2">
                    Your one-stop shop for the <u>world's <b>worst</b></u> e-books!
                </p>

                <h1 className='text-zinc-900 font-merriweather text-4xl font-bold mt-10'>
                    Our Catalogue
                </h1>
                <div className="w-full flex-grow mt-2 border-black border rounded-xl p-5 grid justify-start grid-cols-2 md:grid-cols-4 gap-4">
                    {books.map((book) => (
                        <button onClick={() => window.location.pathname = `/store/book/${book.id}`} key={book.id} className="flex flex-col items-center hover:underline hover:brightness-75 group h-fit w-fit">
                            <img alt={`Front cover of ${book.title}`} src={`${process.env.REACT_APP_BACKEND_URL}/api/books/${book.id}/cover`} className="h-[20rem] w-full rounded-xl border-2 border-zinc-900 object-cover object-center group-hover:brightness-75"/>
                            <h1 className="font-merriweather font-semibold group-hover:underline text-xl">
                                {book.title}
                            </h1>
                            <h1 className="font-merriweather text-1xl">
                                {book.price} Credits
                            </h1>
                        </button>
                    ))}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 w-full flex items-center justify-center py-2">
                <h1>
                (For legal reasons) This entire site is a joke. | ©{" "}
                {new Date().getFullYear()} ChrisMC Developments | <a className='underline cursor-pointer' onClick={() => {window.location.pathname = '/policies/use'}}>Acceptable Use Policy</a>
                </h1>
            </div>
        </div>
    );
};

export default LandingPage;