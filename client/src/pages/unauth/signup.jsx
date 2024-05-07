import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SignupPage = ({ user }) => {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    function SignupFunction(e) {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        setErrors({});

        const username = e.target[0].value;
        const password = e.target[1].value;
        const confirmPassword = e.target[2].value;

        let validationErr = false;
        let errs = {};

        if (username.length === 0) {
            errs = { ...errs, username: 'Username cannot be empty.' };
            validationErr = true;
        }

        if (username.length > 30) {
            errs = { ...errs, username: 'Username must be less than 30 characters.' };
            validationErr = true;
        }

        if (password.length < 4) {
            errs = { ...errs, password: 'Password must be at least 4 characters.' };
            validationErr = true;
        }

        if (password !== confirmPassword) {
            errs = { ...errs, password: 'Passwords do not match.' };
            validationErr = true;
        }

        setErrors(errs);

        if (validationErr) {
            setLoading(false);
            return;
        }

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/signup`, {
            username,
            password
        })
        .then(res => {
            toast.success('Account created successfully!');
            setLoading(false);
            window.location.pathname = '/app';
        })
        .catch((err) => {
            console.error(err);
            setLoading(false);
            if(err.response && err.response.status === 400) {
                const responseData = err.response.data;
                const newErrors = {};
                if (responseData === 'USERNAME_TOO_LONG') {
                    newErrors.username = 'Username must be less than 30 characters.';
                } else if (responseData === 'PASSWORD_TOO_SHORT') {
                    newErrors.password = 'Password must be at least 4 characters.';
                } else if (responseData === 'PASSWORD_TOO_LONG') {
                    newErrors.password = 'Password must be less than 300 characters.';
                } else if (responseData === 'ALREADY_EXISTS') {
                    newErrors.username = 'An account with that username already exists.';
                }
                setErrors(newErrors);
            } else {
                toast.error('An error occurred. Please try again later.');
                setErrors({ generic: 'An error occurred. Please try again later.' });
            }
        });
    }

    useEffect(() => {
        if (user !== null && user !== 'loading') {
            toast.error('You must be logged out to view this page!');
            window.location.pathname = '/';
        }
    }, [user]);

    return (
        <div className="bg-orange-50 w-full min-h-screen">
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
                    <div className="ml-auto flex flex-col gap-y-2 h-full font-merriweather text-2xl font-bold">
                        <button onClick={() => window.location.pathname = '/login'} className="bg-zinc-900 flex-grow rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            Log In
                        </button>
                        <button onClick={() => window.location.pathname = '/'} className="flex-grow bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            Home
                        </button>
                    </div>
                </div>
                <p className="text-2xl pt-2">
                    Your one-stop shop for the <u>world's <b>worst</b></u> e-books!
                </p>
                <div className="mt-[10rem] mx-auto w-full max-w-2xl">
                    <h1 className="text-4xl font-merriweather font-bold leading-none">Create an account</h1>
                    <p className="font-merriweather leading-none text-2 mb-[2rem]">Because you, clearly, love reading.</p>
                    <form onSubmit={SignupFunction} className="w-full flex flex-col font-merriweather">
                        <p className="font-merriweather">
                            Username
                        </p>
                        {errors.username && (
                            <p className="text-red-500">{errors.username}</p>
                        )}
                        <input required className="flex-grow px-3 py-2 text-xl border border-zinc-900 rounded-xl" />
                        <p className="font-merriweather mt-5">
                            Password
                        </p>
                        {errors.password && (
                            <p className="text-red-500">{errors.password}</p>
                        )}
                        <input required type='password' className="flex-grow px-3 py-2 text-xl border border-zinc-900 rounded-xl" />
                        <p className="font-merriweather">
                            Confirm Password
                        </p>
                        <input required type='password' className="flex-grow px-3 py-2 text-xl border border-zinc-900 rounded-xl" />
                        <button type='submit' className="flex-grow bg-zinc-900 rounded-xl mt-3 text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            Create my account already
                        </button>
                        <p className="select-none text-xs mt-2">
                            <b>© {new Date().getFullYear()} ChrisMC Developments</b><br/>
                            By pressing the button above & creating your account, you agree to the <a className="underline cursor-pointer" onClick={() => window.location.pathname = '/policies/use'}>acceptable use policy</a> of this site.
                        </p>
                    </form>
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

export default SignupPage;
