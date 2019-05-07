const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

//********************************* Points ***********************************//
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.step = function(dx, dy) {
    this.x += dx;
    this.y += dy;
}

// Add random ∆s, bounded by min and max, to both x and y coordinates 
// of the point. Return as a new point.
Point.prototype.addNoise = function(min, max) {
    var xNoise = min + Math.random() * (max - min);
    var yNoise = min + Math.random() * (max - min);
    if (Math.random() < 0.5) xNoise *= -1;
    if (Math.random() < 0.5) yNoise *= -1;
    return new Point(this.x + xNoise, this.y + yNoise);
}

Point.prototype.midpointTo = function(otherPoint) {
    var midX = (this.x + otherPoint.x) / 2;
    var midY = (this.y + otherPoint.y) / 2;
    return new Point(midX, midY);
}

//******************************** Triangles *********************************//
function Triangle(p1, p2, p3, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.color = color;
}

Triangle.prototype.draw = function() {
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.lineTo(this.p3.x, this.p3.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.fill();
}

Triangle.prototype.step = function() {
    this.p1.step(1, 1);
    this.p2.step(1, 1);
    this.p3.step(1, 1);
}

//******************************* Bezier shapes ******************************//
// A new shape defined by two Bezier curves between two points, with randomly
// generated control points.
function BezierShape(p1, p2, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;

    var mid = p1.midpointTo(p2);
    this.ctrl1 = mid.addNoise(0, 200);
    this.ctrl2 = mid.addNoise(0, 200);
    this.ctrl3 = mid.addNoise(0, 200);
    this.ctrl4 = mid.addNoise(0, 200);
}

BezierShape.prototype.draw = function() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.bezierCurveTo(this.ctrl1.x, this.ctrl1.y, 
	this.ctrl2.x, this.ctrl2.y, this.p2.x, this.p2.y);
    ctx.bezierCurveTo(this.ctrl3.x, this.ctrl3.y, 
	this.ctrl4.x, this.ctrl4.y, this.p1.x, this.p1.y);
    ctx.stroke();
    ctx.closePath();
    ctx.fill();
 }

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
	color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomPoint() {
    var x = Math.random() * canvas.width;
    var y = Math.random() * canvas.height;
    return new Point(x, y);
}

function randomTriangle() {
    var p1 = getRandomPoint();
    var p2 = getRandomPoint();
    var p3 = getRandomPoint();
    var color = getRandomColor();
    return new Triangle(p1, p2, p3, color);
}

function randomBezierShape() {
    var p1 = getRandomPoint();
    var p2 = getRandomPoint();
    var color = getRandomColor();
    return new BezierShape(p1, p2, color);
}

function fillCanvas(n) {
    var shapes = []
    for (var i = 0; i < n; i++) {
	if (i % 2 == 0) {
	    let bez = randomBezierShape();
	    bez.draw();
	    shapes.push(bez);
	} else {
	    let tri = randomTriangle();
	    tri.draw();
	    shapes.push(tri);
	}
    }
}

fillCanvas(40);

// function animate() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     tri.step();
//     tri.draw();
//     window.requestAnimationFrame(animate);
// }
