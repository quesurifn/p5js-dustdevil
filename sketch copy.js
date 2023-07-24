/// START WITHOUT ASSISTANCE AS PART OF MIDTERM
/// START WITHOUT ASSISTANCE AS PART OF MIDTERM
/// START WITHOUT ASSISTANCE AS PART OF MIDTERM

let cameraPosX = 0;
let collectedCacti = 0;

/* ASSETS FOR BACKGROUND */
let canyon;
let dustDevil;
/* END ASSETS FOR BACKGROUND */

/* VARIABLES FOR MOVEMENT */
let isLeft = false;
let isRight = false;
let isFalling = false;
let isPlummeting = false;
/* END VARIABLES FOR MOVEMENT */

/* VARIABLES FOR GAMEPLAY */
const collectionBufferInPixels = 20;
/* END VARIABLES FOR GAMEPLAY */

// Gameboard
const GAME_BOARD_MAX_X = 1_0000;
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
const FLOOR_POS = 402;

const clouds = [];
const trees = [];
const cacti = []
const mountains = [];
const canyons = [];

const randomBetweenRange = (num1, num2) => {
	return Math.floor(Math.random() * (num2 - num1 + 1) + num1);
}


function setup() {
	const MOUNTAIN_DENSITY = 2000;
	const MAX_MOUNTAIN_COUNT = 5;
	let mountainCount = 0;

	const CACTUS_DENSITY = 1000;
	const MAX_CACTUS_COUNT = 5;
	let cactusCount = 0;

	const TREE_DENSITY = 1000;
	const MAX_TREE_COUNT = 20;
	let treeCount = 0;

	const CLOUD_DENSITY = 1000;
	const MAX_CLOUD_COUNT = 20;
	let cloudCount = 0;

	const CANYON_DENSITY = 1000;
	const MAX_CANYON_COUNT = 15;
	let canyonCount = 0;

	let lastCloudX = 0;
	let lastTreeX = 0;
	let lastCactusX = 0;
	let lastMountainX = 0;
	let lastCanyonX = 0;


	// Setup Loop
	for(let i = 0; i < GAME_BOARD_MAX_X / 150; i++) {
		if(cloudCount <= MAX_CLOUD_COUNT) {
			lastCloudX += randomBetweenRange(100, CLOUD_DENSITY);
			clouds.push({x_pos: lastCloudX, y_pos: randomBetweenRange(50, 100)});
			cloudCount++;
		}

		if(treeCount <= MAX_TREE_COUNT) {
			lastTreeX += randomBetweenRange(100, TREE_DENSITY);
			trees.push({x_pos: lastTreeX, y_pos: 432});
			treeCount++;
		}

		if(cactusCount <= MAX_CACTUS_COUNT) {
			lastCactusX += randomBetweenRange(100, CACTUS_DENSITY);
			cacti.push({x_pos: lastCactusX, y_pos: 392});
			cactusCount++;
		}

		if(mountainCount <= MAX_MOUNTAIN_COUNT) {
			lastMountainX += randomBetweenRange(100, MOUNTAIN_DENSITY);
			mountains.push({x_pos: lastMountainX, y_pos: 432});
			mountainCount++;
		}

		if(canyonCount <= MAX_CANYON_COUNT) {
			lastCanyonX += randomBetweenRange(100, CANYON_DENSITY);
			canyons.push({x_pos: lastCanyonX, width: randomBetweenRange(50, 100)});
			canyonCount++;
		}
	}

	trees.push(
		{x_pos: 870, y_pos: 432},
		{x_pos: 910, y_pos: 432},
		{x_pos: 950, y_pos: 432},
	);
	clouds.push(
		{x_pos: 200, y_pos: 100},
		{x_pos: 500, y_pos: 150},
		{x_pos: 800, y_pos: 100},
	)
	mountains.push({x_pos: 490, y_pos: 432});

	// One Time Assets
	dustDevil = { x_pos: 100, y_pos: 400, rainbows: false, spillY: 20 };
	canyon = { x_pos: 322, width: 100 };

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
}

