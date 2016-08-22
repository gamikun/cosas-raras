var STROKE_STYLE = '#fff solid';
var KEY_SPACE = 32;
var KEY_B     = 66;
var GROW_RATE = 1.8;
var WPN_BOMB = 1;

var keymap = [];
var mousemap = [false, false, false];
var shoots = [];
var enemies = [];
var lvlups = [];

var levelsexp = [
	0, 0,
	150, // level 2
	400, // level 3
	700, // level 4
];

var TICK = 25;
var ship = {
	loc: {x: 0, y: 0},
	killed: false,
	level: 1,
	exp: 0,
	shield: {
		capacity: 100,
		hp: 100,
		radio: 30
	}
};

var Shoot = function() {
	this.x = 0;
	this.y = 0;
};

var currentWeapon = {
	shootRate: 500, // milliseconds
	timeToShoot: 0,
	ready: true,
	damage: 20,
	level: 1
};

var currentBomb = {
	damage: 300,
	radio: 15,
	shootRate: 2000,
	timeToShoot: 0,
	ammo: 10
};

function timeit() {
	var shoot, enemy;
	var cx = canvas.width / 2;
	var by = canvas.height - 100;

	for (var i = 0; i < enemies.length; i++) {
		enemy = enemies[i];
		if (enemy.dead) {
			continue;
		}
		
		enemy.loc.y += enemy.speed;
		if (enemy.loc.y > canvas.height) {
			enemy.loc.y = -enemy.size.h;
			enemy.hp = enemy.maxhp * GROW_RATE;
			enemy.beingShot = false;
			// enemies.splice(i, 1);
			continue;
		}

		// validte if it's coliding with shield
		if (false) {
			
		}

		// validate if it's colliding with ship
		if (!enemy.dead && ship.loc.y < (enemy.loc.y + enemy.size.h)
		 && ship.loc.y > enemy.loc.y
		 && ship.loc.x > enemy.loc.x
		 && ship.loc.x < (enemy.loc.x + enemy.size.w)) {
			ship.killed = true;
		}
	}

	// Move the shoots
	var nextLevel = 0;
	for (var i = 0; i < shoots.length; i++) {
		shoot = shoots[i];
		shoot.loc.y -= shoot.speed;
		// check if the shoot is touching an enemy
		for (var j = 0; j < enemies.length; j++) {
			enemy = enemies[j];
			if (!enemy.dead && shoot.loc.y >= enemy.loc.y
			  && shoot.loc.y <= (enemy.loc.y + enemy.size.h)
			  && shoot.loc.x >= enemy.loc.x
			  && shoot.loc.x <= (enemy.loc.x + enemy.size.w))
			{
				if (!shoot.fromEnemy) {
					if (shoot.type == WPN_BOMB) {
						if (shoot.dead) {
							shoots.splice(i, 1);
							// Search for affected enemies
							for (var i = 0; i < enemies.length; i++) {
								var enemy = enemies[i];
								var dtl = Math.hypot(
									shoot.loc.x - enemy.loc.x,
									shoot.loc.y - enemy.loc.y
								);
								if (dtl < shoot.expRadio) {
									console.log(shoot.damage);
									enemy.hp -= shoot.damage;
									enemy.beingShot = true;
								}

								if (enemy.hp <= 0) {
									ship.exp += enemy.exp;
									nextLevel = currentWeapon.level + 1;
									if (nextLevel < levelsexp.length) {
										if (ship.exp >= levelsexp[nextLevel]) {
											currentWeapon.level += 1;
										}
									}
									//enemy.loc.y = -enemy.size.h;
									enemy.dead = true;
									enemy.hp = enemy.maxhp * GROW_RATE;
								}
							}
						} else if (shoot.exploding) {
							shoot.radio += shoot.expSpeed;
							if (shoot.radio >= shoot.expRadio) {
								shoot.radio = shoot.expRadio;
								shoot.dead = true;
							}
						} else {
							shoot.speed = -1;
							shoot.exploding = true;
						}
						if (shoot.exploding === false) {
							
						}
					} else {
						shoots.splice(i, 1);
						enemy.hp -= shoot.damage;
						enemy.beingShot = true;

						if (enemy.hp <= 0) {
							ship.exp += enemy.exp;
							nextLevel = currentWeapon.level + 1;
							if (nextLevel < levelsexp.length) {
								if (ship.exp >= levelsexp[nextLevel]) {
									currentWeapon.level += 1;
								}
							}
							//enemies.splice(j, 1);
							//enemy.loc.y = -enemy.size.h;
							enemy.hp = enemy.maxhp * GROW_RATE;
						}
					}
					

					break;
				}
			}
		}
	}

	// Increment weapon transcurred time
	currentWeapon.timeToShoot -= TICK;
	currentBomb.timeToShoot -= TICK;

	
	if (currentBomb.timeToShoot <= 0 && currentBomb.ammo > 0) {		
		if (keymap[KEY_B]) {
			currentBomb.ammo -= 1;
			currentBomb.timeToShoot = currentBomb.shootRate;
			shoots.push({
				type: WPN_BOMB,
				radio: currentBomb.radio,
				expSpeed: 15,
				expRadio: 100,
				exploding: false,
				died: false,
				loc: {x: ship.loc.x - 30, y: ship.loc.y},
				speed: 2,
				damage: currentBomb.damage
			});
		}
	}
	
	if (currentWeapon.timeToShoot <= 0) {
		currentWeapon.timeToShoot = currentWeapon.shootRate;
		currentWeapon.ready = true;
		if (keymap[KEY_SPACE] === true || mousemap[0] === true) {
			var nshoot;

			if (currentWeapon.level == 4) {
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x - 30, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x + 30, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x - 15, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x + 15, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
			}
			if (currentWeapon.level == 3) {
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x - 20, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x + 20, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
			} else if (currentWeapon.level == 2) {
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x - 15, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x + 15, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
			} else {
				shoots.push({
					length: 30,
					loc: {x: ship.loc.x, y: ship.loc.y},
					speed: 5,
					damage: 20
				});
			}
			
			currentWeapon.ready = false;
		}
	}

	// enemy fire
	for (var i = 0; i < enemies.length; i++) {
		var enemy = enemies[i];
		if (enemy.dead) {
			continue;
		}
		enemy.weapon.timeToShoot -= TICK;
		if (enemy.weapon.timeToShoot <= 0) {
			shoots.push({
				length: 30,
				loc: {
					x: enemy.size.w / 2 + enemy.loc.x,
					y: enemy.loc.y + enemy.size.h
				},
				speed: -5,
				damage: 20,
				fromEnemy: true
			});
			enemy.weapon.timeToShoot = enemy.weapon.shootRate;
		}
	}

	context.fillStyle = '#000';
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Draw al shoots in the space
	for(var i = 0; i < shoots.length; i++) {
		shoot = shoots[i];
		drawShoot(shoot);
	}

	// Draw enemies
	for (var i = 0; i < enemies.length; i++) {
		enemy = enemies[i];
		if (enemy.dead == false) {
			drawEnemy(enemy);
		}
	}

	// Draw level
	context.fillStyle = '#fff';
	context.fillText('LVL ' + ship.level
		+ ' (exp: ' + ship.exp + ')',
		10, canvas.height - 10);

	// Barra de energía
	drawHPBar();

	drawShip(ship.loc.x, ship.loc.y);
	if (ship.killed === false) {
		drawShield(ship.loc.x, ship.loc.y, 50);
	}
	//drawShoot(cx, by);
	//drawShoot(cx, by - 30);
	//drawShoot(cx, by - 60);

	if (!ship.killed) {
		requestAnimationFrame(timeit);
	}	
}

