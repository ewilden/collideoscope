function NewEnclosingCylinder() {
    const cylinderRadius = 1;
    const geometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 8, 6, 1, true);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0 });
    const cylinder = new THREE.Mesh(geometry, material);
    material.side = THREE.DoubleSide;
    return cylinder;
}