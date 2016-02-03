var board, game;

$(document).ready(function() {
	var removeHighlights = function() {
		$("#board .square-55d63").css("backgroundColor", "");
	};

	var highlightSquare = function(square) {
		var squareEl = $("#board .square-" + square);

		var background = "#a9a9a9";
		if(squareEl.hasClass("black-3c85d")) {
			background = "#696969";
		}

		squareEl.css("backgroundColor", background);
	};

	var onMouseoverSquare = function(square, piece) {
		// Possible moves for square
		var moves = game.moves({
			"square": square,
			"verbose": true
		});

		if(moves.length === 0) {
			return;
		}

		highlightSquare(square);
		for(var i = 0; i < moves.length; i++) {
			highlightSquare(moves[i].to);
		}
	};

	var onMouseoutSquare = function(square, piece) {
		removeHighlights();
	};

	var config = {
		"draggable": true,
		"showNotation": false,
		"pieceTheme": "lib/chessboardjs/img/chesspieces/wikipedia/{piece}.png",
		"position": "start",
		"onMouseoverSquare": onMouseoverSquare,
		"onMouseoutSquare": onMouseoutSquare
	};
	board = ChessBoard("board", config); // Initialize chessboard
	game = new Chess(); // Game rules
});