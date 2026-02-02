// Three.js Animation Module
// Simple geometric lobsters flying around

const MoltbookAnimation = (function() {
    function initAnimation() {
        const canvas = document.getElementById('bg-canvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        camera.position.z = 30;

        // Lobster colors
        const colors = [
            0xff4444, // Red
            0xff8844, // Orange
            0xaa44ff, // Purple
            0x44ffff, // Cyan
            0x44ff44, // Green
            0xff44aa, // Pink
            0xffaa44, // Yellow-orange
            0x4488ff  // Blue
        ];

        // Create simple geometric lobster
        function createLobster(color) {
            const lobster = new THREE.Group();
            const material = new THREE.MeshPhongMaterial({
                color,
                shininess: 30,
                emissive: color,
                emissiveIntensity: 0.2
            });

            // Body (stretched sphere)
            const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            bodyGeometry.scale(1.5, 0.8, 0.8);
            const body = new THREE.Mesh(bodyGeometry, material);
            lobster.add(body);

            // Tail (series of small spheres)
            for (let i = 0; i < 3; i++) {
                const tailSegment = new THREE.Mesh(
                    new THREE.SphereGeometry(0.5 - i * 0.1, 12, 12),
                    material
                );
                tailSegment.position.set(-1.2 - i * 0.7, 0, 0);
                lobster.add(tailSegment);
            }

            // Tail fan (flat diamond)
            const tailFan = new THREE.Mesh(
                new THREE.ConeGeometry(0.6, 0.1, 4),
                material
            );
            tailFan.rotation.z = Math.PI / 2;
            tailFan.rotation.y = Math.PI / 4;
            tailFan.position.set(-3.5, 0, 0);
            lobster.add(tailFan);

            // Claws (cones)
            const clawGeometry = new THREE.ConeGeometry(0.3, 1, 8);

            // Left claw
            const leftClaw = new THREE.Mesh(clawGeometry, material);
            leftClaw.rotation.z = Math.PI / 4;
            leftClaw.position.set(0.8, 0.8, 0);
            lobster.add(leftClaw);

            // Right claw
            const rightClaw = new THREE.Mesh(clawGeometry, material);
            rightClaw.rotation.z = -Math.PI / 4;
            rightClaw.position.set(0.8, -0.8, 0);
            lobster.add(rightClaw);

            // Antennae (thin cylinders)
            const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 4);

            const antenna1 = new THREE.Mesh(antennaGeometry, material);
            antenna1.rotation.z = Math.PI / 6;
            antenna1.position.set(1.3, 0.3, 0.2);
            lobster.add(antenna1);

            const antenna2 = new THREE.Mesh(antennaGeometry, material);
            antenna2.rotation.z = -Math.PI / 6;
            antenna2.position.set(1.3, -0.3, 0.2);
            lobster.add(antenna2);

            // Scale down the entire lobster
            lobster.scale.set(0.7, 0.7, 0.7);

            return lobster;
        }

        // Create multiple lobsters with random properties
        const lobsters = [];
        const numLobsters = 6;

        for (let i = 0; i < numLobsters; i++) {
            const color = colors[i % colors.length];
            const lobster = createLobster(color);

            // Random starting position
            lobster.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40 - 10
            );

            // Random rotation
            lobster.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // Store animation properties
            lobster.userData = {
                speedX: (Math.random() - 0.5) * 0.02,
                speedY: (Math.random() - 0.5) * 0.02,
                speedZ: (Math.random() - 0.5) * 0.015,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                bobSpeed: Math.random() * 0.02 + 0.01,
                bobOffset: Math.random() * Math.PI * 2,
                bobAmplitude: Math.random() * 0.5 + 0.3
            };

            scene.add(lobster);
            lobsters.push(lobster);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00ff, 0.8, 100);
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);

        // Animation loop
        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.016; // Approximate 60fps

            lobsters.forEach(lobster => {
                const userData = lobster.userData;

                // Move lobster
                lobster.position.x += userData.speedX;
                lobster.position.y += userData.speedY;
                lobster.position.z += userData.speedZ;

                // Bobbing motion (sine wave)
                lobster.position.y += Math.sin(time * userData.bobSpeed + userData.bobOffset) * 0.01;

                // Wrap around screen
                if (lobster.position.x > 40) lobster.position.x = -40;
                if (lobster.position.x < -40) lobster.position.x = 40;
                if (lobster.position.y > 30) lobster.position.y = -30;
                if (lobster.position.y < -30) lobster.position.y = 30;
                if (lobster.position.z > 20) lobster.position.z = -30;
                if (lobster.position.z < -30) lobster.position.z = 20;

                // Gentle rotation
                lobster.rotation.y += userData.rotationSpeed;
                lobster.rotation.z += userData.rotationSpeed * 0.5;
            });

            renderer.render(scene, camera);
        }

        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // Public API
    return {
        initAnimation
    };
})();
