var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// set up objects in scene
const cylinder = NewEnclosingCylinder();
scene.add(cylinder);
cylinder.rotation.y += Math.PI / 6;
cylinder.rotation.x += Math.PI / 2;

// set up lights
const pointLight = new THREE.PointLight(0xff5588, 1, 100);
scene.add(pointLight);
pointLight.position.set(4, 4, 4);
const centerLight = new THREE.PointLight(0x1111ff, 1, 100);
scene.add(centerLight);
centerLight.position.set(0, 0, -3);
const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);

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
const ArrowLeft = { key: "ArrowLeft", keyCode: 37 };
const ArrowRight = { key: "ArrowRight", keyCode: 39 };
const ArrowUp = { key: "ArrowUp", keyCode: 38 };
const ArrowDown = { key: "ArrowDown", keyCode: 40 };

let rotY = 0;
let velZ = 0;

aka(
    ArrowLeft,
    event => { rotY -= 0.05; },
    event => { rotY += 0.05; },
);
aka(
    ArrowRight,
    event => { rotY += 0.05; },
    event => { rotY -= 0.05; },
);
aka(
    ArrowDown,
    event => { velZ += 0.05; },
    event => { velZ -= 0.05; },
);
aka(
    ArrowUp,
    event => { velZ -= 0.05; },
    event => { velZ += 0.05; },
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

// animate/render loop
function animate() {
    requestAnimationFrame(animate);

    // update cylinder
    cylinder.position.z -= velZ;
    cylinder.rotation.y += rotY;

    renderer.render(scene, camera);
}
animate();