function draw()
{
	/**
	 * Derived Game Loop Constants
	 */


	cameraPosX += 1;
	makeGround();
	push();
	translate(-cameraPosX, 0);


	/**
	 * For some reason when using one loop to draw all the assets the "z-index" of the assets are
	 * not respected via the order of the function calls in the loop
	 */


	makeSun(CANVAS_WIDTH + cameraPosX - 100, 100);
	for (const mountain of mountains) {
		makeMountain(mountain.x_pos, mountain.y_pos);
	}

	for (const cloud of clouds) {
		makeCloud(cloud.x_pos, cloud.y_pos);
	}

	for (const tree of trees) {
		makeTree(tree.x_pos, tree.y_pos);
	}

	for(const cactus of cacti) {
		makeCactus(cactus.x_pos, cactus.y_pos);
	}

	for(const canyon of canyons) {
		makeCanyon(canyon.x_pos, canyon.width);
	}

	makeCanyon(canyon.x_pos, canyon.width);
	makeDustDevil(dustDevil.x_pos, dustDevil.y_pos, {maxSizeX: 20, maxSizeY: 40});
	pop();


	isFalling = dustDevil.y_pos < FLOOR_POS;

	/* COLLISION DETECTION LOOP */
	for(let i = 0; i < Math.max(canyons.length, cacti.length); i++) {
		const cactus = cacti[i];
		const canyon = canyons[i];

		if(canyon && Math.abs(dustDevil.x_pos - canyon.x_pos) <= collectionBufferInPixels
			&& Math.abs(dustDevil.y_pos - FLOOR_POS) <= collectionBufferInPixels) {
			isPlummeting = true;
		}

		if(cactus && Math.abs(dustDevil.x_pos - cactus.x_pos) <= collectionBufferInPixels
			&& Math.abs(dustDevil.y_pos - cactus.y_pos) <= collectionBufferInPixels) {
			cacti.splice(i, 1);
			collectedCacti++;
		}
	}

	const isPastCanyonStart = dustDevil.x_pos > canyon.x_pos;
	const isBeforeCanyonEnd = dustDevil.x_pos < (canyon.x_pos + canyon.width - 30);
	const isCloseToGround = Math.abs(dustDevil.y_pos - FLOOR_POS) < 10;

	if(isPastCanyonStart && isBeforeCanyonEnd && isCloseToGround) {
		isPlummeting = true;
	}
	/* END COLLISION DETECTION */


	/* MOVEMENT*/
	if(!isPlummeting && isLeft) {
		dustDevil.x_pos -= 10;
		dustDevil.spillX = 40;
	}
	if(!isPlummeting && isRight) {
		dustDevil.x_pos += 10;
		dustDevil.spillX = 40;
	}
	if(isPlummeting) {
		dustDevil.y_pos += 10;
	}
	if(dustDevil.y_pos >= FLOOR_POS) {
		dustDevil.rainbows = false;
		dustDevil.spillY = 20;
	}
	if(isFalling) {
		dustDevil.y_pos += 5;
		dustDevil.spillX = 20;
	}
	const isStill = !isLeft && !isRight && !isFalling && !isPlummeting
	if(isStill) {
		dustDevil.spillX = 10;
	}
}

// Functions for Creating Assets
function makeGround() {
    background(100, 155, 255); //fill the sky blue
	noStroke();
	fill(237,201,175);
	rect(0, 432, 1024, 144); //draw some green ground
}

function makeDustDevil(x, y, szOpts = {maxSizeX: 20, maxSizeY: 40}) {
	for(let i = 0; i < 4; i++) {
		if(dustDevil.rainbows) fill(random(255), random(255), random(255));
		else fill(0,0,0);
		noStroke();
		const size = random(szOpts.maxSizeX || 30, szOpts.maxSizeY || 30);
		const x1 = x + random(dustDevil.spillX || -10,  10);
		const y1 = y + random(dustDevil.spillY || -10,  10);
		ellipse(x1, y1, size, size);
	}
}

