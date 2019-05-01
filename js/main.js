var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const keyActions = [];
function addKeyAction(keySpec, onDown, onUp) {
    const action = {
        keySpec,
        onDown,
        onUp
    };
    keyActions.push(action);
}
const aka = addKeyAction;
const ArrowLeft = { key: "ArrowLeft", keyCode: 37 };
const ArrowRight = { key: "ArrowRight", keyCode: 39 };
const ArrowUp = { key: "ArrowUp", keyCode: 38 };
const ArrowDown = { key: "ArrowDown", keyCode: 40 };

// add key actions
aka(
    ArrowLeft,
    event => { cube.rotation.y -= 0.05; },
    event => { cube.rotation.y += 0.05; },
);
aka(
    ArrowRight,
    event => { cube.rotation.y += 0.05; },
    event => { cube.rotation.y -= 0.05; },
);
aka(
    ArrowDown,
    event => { cube.rotation.x += 0.05; },
    event => { cube.rotation.x -= 0.05; },
);
aka(
    ArrowUp,
    event => { cube.rotation.x -= 0.05; },
    event => { cube.rotation.x += 0.05; },
);


document.addEventListener('keydown', (event) => {
    keyActions.forEach(({ keySpec, onDown }) => {
        const { key, keyCode } = keySpec;
        if (event.key == key || event.keyCode == keyCode) {
            event.preventDefault();
            onDown(event);
        }
    });
});

document.addEventListener('keyup', (event) => {
    keyActions.forEach(({ keySpec, onUp }) => {
        const { key, keyCode } = keySpec;
        if (event.key == key || event.keyCode == keyCode) {
            event.preventDefault();
            onUp(event);
        }
    })
});


function animate() {
    requestAnimationFrame(animate);

    // update cube
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}
animate();