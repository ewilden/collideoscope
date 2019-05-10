const GRAVITY = new THREE.Vector3(0, -.0030, 0);
var velocity = new THREE.Vector3();
var netForces = new THREE.Vector3();

function collideWithCylinder() {
    let playerXY = player.position.clone().setZ(0);
    playerXY.setLength(Math.min(CYLINDER_RADIUS - PLAYER_RADIUS, playerXY.length()));
    player.position.x = playerXY.x;
    player.position.y = playerXY.y;
}

function touchingCylinder() {
    return player.position.clone().setZ(0).length() + PLAYER_RADIUS >= CYLINDER_RADIUS - 0.01;
}

var jumped = false;
function handleJump() {
    jumped = false;
    if (touchingCylinder()) {
        velocity = new THREE.Vector3();
        let jumpForce = player.position.clone().negate().setLength(CYLINDER_RADIUS - PLAYER_RADIUS);
        jumpForce.divideScalar(.89);
        netForces.copy(jumpForce);
    }
}

function tangentToCylinder(neg) {
    let tangent = player.position.clone().setZ(0);

    let angle;
    if (!neg) {
        angle = -Math.PI / 2;
    }
    else {
        angle = Math.PI / 2;
    }

    tangent.applyAxisAngle(Z_AXIS, angle);
    return tangent;
}

var rotating = false;
var clockwise = false;
function rotateBallWithCylinder() {
    if (!rotating || !touchingCylinder()) return;

    let tan = tangentToCylinder(clockwise);
    tan.multiplyScalar(.0045);
    netForces.add(tan);

    rotating = false;
}

function addFriction() {
    if (!touchingCylinder()) return;

    let tangent = player.position.clone().setZ(0).normalize();
    if (tangent.x < 0) 
	tangent.applyAxisAngle(Z_AXIS, -Math.PI / 2);
    else 
	tangent.applyAxisAngle(Z_AXIS, Math.PI / 2);

    let X_AXIS = new THREE.Vector3(1, 0, 0);
    let sin_factor = new THREE.Vector3().crossVectors(X_AXIS, tangent).length() / tangent.length();

    tangent.multiplyScalar(sin_factor);
    tangent.multiplyScalar(.005);
    
    netForces.sub(tangent);
}

function checkRadialVelocity() {
    if (!touchingCylinder()) return;

    let radVec = player.position.clone().setZ(0).normalize();
    let dotprod = velocity.dot(radVec);
    if (dotprod > 0) {
	let proj = radVec.multiplyScalar(dotprod);
	proj.multiplyScalar(0.2);
	velocity.sub(proj);
    }
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
    addFriction();
    checkRadialVelocity();
    updateBallVelocity();
    updateBallPosition();
}

function simulatePhysics() {
    simulateForces();
    collideWithCylinder()
}
