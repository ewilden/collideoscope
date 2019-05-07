const CYLINDER_RADIUS = 1;

function NewEnclosingCylinder() {
    const geometry = new THREE.CylinderGeometry(
        CYLINDER_RADIUS, // radiusTop
        CYLINDER_RADIUS, // radiusBottom
        8, // height
        32, // radialSegments
        1, // heightSegments
        true // openEnded
    );
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });
    const cylinder = new THREE.Mesh(geometry, material);
    material.side = THREE.DoubleSide; // or FrontSide or BackSide
    cylinder.rotation.y += Math.PI / 6;
    cylinder.rotation.x += Math.PI / 2;
    return cylinder;
}

function NewBarrier(thetaStart, thetaEnd) {
    const barrierRadius = CYLINDER_RADIUS * 0.99;
    const geometry = new THREE.CylinderGeometry(barrierRadius, barrierRadius, 2, 32, 1, false, thetaStart, thetaEnd);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 });
    const cylinder = new THREE.Mesh(geometry, material);
    material.side = THREE.FrontSide;
    cylinder.rotation.y += Math.PI / 6;
    cylinder.rotation.x += Math.PI / 2;
    return cylinder;
}
