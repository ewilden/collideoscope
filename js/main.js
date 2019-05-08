var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// set up objects in scene
const sceneObjects = [];
sceneObjects.push(NewPieCylinder());

const barriers = [];

// const barrier1 = NewBarrier(1 / 2, 0);
const barrier1 = NewPieBarrier(12, 0);
barrier1.position.z = 2;
barriers.push(barrier1);

// const barrier2 = NewBarrier(1 / 3, Math.PI / 2);
const barrier2 = NewPieBarrier(4, Math.PI / 2);
barrier2.position.z = 0;
barriers.push(barrier2);

// const barrier3 = NewBarrier(1 / 6, Math.PI / 8);
const barrier3 = NewPieBarrier(5, Math.PI / 8);
barrier3.position.z = -2;
barriers.push(barrier3);

barriers.forEach(b => sceneObjects.push(b));

sceneObjects.forEach(obj => scene.add(obj));

const player = NewPlayer();
player.position.z = 4;
scene.add(player);

// set up lights
const lights = [];

const cameraLight = new THREE.PointLight(0xffffff, 1, 100, 0);
cameraLight.position.set(0, 0, 6);
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
const boundKeys = [
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    KeyA,
    KeyD,
    KeyW,
    KeyS
];

function watchKey(keyObj) {
    aka(
        keyObj,
        event => { keyObj.isPressed = true },
        event => { keyObj.isPressed = false },
    );
}
boundKeys.forEach(watchKey);

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

// animate/render loop
function mainAnimationLoop() {
    requestAnimationFrame(mainAnimationLoop);

    // update rotation and depth velocity
    let velZ = 0;
    let rotZ = 0;
    if (ArrowUp.isPressed) {
        velZ += 0.05;
    }
    if (ArrowDown.isPressed) {
        velZ += -0.05;
    }
    if (ArrowRight.isPressed) {
        rotZ += -0.05;
    }
    if (ArrowLeft.isPressed) {
        rotZ += 0.05;
    }

    // update from WASD movement
    let velX = 0;
    let velY = 0;
    if (KeyA.isPressed) {
        velX -= 0.05;
    }
    if (KeyD.isPressed) {
        velX += 0.05;
    }
    if (KeyW.isPressed) {
        velY += 0.05;
    }
    if (KeyS.isPressed) {
        velY -= 0.05;
    }

    // rather than moving the camera into the scene, 
    // the scene moves itself toward the camera,
    // and rotates around the camera viewing axis.
    sceneObjects.forEach(obj => {
        obj.rotation.z += rotZ;
        obj.position.z += velZ;
    });
    player.position.x += velX;
    player.position.y += velY;

    // reposition camera based on player
    const playerXY = player.position.clone().setZ(0);
    const cameraXY = camera.position.clone().setZ(0);
    const disp = new THREE.Vector3().subVectors(playerXY, cameraXY);
    const desiredSpeed = Math.min(disp.length() / 10, 0.05);
    disp.setLength(desiredSpeed);
    camera.position.add(disp);

    renderer.render(scene, camera);
    animate();
    SingletonKaleidoscopeTexture.needsUpdate = true;
}
mainAnimationLoop();
