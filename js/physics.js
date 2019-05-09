const GRAVITY = THREE.Vector3(0, -30, 0);

var ball_velocity = THREE.Vector3();
var netForces = THREE.Vector3();

function collideWithCylinder() {
    let playerXY = player.position.clone().setZ(0);
    playerXY.setLength(Math.min(CYLINDER_RADIUS - PLAYER_RADIUS, playerXY.length()));
    player.position.x = playerXY.x;
    player.position.y = playerXY.y;
}

function addGravity() {
    netForces.add(GRAVITY);
}

function updateBallVelocity() {
    ball_velocity.add(netForces);
    netForces = THREE.Vector3();
}

function updateBallPosition() {

}

function simulatePhysics() {
    collideWithCylinder()
}
