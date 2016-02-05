var board, primary, secondary, state, turn, piecesKnown; // state: primary,secondary,unknown

var PRIMARY = "p";
var SECONDARY = "s";
var UNKNOWN = "?";

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

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
		if (!piecesKnown[square]) {
			secondaryObj[square] = secondaryObj[square].substring(0,1) + "?";
		}
	}
	board.quantumPosition(mainObj, primaryObj, secondaryObj);
}

$(document).ready(function() {
	var onDragStart = function(source, piece, position, orientation) {
		if (state[source] === UNKNOWN) {
			state[source] = (Math.random() < 0.5 ? PRIMARY : SECONDARY);
		}
		var moves;
		console.log(state);
		console.log(state[source]);
		if (state[source] === PRIMARY) {
			if(primary.game_over() || (turn === "w" && piece.search(/^w/) === -1) || (turn === "b" && piece.search(/^b/) === -1)) {
				return false;
			}
			moves = primary.moves({
				"square": source,
				"verbose": true
			});
		}
		else if (state[source] === SECONDARY) {
			if(secondary.game_over() || (turn === "w" && piece.search(/^w/) === -1) || (turn === "b" && piece.search(/^b/) === -1)) {
				return false;
			}
			moves = secondary.moves({
				"square": source,
				"verbose": true
			});
			piecesKnown[source] = true;
		}
		else {
			console.log("dang");
		}
		if (moves.length === 0) {
			return false;
		}

		highlightSquare(source);
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
		if (state[source] === PRIMARY) {
			moves = primary.moves({
				"square": source,
				"verbose": true
			});
		}
		else if (state[source] === SECONDARY) {
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
					if (primary.square_color(target) === "dark") {
						state[target] = UNKNOWN;
					}
					else if (primary.square_color(target) === "light") {
						state[target] = state[source];
					}
					else {
						console.log("dang 3");
					}
					piecesKnown[target] = piecesKnown[source];
					delete piecesKnown[source];
					delete state[source];
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

	var secondaryArrayString = shuffleArray("rnbqbnrpppppppp".split()).join();
	var secondaryInitialFen = secondaryArrayString.substring(0,4) + "k" + secondaryArrayString.substring(4,7) + "/" + secondaryArrayString.substring(7);
	secondaryInitialFen += "/8/8/8/8/";
	secondaryArrayString = shuffleArray("PPPPPPPPRNBQBNR".split()).join();
	secondaryInitialFen += secondaryArrayString.substring(0,8) + "/" + secondaryArrayString.substring(8,12) + "K" + secondaryArrayString.substring(12);
	secondaryInitialFen += " w KQkq - 0 1";

	primary = new Chess();
	secondary = new Chess(secondaryInitialFen);
	state = ChessBoard.fenToObj(primary.fen());
	piecesKnown = ChessBoard.fenToObj(primary.fen());
	for (var square in state) {
		if (state[square].substring(1,2) === "K") {
			state[square] = PRIMARY;
			piecesKnown[square] = true;
		}
		else {
			state[square] = UNKNOWN;
			piecesKnown[square] = false;
		}
	}


	var config = {
		"quantum": true,
		"draggable": true,
		"showNotation": false,
		"pieceTheme": "lib/chessboardjs/img/chesspieces/{piece}.png",
		"onDragStart": onDragStart,
		"onDrop": onDragEnd,
		"onSnapEnd": onSnapEnd
	};
	board = ChessBoard("board", config); // Initialize chessboard
	displayBoard();
});