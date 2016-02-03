var board, game;

$(document).ready(function() {
	var config = {
		"draggable": true,
		"showNotation": false,
		"pieceTheme": "lib/chessboardjs/img/chesspieces/wikipedia/{piece}.png",
		"position": "start"
	};
	board = ChessBoard("board", config); // Initialize chessboard
	game = new Chess(); // Game rules
});