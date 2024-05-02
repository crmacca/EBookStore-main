import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminBookForm from './admin_form';

const AdminOverview = ({ user }) => {
    const [isAdmin, setIsAdmin] = useState(null);
    const [books, setBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/adminstatus`);
                setIsAdmin(res.data.isAdmin);
                if (res.data.isAdmin) {
                    loadBooks();
                } else {
                    console.log('You are not an admin, you will not be able to see any data. 🤷‍♂️');
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkAdminStatus();
    }, [user]);

    const loadBooks = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/books`);
            setBooks(response.data);
        } catch (error) {
            console.error('Error loading books:', error);
        }
    };

    const handleEdit = (book) => {
        setSelectedBook(book);
        setShowForm(true);
    };

    const handleCreate = () => {
        setSelectedBook(null);
        setShowForm(true);
    };

    // Assuming deletion is also required
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/books/${id}`)
            loadBooks(); // Refresh the list after deletion
        } catch (error) {
            console.error('Failed to delete book:', error);
        }
    };


    return isAdmin ? (
        <div className="bg-orange-50 w-full min-h-screen">
            <div className="max-w-full md:max-w-7xl m-auto h-screen p-4 md:p-20 flex flex-col">
                <div className="flex items-center justify-start gap-2">
                    <img alt='CornerOfBooks Logo' src='/logoSM.png' className="w-40 hidden md:block"/>
                    <div>
                        <h1 className='text-zinc-900 font-merriweather text-7xl font-bold'>
                            E-Book
                        </h1>
                        <h1 className='text-zinc-900 font-merriweather text-5xl font-regular'>
                            Corner Store Admin Panel
                        </h1>
                    </div>
                </div>

                <button onClick={handleCreate} className="bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200 mt-8 mb-4">
                    Create New Book
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {books.map((book) => (
                        <div key={book.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-md flex flex-col items-center gap-y-3">
                            <div className="flex items-center">
                                <img src={`${process.env.REACT_APP_BACKEND_URL}/api/books/${book.id}/cover`} alt={book.name} className="w-32 h-32 rounded-lg mr-4" />
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
                                    <p className="text-sm text-gray-600 mb-2">{book.description.slice(0, 50)}{book.description.length > 50 && '...'}</p>
                                    <p className="text-lg font-bold">{book.price} Credits</p>
                                </div>
                            </div>
                            <div className="ml-4">
                                <button onClick={() => handleEdit(book)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">Edit</button>
                                <button onClick={() => handleDelete(book.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showForm && <AdminBookForm selectedBook={selectedBook} onClose={() => setShowForm(false)} />}
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center h-screen text-2xl font-merriweather">
            <h1 className="font-bold">Welcome to the Admin Panel</h1><br />
            <h1>{isAdmin === null ? 'Hang-tight, checking admin privillege.' : 'You are NOT an admin, page will not proceed.'}</h1>
        </div>
    )
};

export default AdminOverview;
