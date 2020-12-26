var FPS = 15

var WINDOWWIDTH = 640
var WINDOWHEIGHT = 480
var CELLSIZE = 20

var Game = new function(){
    // Game initialization
    this.initialize = function(canvasElementId) {
	this.canvas = document.getElementById(canvasElementId);
	this.width = this.canvas.width = WINDOWWIDTH;
	this.height = this.canvas.height = WINDOWHEIGHT;
	this.points = 0;
	
	this.cellWidth = Math.floor(WINDOWWIDTH / CELLSIZE);
	this.cellHeight = Math.floor(WINDOWHEIGHT / CELLSIZE);
	this.cellSize = CELLSIZE;
	
	// Set up rendering context
	this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
	
	if (!this.ctx) { return alert("Plz upgrade your browser to play"); }
	
	// Set up input
	this.setupInput();
	
	// start the game loop
	this.loop();
	
    };
    
    // Handle Input
    var KEY_CODES = { 37:'left', 39:'right', 32:'start',
		      38: 'up',  40: 'down' };
    this.keys = {};
    this.setupInput = function() {
	window.addEventListener('keydown', function(e){
	    if (KEY_CODES[e.keyCode]) {
		Game.keys[KEY_CODES[e.keyCode]] = true;
		e.preventDefault();
	    }
	}, false);
	window.addEventListener('keyup', function(e){
	    if (KEY_CODES[e.keyCode]) {
		Game.keys[KEY_CODES[e.keyCode]] = false;
		e.preventDefault();
	    }
	}, false);
    };
    
    // Game Loop:
    var boards = [];
    this.loop = function() {
	var dt = 1 / FPS;
	for (var i=0, len = boards.length; i < len; i++){
	    if (boards[i]) {
		boards[i].step(dt);
		boards[i] && boards[i].draw(Game.ctx);
	    }
	}
	setTimeout(Game.loop, 1000 / FPS);
    }
    
    // change an active game board
    this.setBoard = function(num, board) {boards[num] = board;};
    
};

var TitleScreen = function TitleScreen(title, subtitle, callback, t) {

    t = t || 0;

    this.step = function(dt) {

	t -= dt;
	
	if (Game.keys['start'] && callback &&
	  t <= 0) callback();
    };
    this.draw = function(ctx) {
	ctx.fillStyle = "#FFFFFF";
	ctx.textAlign = "center";
	ctx.font = "bold 40px bangers";
	ctx.fillText(title,Game.width/2,Game.height/2);
	ctx.font = "bold 20px bangers";
	ctx.fillText(subtitle,Game.width/2,Game.height/2 + 40);
    };
};

var GameBoard = function(){
    var board = this;

    // the current list of objects
    this.objects = [];
    this.cnt = [];

    // Add a new object to objects
    this.add = function(obj) {
	obj.board = this;
	this.objects.push(obj);
	this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
	return obj;
    };
    
    //  Mark an object for removal
    this.remove = function(obj) {
	var wasStillAlive = this.removed.indexOf(obj) == -1;
	if (wasStillAlive) { 
	    this.removed.push(obj); 
	    this.cnt[obj.type]--;
	}
	return wasStillAlive;
    };

    // Reset the list of removed objects
    this.resetRemoved = function() { this.removed = []; }

    // Remove object
    this.finalizeRemoved = function() {
	for (var i = 0, len = this.removed.length; i < len; ++i){
	    var idx = this.objects.indexOf(this.removed[i]);
	    if (idx != -1) {
		this.objects.splice(idx, 1);
	    }
	}
    }
    
    // helper methods
    // Call the same method on all current objects
    this.iterate = function(funcName) {
	// python: args = arguments[1:]
	var args = Array.prototype.slice.call(arguments, 1);
	for (var i = 0, len = this.objects.length; i < len; ++i){
	    var obj = this.objects[i];
	    obj[funcName].apply(obj, args);  // obj.funcName(args)
	}
    };

    // Find the first object for which func is true
    // TODO remove val=
    this.detect = function(func) {
	for (var i=0, val=null, len=this.objects.length;
	     i < len; i++){
	    if (func.call(this.objects[i])) return this.objects[i];
	}
	return false; // nothing found
    };

    // Call step on all objects and then delete any objects
    // that have been marked for removal
    this.step = function(dt) {
	this.resetRemoved();
	this.iterate('step', dt);
	this.finalizeRemoved();
    };

    // Draw all the objects
    this.draw = function(ctx) {
	this.iterate('draw', ctx);
    };
    
    this.overlap = function(o1,o2) {
	return o1.x == o2.x && o1.y == o2.y;
    };
    
    this.collide = function(obj, type) {
	return this.detect(function(){
	    if (obj != this) {
		var col = (!type || this.type & type) && board.overlap(obj, this);
		return col ? this : false;
	    }
	});
    }
}

