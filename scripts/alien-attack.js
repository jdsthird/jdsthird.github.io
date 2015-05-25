const gameConstants = {
	PLAYER_SHIP_HEIGHT: 20,
	PLAYER_SHIP_WIDTH: 14,
	PLAYER_SHIP_SPEED: 100,
	PROJECTILE_SPEED: 150,
	WINDOW_WIDTH: 800,
	WINDOW_HEIGHT: 550,
	ENEMY_SHIP_HEIGHT: 10,
	ENEMY_SHIP_WIDTH: 14,
	ENEMY_SHIP_SPEED: 75,
	SPAWN_DELAY: 2
}

var date = new Date();
var keyPrevDown = false;
var lastTime = undefined;
var projectiles = [];
var enemies = [];
var sinceSpawn = 0;


function PlayerShip(){
	this.health = 100;
	this.x = gameConstants.WINDOW_WIDTH / 2 - gameConstants.PLAYER_SHIP_WIDTH / 2;
	this.y = gameConstants.WINDOW_HEIGHT - gameConstants.PLAYER_SHIP_HEIGHT;
	this.direction = 0;
}

PlayerShip.prototype.update = function(ellapsedTime){
	if (this.health > 0)
		this.x = Math.min(gameConstants.WINDOW_WIDTH - gameConstants.PLAYER_SHIP_WIDTH,
			Math.max(0, this.x += gameConstants.PLAYER_SHIP_SPEED * this.direction * ellapsedTime));
}

PlayerShip.prototype.shoot = function(){
	projectiles.push(new Projectile(true, this.x + gameConstants.PLAYER_SHIP_WIDTH / 2, this.y));
}

PlayerShip.prototype.draw = function(cx){
	if (this.health > 0){
		cx.beginPath();
		cx.moveTo(this.x, this.y + 20);
		cx.quadraticCurveTo(this.x + 7, this.y, this.x + 14, this.y + 20);
		cx.lineTo(this.x + 7, this.y);
		cx.fill();
	}
}

PlayerShip.prototype.checkCollision = function(projectile){
	if (projectile.x <= this.x + gameConstants.PLAYER_SHIP_WIDTH &&
		projectile.x >= this.x &&
		projectile.y >= gameConstants.WINDOW_HEIGHT - gameConstants.PLAYER_SHIP_HEIGHT){
		projectile.active = false;
		this.health -= 10;
		console.log(this.health);
	}
};

function Projectile(playerProjectile, x, y){
	this.active = true;
	this.playerProjectile = playerProjectile;
	this.x = x;
	this.y = y;
}

Projectile.prototype.update = function(ellapsedTime){
	if (!this.active)
		return;
	if (this.playerProjectile)
		this.y -= gameConstants.PROJECTILE_SPEED * ellapsedTime;
	else
		this.y += gameConstants.PROJECTILE_SPEED * ellapsedTime;
	if (this.y < 0 || this > gameConstants.WINDOW_HEIGHT)
		this.active = false;
};

Projectile.prototype.draw = function(cx){
	if (this.active){
		cx.beginPath();
		cx.moveTo(this.x - 2, this.y - 2);
		cx.lineTo(this.x - 2, this.y + 2);
		cx.lineTo(this.x + 2, this.y + 2);
		cx.lineTo(this.x + 2, this.y - 2);
		cx.fill();
	}
};

function EnemyShip(x){
	this.x = x;
	this.y = 0;
	this.active = true;
};

EnemyShip.prototype.update = function(ellapsedTime){
	this.y += gameConstants.ENEMY_SHIP_SPEED * ellapsedTime;
	if (this.y > gameConstants.WINDOW_HEIGHT)
		this.active = false;
	if (Math.floor(Math.random() * 50) == 1)
		this.shoot();
};

