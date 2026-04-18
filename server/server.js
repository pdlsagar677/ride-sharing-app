const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket/socket');
const port = process.env.PORT ;

const server = http.createServer(app);
initializeSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});