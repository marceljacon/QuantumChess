var board, primary, secondary, state, turn; // state: primary,secondary,unknown

var PRIMARY = "p";
var SECONDARY = "s";
var UNKNOWN = "?";

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
function displayBoard() {
	var primaryObj = ChessBoard.fenToObj(primary.fen());
	var secondaryObj = ChessBoard.fenToObj(secondary.fen());
	var mainObj = {};
	for (var square in state) {
		switch(state[square]) {
			case PRIMARY:
				mainObj[square] = primaryObj[square];
				break;
			case SECONDARY:
				mainObj[square] = secondaryObj[square];
				break;
			case UNKNOWN:
				mainObj[square] = primaryObj[square].substring(0,1) + "?"; //w? or b?
				break;
		}	
	}
	for (var square in piecesKnown) {
		secondaryObj[square] = piecesKnown[square];
	}
	board.quantumPosition(primaryObj, secondaryObj, mainObj);
}

$(document).ready(function() {
	var onDragStart = function(source, piece, position, orientation) {
		if (piecesQuantum.hasOwnProperty(source) {
			delete piecesQuantum[source];
			state[square] = (Math.random() < 0.5 ? PRIMARY : SECONDARY);
		}
		var moves;
		if (state[square] === PRIMARY) {
			if(primary.game_over() || (turn === "w" && piece.search(/^w/) === -1) || (turn === "b" && piece.search(/^b/) === -1)) {
				return false;
			}
			moves = primary.moves({
				"square": source,
				"verbose": true
			});
		}
		else if (state[square] === SECONDARY) {
			/* TODO: deal with piecesKnown */
			if(secondary.game_over() || (turn === "w" && piece.search(/^w/) === -1) || (turn === "b" && piece.search(/^b/) === -1)) {
				return false;
			}
			moves = secondary.moves({
				"square": source,
				"verbose": true
			});
		}
		else {
			console.log("dang");
		}
		if (moves.length === 0) {
			return false;
		}

		highlightSquare(square);
		for(var i = 0; i < moves.length; i++) {
			highlightSquare(moves[i].to);
		}
		displayBoard()
	};

	var onDragEnd = function(source, target) {
		removeHighlights();

		var notValid = true;
		// Find all moves from square
		var moves;
		if (state[square] === PRIMARY) {
			if(primary.game_over() || (turn === "w" && piece.search(/^w/) === -1) || (turn === "b" && piece.search(/^b/) === -1)) {
				return false;
			}
			moves = primary.moves({
				"square": source,
				"verbose": true
			});
		}
		else if (state[square] === SECONDARY) {
			if(secondary.game_over() || (turn === "w" && piece.search(/^w/) === -1) || (turn === "b" && piece.search(/^b/) === -1)) {
				return false;
			}
			moves = secondary.moves({
				"square": source,
				"verbose": true
			});
		}
		else {
			console.log("dang 2");
		}

		for(var i = 0; i < moves.length; i++) {
			if(moves[i].to === target) { // Make sure move is to target
				notValid = false;
				if(moves[i].flags.indexOf("p") !== -1) { // Check for promotion
					console.log("Valid promotion move");
					console.log(moves[i]);
					var promote = prompt("Which piece would you like to promote this pawn to?");
					switch(promote.toLowerCase()) {
						/* TODO: use new code for promotions */
						/*
						case "q":
						case "queen":
							game.move({"from": source, "to": target, "promotion": "q"});
							break;
						case "n":
						case "k":
						case "h":
						case "knight":
						case "horse":
						case "horsey":
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
						*/
					}
				}
				else {
					primary.put(primary.remove(source), target);
					secondary.put(secondary.remove(source), target);
					/* TODO: light/dark square quantum changes */
				}
				break;
			}
		}

		// Illegal move
		if(notValid) {
			return "snapback";
		}
		displayBoard()
		turn = (turn === "w" ? "b" : "w");
		updateTurnText(turn);
	};

	var onSnapEnd = function() {
		displayBoard();
	};

	var config = {
		"draggable": true,
		"showNotation": false,
		"pieceTheme": "lib/chessboardjs/img/chesspieces/wikipedia/{piece}.png",
		"position": "start",
		"onDragStart": onDragStart,
		"onDrop": onDragEnd,
		"onSnapEnd": onSnapEnd
	};
	board = ChessBoard("board", config); // Initialize chessboard
	primary = new Chess();
	secondary = new Chess();
	/* TODO: initialize EVERYTHING */

});