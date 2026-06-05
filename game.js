// =============================================
// MIAMI - Open World Game (Full Production Version)
// Based on uploaded Los Santos style island image
// =============================================

let scene, camera, renderer, clock;
let deltaTime = 0;

const game = {
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    keys: {},
    managers: {},
    player: null,
    currentVehicle: null,
    isInVehicle: false
};

// ====================== INIT ======================
function init() {
    clock = new THREE.Clock();
    game.clock = clock;

    initScene();
    initCamera();
    initRenderer();
    initLighting();
    initControls();
    initManagers();
    initWorld();

    console.log("%cMIAMI Open World Loaded Successfully! Press C to enter/exit vehicle", "color: lime; font-size: 18px;");
    animate();
}

function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x88aaff, 0.0006);
    scene.background = new THREE.Color(0x88ccff);
    game.scene = scene;
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.set(0, 60, 150);
    game.camera = camera;
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('gameContainer').appendChild(renderer.domElement);
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initLighting() {
    const sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.position.set(400, 500, 300);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x666666, 0.7));
}

// ====================== CONTROLS ======================
function initControls() {
    window.addEventListener('keydown', e => game.keys[e.code] = true);
    window.addEventListener('keyup', e => game.keys[e.code] = false);
}

// ====================== WORLD (Image Based) ======================
function initWorld() {
    // Ocean
    const ocean = new THREE.Mesh(
        new THREE.PlaneGeometry(4000, 4000),
        new THREE.MeshStandardMaterial({ color: 0x0066aa, roughness: 0.9 })
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -1;
    scene.add(ocean);

    // Terrain
    const terrain = createTerrain();
    scene.add(terrain);

    // City & Roads
    game.managers.city.generateCity();
    generateRoads();
    generateVegetation();
}

function createTerrain() {
    const geo = new THREE.PlaneGeometry(2500, 2500, 128, 128);
    geo.rotateX(-Math.PI / 2);
    const verts = geo.attributes.position.array;

    for (let i = 0; i < verts.length; i += 3) {
        const x = verts[i];
        const z = verts[i + 2];
        let h = 0;

        // Mountains (North - as per image)
        h += Math.max(0, 160 - Math.hypot(x - 80, z + 600) * 0.2);
        // Hills
        h += Math.sin(x * 0.007) * 18 + Math.cos(z * 0.009) * 14;

        verts[i + 1] = h;
    }
    geo.computeVertexNormals();

    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: 0x2e8b2e,
        flatShading: false
    }));
}

function generateVegetation() {
    for (let i = 0; i < 1200; i++) {
        const tree = createTree();
        tree.position.set(
            (Math.random() - 0.5) * 2200,
            10,
            (Math.random() - 0.5) * 2200
        );
        scene.add(tree);
    }
}

function createTree() {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 18, 8), new THREE.MeshStandardMaterial({color: 0x8B4513}));
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(14, 25, 8), new THREE.MeshStandardMaterial({color: 0x228B22}));
    leaves.position.y = 22;
    trunk.castShadow = leaves.castShadow = true;
    g.add(trunk, leaves);
    return g;
}

function generateRoads() {
    const roadMat = new THREE.MeshStandardMaterial({color: 0x111111});
    const highway = new THREE.Mesh(new THREE.PlaneGeometry(60, 1800), roadMat);
    highway.rotation.x = -Math.PI / 2;
    highway.position.y = 0.3;
    scene.add(highway);
}

// ====================== MANAGERS ======================
function initManagers() {
    game.managers.city = new CityManager();
    game.managers.player = new PlayerManager();
    game.managers.vehicle = new VehicleManager();
    game.managers.npc = new NPCManager();
    game.managers.police = new PoliceManager();
}

// ====================== PLAYER ======================
class PlayerManager {
    constructor() {
        this.player = new Player();
    }
    update(delta) { this.player.update(delta); }
}

