const AcceptableUsePolicy = () => {
    return (
        <div className="bg-orange-50 w-full min-h-screen">
            <div className="max-w-7xl m-auto min-h-screen p-4 md:p-20 flex flex-col">
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
                    <button onClick={() => window.location.pathname = '/'} className="bg-zinc-900 max-w-fit ml-auto rounded-lg my-5 text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                        Home
                    </button>
                </div>

                <p className="text-2xl pt-2">
                    Your one-stop shop for the <u>world's <b>worst</b></u> e-books!
                </p>

                <h1 className="font-bold text-[5rem] m-0 leading-none mt-[3rem]">Acceptable Use Policy</h1>
                <br/>
                <p>This Acceptable Use Policy applies to all users of CornerOfBooks software, provided and managed by <strong>ChrisMCDevelopments (CMCDev)</strong>, accessible at <a href="http://cmcdev.net">cmcdev.net</a>. By using CornerOfBooks, you agree to comply with this policy, which is designed to ensure that our service remains safe and enjoyable for everyone. Violation of this policy may result in the suspension or termination of your access to the software, as detailed below.</p>
                <br/>
                <h2><b>1. Acceptance of Terms</b></h2>
                <p>By using CornerOfBooks, you agree to the terms outlined in this Acceptable Use Policy. If you disagree with any part of the terms, you must cease usage of our software immediately.</p>
                <p>By selecting the 'Read' button on an e-book, you automatically agree to these terms which are <b>also</b> agreed to upon account creation.</p>
                <br/>
                <h2><b>2. Prohibited Activities</b></h2>
                <p>In order to maintain the integrity and functionality of CornerOfBooks, the following activities are strictly prohibited:</p>
                <ul>
                    <li><strong>Redistribution and Copying:</strong> You may not distribute, reproduce, duplicate, copy, sell, resell, or exploit any portion of CornerOfBooks, its use, or access to any content provided by the software, except as expressly permitted in writing by ChrisMCDevelopments.</li>
                    <li><strong>Illegal Use:</strong> You may not use the software for any unlawful purposes, nor may you violate any applicable laws and regulations.</li>
                    <li><strong>Interference with the Service:</strong> You are prohibited from attempting to disrupt or interfere with the security features of the software, including the delivery of services or infrastructure that supports CornerOfBooks.</li>
                </ul>
                <br/>
                <h2><b>3. Enforcement</b></h2>
                <p>Violations of this Acceptable Use Policy may result in immediate termination of your access to CornerOfBooks, without refund or recourse. ChrisMCDevelopments reserves the right to determine, in its sole discretion, what constitutes a violation of this policy.</p>
                <br/>
                <h2><b>4. Modifications to the Policy</b></h2>
                <p>ChrisMCDevelopments reserves the right to modify this Acceptable Use Policy at any time. We will notify users of significant changes and indicate the date of the latest revision. Your continued use of CornerOfBooks after changes to this policy will constitute your acceptance of such changes.</p>
                <br/>
                <h2><b>5. Contact Us</b></h2>
                <p>If you have any questions about this Acceptable Use Policy, please contact us at <strong>[Your Contact Information]</strong>.</p>
                <br/>
                <p><strong>Last Updated: 2nd May 2024</strong></p>



            </div>
            <div className="fixed bottom-0 left-0 w-full flex items-center justify-center py-2">
                <h1>
                (For legal reasons) This entire site is a joke. | ©{" "}
                {new Date().getFullYear()} ChrisMC Developments| <a className='underline cursor-pointer' onClick={() => {window.location.pathname = '/policies/use'}}>Acceptable Use Policy</a>
                </h1>
            </div>
        </div>
    )
}

export default AcceptableUsePolicy