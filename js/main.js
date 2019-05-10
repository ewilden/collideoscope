var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;
let WorldZRotation = 0;
const Z_AXIS = new THREE.Vector3(0, 0, 1);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let CYLINDER_PARITY = false;
const NUM_STARTING_CYLINDERS = 2;

// set up objects in scene
const enclosingCylinders = [
    NewPieCylinder(0),
    NewPieCylinder(-CYLINDER_HEIGHT, true),
];

const endcap = NewCylinderEndcap();
endcap.position.z = -CYLINDER_HEIGHT;
scene.add(endcap);

const barriers = [];

const NUM_STARTING_BARRIERS = 10;
const BARRIER_STARTING_Z = 4;
const BARRIER_Z_INCREMENT = 4;
for (let i = 0; i < NUM_STARTING_BARRIERS; ++i) {
    barriers.push(NewRandomPieBarrier(BARRIER_STARTING_Z - i * BARRIER_Z_INCREMENT));
}

enclosingCylinders.forEach(obj => scene.add(obj));
barriers.forEach(obj => scene.add(obj));

const CAMERA_DISTANCE_FROM_PLAYER = 1;

const player = NewPlayer();
player.position.z = camera.position.z - CAMERA_DISTANCE_FROM_PLAYER;
scene.add(player);

// set up lights
const lights = [];

