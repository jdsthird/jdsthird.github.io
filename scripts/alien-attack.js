const gameConstants = {
	PLAYER_SHIP_HEIGHT: 40,
	PLAYER_SHIP_WIDTH: 28,
	PLAYER_SHIP_SPEED: 100,
	PROJECTILE_SPEED: 150,
	WINDOW_WIDTH: 800,
	WINDOW_HEIGHT: 500,
	ENEMY_SHIP_HEIGHT: 30,
	ENEMY_SHIP_WIDTH: 42,
	ENEMY_SHIP_SPEED: 75,
	SPAWN_DELAY: 2,
	HEALTH_STRING: "Health: ",
	SCORE_STRING: "Score: ",
	WELCOME_MESSAGE: "Welcome to Alien-Attack!\nClick anywhere to begin."
}

var date = new Date();
var keyPrevDown = false;
var lastTime = undefined;
var projectiles = [];
var enemies = [];
var sinceSpawn = 0;
var score = 0;
var gameRunning = false;


function PlayerShip(){
	this.health = 100;
	this.x = gameConstants.WINDOW_WIDTH / 2 - gameConstants.PLAYER_SHIP_WIDTH / 2;
	this.y = gameConstants.WINDOW_HEIGHT - gameConstants.PLAYER_SHIP_HEIGHT;
	this.direction = 0;
}

PlayerShip.prototype.update = function(ellapsedTime){
	this.x = Math.min(gameConstants.WINDOW_WIDTH - gameConstants.PLAYER_SHIP_WIDTH,
		Math.max(0, this.x += gameConstants.PLAYER_SHIP_SPEED * this.direction * ellapsedTime));
	if (this.health <= 0)
		gameRunning = false;
}

PlayerShip.prototype.shoot = function(){
	projectiles.push(new Projectile(true, this.x + gameConstants.PLAYER_SHIP_WIDTH / 2, this.y));
}

PlayerShip.prototype.draw = function(cx){
	if (this.health > 0){
		cx.beginPath();
		cx.moveTo(this.x, this.y + gameConstants.PLAYER_SHIP_HEIGHT);
		cx.quadraticCurveTo(this.x + gameConstants.PLAYER_SHIP_WIDTH / 2,
			this.y,
			this.x + gameConstants.PLAYER_SHIP_WIDTH,
			this.y + gameConstants.PLAYER_SHIP_HEIGHT);
		cx.lineTo(this.x + gameConstants.PLAYER_SHIP_WIDTH / 2, this.y);
		cx.fill();
	}
}

PlayerShip.prototype.checkCollision = function(projectile){
	if (projectile.x <= (this.x + gameConstants.PLAYER_SHIP_WIDTH) &&
		projectile.x >= this.x &&
		projectile.y >= (gameConstants.WINDOW_HEIGHT - gameConstants.PLAYER_SHIP_HEIGHT)){
		projectile.active = false;
		this.health -= 10;
	}
};

PlayerShip.prototype.checkEnemyCollision = function(enemyShip){
	if (enemyShip.x <= this.x + gameConstants.PLAYER_SHIP_WIDTH &&
		enemyShip.x >= this.x - gameConstants.ENEMY_SHIP_WIDTH &&
		enemyShip.y >= this.y - gameConstants.ENEMY_SHIP_HEIGHT){
		this.health -= 40;
		enemyShip.active = false;
	}
}

function Projectile(playerProjectile, x, y){
	this.active = true;
	this.playerProjectile = playerProjectile;
	this.x = x;
	this.y = y;
}

Projectile.prototype.update = function(ellapsedTime){
	if (this.playerProjectile)
		this.y -= gameConstants.PROJECTILE_SPEED * ellapsedTime;
	else
		this.y += gameConstants.PROJECTILE_SPEED * ellapsedTime;
	if (this.y >= gameConstants.WINDOW_HEIGHT || this.y <= 0)
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
	projectiles.push(new Projectile(false,
		this.x + gameConstants.ENEMY_SHIP_WIDTH / 2,
		this.y + gameConstants.ENEMY_SHIP_HEIGHT));
};

