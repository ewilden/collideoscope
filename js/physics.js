const GRAVITY = new THREE.Vector3(0, -.0046, 0);
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
    if (touchingCylinder()) {
	velocity = new THREE.Vector3();
	let jumpForce = player.position.clone().negate().setLength(CYLINDER_RADIUS - PLAYER_RADIUS);
	jumpForce.divideScalar(.95);
	netForces.copy(jumpForce);
    } 
}

function tangentToCylinder(clockwise) {
    let tangent = player.position.clone().setZ(0);
    
    let angle;
    if (clockwise)  {
	angle = Math.PI/2;
    }
    else {
	angle = -Math.PI/2;
    }

    tangent.applyAxisAngle(Z_AXIS, angle);
    return tangent;
}

var rotating = false;
var clockwise = false;
function rotateBallWithCylinder() {
    if (!rotating || !touchingCylinder()) return;

    let tan = tangentToCylinder(clockwise);
    tan.divideScalar(70);
    netForces.add(tan);

    rotating = false;
}

function addNormal() {
    if (!touchingCylinder()) return;

    let tangent = player.position.clone().setZ(0);
    if (tangent.x < 0) tangent.x *= -1;
    tangent.applyAxisAngle(Z_AXIS, Math.PI/2);

    let X_AXIS = new THREE.Vector3(1, 0, 0);

    let cos_factor = (tangent.dot(X_AXIS)) / tangent.length();
    let normal = new THREE.Vector3().copy(GRAVITY)
	.negate().multiplyScalar(cos_factor);
    netForces.add(normal);
}

function addGravity() {
    netForces.add(GRAVITY);
}

function updateBallVelocity() {
    velocity.add(netForces);
}

function updateBallPosition() {
    player.position.x += velocity.x;
    player.position.y += velocity.y;
}

function simulateForces() {
    netForces = new THREE.Vector3();
    if (jumped) {
	handleJump();
    }
    rotateBallWithCylinder();
    addGravity();
    addNormal();
    updateBallVelocity();
    updateBallPosition();
}

function simulatePhysics() {
    simulateForces();
    collideWithCylinder()
}