const cameraLight = new THREE.PointLight(0xffffff, 1, 100, 0);
cameraLight.position.set(0, 0, camera.position.z + 1);
lights.push(cameraLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
lights.push(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 100);
// directionalLight.position.set(0, 0, -6);
// lights.push(directionalLight);
// const centerLight = new THREE.PointLight(0xffffff, 0.3, 100);
// centerLight.position.set(0, 0, 0);
// lights.push(centerLight);

lights.forEach(l => scene.add(l));

// addKeyAction takes a {key, keyCode}, onDown function, and onUp function, 
// and together with the later addEventListener calls, makes it so that
// onDown is called when the key is first pressed, and onUp
// is called when the key is released. Actions are not resent by holding the key.
const keyActions = [];
function addKeyAction(keySpec, onDown, onUp) {
    const action = {
        keySpec,
        onDown,
        onUp,
        isRepeat: false,
    };
    keyActions.push(action);
}

let isPaused = false;

// add key actions
const aka = addKeyAction;
// https://keycode.info
const ArrowLeft = { key: "ArrowLeft", keyCode: 37, isPressed: false };
const ArrowRight = { key: "ArrowRight", keyCode: 39, isPressed: false };
const ArrowUp = { key: "ArrowUp", keyCode: 38, isPressed: false };
const ArrowDown = { key: "ArrowDown", keyCode: 40, isPressed: false };
const KeyA = { key: "a", keyCode: 65, isPressed: false };
const KeyD = { key: "d", keyCode: 68, isPressed: false };
const KeyW = { key: "w", keyCode: 87, isPressed: false };
const KeyS = { key: "s", keyCode: 83, isPressed: false };
const Space = { key: "Space", keyCode: 32, isPressed: false }
const boundKeys = [
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    KeyA,
    KeyD,
    KeyW,
    KeyS,
    Space
];

const Escape = { key: "Escape", keyCode: 27, isPressed: false };

function watchKey(keyObj) {
    aka(
        keyObj,
        event => { keyObj.isPressed = true },
        event => { keyObj.isPressed = false },
    );
}
boundKeys.forEach(watchKey);
addKeyAction(
    Escape,
    event => { isPaused = !isPaused },
    event => { },
);

document.addEventListener('keydown', (event) => {
    keyActions.forEach((action) => {
        const { keySpec, onDown, isRepeat } = action;
        const { key, keyCode } = keySpec;
        if (event.key == key || event.keyCode == keyCode) {
            event.preventDefault();
            if (isRepeat) {
                return;
            } else {
                action.isRepeat = true;
            }
            onDown(event);
        }
    });
});

document.addEventListener('keyup', (event) => {
    keyActions.forEach((action) => {
        const { keySpec, onUp } = action;
        const { key, keyCode } = keySpec;
        if (event.key == key || event.keyCode == keyCode) {
            action.isRepeat = false;
            event.preventDefault();
            onUp(event);
        }
    })
});

let zDisplacement = 0;
let prevZDisplacement = 0;

let zDispAtPrevBarrierAddition = 0;

const Z_SPEED = 0.07;
const ROTATION_SPEED = 0.05;

// animate/render loop
function mainAnimationLoop() {
    requestAnimationFrame(mainAnimationLoop);

    // update rotation and depth velocity
    let velZ = 0;
    let rotZ = 0;
    if (ArrowUp.isPressed) {
        velZ += Z_SPEED;
    }
    if (ArrowDown.isPressed) {
        velZ += -Z_SPEED;
    }
    if (ArrowRight.isPressed) {
        rotZ += -ROTATION_SPEED;
        rotating = true;
        clockwise = true;
    }
    if (ArrowLeft.isPressed) {
        rotZ += ROTATION_SPEED;
        rotating = true;
        clockwise = false;
    }

    if (Space.isPressed) {
        jumped = true;
    }

    if (Space.isPressed) {
        jumped = true;
    }

    if (Space.isPressed) {
        jumped = true;
    }

    if (isPaused) {
        renderer.render(scene, camera);
        return;
    }
    // update from WASD movement
    let velX = 0;
    let velY = 0;
    // if (KeyA.isPressed) {
    //     velX -= 0.05;
    // }
    // if (KeyD.isPressed) {
    //     velX += 0.05;
    // }
    // if (KeyW.isPressed) {
    //     velY += 0.05;
    // }
    // if (KeyS.isPressed) {
    //     velY -= 0.05;
    // }

    // move the camera, lights, and player
    WorldZRotation += rotZ;
    [...barriers, ...enclosingCylinders].forEach(obj => {
        obj.rotateOnWorldAxis(Z_AXIS, rotZ);
        obj.position.z += velZ;
    });
    player.position.x += velX;
    player.position.y += velY;

    zDisplacement += velZ;

    // destroy barriers that are behind the camera
    while (barriers[0] && barriers[0].position.z > camera.position.z) {
        const newBarrier = NewRandomPieBarrier(barriers[barriers.length - 1].position.z - BARRIER_Z_INCREMENT);
        barriers.push(newBarrier);
        scene.add(newBarrier);

        barriers[0].children.forEach(child => {
            child.material.dispose();
        });
        scene.remove(barriers[0]);
        barriers.shift();
    }

    // destroy cylinders that are behind the camera
    while (enclosingCylinders[0] && enclosingCylinders[0].position.z > camera.position.z + CYLINDER_HEIGHT) {
        const newCylinder = NewPieCylinder(enclosingCylinders[enclosingCylinders.length - 1].position.z - CYLINDER_HEIGHT, CYLINDER_PARITY);
        CYLINDER_PARITY = !CYLINDER_PARITY;
        enclosingCylinders.push(newCylinder);
        scene.add(newCylinder);
        newCylinder.rotateOnWorldAxis(Z_AXIS, WorldZRotation);
        enclosingCylinders[0].children.forEach(child => {
            child.material.dispose();
            child.geometry.dispose();
        });
        scene.remove(enclosingCylinders[0]);
        enclosingCylinders.shift();
    }

    // reposition camera based on player
    playerXY = player.position.clone().setZ(0);
    const cameraXY = camera.position.clone().setZ(0);
    const disp = new THREE.Vector3().subVectors(playerXY, cameraXY);
    const desiredSpeed = disp.length() ** 2;
    disp.setLength(desiredSpeed);
    camera.position.add(disp);

    // but then adjust camera back toward center of tube by a little bit
    camera.position.lerp(new THREE.Vector3(0, 0, camera.position.z), 0.1);
    camera.position.z = CAMERA_DISTANCE_FROM_PLAYER + player.position.z;

    simulatePhysics();

    // check collisions
    for (let i = 0; i < barriers.length; ++i) {
        const currBarrier = barriers[i];
        if (currBarrier.position.z < player.position.z - 4) {
            break;
        }
        currBarrier.checkCollision(player);
    }

    renderer.render(scene, camera);
    animate();

    SingletonKaleidoscopeTexture.needsUpdate = true;
    prevZDisplacement = zDisplacement;
}
mainAnimationLoop();
