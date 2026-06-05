// game.js

// ===============================
// GLOBAL VARIABLES
// ===============================
let scene, camera, renderer;
let clock;
let deltaTime;

const game = {
  scene: null,
  camera: null,
  renderer: null,
  clock: null,
  deltaTime: 0,
  managers: {}, // will hold all managers
  player: null,
  vehicle: null,
  controls: {}, // input controls
  debug: false,
};

// ===============================
// INITIALIZATION
// ===============================
init();

function init() {
  initScene();
  initCamera();
  initRenderer();
  initLighting();
  initPostProcessing();
  initManagers();
  initPlayer();
  initCity();
  initNPCs();
  initUI();
  initEventListeners();

  // Start the main loop
  game.clock = new THREE.Clock();
  animate();
}

// ===============================
// SCENE AND RENDERER
// ===============================
function initScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xa0a0a0, 50, 300);
  scene.background = new THREE.Color(0x87ceeb); // daytime sky color
  game.scene = scene;
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 50, 100);
  game.camera = camera;
}

function initRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('gameContainer').appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize);
  game.renderer = renderer;
}

function onWindowResize() {
  game.camera.aspect = window.innerWidth / window.innerHeight;
  game.camera.updateProjectionMatrix();
  game.renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===============================
// LIGHTING AND FOG
// ===============================
function initLighting() {
  // Sunlight
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(100, 200, 100);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  scene.add(sun);

  // Ambient light for softer shadows
  const ambient = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambient);
}

// ===============================
// MANAGERS (Organized System Handlers)
// ===============================
function initManagers() {
  game.managers.city = new CityManager();
  game.managers.npcs = new NPCManager();
  game.managers.vehicle = new VehicleManager();
  game.managers.player = new PlayerManager();
  game.managers.ui = new UIManager();
  game.managers.mission = new MissionManager();
  game.managers.economy = new EconomyManager();
  game.managers.combat = new CombatManager();
  game.managers.save = new SaveManager();
  game.managers.performance = new PerformanceManager();
  // Initialize all managers
  Object.values(game.managers).forEach(manager => manager.init());
}

// ===============================
// PLAYER SYSTEM
// ===============================
class Player {
  constructor() {
    this.position = new THREE.Vector3(0, 1, 0);
    this.velocity = new THREE.Vector3();
    this.health = 100;
    this.armor = 0;
    this.stamina = 100;
    this.isJumping = false;
    this.isSprinting = false;
    this.speed = 0;
    this.model = null; // 3D object
    this.cameraOffset = new THREE.Vector3(0, 2, -5);
    this.isInVehicle = false;
    this.currentVehicle = null;
    this.initModel();
  }

  initModel() {
    // For simplicity, use a capsule or box
    const geometry = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    this.model = new THREE.Mesh(geometry, material);
    this.model.castShadow = true;
    scene.add(this.model);
  }

  update(delta) {
    // Movement logic based on controls
    const moveDirection = new THREE.Vector3();
    if (game.controls.W) moveDirection.z -= 1;
    if (game.controls.S) moveDirection.z += 1;
    if (game.controls.A) moveDirection.x -= 1;
    if (game.controls.D) moveDirection.x += 1;

    moveDirection.normalize();

    // Sprint
    this.isSprinting = game.controls.Shift && this.stamina > 0;

    const moveSpeed = this.isSprinting ? 10 : 5;
    if (this.isSprinting) this.stamina -= delta * 10;
    else this.stamina = Math.min(this.stamina + delta * 5, 100);

    // Jump
    if (game.controls.Space && !this.isJumping) {
      this.velocity.y = 8; // jump strength
      this.isJumping = true;
    }

    // Gravity
    this.velocity.y -= 9.8 * delta;
    this.position.addScaledVector(this.velocity, delta);

    // Apply movement
    if (!this.isInVehicle) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

      const move = new THREE.Vector3();
      move.copy(forward).multiplyScalar(moveDirection.z);
      move.add(right.multiplyScalar(moveDirection.x));
      move.normalize();

      this.position.addScaledVector(move, moveSpeed * delta);
    }

    // Ground collision
    if (this.position.y < 1) {
      this.position.y = 1;
      this.velocity.y = 0;
      this.isJumping = false;
    }

    // Update model position
    this.model.position.copy(this.position);

