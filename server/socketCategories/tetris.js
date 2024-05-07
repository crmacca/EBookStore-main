const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function setupTetrisGame(io) {
    io.on('connection', (socket) => {
        const userId = socket.handshake.session.passport?.user;

        socket.on('t-start-game', async () => {
            const userObj = await prisma.user.findFirst({
                where: {
                    id: userId
                },
                select: {
                    credits: true
                }
            });

            if (userObj.credits < 3) {
                socket.emit('t-error', 'Not enough credits to play');
                return;
            }

            await prisma.tetrisGame.deleteMany({
                where: {
                    userId
                }
            })

            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    credits: {
                        decrement: 3 //PRICE OF PLAY
                    }
                }
            })

            await prisma.tetrisGame.create({
                data: {
                    userId,
                    isActive: true
                }
            })

            socket.emit('t-game-started', {status: ''});
        });

        socket.on('t-end-game', async ({ points }) => {
            const game = await prisma.tetrisGame.findFirst({
                where: {
                    userId,
                    isActive: true
                }
            })

            if (!game) {
                socket.emit('t-error', 'No active game found');
                return;
            }

            await prisma.tetrisGame.delete({
                where: {
                    id: game.id
                }
            })

            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    credits: {
                        increment: points / 250
                    }
                }
            });

            socket.emit('t-game-ended', {
                status: `Game ended. ${points / 250} Credits earnt.`
            });
        });

    });
}

module.exports = { setupTetrisGame };
