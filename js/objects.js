const CYLINDER_RADIUS = 1;

function NewEnclosingCylinder() {
    const geometry = new THREE.CylinderGeometry(
        CYLINDER_RADIUS, // radiusTop
        CYLINDER_RADIUS, // radiusBottom
        20, // height
        32, // radialSegments
        1, // heightSegments
        true // openEnded
    );
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });
    const cylinder = new THREE.Mesh(geometry, material);
    material.side = THREE.DoubleSide; // or FrontSide or BackSide
    cylinder.rotation.x += Math.PI / 2;
    const group = new THREE.Group();
    group.add(cylinder);
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

const ODD_TEST_MAT = () => new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5 });
const EVEN_TEST_MAT = () => new THREE.MeshStandardMaterial({ color: 0xEEEEEE, metalness: 0.5 });

function NewPieBarrier(
    numSlices, // how many 1/6-th slices are in the barrier
    gapPosition, // the angle (in radians) that the centerline of the gap in the barrier should be at
) {
    const barrierRadius = CYLINDER_RADIUS * 0.99;
    const slices = [];
    const sliceAngle = Math.PI / 3;
    for (let i = 0; i < numSlices; ++i) {
        const geometry = new THREE.CylinderGeometry(barrierRadius, barrierRadius, 1, 32, 1, false, sliceAngle * i, sliceAngle);
        const material = i % 2 == 0 ? ODD_TEST_MAT() : EVEN_TEST_MAT();
        material.side = THREE.FrontSide;
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.rotation.x += Math.PI / 2;
        slices.push(cylinder);
    }
    const group = new THREE.Group();
    slices.forEach(slice => group.add(slice));
    const gapFraction = 1 - numSlices / 6;
    group.rotation.z += gapFraction * Math.PI + Math.PI / 2 + gapPosition;
    return group;
}