    // Update camera for third person
    const cameraPosition = this.position.clone().add(this.cameraOffset);
    game.camera.position.lerp(cameraPosition, 0.1);
    game.camera.lookAt(this.model.position);
  }
}

class PlayerManager {
  constructor() {
    this.player = null;
  }

  init() {
    this.player = new Player();
  }

  update(delta) {
    this.player.update(delta);
  }
}

// ===============================
// CITY SYSTEM: Procedural Generation
// ===============================
class CityManager {
  constructor() {
    this.cityObjects = [];
  }

  init() {
    this.generateCity();
  }

  generateCity() {
    // Simple grid layout for demo
    const gridSize = 10;
    const blockSize = 50;
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        if ((x + z) % 2 === 0) {
          this.spawnBuilding(x * blockSize, z * blockSize);
        } else {
          this.spawnRoad(x * blockSize, z * blockSize);
        }
      }
    }
    // Add streetlights, trees, parks
    // For brevity, only buildings and roads are shown
  }

  spawnBuilding(x, z) {
    const geometry = new THREE.BoxGeometry(20, Math.random() * 50 + 20, 20);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, geometry.parameters.height / 2, z);
    building.castShadow = true;
    scene.add(building);
    this.cityObjects.push(building);
  }

  spawnRoad(x, z) {
    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const road = new THREE.Mesh(geometry, material);
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0, z);
    road.receiveShadow = true;
    scene.add(road);
    this.cityObjects.push(road);
  }
}

// ===============================
// NPC SYSTEM
// ===============================
class NPC {
  constructor(position) {
    this.position = position.clone();
    this.speed = 1 + Math.random() * 1.5;
    this.model = null;
    this.targetPosition = this.getNewTarget();
    this.initModel();
  }

  initModel() {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    this.model = new THREE.Mesh(geometry, material);
    this.model.position.copy(this.position);
    this.model.castShadow = true;
    scene.add(this.model);
  }

  getNewTarget() {
    // Random point within some radius
    const radius = 50;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    return new THREE.Vector3(
      this.position.x + Math.cos(angle) * distance,
      0,
      this.position.z + Math.sin(angle) * distance
    );
  }

  update(delta) {
    const dir = new THREE.Vector3().subVectors(this.targetPosition, this.model.position);
    const distance = dir.length();
    if (distance < 1) {
      this.targetPosition = this.getNewTarget();
    } else {
      dir.normalize();
      this.model.position.addScaledVector(dir, this.speed * delta);
      this.model.lookAt(this.targetPosition);
    }
  }
}

class NPCManager {
  constructor() {
    this.npcs = [];
  }

  init() {
    // Spawn some NPCs
    for (let i = 0; i < 50; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 1000,
        0,
        (Math.random() - 0.5) * 1000
      );
      this.npcs.push(new NPC(pos));
    }
  }

  update(delta) {
    this.npcs.forEach(npc => npc.update(delta));
  }
}

// ===============================
// VEHICLE SYSTEM
// ===============================
class Vehicle {
  constructor(position) {
    this.position = position.clone();
    this.model = null;
    this.speed = 0;
    this.maxSpeed = 50;
    this.acceleration = 10;
    this.brakeDeceleration = 20;
    this.turnSpeed = Math.PI / 4; // radians/sec
    this.isPlayerDriven = false;
    this.initModel();
  }

  initModel() {
    const geometry = new THREE.BoxGeometry(2, 1, 4);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.model = new THREE.Mesh(geometry, material);
    this.model.position.copy(this.position);
    this.model.castShadow = true;
    scene.add(this.model);
  }

  update(delta) {
    // Control logic based on input
    // For simplicity, assume controls are global
    if (game.controls.forward) {
      this.speed = Math.min(this.speed + this.acceleration * delta, this.maxSpeed);
    } else if (game.controls.backward) {
      this.speed = Math.max(this.speed - this.brakeDeceleration * delta, -this.maxSpeed/2);
    } else {
      // friction
      this.speed *= 0.98;
    }

    if (game.controls.left) {
      this.model.rotation.y += this.turnSpeed * delta;
    }
    if (game.controls.right) {
      this.model.rotation.y -= this.turnSpeed * delta;
    }

    // Move vehicle
    const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.model.rotation);
    this.model.position.addScaledVector(direction, this.speed * delta);
  }

  setPosition(pos) {
    this.model.position.copy(pos);
  }
}

class VehicleManager {
  constructor() {
    this.vehicles = [];
    this.playerVehicle = null;
  }