function drawShip(x, y) {
	context.strokeStyle = '#fff';
	context.beginPath();
	if (ship.killed === false) {
		context.moveTo(x, y);
		context.lineTo(x + 10, y + 40);
		context.lineTo(x - 10, y + 40);
		context.closePath();
	} else {
		context.moveTo(x - 30, y);
		context.lineTo(x + 30, y + 40);
		context.moveTo(x + 30, y);
		context.lineTo(x - 30, y + 40)
	}
	
	context.stroke();
}

function drawShield(x, y, radio) {
	context.beginPath();
	context.arc(x, y, radio, Math.PI, Math.PI * 2);
	context.stroke();
}

function drawShoot(shoot) {
	context.beginPath();
	if (shoot.radio) {
		context.arc(shoot.loc.x, shoot.loc.y,
			shoot.radio, 0, Math.PI * 2);
	} else {
		context.moveTo(shoot.loc.x, shoot.loc.y - 10);
		context.lineTo(shoot.loc.x, shoot.loc.y - 30);
	}
	
	context.stroke();
}

function drawHPBar() {
	context.strokeStyle = '#fff 2px';
	context.strokeRect(16, 16, 100, 30);
	context.fillStyle = '#fff';
	context.strokeStyle = null;
	context.fillRect(20, 20, 92, 22);
}

