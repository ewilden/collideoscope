let canvas;
const CANVAS_SIZE = 512;
if (IS_KALEIDOSCOPE_SIM) {
    canvas = document.getElementById('canvas');
} else {
    if (typeof OffscreenCanvas === 'function') {
        canvas = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE);
    } else {
        canvas = document.createElement('canvas');
    }
}

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
const textureCanvas = canvas;
const ctx = canvas.getContext('2d');
ctx.fillStyle = "#111";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const NUM_SHAPES = CANVAS_SIZE / 8;

var colors = [
    "blue",
    "red",
    "violet",
    "yellow",
    "green",
    "aqua",
    "maroon",
    "teal",
    "lime",
    "navy",
    "orange",
    "deeppink",
]

var currentLevel = 0;
var levelTime = 0;
var levelLength = 1200;

//********************************* Points ***********************************//
function Point(x, y, dir) {
    this.loc = new THREE.Vector2(x, y);
}

Point.prototype.step = function (dirVec) {
    this.loc.add(dirVec);
}

// Add random ∆s, bounded by min and max, to both x and y coordinates 
// of the point. Return as a new point.
Point.prototype.addNoise = function (min, max) {
    var xNoise = min + Math.random() * (max - min);
    var yNoise = min + Math.random() * (max - min);
    if (Math.random() < 0.5) xNoise *= -1;
    if (Math.random() < 0.5) yNoise *= -1;
    return new Point(this.loc.x + xNoise, this.loc.y + yNoise);
}

Point.prototype.midpointTo = function (otherPoint) {
    var midX = (this.loc.x + otherPoint.loc.x) / 2;
    var midY = (this.loc.y + otherPoint.loc.y) / 2;
    return new Point(midX, midY);
}

Point.prototype.offCanvas = function () {
    return this.loc.x <= 0 || this.loc.y <= 0 ||
        this.loc.x >= canvas.width - 1 ||
        this.loc.y >= canvas.width - 1;
}

// Point.prototype.wrapPosition = function() {
//     if (this.loc.x <= 0) this.loc.x += canvas.width;
//     else if (this.loc.x >= canvas.width) this.loc.x -= canvas.width;
//     if (this.loc.y <= 0) this.loc.y += canvas.height;
//     else if (this.loc.y >= canvas.width) this.loc.y -= canvas.width;
// }

/******************************** Triangles ***********************************/
function Triangle(p1, p2, p3, color, dirVec, density) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;

    this.color = color;
    this.transitionStep = 100;
    this.totalSteps = 100;

    this.dir = dirVec.multiplyScalar(density);
}

