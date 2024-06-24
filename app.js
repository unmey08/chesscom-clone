const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const path = require('path');

const app = express();

const server = http.createServer(app);

const io = socket(server);

const chess = new Chess();

let players = {};
let curentPlayer = "w";

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', { title: 'Chess Game' });
});

io.on('connection', (socket) => {
    if (!players.white) {
        players.white = socket.id;
        socket.emit('playerRole', 'W');
    }
    else if (!players.black) {
        players.black = socket.id;
        socket.emit('playerRole', 'B');
    }
    else {
        socket.emit('spectator');
    }

    socket.on('disconnect', () => {
        if (socket.id === players.white || socket.id === players.black) {
            players = {};
        }
    })

    socket.on('move', (move) => {
        try {
            if (chess.turn() === 'w' && socket.id !== players.white) return;
            if (chess.turn() === 'b' && socket.id !== players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit('move', move);
                io.emit('boardState', chess.fen());
            }
            else {
                socket.emit('invalidMove', move);
            }
        }
        catch (error) {
            socket.emit('invalidMove', move);
        }
    })
})

server.listen(3000);