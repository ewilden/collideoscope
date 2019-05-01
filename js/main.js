var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

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
const aka = addKeyAction;
const ArrowLeft = { key: "ArrowLeft", keyCode: 37 };
const ArrowRight = { key: "ArrowRight", keyCode: 39 };
const ArrowUp = { key: "ArrowUp", keyCode: 38 };
const ArrowDown = { key: "ArrowDown", keyCode: 40 };
// const light = new THREE.(0x404040);
const pointLight = new THREE.PointLight(0xff5588, 1, 100);
// light.position.set(50, 50, 50);
scene.add(pointLight);
pointLight.position.set(4, 4, 4);
const ambient = new THREE.AmbientLight(0x7070dd);
scene.add(ambient);

let rotY = 0;
let rotX = 0;

// add key actions
aka(
    ArrowLeft,
    event => {
        rotY -= 0.05;
    },
    event => { rotY += 0.05; },
);
aka(
    ArrowRight,
    event => { rotY += 0.05; },
    event => { rotY -= 0.05; },
);
aka(
    ArrowDown,
    event => { rotX += 0.05; },
    event => { rotX -= 0.05; },
);
aka(
    ArrowUp,
    event => { rotX -= 0.05; },
    event => { rotX += 0.05; },
);


document.addEventListener('keydown', (event) => {
    keyActions.forEach((action) => {
        const { keySpec, onDown, isRepeat } = action;
        const { key, keyCode } = keySpec;
        if (event.key == key || event.keyCode == keyCode) {
            if (isRepeat) {
                return;
            } else {
                action.isRepeat = true;
            }
            event.preventDefault();
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


function animate() {
    requestAnimationFrame(animate);

    // update cube
    cube.rotation.x += rotX;
    cube.rotation.y += rotY;

    renderer.render(scene, camera);
}
animate();