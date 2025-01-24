import gunLib from "gun";

const server = require('http').createServer().listen(8765);

const gun = gunLib({
   web: server
});