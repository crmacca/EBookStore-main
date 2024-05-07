import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Tetris from 'react-tetris';

const TetrisGame = ({ socket, user }) => {
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
            socket.on('t-game-started', data => {
                console.log('Game started')
                setGameActive(true)
                setLoading(false);
                setMessage(data.status)
            });

            socket.on('t-error', data => {
                console.log('got error', data)
                setMessage(data);
                setLoading(false);
                setGameActive(false);
            });

            socket.on('t-game-ended', data => {
                setLoading(false);
                setGameActive(false); 
                setMessage(data.status);
            })
    
            return () => {
                socket.off('t-game-started');
                socket.off('t-error');
            };
        }
    }, [socket]);

    const handleStartGame = () => {
        if(loading) return;
        setLoading(true);
        socket.emit('t-start-game');
    };

    const handleGameEnd = (points) => {
        if(loading) return;
        socket.emit('t-end-game', { points: points});
    }

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/balance`).then((res) => {
            setWallet(res.data.balance)
        })
    }, [gameActive])

    return socket !== null  ? (
        <div className="bg-orange-50 w-full min-h-screen font-merriweather">
            <div className="max-w-7xl m-auto min-h-screen p-4 md:p-10 flex flex-col">
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

                <h1 className="text-4xl font-bold text-zinc-900 mt-2 text-center">Tetris Game</h1>
                <p className='text-center'>You will recieve 1 credit per 250 in-game score <b>UPON</b> game end.</p>
                {message && <p className="text-red-500 text-center text-2xl my-5">{message}</p>}

                {!gameActive && (
                    <button onClick={handleStartGame} disabled={gameActive} className="mx-auto max-w-xl disabled:opacity-50 bg-zinc-900 w-full mt-2 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200">
                        Pay 3 credits for 1 play
                    </button>
                )}

                {
                    gameActive && (
                        <Tetris
                        keyboardControls={{
                          // Default values shown here. These will be used if no
                          // `keyboardControls` prop is provided.
                          down: 'MOVE_DOWN',
                          left: 'MOVE_LEFT',
                          right: 'MOVE_RIGHT',
                          space: 'HARD_DROP',
                          z: 'FLIP_COUNTERCLOCKWISE',
                          x: 'FLIP_CLOCKWISE',
                          up: 'FLIP_CLOCKWISE',
                          p: 'TOGGLE_PAUSE',
                          c: 'HOLD',
                          shift: 'HOLD'
                        }}
                      >
                        {({
                          HeldPiece,
                          Gameboard,
                          PieceQueue,
                          points,
                          linesCleared,
                          state,
                          controller,
                        }) => (
                          <div>
                            {state === 'LOST' && (
                              <div className='flex flex-col justify-center items-center mb-2'>
                                <h2 className='text-red-500 text-xl'>Game Over!</h2>
                                <button disabled={loading} className="mx-auto max-w-sm disabled:opacity-50 bg-zinc-900 w-full mt-2 rounded-lg text-white px-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200" onClick={() => {handleGameEnd(points);}}>Claim Credits</button>
                              </div>
                            )}
                            <div className='flex gap-2 w-full justify-center items-start'>
                                <div className='flex items-start justify-center flex-col'>
                                    <HeldPiece />
                                    <div>
                                        <p><b>Points: </b>{points}</p>
                                        <p><b>Lines Cleared: </b>{linesCleared}</p>
                                        <p><b>Credits Earnt:</b> {points / 250}</p>
                                    </div>
                                </div>
                                <Gameboard />
                                <PieceQueue />
                            </div>
                            <div>
                                <p className='text-center mt-5'>Do <b>not</b> reload the page during a game, your credits will be taken.</p>
                                <p className='text-center text-1xl'>Balance may not update instantly, <b>do not</b> reload the page to refresh it, if you are mid-game.</p>
                            </div>
                          </div>
                        )}
                      </Tetris>
                    )
                }

                {!gameActive && (
                    <p className="text-center mt-5">Balance: {Number(wallet.toFixed(1))} Credits</p>
                )}
            </div>
            <div className="fixed bottom-0 left-0 w-full flex items-center justify-center py-2">
                <h1>
                (For legal reasons) This entire site is a joke. | ©{" "}
                {new Date().getFullYear()} ChrisMC Developments | <a className='underline cursor-pointer' onClick={() => {window.location.pathname = '/policies/use'}}>Acceptable Use Policy</a>
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

export default TetrisGame;
