const CYLINDER_RADIUS = 1;
const CYLINDER_HEIGHT = 20;

function NewPieCylinder() {
    const group = new THREE.Group();
    const sliceAngle = 2 * Math.PI / 12;
    for (let i = 0; i < 12; ++i) {
        const geometry = new THREE.CylinderGeometry(
            CYLINDER_RADIUS, // radiusTop
            CYLINDER_RADIUS, // radiusBottom
            CYLINDER_HEIGHT, // height
            32, // radialSegments
            1, // heightSegments
            true, // openEnded
            0,
            2 * Math.PI / 12,
        );
        const material = EnclosingKaleidoscopeMaterial();
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
        const lineMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 1.0 });
        lineMat.side = THREE.FrontSide;
        const lineCylinder = new THREE.Mesh(lineGeo, lineMat);
        lineCylinder.rotation.x += Math.PI / 2;
        const theta = 2 * Math.PI * i / 12;
        lineCylinder.position.x = 0.99 * CYLINDER_RADIUS * Math.cos(theta);
        lineCylinder.position.y = 0.99 * CYLINDER_RADIUS * Math.sin(theta);
        group.add(lineCylinder);
    }
    return group;
}

function NewEnclosingCylinder() {
    const geometry = new THREE.CylinderGeometry(
        CYLINDER_RADIUS, // radiusTop
        CYLINDER_RADIUS, // radiusBottom
        CYLINDER_HEIGHT, // height
        32, // radialSegments
        1, // heightSegments
        true // openEnded
    );
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0 });
    const cylinder = new THREE.Mesh(geometry, material);
    material.side = THREE.BackSide; // DoubleSide, FrontSide or BackSide

    cylinder.rotation.x += Math.PI / 2;
    const group = new THREE.Group();
    group.add(cylinder);

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
        const lineMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 1.0 });
        lineMat.side = THREE.FrontSide;
        const lineCylinder = new THREE.Mesh(lineGeo, lineMat);
        lineCylinder.rotation.x += Math.PI / 2;
        const theta = 2 * Math.PI * i / 12;
        lineCylinder.position.x = 0.99 * CYLINDER_RADIUS * Math.cos(theta);
        lineCylinder.position.y = 0.99 * CYLINDER_RADIUS * Math.sin(theta);
        group.add(lineCylinder);
    }
    return group;
}

function NewBarrier(
    gapFraction, // the fraction of the disc that should be cut out to form the gap to fly through
    gapPosition  // the angle (in radians) that the centerline of the gap should be at
) {
    const barrierRadius = CYLINDER_RADIUS * 0.99;
    const geometry = new THREE.CylinderGeometry(barrierRadius, barrierRadius, 2, 32, 1, false, 0, (1 - gapFraction) * 2 * Math.PI);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 });
    const cylinder = new THREE.Mesh(geometry, material);
    material.side = THREE.FrontSide;
    cylinder.rotation.x += Math.PI / 2;
    cylinder.rotation.y += gapFraction * Math.PI + Math.PI / 2 + gapPosition;
    // cylinder.rotation.y += gapPosition - gapFraction * 2 * Math.PI;
    const group = new THREE.Group();
    group.add(cylinder);
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
        //  transparent: true, opacity: 0.75
    });
    return mat;
}

const EnclosingKaleidoscopeMaterial = () => {
    const mat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF, metalness: 0.5, map: SingletonKaleidoscopeTexture,
    });
    return mat;
}


const TOTAL_NUM_SLICES = 12;
const SLICE_ANGLE = 2 * Math.PI / TOTAL_NUM_SLICES;
const REFLECTION_MATRIX = new THREE.Matrix4().makeRotationY(-SLICE_ANGLE / 2)
    .premultiply(new THREE.Matrix4().makeScale(-1, 1, 1))
    .premultiply(new THREE.Matrix4().makeRotationY(SLICE_ANGLE / 2));

function NewPieBarrier(
    numSlices, // how many 1/6-th slices are in the barrier
    gapPosition, // the angle (in radians) that the centerline of the gap in the barrier should be at
) {
    const barrierRadius = CYLINDER_RADIUS;
    const slices = [];
    const sliceAngle = 2 * Math.PI / TOTAL_NUM_SLICES;

    for (let i = 0; i < numSlices; ++i) {
        const geometry = new THREE.CylinderGeometry(barrierRadius, barrierRadius, 1, 32, 1, false, 0, sliceAngle);
        const material = KaleidoscopeMaterial();
        const cylinder = new THREE.Mesh(geometry, material);

        // this is where the kaleidoscope effect comes in!
        if (i % 2 == 0) {
            cylinder.applyMatrix(REFLECTION_MATRIX);
        }

        cylinder.rotation.x += Math.PI / 2;
        cylinder.rotation.y += sliceAngle * i;
        slices.push(cylinder);
    }
    const group = new THREE.Group();
    slices.forEach(slice => group.add(slice));
    const gapFraction = 1 - numSlices / TOTAL_NUM_SLICES;
    group.rotation.z += gapFraction * Math.PI + Math.PI / 2 + gapPosition;
    return group;
}

function NewRandomPieBarrier() {
    const minPossibleSlices = 2;
    const maxPossibleSlices = 11;
    const numSlices = Math.floor(Math.random() * (maxPossibleSlices - minPossibleSlices + 1));
    const rotationAngle = Math.floor(Math.random() * 6) * Math.PI * 2 / 6;
    return NewPieBarrier(numSlices, rotationAngle);
}

const PLAYER_RADIUS = 0.2;

function NewPlayer() {
    const geometry = new THREE.SphereGeometry(PLAYER_RADIUS, 12, 12);
    const material = new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.33 });
    const player = new THREE.Mesh(geometry, material);
    return player;
}
