const gameConstants = {
	PLAYER_SHIP_HEIGHT: 20,
	PLAYER_SHIP_WIDTH: 14,
	PLAYER_SHIP_SPEED: 1,
	WINDOW_WIDTH: 800,
	WINDOW_HEIGHT: 550,
	ENEMY_SHIP_HEIGHT: 10,
	CONTEXT: document.querySelector("canvas").getContext("2d")
}

var keyPrevDown = false;
var previousGameTime = null;
var date = new Date();

function PlayerShip(){
	this.health = 100;
	this.x = gameConstants.WINDOW_WIDTH / 2 - gameConstants.PLAYER_SHIP_WIDTH / 2;
	this.y = gameConstants.WINDOW_HEIGHT - gameConstants.PLAYER_SHIP_HEIGHT;
	this.direction = 1;
}

PlayerShip.prototype.update	= function(time){
	if (previousGameTime != null)
		this.x += gameConstants.PLAYER_SHIP_SPEED * this.direction * (time - previousGameTime / 1000);
	previousGameTime = time;
	playerShip.draw(gameConstants.CONTEXT);
	requestAnimationFrame(playerShip.update);
}

PlayerShip.prototype.draw = function(cx){
	cx.beginPath();
	cx.moveTo(this.x, this.y + 20);
	cx.quadraticCurveTo(this.x + 7, this.y, this.x + 14, this.y + 20);
	cx.lineTo(this.x + 7, this.y);
	cx.fill();
}

playerShip = new PlayerShip();


addEventListener("keydown", function(event){
	if (!keyPrevDown && event.which == 37)
		playerShip.direction = -1;
	else if (!keyPrevDown && event.which == 39)
		playerShip.direction = 1;
	keyPrevDown = true;
})

addEventListener("keyup", function(event){
	if (keyPrevDown && (event.which == 37 || event.which == 39))
		playerShip.direction = 0;
	keyPrevDown = false;
})

requestAnimationFrame(playerShip.update);

// function runAnimation(frameFunc){
// 	var lastTime = null;
// 	function frame(time){
// 		var stop = false;
// 		if (lastTime != null){
// 			var timeStep = Math.min(time - lastTime, 100) / 1000;
// 			stop = frameFunc(timeStep) === false;
// 		}
// 		lastTime = time;
// 		if (!stop)
// 			requestAnimationFrame(frame);
// 	}
// 	requestAnimationFrame(frame);
// }

function getEllapsedGameTime(time){
	if (previousGameTime)
		var output = time - previousGameTime;
	else
		var output = time;
	return output;
}