  init() {
    // Example spawn
    this.spawnVehicle(new THREE.Vector3(10, 0, 10));
  }

  spawnVehicle(position) {
    const vehicle = new Vehicle(position);
    this.vehicles.push(vehicle);
    return vehicle;
  }

  update(delta) {
    this.vehicles.forEach(v => v.update(delta));
  }
}

// ===============================
// NPC POLICE SYSTEM
// ===============================
class Police {
  constructor() {
    this.wantedLevel = 0;
    this.spawnedPolices = [];
  }

  increaseWanted() {
    this.wantedLevel = Math.min(this.wantedLevel + 1, 5);
    this.spawnPoliceUnits();
  }

  spawnPoliceUnits() {
    // Spawn police cars or officers based on wanted level
    for (let i = 0; i < this.wantedLevel; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 200,
        0,
        (Math.random() - 0.5) * 200
      );
      const policeCar = new Vehicle(pos);
      policeCar.model.material.color.setHex(0x0000ff);
      this.spawnedPolices.push(policeCar);
    }
  }

  chasePlayer(playerPosition) {
    // Implement chase logic
    this.spawnedPolices.forEach(p => {
      // simple chase toward player
      const direction = new THREE.Vector3().subVectors(playerPosition, p.model.position).normalize();
      p.model.position.addScaledVector(direction, 5 * deltaTime);
      p.model.lookAt(playerPosition);
    });
  }
}
game.managers.police = new Police();

// ===============================
// MISSION SYSTEM
// ===============================
class Mission {
  constructor(id, description, reward) {
    this.id = id;
    this.description = description;
    this.reward = reward;
    this.completed = false;
  }
}

class MissionManager {
  constructor() {
    this.missions = [];
    this.currentMission = null;
  }

  init() {
    this.loadMissions();
  }

  loadMissions() {
    this.missions.push(new Mission(1, 'Deliver package to point A', 1000));
    this.missions.push(new Mission(2, 'Kill 5 gang members', 2000));
    this.currentMission = this.missions[0];
    UIManager.updateMissionText(this.currentMission.description);
  }

  completeCurrentMission() {
    if (this.currentMission) {
      this.currentMission.completed = true;
      // reward player
      EconomyManager.addMoney(this.currentMission.reward);
      // show popup
      UIManager.showMissionComplete();
      // load next mission
      const nextIndex = this.missions.indexOf(this.currentMission) + 1;
      if (nextIndex < this.missions.length) {
        this.currentMission = this.missions[nextIndex];
        UIManager.updateMissionText(this.currentMission.description);
      } else {
        UIManager.updateMissionText('All missions completed!');
      }
    }
  }
}

// ===============================
// ECONOMY SYSTEM
// ===============================
class EconomyManager {
  constructor() {
    this.money = 0;
  }

  init() {
    this.load();
  }

  addMoney(amount) {
    this.money += amount;
    UIManager.updateMoney(this.money);
  }

  spendMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      UIManager.updateMoney(this.money);
      return true;
    }
    return false;
  }

  save() {
    localStorage.setItem('playerMoney', this.money);
  }

  load() {
    const savedMoney = localStorage.getItem('playerMoney');
    if (savedMoney) this.money = parseInt(savedMoney);
  }
}

// ===============================
// COMBAT SYSTEM
// ===============================
class Weapon {
  constructor(name, damage, ammo) {
    this.name = name;
    this.damage = damage;
    this.ammo = ammo;
  }
}

class WeaponManager {
  constructor() {
    this.currentWeapon = null;
    this.weapons = [
      new Weapon('Pistol', 10, 15),
      new Weapon('Rifle', 20, 30),
    ];
  }

  init() {
    this.currentWeapon = this.weapons[0];
  }

  shoot() {
    if (this.currentWeapon.ammo > 0) {
      this.currentWeapon.ammo--;
      // Implement shooting visuals, raycast, damage application
      UIManager.showNotification(`Shot fired! Ammo left: ${this.currentWeapon.ammo}`);
    } else {
      UIManager.showNotification('No ammo! Reload.');
    }
  }

  reload() {
    // reload logic
    this.currentWeapon.ammo = 15; // example
  }
}
game.managers.weapon = new WeaponManager();

