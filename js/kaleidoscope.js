const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.step = function(dx, dy) {
    this.x += dx;
    this.y += dy;
}

function Triangle(p1, p2, p3, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.colorString = color;
}

Triangle.prototype.draw = function() {
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.lineTo(this.p3.x, this.p3.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = this.colorString;
    ctx.fill();
}

Triangle.prototype.step = function() {
    this.p1.step(1, 1);
    this.p2.step(1, 1);
    this.p3.step(1, 1);
}

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

function fillCanvas(n) {
    var triangles = []
    for (var i = 0; i < n; i++) {
	let tri = randomTriangle();
	tri.draw();
	triangles.push(tri);
    }
}

fillCanvas(20);

// function animate() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     tri.step();
//     tri.draw();
//     window.requestAnimationFrame(animate);
// }
