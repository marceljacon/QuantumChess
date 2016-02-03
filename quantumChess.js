var board, game;

function removeHighlights() {
	$("#board .square-55d63").css("backgroundColor", "");
}

function highlightSquare(square) {
	var squareEl = $("#board .square-" + square);

	var background = "#a9a9a9";
	if(squareEl.hasClass("black-3c85d")) {
		background = "#696969";
	}

	squareEl.css("backgroundColor", background);
}

function updateTurnText(turn) {
	if(turn === "w") {
		$("#turn").addClass("white");
		$("#turn").removeClass("black");
		$("#turn").html("White's");
	}
	else {
		$("#turn").addClass("black");
		$("#turn").removeClass("white");
		$("#turn").html("Black's");
	}
}

$(document).ready(function() {
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

	var onDragStart = function(source, piece, position, orientation) {
		if(game.game_over() || (game.turn() === "w" && piece.search(/^w/) === -1) || (game.turn() === "b" && piece.search(/^b/) === -1)) {
			return false;
		}
	};

	var onDragEnd = function(source, target) {
		removeHighlights();

		var notValid = true;
		// Find all moves from square
		var moves = game.moves({"square": source, "verbose": true});

		for(var i = 0; i < moves.length; i++) {
			if(moves[i].to === target) { // Make sure move is to target
				notValid = false;
				if(moves[i].flags.indexOf("p") !== -1) { // Check for promotion
					console.log("Valid promotion move");
					console.log(moves[i]);
					var promote = prompt("Which piece would you like to promote this pawn to?");
					switch(promote.toLowerCase()) {
						case "q":
						case "queen":
							game.move({"from": source, "to": target, "promotion": "q"});
							break;
						case "n":
						case "k":
						case "knight":
							game.move({"from": source, "to": target, "promotion": "n"});
							break;
						case "b":
						case "bishop":
							game.move({"from": source, "to": target, "promotion": "b"});
							break;
						case "r":
						case "rook":
						case "c":
						case "castle":
							game.move({"from": source, "to": target, "promotion": "r"});
							break;
					}
				}
				else {
					game.move({"from": source, "to": target});
				}
				break;
			}
		}

		// Illegal move
		if(notValid) {
			return "snapback";
		}

		updateTurnText(game.turn());
	};

	var onSnapEnd = function() {
		board.position(game.fen());
	};

	var config = {
		"draggable": true,
		"showNotation": false,
		"pieceTheme": "lib/chessboardjs/img/chesspieces/wikipedia/{piece}.png",
		"position": "start",
		"onMouseoverSquare": onMouseoverSquare,
		"onMouseoutSquare": onMouseoutSquare,
		"onDragStart": onDragStart,
		"onDrop": onDragEnd,
		"onSnapEnd": onSnapEnd
	};
	board = ChessBoard("board", config); // Initialize chessboard
	game = new Chess(); // Game rules
});