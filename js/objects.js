const CYLINDER_RADIUS = 1;
const CYLINDER_HEIGHT = 20;

const EnclosingCylinderGeometry = new THREE.CylinderGeometry(
    CYLINDER_RADIUS, // radiusTop
    CYLINDER_RADIUS, // radiusBottom
    CYLINDER_HEIGHT, // height
    32, // radialSegments
    1, // heightSegments
    true, // openEnded
    0,
    2 * Math.PI / 12,
);

function NewPieCylinder(startingZ, parity = false) {
    const group = new THREE.Group();
    const sliceAngle = 2 * Math.PI / 12;
    for (let i = 0; i < 12; ++i) {
        const geometry = EnclosingCylinderGeometry;
        const material = SingletonEnclosingKaleidoscopeMaterial;
        const cylinder = new THREE.Mesh(geometry, material);
        material.side = THREE.BackSide; // DoubleSide, FrontSide or BackSide
        cylinder.rotation.x += Math.PI / 2;
        cylinder.rotation.y += sliceAngle * i;
        group.add(cylinder);
    }

    // add wall lines
    const numWallLines = 12;
    const lineRadius = 0.01;
    for (let i = 0; i < numWallLines; ++i) {
        const lineGeo = new THREE.CylinderGeometry(
            lineRadius,
            lineRadius,
            CYLINDER_HEIGHT,
            8,
            1,
            true
        );
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.88 });
        lineMat.side = THREE.FrontSide;
        const lineCylinder = new THREE.Mesh(lineGeo, lineMat);
        lineCylinder.rotation.x += Math.PI / 2;
        const theta = 2 * Math.PI * i / 12;
        lineCylinder.position.x = 0.99 * CYLINDER_RADIUS * Math.cos(theta);
        lineCylinder.position.y = 0.99 * CYLINDER_RADIUS * Math.sin(theta);
        group.add(lineCylinder);
    }
    if (parity) {
        group.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
    }


    group.position.z += startingZ;
    return group;
}

const KaleidoscopeTexture = () => {
    const texture = new THREE.CanvasTexture(
        textureCanvas,
        THREE.UVMapping,
    );
    return texture;
}
const SingletonKaleidoscopeTexture = KaleidoscopeTexture();

const KaleidoscopeMaterial = () => {
    const mat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF, metalness: 0.0, map: SingletonKaleidoscopeTexture,
        transparent: true, opacity: 0.75
    });
    return mat;
}

const SingletonKaleidoscopeMaterial = KaleidoscopeMaterial();

const EnclosingKaleidoscopeMaterial = () => {
    const mat = new THREE.MeshStandardMaterial({
        color: 0x888888, metalness: 0.3, map: SingletonKaleidoscopeTexture,
    });
    return mat;
}

const SingletonEnclosingKaleidoscopeMaterial = EnclosingKaleidoscopeMaterial();

const TOTAL_NUM_SLICES = 12;
const SLICE_ANGLE = 2 * Math.PI / TOTAL_NUM_SLICES;
const REFLECTION_MATRIX = new THREE.Matrix4().makeRotationY(-SLICE_ANGLE / 2)
    .premultiply(new THREE.Matrix4().makeScale(-1, 1, 1))
    .premultiply(new THREE.Matrix4().makeRotationY(SLICE_ANGLE / 2));
const BARRIER_RADIUS = CYLINDER_RADIUS;

const PieBarrierGeometry = new THREE.CylinderGeometry(BARRIER_RADIUS, BARRIER_RADIUS, 1, 32, 1, false, 0, SLICE_ANGLE);

