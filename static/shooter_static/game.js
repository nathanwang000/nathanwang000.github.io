// declare some const types
// each is a power of 2 to
// perform bitwise logic in 
// collision detection
var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16;

var sprites = {
    ship: {sx:0, sy:0, w:37, h:42, frames:1,
	   totalHealth: 30},
    missile: {sx:0, sy:30, w:2, h:10, frames:1 },
    enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1,
		    totalHealth: 30},
    enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1,
		 total_health: 10},
    enemy_ship: { sx: 116, sy: 0, w: 42, h: 43, frames: 1,
		  totalHealth: 30},
    enemy_circle: { sx: 158, sy: 0, w: 32, h: 33, frames: 1,
		    totalHealth: 40 },
    explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12 }
};

var enemies = {
    straight: { x: 0, y: -50, sprite: 'enemy_ship',
		E: 100, damage: 10 },
    ltr: { x: 0, y: -100, sprite: 'enemy_purple',
	   B: 200, C: 1, E: 200, damage: 10 },
    circle: { x: 400, y: -50, sprite: 'enemy_circle',
	      B: -200, C: 1, E: 20, F: 200, G: 1, H: Math.PI/2,
	      damage: 10},
    wiggle: { x: 100, y: -50, sprite: 'enemy_bee',
	      B: 100, C: 4, E: 100, damage: 10 },
    step: {x: 0, y: -50, sprite: 'enemy_circle',
	   B: 300, C: 1.5, E: 60, damage: 10 }
};

var startGame = function() {
    Game.setBoard(0,new Starfield(20,0.4,100,true))
    Game.setBoard(1,new Starfield(50,0.6,100))
    Game.setBoard(2,new Starfield(100,1.0,50));
    Game.setBoard(3,new TitleScreen("Alien Invasion",
				    "press space bar to begin",
				    playGame));
    Game.music.title.play();
}

var playGame = function() {
    var board = new GameBoard();
    // reset the messageBoard
    Game.setBoard(4,null);
    board.add(new PlayerShip());
    board.add(new Level(level1, winGame));
    Game.setBoard(3, board);
    Game.stopMusic();
    Game.music.battle.play();
}

var winGame = function() {
    Game.stopMusic();
    Game.music.victory.play();
    Game.setBoard(4, new TitleScreen("You win!",
				     "Press fire to play again",
				     playGame, 1));
}

var loseGame = function() {
    Game.stopMusic();
    Game.music.defeat.play();
    Game.setBoard(4, new TitleScreen("You lose!",
				     "Press fire to play again",
				     playGame, 1));
}

window.addEventListener("load", function(){
    Game.initialize("game", sprites, startGame);
});

function getRandomColor(){
    var str = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; ++i) {
	color += str[Math.floor(Math.random()*str.length)];
    }
    return color;
}

var Starfield = function(speed, opacity, numStars, clear) {
    
    // Set up the offscreen canvas
    var stars = document.createElement("canvas");
    stars.width = Game.width;
    stars.height = Game.height;
    
    var starCtx = stars.getContext("2d");
    var offset = 0;
    
    // clear the ground
    if (clear) {
	starCtx.fillStyle = "#000";
	starCtx.fillRect(0, 0, stars.width, stars.height);

    }

    // draw the stars
    starCtx.globalAlpha = opacity; // range from 0 to 1
    for (var i = 0; i < numStars; i++){
	starCtx.fillStyle = getRandomColor();
	starCtx.fillRect(Math.floor(Math.random()*stars.width),
			 Math.floor(Math.random()*stars.height),
			 2,
			 2);
    }
    // This method is called every frame
    // to draw the starfield onto the canvas
    this.draw = function(ctx) {
	var intOffset = Math.floor(offset);
	var remaining = stars.height - intOffset;
	// Draw the top half of the starfield
	if (intOffset > 0) {
	    ctx.drawImage(stars,
			  0, remaining,
			  stars.width, intOffset,
			  0, 0,
			  stars.width, intOffset
		
	    );
	}
	// Draw the bottom half of the starfield
	if(remaining > 0) {
	    ctx.drawImage(stars,
			  0, 0,
			  stars.width, remaining,
			  0, intOffset,
			  stars.width, remaining);
	}
    };
    // update the starfield
    this.step = function(dt){
	offset += dt * speed;
	offset = offset % stars.height;
    }

};

