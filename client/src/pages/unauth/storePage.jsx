import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";

const StorePage = ({ user }) => {
    const params = useParams();
    const [credits, setCredits] = useState(0)

    console.log(params)

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/balance`);
                setCredits(res.data.balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        };
        fetchBalance();
    }, [])

    const [loading, setLoading] = useState(true)
    const [bookData, setBookData] = useState({
        title: 'Bart\'s Fart',
        price: 999,
        description: 'A thrilling tale of Bart\'s Fart',
        id: '07eaccaa-cddf-4452-8729-ab46a776d584'
    })

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/books/${params.id}/details`);
                setBookData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching book details:', error);
                setLoading(false);
            }
        };
        fetchBookDetails();
    }, [params.id]);

    if (!bookData) {
        return <div className="text-center mt-20">Book not found.</div>;
    }

    const handlePurchase = async () => {
        if(user === null) return window.location.pathname = '/login'

        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/books/${bookData.id}/purchase`)
        .then((res) => {
            toast.success(res.data.message);
            setBookData({...bookData, owned: true});  // Update local state to reflect ownership
        })
        .catch((err) => {
            console.error(err)
            if(err.response && err.response.data.message) {
                return toast.error(err.response.data.message)
            } 
            
            toast.error(`Unknown error buying ${bookData.title}. 🤓`)
        })
    };

    return (
        <div className="bg-orange-50 w-full min-h-screen font-merriweather">
            <div className="max-w-7xl m-auto min-h-screen p-20 flex flex-col">
                <div className="flex items-center justify-start gap-2">
                    <img alt='CornerOfBooks Logo' src='/logoSM.png' className="w-40 hidden md:block"/>
                    <div>
                        <h1 className='text-zinc-900 font-merriweather text-7xl font-bold'>
                            E-Book
                        </h1>
                        <h1 className='text-zinc-900 font-merriweather text-5xl font-regular'>
                            Corner Store
                        </h1>
                    </div>
                    <div className="ml-auto flex items-center gap-2 h-full font-merriweather text-2xl font-bold">
                        <div className="flex-col items-start justify-center mr-2 hidden md:flex">
                            <p className="font-bold text-md leading-none">
                                Balance
                            </p>
                            <p className="text-lg leading-none font-light">
                                {credits} Credits
                            </p>
                        </div>
                        <button onClick={() => window.location.pathname = '/'} className="bg-zinc-900 flex-grow rounded-lg my-5 text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            Home
                        </button>
                    </div>
                </div>
                <p className="text-2xl pt-2">
                    Your one-stop shop for the <u>world's <b>worst</b></u> e-books!
                </p>

                {
                    !loading ? (
                        <div className="grid md:grid-cols-2 p-10">
                            <img className='rounded-xl border-3 border-black shadow  w-[80%] h-full object-cover overflow-hidden' alt={`${bookData.title}'s Cover Illustration`} src={`${process.env.REACT_APP_BACKEND_URL}/api/books/${bookData.id}/cover`}/>
                            <div>
                                <h1 className="font-extrabold text-5xl">{bookData.title}</h1>
                                <h1 className="text-3xl font-regular">{bookData.price} Credits</h1>
                                <h1 className="text-xl font-light mt-3">{bookData.description}</h1>

                                <p className="mt-5">
                                    Current Balance: {Number(credits.toFixed(1))} Credits
                                </p>

                                {
                                    bookData.owned ? (
                                        <button disabled={bookData.owned === true} className=" disabled:opacity-50 bg-zinc-900 w-full mt-2 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                                            Owned already!
                                        </button>
                                    ) : (
                                        <button onClick={handlePurchase} disabled={bookData.owned === true} className=" disabled:opacity-50 bg-zinc-900 w-full mt-2 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                                            Purchase for <u><b>{bookData.price} credits</b></u>
                                        </button>
                                    )
                                }
                                <p className="text-xs mt-2">
                                    <b>Disclaimer:</b> <u>There is no confirmation</u> on purchase, pressing the button will bill immediately. <br/><br/> <b>No refunds! Thank you for being a loyal customer.</b>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center mt-10">
                            <CircularProgress />
                        </div>
                    )
                }

            </div>
            <div className="fixed bottom-0 left-0 w-full flex items-center justify-center py-2">
                <h1>
                (For legal reasons) This entire site is a joke. | ©{" "}
                {new Date().getFullYear()} ChrisMC Developments | <a className='underline cursor-pointer' onClick={() => {window.location.pathname = '/policies/use'}}>Acceptable Use Policy</a>
                </h1>
            </div>
        </div>
    );
}

export default StorePage;
