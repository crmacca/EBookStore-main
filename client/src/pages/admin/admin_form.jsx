import { useState, useEffect } from "react";
import axios from "axios";

const AdminBookForm = ({ selectedBook, onClose }) => {
    const [formData, setFormData] = useState({
        bookId: "",
        name: "",
        price: "",
        description: "",
        epubFile: null,
        coverImage: null,
    });

    useEffect(() => {
        if (selectedBook) {
            setFormData({
                bookId: selectedBook.id,
                name: selectedBook.title,
                price: selectedBook.price,
                description: selectedBook.description,
                epubFile: null, // You may want to handle file updates differently
                coverImage: null, // You may want to handle file updates differently
            });
        }
    }, [selectedBook]);

    const handleChange = (e) => {
        const { name, files, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] != null) data.append(key, formData[key]);
        });

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/books`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then((res) => {
                window.location.reload();
            })
            onClose();
        } catch (error) {
            console.error(error.response.data);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8">
                <h2 className="text-2xl font-semibold mb-4">{selectedBook ? "Edit Book" : "Create New Book"}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name:</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-zinc-900" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="price" className="block text-gray-700 font-bold mb-2">Price:</label>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-zinc-900" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description:</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-zinc-900" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="epubFile" className="block text-gray-700 font-bold mb-2">EPUB File:</label>
                        <input type="file" id="epubFile" name="epubFile" accept=".epub" onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-zinc-900" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="coverImage" className="block text-gray-700 font-bold mb-2">Cover Image:</label>
                        <input type="file" id="coverImage" name="coverImage" accept="image/*" onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-zinc-900" />
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 px-4 rounded">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminBookForm;