var PlayerShip = function() {
    this.setup('ship', {
	vx: 0, vy: 0, g: 600, friction: 0.9,
	reloadTime: 0.25, frame: 0
    })
    
    this.x = Game.width/2 - this.w/2;
    this.y = Game.height - Game.playerOffset - this.h;
    this.reload = this.reloadTime; // t remaining
        
    this.step = function(dt) {
	
	if (this.alpha >= 0.01)
	    this.alpha -= 0.01;
	
	if (Game.keys['left']) {
	    this.vx -= this.g * dt;
	}
	else if (Game.keys['right']) {
	    this.vx += this.g * dt;
	}
	else if (Game.keys['up']) {
	    this.vy -= this.g * dt;
	}
	else if (Game.keys['down']) {
	    this.vy += this.g * dt;
	}
	else {
	    this.vx *= this.friction; 
	    this.vy *= this.friction; 
	}

	this.x += this.vx * dt;
	this.y += this.vy * dt;

	if (this.x < 0) { 
	    this.x = 0; 
	    this.vx = -this.vx * this.friction;
	}
	else if (this.x > Game.width - this.w) {
	    this.x = Game.width - this.w;
	    this.vx = -this.vx * this.friction;
	}
	else if (this.y < 0) {
	    this.y = 0;
	    this.vy = -this.vy * this.friction;
	}
	else if (this.y > Game.height - this.h) {
	    this.y = Game.height - this.h;
	    this.vy = -this.vy * this.friction;
	}
	
	this.reload -= dt;
	if (Game.keys['fire'] && this.reload < 0) {
	    this.reload = this.reloadTime;
	    Game.sound.shoot.play();
	    this.board.add(new PlayerMissile(this.x, 
					     this.y + this.h / 2));
	    this.board.add(new PlayerMissile(this.x + this.w, 
					     this.y + this.h / 2));
	}
    }
}
PlayerShip.prototype = new LivingObject();
PlayerShip.prototype.type = OBJECT_PLAYER;
PlayerShip.prototype.hit = function(damage) {
    LivingObject.prototype.hit.call(this, damage);
    if (this.health <= 0)
	loseGame();
};

var PlayerMissile = function(x, y) {
    this.setup('missile', {vy: -700, damage: 10});
    // Center the missile
    this.x = x - this.w / 2;
    this.y = y - this.h;
};
PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;
PlayerMissile.prototype.step = function(dt) {
    this.y += this.vy * dt;
    var collision = this.board.collide(this, OBJECT_ENEMY);

    if (collision) {
	collision.hit(this.damage);
	collision.alpha = collision.alpha < 0.7 ? 
	    0.3 + collision.alpha : 1;
	this.board.remove(this); // remove the bullet
    } else if (this.y < -this.h) {
	this.board.remove(this);
    }
};

var Enemy = function(blueprint, override) {
    
    this.merge(this.baseParameters);
    this.setup(blueprint.sprite, blueprint);
    this.merge(override);

}
Enemy.prototype = new LivingObject();
Enemy.prototype.type = OBJECT_ENEMY;
Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0,
				   D: 0, E: 0, F: 0,
				   G: 0, H: 0, t: 0 };

Enemy.prototype.step = function(dt) {
    
    this.alpha = this.alpha > 0.01 ? this.alpha - 0.01 : 0
    this.t += dt;
    this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
    this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    var collision = this.board.collide(this, OBJECT_PLAYER);
    if (collision) {
	collision.hit(this.damage);
	collision.alpha = collision.alpha < 0.7 ? 
	    0.3 + collision.alpha : 1;
	this.board.remove(this);
    } else if (this.y > Game.height) {
	this.board.remove(this);
    }
    this.inbound_left();
    this.inbound_right()
}

var Explosion = function(centerX, centerY) {
    this.setup('explosion', { frame: 0 });
    this.x = centerX - this.w/2;
    this.y = centerY - this.h/2;
    this.subFrame = 0;
};
Explosion.prototype = new Sprite();
Explosion.prototype.step = function(dt) {
    this.frame = Math.floor(this.subFrame++/3);
    if (this.subFrame >= 36) {
	this.board.remove(this);
    }
};

var level1 = [
    // Start,  End,  Gap,  Type,        Override
    [   0,     1200, 500,  'step'],
    [ 6000,   13000, 800,  'ltr'],
    [12000,   16000, 400,  'circle'],
    [18200,   20000, 500,  'straight', { x: 150}]
];