Triangle.prototype.draw = function () {
    ctx.fillStyle = '#' + this.color.getHexString();
    ctx.strokeStyle = '#' + this.color.getHexString();
    ctx.beginPath();
    ctx.moveTo(this.p1.loc.x, this.p1.loc.y);
    ctx.lineTo(this.p2.loc.x, this.p2.loc.y);
    ctx.lineTo(this.p3.loc.x, this.p3.loc.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

Triangle.prototype.step = function () {
    this.p1.step(this.dir);
    this.p2.step(this.dir);
    this.p3.step(this.dir);
}

Triangle.prototype.handleBorder = function () {
    if (this.p1.offCanvas() && this.p2.offCanvas() && this.p3.offCanvas()) {
        this.dir.negate();
    }
}

Triangle.prototype.evolveColor = function () {
    if (this.transitionStep == this.totalSteps) {
        this.targetColor = getRandomColor();
        this.transitionStep = 0;
        this.delta_r = (this.targetColor.r - this.color.r) / this.totalSteps;
        this.delta_g = (this.targetColor.g - this.color.g) / this.totalSteps;
        this.delta_b = (this.targetColor.b - this.color.b) / this.totalSteps;
    }

    this.color.r += this.delta_r;
    this.color.g += this.delta_g;
    this.color.b += this.delta_b;
    this.transitionStep += 1;
}


//******************************* Bezier shapes ******************************//
// A new shape defined by two Bezier curves between two points, with randomly
// generated control points.
function BezierShape(p1, p2, color, dirVec, density) {
    this.p1 = p1;
    this.p2 = p2;
    this.dir = dirVec.multiplyScalar(density);

    this.color = color;
    this.transitionStep = 100;
    this.totalSteps = 100;

    var mid = p1.midpointTo(p2);
    this.ctrl1 = mid.addNoise(100, 300);
    this.ctrl2 = mid.addNoise(100, 300);
    this.ctrl3 = mid.addNoise(100, 300);
    this.ctrl4 = mid.addNoise(100, 300);
}

BezierShape.prototype.draw = function () {
    ctx.fillStyle = '#' + this.color.getHexString();
    ctx.strokeStyle = '#' + this.color.getHexString();
    ctx.beginPath();
    ctx.moveTo(this.p1.loc.x, this.p1.loc.y);
    ctx.bezierCurveTo(this.ctrl1.loc.x, this.ctrl1.loc.y,
        this.ctrl2.loc.x, this.ctrl2.loc.y, this.p2.loc.x, this.p2.loc.y);
    ctx.bezierCurveTo(this.ctrl3.loc.x, this.ctrl3.y,
        this.ctrl4.loc.x, this.ctrl4.loc.y, this.p1.loc.x, this.p1.loc.y);
    ctx.stroke();
    ctx.closePath();
    ctx.fill();
}

BezierShape.prototype.step = function () {
    this.p1.step(this.dir);
    this.p2.step(this.dir);
    this.ctrl1.step(this.dir);
    this.ctrl2.step(this.dir);
    this.ctrl3.step(this.dir);
    this.ctrl4.step(this.dir);
}

BezierShape.prototype.handleBorder = function () {
    if (this.p1.offCanvas() && this.p2.offCanvas())
        this.dir.negate();
}

BezierShape.prototype.evolveColor = function () {
    if (this.transitionStep == this.totalSteps) {
        this.targetColor = getRandomColor();
        this.transitionStep = 0;
        this.delta_r = (this.targetColor.r - this.color.r) / this.totalSteps;
        this.delta_g = (this.targetColor.g - this.color.g) / this.totalSteps;
        this.delta_b = (this.targetColor.b - this.color.b) / this.totalSteps;
    }

    this.color.r += this.delta_r;
    this.color.g += this.delta_g;
    this.color.b += this.delta_b;
    this.transitionStep += 1;
}

/*****************************************************************************/

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    if (Math.random() < .6)
        return new THREE.Color(colors[currentLevel % colors.length]);
    return new THREE.Color(Math.random() * 0xFFFFFF);
}

function getRandomPoint() {
    var x = Math.random() * canvas.width;
    var y = Math.random() * canvas.height;
    return new Point(x, y);
}

function getRandomPointNear(p, minDist, maxDist) {
    var x = Math.random() * (maxDist - minDist);
    if (Math.random() < .5) x *= -1;
    x += p.loc.x + minDist;
    var y = Math.random() * (maxDist - minDist);
    if (Math.random() < .5) y *= -1;
    y += p.loc.y + minDist;
    return new Point(x, y);
}

function getRandomDir() {
    var x = Math.random();
    if (Math.random() < .5) x *= -1;
    var y = Math.random();
    if (Math.random() < .5) y *= -1;
    return new THREE.Vector2(x, y).normalize().divideScalar(5);
}

function randomTriangle() {
    var p1 = getRandomPoint();
    var p2 = getRandomPointNear(p1, 100, 200);
    var p3 = getRandomPointNear(p1, 100, 200);
    var color = getRandomColor();
    var dir = getRandomDir();
    var density = Math.random() * 10;
    return new Triangle(p1, p2, p3, color, dir, density);
}

function randomBezierShape() {
    var p1 = getRandomPoint();
    var p2 = getRandomPointNear(p1, 100, 200);
    var color = getRandomColor();
    var dir = getRandomDir();
    var density = Math.random() * 10;
    return new BezierShape(p1, p2, color, dir, density);
}

function Simulation(n) {
    this.shapes = []
    for (var i = 0; i < n; i++) {
        if (i % 4 == 0) {
            this.shapes.push(randomTriangle());
        } else {
            this.shapes.push(randomBezierShape());
        }
    }
}

Simulation.prototype.drawShapes = function () {
    for (var i = 0; i < this.shapes.length; i++) {
        this.shapes[i].handleBorder();
        this.shapes[i].evolveColor();
        this.shapes[i].draw();
    }
}

Simulation.prototype.updatePositions = function () {
    for (var i = 0; i < this.shapes.length; i++) {
        this.shapes[i].step();
    }
}

let animate;
if (IS_KALEIDOSCOPE_SIM) {
    animate = function () {
        if (levelTime == levelLength) {
            levelTime = 0;
            currentLevelColor = nextLevelColor;
        }
        levelTime += 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sim.drawShapes();
        sim.updatePositions();
        window.requestAnimationFrame(animate);
    }
} else {
    animate = function () {
        if (levelTime == levelLength) {
            currentLevel += 1;
            levelTime = 0;
        }
        levelTime += 1;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        sim.drawShapes();
        sim.updatePositions();
    }
}

sim = new Simulation(NUM_SHAPES);
animate();

canvas.addEventListener('click', function () {
    sim = new Simulation(NUM_SHAPES);
}, false);
