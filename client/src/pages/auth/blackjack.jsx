import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { useState, useEffect } from 'react';

const BlackjackGame = ({ socket, user }) => {
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [playerTotal, setPlayerTotal] = useState(0);
    const [dealerTotal, setDealerTotal] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [message, setMessage] = useState('');
    const [bet, setBet] = useState('0');
    const [wallet, setWallet] = useState(0); // Initial wallet amount
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(user === null) {
            window.location.pathname = '/login'
        }
    }, [user])

    useEffect(() => {
        if(socket !== null) {
            socket.on('game-started', data => {
                console.log('Game started', data)
                setGameActive(true);
                setLoading(false);
                setPlayerCards(data.playerCards);
                setDealerCards(data.dealerCards);
                setPlayerTotal(data.playerTotal);
                setDealerTotal(data.dealerTotal);
                setMessage("Game started! Your move!");
            });
    
            socket.on('game-updated', data => {
                console.log('Game updated', data)
                setLoading(false);
                setPlayerCards(data.playerCards || []);
                setPlayerTotal(data.playerTotal || 0);
            });

            socket.on('game-ended', data => {
                console.log('Game ended', data)
                setLoading(true);
                setDealerCards(data.dealerCards);
                setDealerTotal(data.dealerTotal);
                setPlayerTotal(data.playerTotal)
                setMessage(data.status || null);
                setGameActive(false);

                setTimeout(() => {
                    setDealerCards([]);
                    setDealerTotal(0);
                    setPlayerCards([]);
                    setPlayerTotal(0);
                    setLoading(false)
                }, 3000)
            });
    
            socket.on('game-ended-plr', data => {
                console.log('Game ended', data)
                setLoading(true);
                setPlayerCards(data.playerCards);
                setPlayerTotal(data.playerTotal)
                setMessage(data.status || null);
                setGameActive(false);

                setTimeout(() => {
                    setDealerCards([]);
                    setDealerTotal(0);
                    setPlayerCards([]);
                    setPlayerTotal(0);
                    setLoading(false)
                }, 3000)
            });
            
            socket.on('error', data => {
                console.log('got error', data)
                setMessage(data);
                setLoading(false);
                setGameActive(false);
            });
    
            return () => {
                socket.off('game-started');
                socket.off('game-updated');
                socket.off('game-ended');
                socket.off('error');
            };
        }
    }, [socket]);

    const handleStartGame = () => {
        if(loading) return;
        setLoading(true);

        

        if (bet > wallet) {
            setMessage("Insufficient funds to place bet.");
            setLoading(false);
            setGameActive(false);
            return;
        }
        if (bet <= 0) {
            setMessage("Please enter a valid bet amount.");
            setLoading(false);
            setGameActive(false);
            return;
        }
        socket.emit('start-game', { bet });
    };

    const handleHit = () => {
        if(loading) return;
        setLoading(true);
        socket.emit('player-action', { action: 'hit' });
    };

    const handleStand = () => {
        if(loading) return;
        setLoading(true);
        socket.emit('player-action', { action: 'stand' });
    };

    const handleBetChange = (event) => {
        setBet(event.target.value);
    };

    const renderCard = (card) => {
        return `${card.value} of ${card.suit}`;
    };

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/balance`).then((res) => {
            setWallet(res.data.balance)
        })
    }, [gameActive])

    return socket !== null  ? (
        <div className="bg-orange-50 w-full min-h-screen font-merriweather">
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
                    <div className="ml-auto flex flex-col gap-y-2 h-full font-merriweather text-2xl font-bold">
                        <button onClick={() => window.location.pathname = '/app'} className="bg-zinc-900 flex-grow rounded-lg my-5 text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                            My Bookshelf
                        </button>
                    </div>
                </div>

                <p className="text-2xl pt-2">
                    Your one-stop shop for the <u>world's <b>worst</b></u> e-books!
                </p>

                <h1 className="text-4xl font-bold text-zinc-900 mb-5 mt-[5vh] text-center">Blackjack</h1>
                {message && <p className="text-red-500 text-center text-2xl my-5">{message}</p>}
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                    <div className='p-2 border-2 border-black rounded-xl '>
                        <h2 className="text-xl font-semibold">Your Hand ({playerTotal})</h2>
                        <div className="flex gap-2">
                            {playerCards.map((card, index) => (
                                <span key={index} className="p-2 border rounded shadow text-white bg-black">{renderCard(card)}</span>
                            ))}
                        </div>
                    </div>
                    <div className='p-2 border-2 border-black rounded-xl bg-black text-white'>
                        <h2 className="text-xl font-semibold">Dealer's Hand ({dealerTotal})</h2>
                        <div className="flex gap-2">
                            {dealerCards.map((card, index) => (
                                <span key={index} className="p-2 border rounded shadow">{renderCard(card)}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-y-2 justify-center items-center mt-4">
                    <form className='flex items-center justify-center gap-2' onSubmit={(e) => {
                        e.preventDefault();
                        handleStartGame();
                    }}>
                        <input disabled={gameActive} type="number" value={bet} onChange={handleBetChange} className="flex-grow px-3 py-2 text-xl border border-zinc-900 rounded-xl"/>
                        <button disabled={loading || parseInt(bet) > wallet} type='submit' className="disabled:opacity-50 cursor-pointer bg-zinc-900 flex-grow rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">Place Bet & Start</button>
                    </form>
                    <div className='flex gap-2 items-center justify-center'>
                        <button disabled={loading || !playerCards.length} onClick={handleHit} className="disabled:opacity-50 cursor-pointer min-w-full bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">Hit</button>
                        <button disabled={loading || !playerCards.length} onClick={handleStand} className="disabled:opacity-50 cursor-pointer min-w-full bg-zinc-900 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">Stand</button>
                    </div>
                </div>
                <p className="text-center mt-5">Balance: {wallet} Credits</p>
                <p className='text-center mt-5'>Do <b>not</b> reload the page if you have just started a game, your bet will be taken if you reload at any time after placing.</p>
                <p className='text-center text-xl'>Balance may not update instantly, <b>do not</b> reload the page to refresh it, if you are mid-game.</p>
            </div>
            <div className="fixed bottom-0 left-0 w-full flex items-center justify-center py-2">
                <h1>
                (For legal reasons) This entire site is a joke. | ©{" "}
                {new Date().getFullYear()} ChrisMC Developments| <a className='underline cursor-pointer' onClick={() => {window.location.pathname = '/policies/use'}}>Acceptable Use Policy</a>
                </h1>
            </div>
        </div>
    ) : (
        <div className='flex flex-col items-center justify-center h-screen bg-orange-50 font-merriweather'>
            <CircularProgress />
            <p className='mt-2 text-lg'>Hold tight, contacting server...</p>
        </div>
    )
};

export default BlackjackGame;