EnemyShip.prototype.checkCollision = function(projectile){
	if (projectile.x <= (this.x + gameConstants.ENEMY_SHIP_WIDTH) &&
		projectile.x >= this.x &&
		projectile.y >= this.y &&
		projectile.y <= (this.y + gameConstants.ENEMY_SHIP_HEIGHT)){
		projectile.active = false;
		this.active = false;
		score += 10;
	}
};


function update(time){
	var ellapsedTime = ellapsedGameTime(time);
	display.wipeCanvas();
	playerShip.update(ellapsedTime);
	updateObjects(projectiles, ellapsedTime, display.cx);
	updateObjects(enemies, ellapsedTime, display.cx);
	checkCollisions(projectiles, enemies);
	deleteInactive(projectiles);
	deleteInactive(enemies);
	if (gameRunning)
		spawnEnemies(ellapsedTime);
	drawObjects(display.cx);
	drawText(display.cx, playerShip.health, score)
	requestAnimationFrame(update);
}

function CanvasDisplay(parent){
	this.parent = parent;
	this.canvas = document.createElement("canvas");
	this.canvas.width = gameConstants.WINDOW_WIDTH;
	this.canvas.height = gameConstants.WINDOW_HEIGHT;
	this.cx = this.canvas.getContext("2d");
	this.cx.font = "15px Georgia";
	this.parent.appendChild(this.canvas);
}
CanvasDisplay.prototype.wipeCanvas = function(){
	this.cx.clearRect(0, 0, gameConstants.WINDOW_WIDTH, gameConstants.WINDOW_HEIGHT);
};


playerShip = new PlayerShip();
display = new CanvasDisplay(document.querySelector("section"));
display.cx.fillText(gameConstants.WELCOME_MESSAGE, 
	(gameConstants.WINDOW_WIDTH - display.cx.measureText(gameConstants.WELCOME_MESSAGE).width) / 2,
	gameConstants.WINDOW_HEIGHT / 2 + 7);


addEventListener("keydown", function(event){
	if (!keyPrevDown && event.which == 37)
		playerShip.direction = -1;
	else if (!keyPrevDown && event.which == 39)
		playerShip.direction = 1;
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

addEventListener("click", function(event){
	display.cx.textAlign = "left";
	score = 0;
	gameRunning = true;
	requestAnimationFrame(update);
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

function drawObjects(displayContext){
	if (gameRunning){
		playerShip.draw(displayContext);
		for (i=0; i<projectiles.length; i++){
			projectiles[i].draw(displayContext);
		}
		for (i=0; i<enemies.length; i++){
			enemies[i].draw(displayContext);
		}
	}
}

function checkCollisions(projectiles, enemies){
	for (i=0; i<projectiles.length; i++){
		if (projectiles[i].active){
			playerShip.checkCollision(projectiles[i]);
			for (j=0; j<enemies.length; j++){
				if (projectiles[i].playerProjectile)
					enemies[j].checkCollision(projectiles[i]);
			}
		}
	}
	for (i=0; i<enemies.length; i++){
		if (enemies[i].active)
			playerShip.checkEnemyCollision(enemies[i]);
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
	if (gameRunning && sinceSpawn > gameConstants.SPAWN_DELAY && Math.floor(Math.random() * 4) == 1){
		enemies.push(new EnemyShip(Math.floor(Math.random() * (
			gameConstants.WINDOW_WIDTH - gameConstants.ENEMY_SHIP_WIDTH))));
 		sinceSpawn = 0;
	}
}

function drawText(displayContext, health, score){
	if (gameRunning){
		displayContext.fillText(gameConstants.HEALTH_STRING + health, 10, 17);
		displayContext.fillText(gameConstants.SCORE_STRING + score, 10, 37);
	}
	else{
		resetGame();
		displayContext.textAlign = "center";
		displayContext.fillText("YOU ARE DEAD", gameConstants.WINDOW_WIDTH / 2, gameConstants.WINDOW_HEIGHT / 2 - 5);
		displayContext.fillText(gameConstants.SCORE_STRING + score,
			gameConstants.WINDOW_WIDTH / 2, gameConstants.WINDOW_HEIGHT / 2 + 20);	
	}
}

function resetGame(){
	while (enemies.length > 0){
		enemies.pop();
	}
	while (projectiles.length > 0){
		projectiles.pop();
	}
	playerShip.health = 100;
}