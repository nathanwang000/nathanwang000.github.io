var documentWidth = window.screen.availWidth;
var documentHeight = window.screen.availHeight;
var gridContainerWidth = 0.92 * documentWidth;
var cellSideLength = 0.18 * documentWidth;
var cellSpace = 0.04 * documentWidth;

function getPosTop(i, j){
    return cellSpace + i * (cellSpace + cellSideLength);
}

function getPosLeft(i, j) {
    return cellSpace + j * (cellSpace + cellSideLength);
}

function getrandomcolor() {
    var result = "#";
    var colorString = "1234567890abcdef";
    for (var i=0; i < 6; ++i) {
	result+=colorString[Math.random()*colorString.length]
    }
    return result;
}

function getNumberBackgroundColor( number ) {
    return colorBgArray[number % colorBgArray.length];
}

function getNumberColor( number ) {
    return colorFgArray[number % colorFgArray.length];
}

function canMoveLeft() {
    for (var i = 0; i < 4; i++)
	for (var j = 1; j < 4; j++) {
	    if (board[i][j] != 0)
		if (board[i][j-1] == 0 || board[i][j-1] == board[i][j])
		    return true;
	}
    console.log("not can move left");
    return false;

}

function canMoveUp() {
    for (var c=0; c<4; c++)
	for (var r=1; r<4; r++)
	    if (board[r][c])
		if (board[r-1][c] == board[r][c] ||
		   !board[r-1][c])
		    return true;
    console.log("not can move up");
    return false;
}

function canMoveRight() {
    for (var r=3; r>=0; r--) {
	for (var c=2; c>=0; c--)
	    if (board[r][c])
		if (board[r][c] == board[r][c+1] ||
		    !board[r][c+1])
		    return true;
    }
    console.log("not can move right");
    return false;
}

function canMoveDown() {
    for (var r=0; r<3; r++)
	for (var c=0; c<4; c++)
	    if (board[r][c])
		if (!board[r+1][c] ||
		    board[r+1][c] == board[r][c])
		    return true;
    console.log("not can move down");
    return false;
}