var Level = function(levelData, callback) {
    this.levelData = [];
    for(var i=0, len=levelData.length; i < len; i++){
	this.levelData.push(Object.create(levelData[i]));
    }
    this.t = 0;
    this.callback = callback;
}

Level.prototype.step = function(dt) {
    var idx = 0, remove = [], curShip = null;

    // Update the current time offset
    this.t += dt * 1000;

    // Example level Data
    //   Start,   End,  Gap, Type,  Override
    // [[ 0,     4000,  500,  'step', {x: 100}]]
    while (curShip = this.levelData[idx]) {
	// Check if past the end time
	if (this.t > curShip[1]) {
	    // remove the entry
	    remove.push(curShip);
	} else if (curShip[0] < this.t) {
	    // Get the enemy definition blueprint
	    var enemy = enemies[curShip[3]],
	        override = curShip[4];

	    // Add a new enemy
	    this.board.add(new Enemy(enemy, override));

	    // Increment the start time by the gap
	    curShip[0] += curShip[2];
	}
	idx++;
    }
    // Remove any objects from the levelData that have passed
    for(var i=0,len=remove.length;i<len;i++) {
	var index = this.levelData.indexOf(remove[i]);
	if (index != -1) this.levelData.splice(index, 1);
    }
    
    // If there are no more enemies on the board and in 
    // levelData, this level is done
    if (this.levelData.length == 0 && 
	this.board.cnt[OBJECT_ENEMY] == 0 &&
	this.board.cnt[OBJECT_PLAYER]) {
	this.board.remove(this);
	if (this.callback) this.callback();
    }
}

Level.prototype.draw = function(ctx) {}

var TouchControls = function() {
    var gutterWidth = 10;
    var unitWidth = Game.width/5;
    var blockWidth = unitWidth - gutterWidth;

    this.drawSquare = function(ctx, x, y, txt, on) {
	ctx.globalAlpha = on ? 0.6 : 0.3;
	ctx.fillStyle = "#CCC";
	ctx.fillRect(x, y, blockWidth, blockWidth);
	
	ctx.fillStyle = "#FFF";
	ctx.textAlign = "center";
	ctx.globalAlpha = 1.0;
	ctx.font = "bold " + (3*unitWidth/4) + "px arial";

	ctx.fillText(txt, x+blockWidth/2-2, y+3*blockWidth/4+2);
    };
    
    this.draw = function(ctx) {
	ctx.save();
	var yLoc = Game.height - unitWidth;

	this.drawSquare(ctx, gutterWidth, yLoc,
			'\u25C0', Game.keys['left']);
	this.drawSquare(ctx, unitWidth + gutterWidth, yLoc,
			'\u25B6', Game.keys['right']);
	this.drawSquare(ctx, 4 * unitWidth, yLoc,
			'A', Game.keys['fire']);
	
	ctx.restore();
    }
    
    this.step = function(dt) {};
    
    this.trackTouch = function(e) {
	var touch, x;
	e.preventDefault();
	Game.keys['left'] = false;
	Game.keys['right'] = false;
	for(var i=0;i<e.targetTouches.length;i++) {
	    touch = e.targetTouches[i];
	    x = touch.pageX / Game.canvasMultiplier
		- Game.canvas.offsetLeft;
	    if (x < unitWidth) {
		Game.keys['left'] = true;
	    }
	    if (x > unitWidth && x < 2 * unitWidth) {
		Game.keys['right'] = true;
	    }
	}
	if (e.type == 'touchstart' || e.type == 'touchend') {
	    for(i=0;i<e.changedTouches.length;i++) {
		touch = e.changedTouches[i];
		x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
		if(x > 4  * unitWidth) {
		    Game.keys['fire'] = ( e.type == 'touchstart' );
		}
	    }

	}
    };
    
    Game.canvas.addEventListener('touchstart', this.trackTouch, true);
    Game.canvas.addEventListener('touchmove', this.trackTouch, true);
    Game.canvas.addEventListener('touchend', this.trackTouch, true);
    Game.playerOffset = unitWidth + 20;
};

var GamePoints = function() {
    Game.points = 0;
    var pointsLength = 8;
    this.draw = function(ctx) {
	ctx.save();
	ctx.font = "bold 18px arial";
	ctx.fillStyle= "#FFFFFF";
	ctx.globalAlpha = 0.6;
	var txt = "" + Game.points;
	var i = pointsLength - txt.length, zeros = "";
	while(i-- > 0) { zeros += "0"; }
	ctx.fillText(zeros + txt,40,20);
	ctx.restore();
    }
    this.step = function(dt) {};
}
