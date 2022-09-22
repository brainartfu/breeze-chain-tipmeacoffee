const socketServer = require('./src/utils/socket');
const app = require('./index');

const server = app.listen(5000, (sss) => {
  console.log(`Express is running on port ${server.address().port} http://localhost:5000`);
  // Set up socket.io
  socketServer.init(server);
  setInterval(() => {
    console.log('setTimeout')
    socketServer.update();
  }, 10000)
});