const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function createDeck() {
    const suits = ['♦', '♣', '♥', '♠'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function dealCards(deck) {
    return deck.splice(0, 2);  // Deal two cards
}

function calculateTotal(cards) {
    const rearranged = cards.slice().sort((a, b) => (a.value === 'A' ? 1 : -1)); // Sort so Aces are evaluated last
    return rearranged.reduce((total, card) => {
        if (['J', 'Q', 'K'].includes(card.value)) {
            return total + 10;
        } else if (card.value === 'A') {
            return (total + 11 <= 21) ? total + 11 : total + 1;
        } else {
            return total + parseInt(card.value);
        }
    }, 0);
}

function dealerPlays(deck, dealerCards) {
    let dealerTotal = calculateTotal(dealerCards);
    while (dealerTotal < 17) {
        const card = dealCards(deck)[0];
        dealerCards.push(card);
        dealerTotal = calculateTotal(dealerCards);
    }
    return { dealerCards, dealerTotal };
}

function setupBlackjackGame(io) {
    io.on('connection', (socket) => {
        const userId = socket.handshake.session.passport?.user;

        socket.on('start-game', async ({ bet }) => {
            if (bet > 5) {
                socket.emit('error', 'Maximum bet is 5 credits');
                return;
            }

            const deck = shuffleDeck(createDeck());
            const playerCards = dealCards(deck);
            const dealerCards = dealCards(deck);

            await prisma.blackjackGame.updateMany({
                where: {
                    userId,
                    isActive: true
                },
                data: {
                    isActive: false
                }
            })

            const newGame = await prisma.blackjackGame.create({
                data: {
                    userId,
                    playerCards: JSON.stringify(playerCards),
                    dealerCards: JSON.stringify(dealerCards),
                    playerTotal: calculateTotal(playerCards),
                    dealerTotal: calculateTotal([dealerCards[0]]), // Hide second dealer card initially
                    bet: parseInt(bet),
                    isActive: true,
                    deck: deck
                }
            });

            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    credits: {
                        decrement: parseInt(bet)
                    }
                }
            })

            socket.emit('game-started', {
                gameId: newGame.id,
                playerCards,
                dealerCards: [dealerCards[0]],
                playerTotal: calculateTotal(playerCards),
                dealerTotal: calculateTotal([dealerCards[0]]),
            });
        });

        socket.on('player-action', async ({ action }) => {

            const game = await prisma.blackjackGame.findFirst({
                where: { userId, isActive: true }
            });

            if (!game || game.gameOver) return socket.emit('error', { status: 'Game not found or already over' });

            let deck = game.deck;

            if (action === 'hit') {
                const card = dealCards(deck)[0];
                const updatedCards = JSON.parse(game.playerCards).concat(card);
                const newTotal = calculateTotal(updatedCards);

                await prisma.blackjackGame.update({
                    where: { id: game.id },
                    data: {
                        playerCards: JSON.stringify(updatedCards),
                        playerTotal: newTotal,
                        gameOver: newTotal > 21,
                        deck: deck
                    }
                });

                if (newTotal > 21) {
                    socket.emit('game-ended-plr', { status: 'Bust!', playerCards: updatedCards, playerTotal: newTotal });
                } else {
                    socket.emit('game-updated', { playerCards: updatedCards, playerTotal: newTotal });
                }
            } else if (action === 'stand') {
                const { dealerCards, dealerTotal } = dealerPlays(deck, JSON.parse(game.dealerCards));
                const finalPlayerTotal = calculateTotal(JSON.parse(game.playerCards));

                let status = 'Game Over: ';
                if (dealerTotal > 21) {
                    status += 'Dealer busts. You win!';
                    await prisma.user.update({
                        where: {
                            id: userId
                        },
                        data: {
                            credits: {
                                increment: game.bet * 2
                            }
                        }
                    })
                } else if (dealerTotal === finalPlayerTotal) {
                    status += 'Push.';
                    await prisma.user.update({
                        where: {
                            id: userId
                        },
                        data: {
                            credits: {
                                increment: game.bet
                            }
                        }
                    })
                } else if (dealerTotal > finalPlayerTotal) {
                    status += 'Dealer wins.';
                } else {
                    status += 'You win!';
                    await prisma.user.update({
                        where: {
                            id: userId
                        },
                        data: {
                            credits: {
                                increment: game.bet * 2
                            }
                        }
                    })
                }

                socket.emit('game-ended', { status, dealerCards, dealerTotal, playerTotal: finalPlayerTotal });
                await prisma.blackjackGame.deleteMany({
                    where: {
                        userId
                    }
                })
            }
        });
    });
}

module.exports = { setupBlackjackGame };
