var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// set up objects in scene
const sceneObjects = [];
sceneObjects.push(NewEnclosingCylinder());

const barrier1 = NewBarrier(1 / 2, 0);
barrier1.position.z = 2;
sceneObjects.push(barrier1);

const barrier2 = NewBarrier(1 / 3, Math.PI / 2);
barrier2.position.z = 0;
sceneObjects.push(barrier2);

const barrier3 = NewBarrier(1 / 6, Math.PI / 8);
barrier3.position.z = -2;
sceneObjects.push(barrier3);

sceneObjects.forEach(obj => scene.add(obj));

// set up lights
const pointLight = new THREE.PointLight(0xff5588, 1, 100);
scene.add(pointLight);
pointLight.position.set(4, 4, 4);
const centerLight = new THREE.PointLight(0x1111ff, 1, 100);
scene.add(centerLight);
centerLight.position.set(0, 0, -3);
const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);

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
function animate() {
    requestAnimationFrame(animate);

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

    camera.position.x += velX;
    camera.position.y += velY;

    // rather than moving the camera into the scene, 
    // the scene moves itself toward the camera,
    // and rotates around the camera viewing axis.
    sceneObjects.forEach(obj => {
        obj.rotation.y += rotZ;
        obj.position.z += velZ;
    })

    renderer.render(scene, camera);
}
animate();