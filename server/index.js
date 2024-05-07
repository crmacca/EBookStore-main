const { app, server } = require('./app');

const PORT = process.env.PORT || 4500;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
