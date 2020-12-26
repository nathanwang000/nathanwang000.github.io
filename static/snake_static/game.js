var OBJECT_APPLE = 1;
var OBJECT_SNAKE = 2;

window.addEventListener("load", function(){
    startGame();
})

var WHITE     = "rgb(255, 255, 255)"
var BLACK     = "rgb(  0,   0,   0)"
var RED       = "rgb(255,   0,   0)"
var GREEN     = "rgb(  0, 255,   0)"
var DARKGREEN = "rgb(  0, 155,   0)"
var DARKGRAY  = "rgb( 40,  40,  40)"
var CORNSILK  = "rgb(255, 248, 220)"
var BGCOLOR = "lightpink"

var UP = 'up'
var DOWN = 'down'
var LEFT = 'left'
var RIGHT = 'right'

var HEAD = 0 // index of the worm's head

var startGame = function() {

    Game.initialize("game");

    Game.setBoard(0, new Background());
    Game.setBoard(1, new Grid());
    Game.setBoard(2, new TitleScreen("SNAKE!", 
				     "press space to start",
				     playGame));
    Game.setBoard(3, new GamePoints());

};

var playGame = function() {
    var board = new GameBoard();
    board.add(new Apple());
    board.add(new Apple());
    board.add(new Apple());
    board.add(new Apple());
    board.add(new Apple());
    board.add(new Snake());
    Game.setBoard(2, board);
    //Game.setBoard(3, new Level(/*TODO*/level1, winGame));
};

var loseGame = function() {
    Game.setBoard(2, new TitleScreen("You lose :(",
				     "press space to restart",
				     playGame, 1));
};

var winGame = function() {
    Game.setBoard(2, new TitleScreen("You win :)",
				     "press space to restart",
				     playGame, 1));
};

var Background = function(){
    this.color = BGCOLOR;
    this.width = Game.width;
    this.height = Game.height;
    this.step = function(dt) {}
    this.draw = function(ctx) {
	ctx.save();
	ctx.globalAlpha = 0.2;
	ctx.fillStyle = BGCOLOR;
	ctx.fillRect(0, 0, this.width, this.height);
	ctx.restore();
    }
};

var Grid = function() {
    this.step = function(dt) {};
    this.draw = function(ctx) {
	ctx.save();
	ctx.strokeStyle = DARKGRAY;
	ctx.lineWidth = 2;
	// draw vertical lines
	for (var x = 0; x < Game.width; x += Game.cellSize) {
	    ctx.moveTo(x, 0);
	    ctx.lineTo(x, Game.height)
	}
	// draw horizontal lines
	for (var y = 0; y < Game.height; y += Game.cellSize) {
	    ctx.moveTo(0, y);
	    ctx.lineTo(Game.width, y);
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.restore();
    };
}

var randInt = function(a, b) {
    return Math.floor(Math.random() * (b+1-a) + a);
}

var Apple = function(x, y) {
    this.x = randInt(0, Game.cellWidth-1);
    this.y = randInt(0, Game.cellHeight-1);
};
Apple.prototype.step = function(dt) {};
Apple.prototype.type = OBJECT_APPLE;
Apple.prototype.hit = function(damage) {
    this.board.remove(this);
    Game.points += this.points || 100;
    // respawn an new apple
    this.board.add(new Apple());
}
Apple.prototype.draw = function(ctx) {
    ctx.save();
    ctx.fillStyle = RED;
    var x = this.x * Game.cellSize;
    var y = this.y * Game.cellSize;
    ctx.fillRect(x, y, Game.cellSize, Game.cellSize);
    ctx.restore();
}

var Snake = function(x, y) {

    startx = x || randInt(5, Game.cellWidth - 5);
    starty = y || randInt(5, Game.cellHeight - 5);;
    this.body = [{x: startx,     y: starty},
		 {x: startx - 1, y: starty},
		 {x: startx - 2, y: starty}];

    this.reloadTime = 0.1;
    this.reload = this.reloadTime; // set the cool down

    this.direction = RIGHT;
    
    this.step = function(dt) {
	this.reload -= dt;
	
	if (Game.keys['left'] && this.direction != RIGHT)
	    this.direction = LEFT;
	else if (Game.keys['right'] && this.direction != LEFT)
	    this.direction = RIGHT;
	else if (Game.keys['up'] && this.direction != DOWN)
	    this.direction = UP;
	else if (Game.keys['down'] && this.direction != UP)
	    this.direction = DOWN;

	if (this.reload < 0) {
	    
	    // check edge
	    if (this.body[HEAD]['x'] == -1 ||
		this.body[HEAD]['x'] == Game.cellWidth ||
		this.body[HEAD]['y'] == -1 ||
		this.body[HEAD]['y'] == Game.cellHeight) {
		this.board.remove(this);
		loseGame();
	    }
	    // check hit itself
	    for (var i = 1, wormBody; wormBody = this.body[i++];){
		if (wormBody['x'] == this.body[HEAD]['x'] &&
		    wormBody['y'] == this.body[HEAD]['y']) {
		    this.board.remove(this);
		    loseGame();
		}
	    }
	    // check collision with apple
	    var collision = this.board.collide(this.body[HEAD], 
					       OBJECT_APPLE);
	    if (collision) {
		collision.hit(this.damage);
	    } else {
		this.body.pop();
	    }
	    
	    // move

	    var newHead = { x: this.body[HEAD].x,
			    y: this.body[HEAD].y };
	    if (this.direction == LEFT)
		newHead.x -= 1;
	    else if (this.direction == RIGHT)
		newHead.x += 1;
	    else if (this.direction == UP)
		newHead.y -= 1;
	    else if (this. direction == DOWN)
		newHead.y += 1
	    this.reload = this.reloadTime;
	    this.body.unshift(newHead);
	}

    };

    this.draw = function(ctx) {
	ctx.fillStyle = DARKGREEN;
	for (var i = 0, coord; coord = this.body[i++];) {
	    x = coord.x * Game.cellSize;
	    y = coord.y * Game.cellSize;
	    
	    ctx.fillRect(x,y,Game.cellSize,Game.cellSize);

	    ctx.save();

	    ctx.fillStyle = GREEN;
	    ctx.fillRect(x+4,y+4,Game.cellSize-8,Game.cellSize-8);

	    ctx.restore();
	}
    };
    
    this.type = OBJECT_SNAKE;
    
};




    
