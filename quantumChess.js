var board, primary, secondary, state, turn, piecesKnown, locked; // state: primary, secondary, unknown

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
	if (squareEl.hasClass("black-3c85d")) {
		background = "#696969";
	}

	squareEl.css("backgroundColor", background);
}

function updateTurn() {
	locked = null;
	turn = (turn === "w" ? "b" : "w");
	primary.load(primary.fen().replace(/\s[wb]/, " " + turn));
	secondary.load(secondary.fen().replace(/\s[wb]/, " " + turn));

	if (turn === "w") {
		$("#turn").addClass("red");
		$("#turn").removeClass("black");
		$("#turn").html("Red's");
	}
	else {
		$("#turn").addClass("black");
		$("#turn").removeClass("red");
		$("#turn").html("Black's");
	}
}
function endTurn(source, target) {
	if (primary.square_color(target) === "dark") {
		state[target] = UNKNOWN;
	}
	else if (primary.square_color(target) === "light") {
		state[target] = state[source];
	}
	piecesKnown[target] = piecesKnown[source];
	delete piecesKnown[source];
	delete state[source];
	updateTurn();
}
function promotePiece(source, target) {
	var html = "";
	html += '<div id="buttons">';
	for (var i = 0; i < 4; i++) {
		var letter = "bnrq".split("")[i];
		html += '<button data-piecetype="' + letter + '">';
		html += '<img src="lib/chessboardjs/img/chesspieces/' + turn + letter.toUpperCase() + '.png">';
		html += '</button>';
	}
	html += '</div>';
	sweetAlert({
		title: "Which piece would you like to promote this pawn to?",
		text: html,
		html: true,
		showConfirmButton: false,
		allowEscapeKey: false	
	});
	$("#buttons button").click(function(e) {
		sweetAlert.close();
		var letter = $(this).data("piecetype");
		primary.remove(source);
		primary.put({
			type: letter,
			color: turn
		}, target);
		secondary.put(secondary.remove(source), target);
		$(this).off(e);
	})
}
function displayBoard() {
	var primaryObj = ChessBoard.fenToObj(primary.fen());
	var secondaryObj = ChessBoard.fenToObj(secondary.fen());
	var mainObj = {};
	for (var square in state) {
		switch (state[square]) {
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
		/* TODO: check if king is taken */
		if ((turn === "w" && piece.search(/^w/) === -1) || (turn === "b" && piece.search(/^b/) === -1)) {
			return false;
		}

		console.log(locked);

		if (locked !== null && locked !== source) {
			return false;
		}
		locked = source;

		var initiallyUnknown = false;
		if (state[source] === UNKNOWN) {
			initiallyUnknown = true;
			state[source] = (Math.random() < 0.5 ? PRIMARY : SECONDARY);
		}

		var moves;
		if (state[source] === PRIMARY) {
			moves = primary.moves({
				"square": source,
				"verbose": true,
				"legal": false
			});
		}
		if (state[source] === SECONDARY) {
			moves = secondary.moves({
				"square": source,
				"verbose": true,
				"legal": false
			});
			piecesKnown[source] = true;
		}

		displayBoard();

		if (moves.length === 0 && initiallyUnknown) {
			updateTurn();
			return false;
		}
		if (moves.length === 0) {
			locked = null;
			return false;
		}

		highlightSquare(source);
		for (var i = 0; i < moves.length; i++) {
			highlightSquare(moves[i].to);
		}
	};

	var onDragEnd = function(source, target) {
		removeHighlights();

		// Find all moves from square
		var moves;
		var game;
		if (state[source] === PRIMARY) {
			game = primary;
		}
		if (state[source] === SECONDARY) {
			game = secondary;
		}
		moves = game.moves({
			"square": source,
			"verbose": true,
			"legal": false
		});

		// promote if pawn is active at ends
		if (source === target && game.get(source).type === "p" && ((source.substring(1) === "8" && turn === "w") || (source.substring(1) === "1" && turn === "b"))) {
			promotePiece(source, target);
			endTurn(source, target);
		}

		var valid = false;
		for (var i = 0; i < moves.length; i++) {
			if (moves[i].to === target) { // Make sure move is to target
				valid = true;
				if (moves[i].flags.indexOf("p") !== -1) { // Check for promotion
					promotePiece(source, target);
					endTurn(source, target);
				}
				else { // Valid move, not promotion
					primary.put(primary.remove(source), target);
					secondary.put(secondary.remove(source), target);
					endTurn(source, target);
				}
				break;
			}
		}


		displayBoard();
		if (!valid) { // Move not to target; still locked
			return "snapback";
		}
	};

	var onSnapEnd = function() {
		displayBoard();
	};

	var secondaryArrayString = shuffleArray("rnbqbnrpppppppp".split("")).join("");
	var secondaryInitialFen = secondaryArrayString.substring(0, 4) + "k" + secondaryArrayString.substring(4, 7) + "/" + secondaryArrayString.substring(7);
	secondaryInitialFen += "/8/8/8/8/";
	secondaryArrayString = shuffleArray("PPPPPPPPRNBQBNR".split("")).join("");
	secondaryInitialFen += secondaryArrayString.substring(0, 8) + "/" + secondaryArrayString.substring(8, 12) + "K" + secondaryArrayString.substring(12);
	secondaryInitialFen += " w - - 0 1";

	primary = new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1");
	secondary = new Chess(secondaryInitialFen);
	state = ChessBoard.fenToObj(primary.fen());
	piecesKnown = ChessBoard.fenToObj(primary.fen());
	for (var square in state) {
		if (state[square].substring(1, 2) === "K") {
			state[square] = PRIMARY;
			piecesKnown[square] = true;
		}
		else {
			state[square] = UNKNOWN;
			piecesKnown[square] = false;
		}
	}

	turn = "w";
	locked = null;

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