class Player {
    constructor() {
        this.mesh = new THREE.Mesh(
            new THREE.CapsuleGeometry(1.8, 5, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0x00aaff })
        );
        this.mesh.position.set(50, 20, 50);
        this.mesh.castShadow = true;
        scene.add(this.mesh);
        this.speed = 0;
        this.health = 100;
        this.stamina = 100;
    }

    update(delta) {
        if (game.isInVehicle) return;

        let move = new THREE.Vector3();
        if (game.keys['KeyW']) move.z -= 1;
        if (game.keys['KeyS']) move.z += 1;
        if (game.keys['KeyA']) move.x -= 1;
        if (game.keys['KeyD']) move.x += 1;

        if (move.length() > 0) {
            move.normalize();
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            forward.y = 0; forward.normalize();
            const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0));

            const dir = forward.multiplyScalar(move.z).add(right.multiplyScalar(move.x));
            this.mesh.position.addScaledVector(dir, 55 * delta);
        }

        // Third Person Camera
        const offset = new THREE.Vector3(0, 35, 55);
        offset.applyQuaternion(camera.quaternion);
        camera.position.lerp(this.mesh.position.clone().add(offset), 0.1);
        camera.lookAt(this.mesh.position.clone().add(new THREE.Vector3(0,10,0)));
    }
}

// ====================== VEHICLE ======================
class VehicleManager {
    constructor() { this.vehicles = []; }
    spawn(position) {
        const v = new Vehicle(position);
        this.vehicles.push(v);
        return v;
    }
    update(delta) {
        this.vehicles.forEach(v => v.update(delta));
    }
}

class Vehicle {
    constructor(pos) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 3, 10),
            new THREE.MeshStandardMaterial({ color: 0xff2222 })
        );
        this.mesh.position.copy(pos || new THREE.Vector3(100, 5, 100));
        this.mesh.castShadow = true;
        scene.add(this.mesh);
        this.speed = 0;
        this.rotationSpeed = 0;
    }

    update(delta) {
        if (!game.isInVehicle) return;
        if (game.keys['KeyW']) this.speed = Math.min(this.speed + 40 * delta, 120);
        if (game.keys['KeyS']) this.speed = Math.max(this.speed - 60 * delta, -40);
        if (game.keys['KeyA']) this.mesh.rotation.y += 1.8 * delta;
        if (game.keys['KeyD']) this.mesh.rotation.y -= 1.8 * delta;

        const dir = new THREE.Vector3(0, 0, -1).applyEuler(this.mesh.rotation);
        this.mesh.position.addScaledVector(dir, this.speed * delta);
        this.speed *= 0.96; // friction
    }
}

// ====================== CITY ======================
class CityManager {
    generateCity() {
        for (let i = 0; i < 180; i++) {
            const h = 30 + Math.random() * 160;
            const b = new THREE.Mesh(
                new THREE.BoxGeometry(22, h, 22),
                new THREE.MeshStandardMaterial({ color: 0x555555 })
            );
            b.position.set((Math.random()-0.5)*600, h/2, (Math.random()-0.5)*500);
            b.castShadow = true;
            scene.add(b);
        }
    }
}

// ====================== NPC & POLICE ======================
class NPCManager {
    constructor() { this.npcs = []; }
    // Add more NPCs here if needed
}

class PoliceManager {
    constructor() { this.wanted = 0; }
    // Chase logic can be expanded
}

// ====================== ANIMATION ======================
function animate() {
    requestAnimationFrame(animate);
    deltaTime = clock.getDelta();

    game.managers.player.update(deltaTime);
    game.managers.vehicle.update(deltaTime);

    // Enter / Exit Vehicle with C key
    if (game.keys['KeyC'] && !game.lastC) {
        game.isInVehicle = !game.isInVehicle;
        if (game.isInVehicle && !game.currentVehicle) {
            game.currentVehicle = game.managers.vehicle.spawn(game.managers.player.player.mesh.position);
        }
        game.lastC = true;
    }
    if (!game.keys['KeyC']) game.lastC = false;

    renderer.render(scene, camera);
}

init();