function drawEnemy(enemy) {
	var strokeColor;
	var fillColor;

	if (enemy.beingShot) {
		strokeColor = '#f00';
		fillColor = '#f00';
		enemy.beingShot = false;
		damaged = true;
	} else {
		strokeColor = '#fff';
	}
	context.beginPath();
	context.moveTo(enemy.loc.x, enemy.loc.y);
	context.lineTo(enemy.loc.x + enemy.size.w, enemy.loc.y);
	context.lineTo(enemy.loc.x + enemy.size.w / 2,
		enemy.loc.y + enemy.size.h)
	context.closePath();
	if (fillColor) {
		context.fillStyle = fillColor;
		context.fill();
	} else {
		context.stroke();
	}
	
	context.fillStyle = '#fff';
	var perc = Math.round(enemy.hp) + '%';
	var s = context.measureText(perc);
	/*context.fillText(perc, 
		enemy.loc.x + (enemy.size.w / 2 - s.width / 2),
		enemy.loc.y + (enemy.size.h / 2)
	);*/
}

window.onload = function() {
	canvas = document.getElementById('space');

	// Force to resize the canvas and then
	// return the context of it.
	window.onresize();
	context = canvas.getContext('2d');

	// Add some enemies
	var enemy, hp;
	for (var i = 0; i < 10; i++) {
		hp = Math.random() * 300;
		enemy = {
			loc: {
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height - canvas.height
			},
			hp: hp,
			maxhp: hp,
			size: {
				w: 100 * Math.random() + 15,
				h: 30 * Math.random() + 30
			},
			dead: false,
			speed: Math.random() + 1.5,
			exp: 5,
			weapon: {
				shootRate: 5000,
				timeToShoot: 0
			}
		};
		enemies.push(enemy);
	}

	// Define defaults colors
	//context.clearStyle = CLEAR_STYLE;
	context.strokeStyle = STROKE_STYLE;

	// Prepares the ship position
	ship.loc.x = canvas.width / 2;
	ship.loc.y = canvas.height - 100;

	// Prepare keymap
	for(var i = 0; i < 256; i++) {
		keymap.push(false);
	}

	window.onkeydown = function(event) {
		keymap[event.keyCode] = true;
	}

	window.onkeyup = function(event) {
		keymap[event.keyCode] = false;
	}

	window.onmousemove = function(event) {
		ship.loc.x = event.clientX;
		ship.loc.y = event.clientY;
	}

	window.onmousedown = function(event) {
		mousemap[event.button] = true;
	}

	window.onmouseup = function(event) {
		mousemap[event.button] = false;
	}

	timeit();
}

window.onresize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}