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
    return cylinder;
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
    return cylinder;
}