EnemyShip.prototype.draw = function(cx){
	if (this.active){
		cx.beginPath();
		cx.moveTo(this.x, this.y);
		cx.quadraticCurveTo(this.x + gameConstants.ENEMY_SHIP_WIDTH / 2,
			this.y + gameConstants.ENEMY_SHIP_HEIGHT,
			this.x + gameConstants.ENEMY_SHIP_WIDTH,
			this.y);
		cx.lineTo(this.x + gameConstants.ENEMY_SHIP_WIDTH / 2, this.y + gameConstants.ENEMY_SHIP_HEIGHT);
		cx.fill();
	}
};

EnemyShip.prototype.shoot = function(){
	enemies.push(new Projectile(false,
		this.x + gameConstants.ENEMY_SHIP_WIDTH / 2,
		this.y + gameConstants.ENEMY_SHIP_HEIGHT));
};


function update(time){
	var ellapsedTime = ellapsedGameTime(time);
	display.wipeCanvas();
	playerShip.update(ellapsedTime);
	// playerShip.draw(display.cx);
	updateObjects(projectiles, ellapsedTime, display.cx);
	updateObjects(enemies, ellapsedTime, display.cx);
	checkCollisions(projectiles);
	deleteInactive(projectiles);
	deleteInactive(enemies);
	spawnEnemies(ellapsedTime);
	drawObjects();
	requestAnimationFrame(update);
}

function CanvasDisplay(parent){
	this.parent = parent;
	this.canvas = document.createElement("canvas");
	this.canvas.width = gameConstants.WINDOW_WIDTH;
	this.canvas.height = gameConstants.WINDOW_HEIGHT;
	this.cx = this.canvas.getContext("2d");
	this.parent.appendChild(this.canvas);
}
CanvasDisplay.prototype.wipeCanvas = function(){
	this.cx.clearRect(0, 0, gameConstants.WINDOW_WIDTH, gameConstants.WINDOW_HEIGHT);
};


playerShip = new PlayerShip();
display = new CanvasDisplay(document.querySelector("section"));
requestAnimationFrame(update);


addEventListener("keydown", function(event){
	if (!keyPrevDown && event.which == 37)
		playerShip.direction = -1;
	else if (!keyPrevDown && event.which == 39)
		playerShip.direction = 1;
	// else if (event.which == 32)
	// 	playerShip.shoot();
	keyPrevDown = true;
})

addEventListener("keypress", function(event){
	if (event.which == 32)
		playerShip.shoot();
})

addEventListener("keyup", function(event){
	if (keyPrevDown && (event.which == 37 || event.which == 39))
		playerShip.direction = 0;
	keyPrevDown = false;
})

function ellapsedGameTime(time){
	if (lastTime != undefined)
		var ellapsedTime = parseFloat((time - lastTime) / 1000);
	else
		var ellapsedTime = 0;
	lastTime = time;
	return ellapsedTime;
}

function updateObjects(array, ellapsedTime, cx){
	for (i=0; i<array.length; i++){
		array[i].update(ellapsedTime);
	}
}

function drawObjects(){
	playerShip.draw(display.cx);
	for (i=0; i<projectiles.length; i++){
		projectiles[i].draw(display.cx);
	}
	for (i=0; i<enemies.length; i++){
		enemies[i].draw(display.cx);
	}
}

function checkCollisions(projectiles){
	for (i=0; i<projectiles.length; i++){
		playerShip.checkCollision(projectiles[i]);
	}
}

function deleteInactive(array){
	for (i = array.length - 1; i >= 0; i--){
		if (!array[i].active)
			array.splice(i, 1);
	}
}

function spawnEnemies(ellapsedTime){
	sinceSpawn += ellapsedTime;
	if (sinceSpawn > gameConstants.SPAWN_DELAY && Math.floor(Math.random() * 4) == 1){
		enemies.push(new EnemyShip(Math.floor(Math.random() * (
			gameConstants.WINDOW_WIDTH - gameConstants.ENEMY_SHIP_WIDTH))));
 		sinceSpawn = 0;
	}
}