// ===============================
// SAVE SYSTEM
// ===============================
class SaveManager {
  constructor() {}
  save() {
    const data = {
      money: EconomyManager.money,
      health: game.player.health,
      armor: game.player.armor,
      position: game.player.model.position.toArray(),
      wantedLevel: game.managers.police.wantedLevel,
      missions: game.managers.mission.missions.map(m => ({ id: m.id, completed: m.completed })),
    };
    localStorage.setItem('gameSave', JSON.stringify(data));
  }

  load() {
    const dataStr = localStorage.getItem('gameSave');
    if (dataStr) {
      const data = JSON.parse(dataStr);
      // Load data into game state
      EconomyManager.money = data.money;
      game.player.health = data.health;
      game.player.armor = data.armor;
      game.player.model.position.fromArray(data.position);
      game.managers.police.wantedLevel = data.wantedLevel;
      // Load missions
      // ...
    }
  }
}

// ===============================
// UI SYSTEM
// ===============================
class UIManager {
  static updateMoney(amount) {
    document.getElementById('moneyDisplay').innerText = `Money: $${amount}`;
  }

  static updateMissionText(text) {
    document.getElementById('missionText').innerText = `Mission: ${text}`;
  }

  static showNotification(msg) {
    const container = document.getElementById('notificationContainer');
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerText = msg;
    container.appendChild(notif);
    setTimeout(() => {
      notif.remove();
    }, 3000);
  }

  static updateFPS(fps) {
    document.getElementById('fpsCounter').innerText = `FPS: ${fps}`;
  }

  static showMissionComplete() {
    document.getElementById('missionCompletePopup').style.display = 'flex';
  }

  static hideMissionComplete() {
    document.getElementById('missionCompletePopup').style.display = 'none';
  }

  static showGameOver() {
    document.getElementById('gameOverScreen').style.display = 'flex';
  }

  static hideGameOver() {
    document.getElementById('gameOverScreen').style.display = 'none';
  }

  static updateHealth(health) {
    document.getElementById('healthBar').style.width = `${health}%`;
  }

  static updateArmor(armor) {
    document.getElementById('armorBar').style.width = `${armor}%`;
  }
}

// ===============================
// PERFORMANCE & OPTIMIZATION
// ===============================
class PerformanceManager {
  constructor() {
    this.frustumCulling = true;
    this.distanceCulling = true;
    this.objectPool = [];
  }

  init() {
    // Implement object pooling and other optimizations
  }

  update() {
    // Implement culling logic as needed
  }
}

// ===============================
// ANIMATION LOOP
// ===============================
function animate() {
  requestAnimationFrame(animate);
  deltaTime = game.clock.getDelta();

  // Update systems
  game.managers.player.update(deltaTime);
  game.managers.npcs.update(deltaTime);
  game.managers.vehicle.update(deltaTime);
  // Update police chase if wanted
  if (game.managers.police.wantedLevel > 0) {
    game.managers.police.chasePlayer(game.player.model.position);
  }

  // Performance updates
  game.managers.performance.update();

  // Render scene
  game.renderer.render(scene, camera);

  // Update FPS display
  const fps = Math.round(1 / deltaTime);
  UIManager.updateFPS(fps);
}

// ===============================
// INPUT CONTROLS
// ===============================
window.addEventListener('keydown', (e) => {
  switch(e.code) {
    case 'KeyW': game.controls.W = true; break;
    case 'KeyA': game.controls.A = true; break;
    case 'KeyS': game.controls.S = true; break;
    case 'KeyD': game.controls.D = true; break;
    case 'ShiftLeft': game.controls.Shift = true; break;
    case 'Space': game.controls.Space = true; break;
    case 'KeyF': game.controls.forward = true; break; // example
    // add more controls
  }
});
window.addEventListener('keyup', (e) => {
  switch(e.code) {
    case 'KeyW': game.controls.W = false; break;
    case 'KeyA': game.controls.A = false; break;
    case 'KeyS': game.controls.S = false; break;
    case 'KeyD': game.controls.D = false; break;
    case 'ShiftLeft': game.controls.Shift = false; break;
    case 'Space': game.controls.Space = false; break;
    case 'KeyF': game.controls.forward = false; break;
  }
});

// ===============================
// START THE GAME
// ===============================
function startGame() {
  // e.g., hide main menu, initialize player controls
  UIManager.hideMainMenu();
  game.controls = {};
  // load saved data if any
  game.managers.save.load();
}

// Additional functions for controls, vehicle enter/exit, mission triggers, etc.

