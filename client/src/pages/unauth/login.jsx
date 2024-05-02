import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    function handleLogin(e) {
        e.preventDefault();
        if(loading) return;
        setLoading(true);

        setErrors({});
        let validationErr = false;
        let errs = {};

        if(username.length === 0) {
            errs.username = 'Username cannot be empty.';
            validationErr = true;
        }

        if(username.length > 30) {
            errs.username = 'Username must be less than 30 characters.';
            validationErr = true;
        }

        if(password.length < 4) {
            errs.password = 'Password must be at least 4 characters.';
            validationErr = true;
        }

        setErrors(errs);

        if(validationErr) {
            setLoading(false);
            return;
        }

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, { username, password })
        .then((res) => {
            toast.success('Successfully logged in!');
            window.location.pathname = '/app';
            setLoading(false);
        })
        .catch((err) => {
            setLoading(false);
            console.error(err);
            if(err.response && err.response.status === 400) {
                if(err.response.data === 'NO_CREDENTIAL_COMBO_FOUND') {
                    setErrors({generic: 'No user found with those credentials.'});
                    toast.error('No user found with those credentials.');
                }
            } else {
                setErrors({generic: 'An unknown error occurred. Please try again later.'});
            }
        });
    }

    return (
        <div className="bg-orange-50 w-full min-h-screen">
            <div className="max-w-7xl m-auto h-screen p-20 flex flex-col">
                <div className="flex items-center justify-start gap-2">
                    <img alt='CornerOfBooks Logo' src='/logoSM.png' className="w-40"/>
                    <div>
                        <h1 className='text-zinc-900 font-merriweather text-7xl font-bold'>
                            E-Book
                        </h1>
                        <h1 className='text-zinc-900 font-merriweather text-5xl font-regular'>
                            Corner Store
                        </h1>
                    </div>
                    <div className="ml-auto flex flex-col gap-y-2 h-full font-merriweather text-2xl font-bold">
                        <button onClick={() => window.location.pathname = '/'} className="bg-zinc-900 flex-grow rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            Home
                        </button>
                        <button onClick={() => window.location.pathname = '/signup'} className="flex-grow bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            Sign Up
                        </button>
                    </div>
                </div>
                <p className="text-2xl pt-2">
                    Your one-stop shop for the <u>world's <b>worst</b></u> e-books!
                </p>
                <div className="mt-[10rem] mx-auto w-full max-w-2xl">
                    <h1 className="text-4xl font-merriweather font-bold leading-none mb-2">Log into your account</h1>
                    <h4 className="font-merriweather mb-5">Nice to see you again... you waste of storage...</h4>
                    <form onSubmit={handleLogin} className="w-full flex flex-col font-merriweather">
                        <p className="font-merriweather">Username</p>
                        {errors.username && (<p className="text-red-500">{errors.username}</p>)}
                        <input required value={username} onChange={(e) => setUsername(e.target.value)} className="flex-grow px-3 py-2 text-xl border border-zinc-900 rounded-xl" placeholder="Username"/>
                        <p className="font-merriweather mt-1">Password</p>
                        {errors.password && (<p className="text-red-500">{errors.password}</p>)}
                        <input required type='password' value={password} onChange={(e) => setPassword(e.target.value)} className="flex-grow px-3 py-2 text-xl border border-zinc-900 rounded-xl" placeholder="Password"/>
                        <button type="submit" className="flex-grow bg-zinc-900 rounded-xl mt-3 text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            Sign In
                        </button>
                    </form>
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
}

export default LoginPage;
