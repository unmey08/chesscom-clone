const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('#chessboard');

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;
let pieceElement = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = '';
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement('div');
            squareElement.classList.add('square', (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black');

                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener('dragstart', (event) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        event.dataTransfer.setData('text/plain', '');
                    }
                })

                pieceElement.addEventListener('dragend', (event) => {
                    draggedPiece = null;
                    sourceSquare = null;
                    event.dataTransfer.setData('text/plain', '');
                })

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            squareElement.addEventListener('drop', (event) => {
                event.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: Number(squareElement.dataset.row),
                        col: Number(squareElement.dataset.col)
                    }

                    handleMove(sourceSquare, targetSquare)
                }
            });
            boardElement.appendChild(squareElement);
        });
    });

    if (playerRole === 'b') {
        boardElement.classList.add('flipped');
    }
    else {
        boardElement.classList.remove('flipped');
    }
}

const handleMove = (sourceSquare, targetSquare) => {
    const move = {
        from: `${String.fromCharCode(97 + sourceSquare.col)}${8 - sourceSquare.row}}`,
        to: `${String.fromCharCode(97 + targetSquare.col)}${8 - targetSquare.row} }`,
        promotion: 'q'
    }

    socket.emit('move', move);
};

const getPieceUnicode = (piece) => {
    const uniCodePieces = {
        p: '♙',
        r: '♜',
        n: '♞',
        b: '♝',
        q: '♛',
        k: '♚',
        P: '♙',
        R: '♖',
        N: '♘',
        B: '♗',
        Q: '♕',
        K: '♔',
    }
    return uniCodePieces[piece.type] || '';
}

socket.on('playerRole', (role) => {
    playerRole = role;
    renderBoard();
});

socket.on('spectator', (role) => {
    playerRole = null;
    renderBoard();
});

socket.on('boardState', (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on('move', (move) => {
    chess.move(move);
    renderBoard();
})

renderBoard();