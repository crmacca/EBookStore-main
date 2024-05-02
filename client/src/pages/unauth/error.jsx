import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
    const error = useRouteError();

    return (
        <div className="bg-orange-50 w-full min-h-screen">
            <div className="max-w-7xl m-auto h-screen p-4 md:p-20 flex flex-col">
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
                </div>

                <p className="text-2xl pt-2">
                    Your one-stop shop for the <u>world's <b>worst</b></u> e-books!
                </p>

                <h1 className="font-bold text-[7rem] m-0 leading-none mt-[5rem]">{error.status}</h1>
                <h1 className="font-regular text-[3rem] m-0 leading-none">{error.statusText}</h1>
                <h1 className="font-regular text-[1.5rem] m-0 leading-none">{error.data}</h1>

                <button onClick={() => window.location.pathname = '/'} className="bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200 max-w-xl mt-5 font-merriweather">
                    Return to landing page
                </button>
                
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

export default ErrorPage