const GRAVITY = new THREE.Vector3(0, -.004, 0);
var velocity = new THREE.Vector3();
var netForces = new THREE.Vector3();

function collideWithCylinder() {
    let playerXY = player.position.clone().setZ(0);
    playerXY.setLength(Math.min(CYLINDER_RADIUS - PLAYER_RADIUS, playerXY.length()));
    player.position.x = playerXY.x;
    player.position.y = playerXY.y;
}

function touchingCylinder() {
    return player.position.clone().setZ(0).length() + PLAYER_RADIUS >= CYLINDER_RADIUS;
}

var jumped = false;
function handleJump() {
    jumped = false;
    if (!touchingCylinder()) { return; }
    velocity = new THREE.Vector3();
    let jumpForce = player.position.clone().negate().setLength(CYLINDER_RADIUS - PLAYER_RADIUS);
    jumpForce.divideScalar(1.05);
    netForces.copy(jumpForce);
}

function addGravity() {
    netForces.add(GRAVITY);
}

function updateBallVelocity() {
    velocity.add(netForces);
    netForces = new THREE.Vector3(0, 0, 0);
}

function updateBallPosition() {
    player.position.x += velocity.x;
    player.position.y += velocity.y;
}

function simulateForces() {
    if (jumped) {
	console.log("handling jump")
	handleJump();
    }
    addGravity();
    updateBallVelocity();
    updateBallPosition();
}

function simulatePhysics() {
    simulateForces();
    collideWithCylinder()
}