function makeCloud(x, y) {
    fill(255, 255, 255)
	noStroke()
    ellipse(x - 40, y, 60, 60)   // Left
	ellipse(x, y, 80, 80)       // Middle
	ellipse(x + 40, y, 60, 60)  // Right
}

function makeMountain(x, y) {
	fill(120, 100, 40)
	beginShape();
	vertex(x, y) // bottom left x,y
	vertex((x + 24), (y - 100)) // x + 24, y - 100
	vertex((x + 37), (y - 111)) // x + 37, y - 111
	vertex((x + 45), (y - 151)) // x + 45, y - 151
	vertex((x + 63) ,(y - 196)) // x + 63, y - 196
	vertex((x + 119),(y - 152)) // x + 119, y - 152
	vertex((x + 156),(y - 111)) // x + 156, y - 111
	vertex((x + 214), y) // bottom right x, y + 214, y - 0
	endShape();


	fill(255, 255, 255)
	beginShape();
	vertex((x + 63), (y - 196)) // 490 + 63, 196 - 40
	vertex((x + 88), (y - 40)) // x + 88, y - 40
	vertex((x + 76), (y - 180)) // oriigin 490,432; x + 76, y - 180
	vertex((x + 71), (y - 196)) // x + 71, y - 196
	vertex((x + 66), (y - 177)) // 556, 255 // origin 490, 432 x + 66, y - 177
	vertex((x + 52), (y - 169)) // 542, 263 // origin 490, 432 x + 52, y - 169
	endShape();


	fill(158, 136, 66)
	beginShape();
	vertex((x + 18),y) // 508, 432 // origin 490, 432 x + 18, y - 0
	vertex((x + 40), (y - 100)) // 530, 332 // origin 490, 432 x + 40, y - 100
	vertex((x + 52), (y - 93)) // 542, 339 // origin 490, 432 x + 52, y - 93
	vertex((x + 54), (y - 15)) // 544, 417 // origin 490, 432 x + 54, y - 15
	vertex((x + 55), y)
	endShape();
}

function makeTree(x, y) {
	noStroke()
    fill(78,53,36)
	rect(x, y, 10, -32)
	fill(0, 155, 0)

	ellipse(x + 5, y - 33, 50, 50)
}

function makeCanyon(x, width) {
    fill(120,100,40)
	rect(x, 432, width, 145) // origin 90, 432; 100, 145
}

function makeSun(x, y) {
	fill(255, 193, 37)
	ellipse(x, y, 100, 100)
}

function makeCactus(x, y) {
	fill(0, 100, 0)
	rect(x, y, 10, 40)

	rect(x, y + 20, 25, 5)
	fill(0, 100, 0)
	rect(x + 20, y + 20 , 5, -25)

	// Left Arm
	rect(x, y + 14, -15, 5)
	fill(0, 100, 0)

	rect(x-15, y + 14 , 5, -18)

	fill(186,85,211)
	ellipse(x + 5, y-5, 10, 10)
}

function keyPressed() {
	function jump() {
		dustDevil.y_pos -= 150;
		dustDevil.rainbows = true;
		dustDevil.spillY = 45;
	}

	switch(keyCode) {
		case RIGHT_ARROW:
			isRight = true;
			break;
		case LEFT_ARROW:
			isLeft = true;
			break;
		case 87:
			if(isFalling) break;
			if(isPlummeting) break;
			jump();
			break;
		case 32:
			if(isFalling) break;
			if(isPlummeting) break;
			jump();
			break;
		default:
			break;
	}
}

function keyReleased() {
	switch(keyCode) {
		case RIGHT_ARROW:
			isRight = false;
		 	break;
		case LEFT_ARROW:
			isLeft = false;
			break;
	    default:
			break;
	}
}

// END WITHOUT ASSISTANCE AS APART OF MIDTERM
// END WITHOUT ASSISTANCE AS APART OF MIDTERM
// END WITHOUT ASSISTANCE AS APART OF MIDTERM