function NewPieBarrier(
    numSlices, // how many 1/12-th slices are in the barrier
    gapPosition, // the angle (in radians) that the centerline of the gap in the barrier should be at
) {
    const slices = [];

    for (let i = 0; i < numSlices; ++i) {
        const geometry = PieBarrierGeometry;
        const material = KaleidoscopeMaterial();
        const cylinder = new THREE.Mesh(geometry, material);

        // this is where the kaleidoscope effect comes in!
        if (i % 2 == 0) {
            cylinder.applyMatrix(REFLECTION_MATRIX);
        }

        cylinder.rotation.x += Math.PI / 2;
        cylinder.rotation.y += SLICE_ANGLE * i;
        slices.push(cylinder);
    }
    const group = new THREE.Group();
    slices.forEach(slice => group.add(slice));
    const gapFraction = 1 - numSlices / TOTAL_NUM_SLICES;
    group.rotation.z += gapFraction * Math.PI + Math.PI / 2 + gapPosition;
    group.WorldZRotationWhenCreated = WorldZRotation;

    group.checkCollision = function (player) {
        const barrierCenter = new THREE.Vector3(0, 0, group.position.z + 0.5);
        const updatedGapPosition = gapPosition + WorldZRotation - group.WorldZRotationWhenCreated;
        const gapWidth = (1 - (numSlices / TOTAL_NUM_SLICES)) * 2 * Math.PI;
        const startingDeg = updatedGapPosition + gapWidth / 2;
        const numPointsToTest = numSlices * 4 + 1;
        const degIncr = SLICE_ANGLE * numSlices / (numPointsToTest - 1);
        const edgePointsToTest = [];
        for (let i = 0; i < numPointsToTest; i++) {
            const currDeg = startingDeg + i * degIncr;
            edgePointsToTest.push(
                new THREE.Vector3(Math.cos(currDeg) * CYLINDER_RADIUS,
                    Math.sin(currDeg) * CYLINDER_RADIUS,
                    barrierCenter.z)
            );
        }
        let hasIntersected = false;
        // for debugging
        edgePointsToTest.forEach(point => {
            if (hasIntersected) {
                return;
            }
            const rayToPoint = new THREE.Vector3().subVectors(point, barrierCenter).normalize();
            const raycaster = new THREE.Raycaster(barrierCenter, rayToPoint, 0, CYLINDER_RADIUS);
            const intersections = raycaster.intersectObject(player);
            if (intersections.length > 0) {
                hasIntersected = true;
                // make sure new color is noticeably different from old one
		if (!inLosingState) {
		    const randColor = Math.floor(Math.random() * (0xaaaaaa) + 0x200000);
		    player.material.color.setHex((randColor + player.material.color.getHex()) % 0xffffff);
		}
                youLose();
            }
        });
    }
    return group;
}

// make things more random feeling (prevent repeats)
let prevSlices = -1;
let prevRotationAngle = -1;

sliceProbabilities = [0.05, 0.15, 0.5, 0.8, 1]
function NewRandomPieBarrier(startingZ = 0) {
    // const minPossibleSlices = 6;
    // const maxPossibleSlices = 10;
    // let numSlices;
    // do {
    //     numSlices = Math.floor(Math.random() * (maxPossibleSlices - minPossibleSlices + 1)) + minPossibleSlices;
    // } while (prevSlices === numSlices);
    // prevSlices = numSlices;

    let numSlices;
    let r = Math.random();
    for (var i = 0; i < sliceProbabilities.length; i++) {
        if (r < sliceProbabilities[i]) {
            numSlices = (i * 2) + 2;

            if (numSlices == 10 && prevSlices == 10) {
                r = Math.random();
                i = 0;
            } else {
                break;
            }
        }
    }
    prevSlices = numSlices;


    let rotationAngle;
    do {
        rotationAngle = Math.floor(Math.random() * 6) * Math.PI * 2 / 6;
    } while (prevRotationAngle === rotationAngle);
    prevRotationAngle = rotationAngle;
    const barrier = NewPieBarrier(numSlices, rotationAngle);
    barrier.position.z += startingZ;
    return barrier;
}

const PLAYER_RADIUS = 0.1;

function NewPlayer() {
    const geometry = new THREE.SphereGeometry(PLAYER_RADIUS, 12, 12);
    const material = new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.60 });
    const player = new THREE.Mesh(geometry, material);
    return player;
}

function NewCylinderEndcap() {
    const geometry = new THREE.CylinderGeometry(CYLINDER_RADIUS, CYLINDER_RADIUS, 0.1, 32, 1, false);
    const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0 });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.rotation.x += Math.PI / 2;
    return cylinder;
}
