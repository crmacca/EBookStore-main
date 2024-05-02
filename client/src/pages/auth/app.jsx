import axios from "axios";
import { useEffect, useState } from "react";

const AppPage = ({ user }) => {
    const [balance, setBalance] = useState(null);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        if (user === null) window.location.pathname = '/login';
    }, [user]);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/balance`);
                setBalance(res.data.balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        };
        fetchBalance();

        const loadBooks = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/books/my`);
                setBooks(res.data);
            } catch (error) {
                console.error("Error loading books:", error);
            }
        };
        loadBooks();
    }, []);

    function getGreeting() {
        const date = new Date();
        const hours = date.getHours();
        if (hours < 12) return 'Good morning,';
        if (hours < 18) return 'Good afternoon,';
        return 'Good evening,';
    }

    return user !== null && (
        <div className="bg-orange-50 w-full min-h-screen font-merriweather">
            <div className="max-w-7xl m-auto h-screen p-4 md:p-20 flex flex-col">
                <div className="flex items-center justify-start gap-2">
                    <img alt='CornerOfBooks Logo' src='/logoSM.png' className="w-32 hidden md:block"/>
                    <div>
                        <h1 className='text-zinc-900 font-merriweather text-5xl font-bold'>
                            E-Book
                        </h1>
                        <h1 className='text-zinc-900 font-merriweather text-3xl font-regular'>
                            Corner Store
                        </h1>
                    </div>
                    <div className="ml-auto flex flex-col gap-2 gap-y-2 max-w-fit text-2xl">
                        <button onClick={() => window.location.pathname = '/'} className=" px-2 py-3 font-semibold flex-grow bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            Store
                        </button>
                        <button onClick={() => axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`).then((res) => window.location.reload())} class="px-2 py-3 font-semibold flex-grow bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            Logout
                        </button>
                    </div>
                </div>

                <p className="text-2xl">
                    {getGreeting()} {user.username}!
                </p>

                <div className="flex items-center justify-start">
                    <p className="text-2xl mt-[5rem]">
                        Earn / Gamble Credits
                    </p>
                    <p className=" ml-auto text-2xl mt-[5rem]">
                        {balance === null ? '...' : balance} Credits
                    </p>
                </div>
                <div class="flex items-center justify-start">
                    <button onClick={() => window.location.pathname = '/blackjack'} class="text-xl max-w-fit px-2 py-3 font-semibold bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                        Blackjack
                    </button>
                    <button onClick={() => window.location.pathname = '/'} className="ml-2 text-xl max-w-fit px-2 py-3 font-semibold bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                        Messenger Minigame
                    </button>
                </div>

                <p className="text-2xl mt-[5rem]">
                    My Bookshelf
                </p>

                <div className="w-full flex-grow mt-2 border-black border rounded-xl p-5 grid justify-start grid-cols-2 md:grid-cols-4 gap-4">
                    {books.map(book => (
                        <button onClick={() => window.location.pathname = `/app/read/${book.id}`} key={book.id} className="flex flex-col items-center hover:underline hover:brightness-75 group h-fit w-fit">
                            <img alt={`Front cover of ${book.title}`} src={`${process.env.REACT_APP_BACKEND_URL}/api/books/${book.id}/cover`} className="h-[20rem] w-full rounded-xl border-2 border-zinc-900 object-cover object-center group-hover:brightness-75"/>
                            <h1 className="font-merriweather font-semibold group-hover:underline text-xl">{book.title}</h1>
                        </button>
                    ))}
                    {books.length === 0 && <h1 className="text-1xl">No books found, lazy bastard. Get to back to woooooorkk!!</h1>}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 w-full flex items-center justify-center py-2">
                <h1>
                (For legal reasons) This entire site is a joke. | ©{" "}
                {new Date().getFullYear()} ChrisMC Developments| <a className='underline cursor-pointer' onClick={() => {window.location.pathname = '/policies/use'}}>Acceptable Use Policy</a>
                </h1>
            </div>
        </div>
    );
};

export default AppPage;
