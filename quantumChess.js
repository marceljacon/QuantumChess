var board;

$(document).ready(function() {
	var config = {
		"draggable": true,
		"notation": false,
		"pieceTheme": "chessboardjs/img/chesspieces/wikipedia/{piece}.png",
		"position": "start"
	};
	board = ChessBoard("board", config); // Initialize chessboard
});