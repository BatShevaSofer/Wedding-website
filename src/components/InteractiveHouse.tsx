import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Maximize2, 
  Eye, 
  Compass, 
  HelpCircle,
  X,
  Heart,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { weddingConfig } from '../config/weddingConfig';

interface InteractiveHouseProps {
  currentDay: number; // 40 down to 0
  isDarkMode: boolean;
  onSelectDay?: (day: number) => void;
}

export const InteractiveHouse: React.FC<InteractiveHouseProps> = ({
  currentDay,
  isDarkMode,
  onSelectDay
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Group references to dynamically add/remove or hide/show
  const houseGroupRef = useRef<THREE.Group | null>(null);
  const dayObjectsMapRef = useRef<Map<number, THREE.Object3D>>(new Map());
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const firefliesRef = useRef<THREE.Points | null>(null);
  const celebrationParticlesRef = useRef<THREE.Points | null>(null);
  const weatherVaneRef = useRef<THREE.Group | null>(null);
  const doorGroupRef = useRef<THREE.Group | null>(null);

  // Replay animation state
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [replayDay, setReplayDay] = useState<number>(currentDay);
  const replayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate 3D scene toggle
  const [autoRotate, setAutoRotate] = useState(false);

  // Display day is either live currentDay or replaying day
  const displayDay = isPlayingReplay ? replayDay : currentDay;

  // Selected 3D part modal tooltip
  const [selectedPartInfo, setSelectedPartInfo] = useState<{
    day: number;
    title: string;
    partName: string;
    desc: string;
  } | null>(null);

  // Step information for currently active/added item
  const currentStepData = useMemo(() => {
    return weddingConfig.steps.find((s) => s.day === displayDay) || weddingConfig.steps[0];
  }, [displayDay]);

  const progressPercent = Math.min(100, Math.max(0, Math.round(((40 - displayDay) / 40) * 100)));

  // ══════════════════════════════════════════════════════════════
  // THREE.JS SCENE SETUP & 40 UNIQUE 3D ELEMENTS CREATION
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDarkMode ? 0x111622 : 0xf7f3eb);
    scene.fog = new THREE.FogExp2(isDarkMode ? 0x111622 : 0xf7f3eb, 0.022);

    // 2. Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(13, 9, 14);
    cameraRef.current = camera;

    // 3. Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDarkMode ? 1.05 : 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.8, 0);
    controls.minDistance = 6;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      isDarkMode ? 0x2a364f : 0xfffaed,
      isDarkMode ? 0.9 : 1.4
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      isDarkMode ? 0x7c94bd : 0xffeed4,
      isDarkMode ? 0.8 : 2.0
    );
    sunLight.position.set(12, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    // Warm bounce light from ground
    const bounceLight = new THREE.DirectionalLight(isDarkMode ? 0xb45309 : 0xfef3c7, isDarkMode ? 0.4 : 0.6);
    bounceLight.position.set(-10, -5, -8);
    scene.add(bounceLight);

    // House Master Group
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);
    houseGroupRef.current = houseGroup;

    // Map storing exactly 1 unique 3D object for each day (from 40 down to 0)
    const dayObjects = new Map<number, THREE.Object3D>();
    dayObjectsMapRef.current = dayObjects;

    // ══════════════════════════════════════════════════════════
    // PALETTE MATERIALS (Warm, dignified, textured)
    // ══════════════════════════════════════════════════════════
    const matGrass = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x223326 : 0x6e8f62,
      roughness: 0.9,
      metalness: 0.1
    });

    const matStoneBase = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x474952 : 0xd8cfc2,
      roughness: 0.85,
      metalness: 0.05
    });

    const matCornerStone = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.4,
      emissive: 0xb45309,
      emissiveIntensity: 0.25
    });

    const matWoodFloor = new THREE.MeshStandardMaterial({
      color: 0x92613d,
      roughness: 0.6,
      metalness: 0.1
    });

    const matWallJerusalem = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x423a31 : 0xf5eedf,
      roughness: 0.8,
      metalness: 0.05
    });

    const matWoodDark = new THREE.MeshStandardMaterial({
      color: 0x543622,
      roughness: 0.65,
      metalness: 0.1
    });

    const matTerracottaRoof = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x7c3624 : 0xba4e32,
      roughness: 0.7,
      metalness: 0.08
    });

    const matGlassWarm = new THREE.MeshPhysicalMaterial({
      color: 0xfff0b8,
      emissive: isDarkMode ? 0xf59e0b : 0xd97706,
      emissiveIntensity: isDarkMode ? 0.9 : 0.35,
      transparent: true,
      opacity: 0.85,
      roughness: 0.15,
      transmission: 0.4
    });

    const matBrassGold = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25
    });

    const matSilver = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      metalness: 0.9,
      roughness: 0.2
    });

    const matOliveFoliage = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x3d4f40 : 0x758f76,
      roughness: 0.85
    });

    const matLavender = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      roughness: 0.8
    });

    // ══════════════════════════════════════════════════════════
    // CONSTRUCTING EACH OF THE 40 DISTINCT 3D OBJECTS
    // ══════════════════════════════════════════════════════════

    // ── Day 40: סימון הקרקע ואבן הפינה (Earth mound + wooden boundary stakes)
    const obj40 = new THREE.Group();
    const groundMesh = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.6, 0.45, 32), matGrass);
    groundMesh.position.y = -0.225;
    groundMesh.receiveShadow = true;
    obj40.add(groundMesh);
    // Boundary stakes
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 8), matWoodDark);
      stake.position.set(Math.cos(angle) * 4.2, 0.35, Math.sin(angle) * 4.2);
      obj40.add(stake);
    }
    dayObjects.set(40, obj40);
    houseGroup.add(obj40);

    // ── Day 39: חפירת יסודות בטון מעמיקים (Deep foundation trench & sub-base)
    const obj39 = new THREE.Group();
    const trenchRing = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.25, 4.4),
      new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.95 })
    );
    trenchRing.position.set(0, 0.05, 0);
    trenchRing.receiveShadow = true;
    obj39.add(trenchRing);
    dayObjects.set(39, obj39);
    houseGroup.add(obj39);

    // ── Day 38: פילוס אבן הפינה (Gravel leveling bed & Cornerstone)
    const obj38 = new THREE.Group();
    const gravelBed = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.15, 4.2), matStoneBase);
    gravelBed.position.set(0, 0.15, 0);
    obj38.add(gravelBed);
    // Golden Cornerstone (אבן הפינה) on the front-right corner
    const cornerStone = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.55), matCornerStone);
    cornerStone.position.set(2.1, 0.35, 1.9);
    cornerStone.castShadow = true;
    obj38.add(cornerStone);
    dayObjects.set(38, obj38);
    houseGroup.add(obj38);

    // ── Day 37: יציקת רצפת הבטון והבידוד (Concrete base platform slab)
    const obj37 = new THREE.Group();
    const concretePlatform = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.3, 4.5), matStoneBase);
    concretePlatform.position.set(0, 0.3, 0);
    concretePlatform.castShadow = true;
    concretePlatform.receiveShadow = true;
    obj37.add(concretePlatform);
    dayObjects.set(37, obj37);
    houseGroup.add(obj37);

    // ── Day 36: עמודי התמיכה הפינתיים (4 Structural corner pillars)
    const obj36 = new THREE.Group();
    const pillarPositions = [
      [-2.1, 1.6, -1.9],
      [2.1, 1.6, -1.9],
      [-2.1, 1.6, 1.9],
      [2.1, 1.6, 1.9]
    ];
    pillarPositions.forEach(([px, py, pz]) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.4, 0.35), matStoneBase);
      pillar.position.set(px, py, pz);
      pillar.castShadow = true;
      obj36.add(pillar);
    });
    dayObjects.set(36, obj36);
    houseGroup.add(obj36);

    // ── Day 35: רצפת הפרקט החמה (Hardwood interior parquet floor)
    const obj35 = new THREE.Group();
    const parquetFloor = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.08, 3.9), matWoodFloor);
    parquetFloor.position.set(0, 0.46, 0);
    parquetFloor.receiveShadow = true;
    obj35.add(parquetFloor);
    dayObjects.set(35, obj35);
    houseGroup.add(obj35);

    // ── Day 34: הקיר האחורי (Back solid stone wall)
    const obj34 = new THREE.Group();
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.35, 0.25), matWallJerusalem);
    backWall.position.set(0, 1.62, -1.95);
    backWall.castShadow = true;
    obj34.add(backWall);
    dayObjects.set(34, obj34);
    houseGroup.add(obj34);

    // ── Day 33: הקיר השמאלי (Left stone wall)
    const obj33 = new THREE.Group();
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.35, 3.8), matWallJerusalem);
    leftWall.position.set(-2.15, 1.62, 0);
    leftWall.castShadow = true;
    obj33.add(leftWall);
    dayObjects.set(33, obj33);
    houseGroup.add(obj33);

    // ── Day 32: הקיר הימני עם פתחי אור (Right stone wall with window opening)
    const obj32 = new THREE.Group();
    const rightWallBottom = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 3.8), matWallJerusalem);
    rightWallBottom.position.set(2.15, 0.9, 0);
    rightWallBottom.castShadow = true;
    const rightWallTop = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.65, 3.8), matWallJerusalem);
    rightWallTop.position.set(2.15, 2.45, 0);
    const rightWallPostL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 1.1), matWallJerusalem);
    rightWallPostL.position.set(2.15, 1.7, -1.35);
    const rightWallPostR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 1.1), matWallJerusalem);
    rightWallPostR.position.set(2.15, 1.7, 1.35);
    obj32.add(rightWallBottom, rightWallTop, rightWallPostL, rightWallPostR);
    dayObjects.set(32, obj32);
    houseGroup.add(obj32);

    // ── Day 31: קיר החזית והכניסה (Front facade wall with doorway opening)
    const obj31 = new THREE.Group();
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.35, 0.25), matWallJerusalem);
    frontWallLeft.position.set(-1.3, 1.62, 1.95);
    frontWallLeft.castShadow = true;
    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.35, 0.25), matWallJerusalem);
    frontWallRight.position.set(1.4, 1.62, 1.95);
    frontWallRight.castShadow = true;
    const frontWallLintel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.25), matWallJerusalem);
    frontWallLintel.position.set(0.1, 2.52, 1.95);
    frontWallLintel.castShadow = true;
    obj31.add(frontWallLeft, frontWallRight, frontWallLintel);
    dayObjects.set(31, obj31);
    houseGroup.add(obj31);

    // ── Day 30: קשת האבן הפנימית (Interior archway partition wall)
    const obj30 = new THREE.Group();
    const archLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.1, 1.2), matWallJerusalem);
    archLeft.position.set(-0.6, 1.5, -0.4);
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 2.4), matWallJerusalem);
    archTop.position.set(-0.6, 2.4, 0.4);
    obj30.add(archLeft, archTop);
    dayObjects.set(30, obj30);
    houseGroup.add(obj30);

    // ── Day 29: עיטורי אבן ירושלמית בפינות (Architectural corner quoins & moulding)
    const obj29 = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const yPos = 0.8 + k * 0.55;
      const quoinL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.42), matStoneBase);
      quoinL.position.set(-2.15, yPos, 1.98);
      const quoinR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.42), matStoneBase);
      quoinR.position.set(2.15, yPos, 1.98);
      obj29.add(quoinL, quoinR);
    }
    dayObjects.set(29, obj29);
    houseGroup.add(obj29);

    // ── Day 28: מסגרות החלונות הראשונות (Front bay window wood frame)
    const obj28 = new THREE.Group();
    const winFrameOuter = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.12), matWoodDark);
    winFrameOuter.position.set(1.4, 1.7, 1.98);
    obj28.add(winFrameOuter);
    dayObjects.set(28, obj28);
    houseGroup.add(obj28);

    // ── Day 27: שמשות הזכוכית והשקיפות (Stained & clear glass panes)
    const obj27 = new THREE.Group();
    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.05), matGlassWarm);
    frontGlass.position.set(1.4, 1.7, 1.98);
    obj27.add(frontGlass);
    dayObjects.set(27, obj27);
    houseGroup.add(obj27);

    // ── Day 26: חלון הצד והשלווה (Side window frame & glass)
    const obj26 = new THREE.Group();
    const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 1.4), matGlassWarm);
    sideGlass.position.set(2.15, 1.7, 0);
    const sideFrame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.05, 1.55), matWoodDark);
    sideFrame.position.set(2.15, 1.7, 0);
    obj26.add(sideGlass, sideFrame);
    dayObjects.set(26, obj26);
    houseGroup.add(obj26);

    // ── Day 25: אדני החלונות המגולפים (Carved stone window sills)
    const obj25 = new THREE.Group();
    const sillFront = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.28), matStoneBase);
    sillFront.position.set(1.4, 1.15, 2.05);
    sillFront.castShadow = true;
    const sillSide = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 1.7), matStoneBase);
    sillSide.position.set(2.25, 1.15, 0);
    obj25.add(sillFront, sillSide);
    dayObjects.set(25, obj25);
    houseGroup.add(obj25);

    // ── Day 24: אדניות פרחים בחלונות (Flower box with blooming roses)
    const obj24 = new THREE.Group();
    const flowerBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.25), matWoodDark);
    flowerBox.position.set(1.4, 1.05, 2.12);
    flowerBox.castShadow = true;
    obj24.add(flowerBox);
    // Colorful blooming flowers
    const flowerColors = [0xe11d48, 0xf43f5e, 0xfb7185, 0xf59e0b, 0xe11d48];
    flowerColors.forEach((color, idx) => {
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
      );
      fl.position.set(0.95 + idx * 0.22, 1.22, 2.14);
      obj24.add(fl);
    });
    dayObjects.set(24, obj24);
    houseGroup.add(obj24);

    // ── Day 23: תריסי עץ כפריים (Classic wooden window shutters)
    const obj23 = new THREE.Group();
    const shutterL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.05, 0.08), matWoodDark);
    shutterL.position.set(0.78, 1.7, 2.02);
    shutterL.rotation.y = 0.25;
    const shutterR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.05, 0.08), matWoodDark);
    shutterR.position.set(2.02, 1.7, 2.02);
    shutterR.rotation.y = -0.25;
    obj23.add(shutterL, shutterR);
    dayObjects.set(23, obj23);
    houseGroup.add(obj23);

    // ── Day 22: מדרגות האבן והכניסה (Entrance porch stairs)
    const obj22 = new THREE.Group();
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.7), matStoneBase);
    step1.position.set(0.1, 0.24, 2.3);
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 0.7), matStoneBase);
    step2.position.set(0.1, 0.1, 2.65);
    obj22.add(step1, step2);
    dayObjects.set(22, obj22);
    houseGroup.add(obj22);

    // ── Day 21: דלת עץ האלון הראשית (Solid oak front entrance door)
    const obj21 = new THREE.Group();
    const doorGroup = new THREE.Group();
    doorGroupRef.current = doorGroup;
    doorGroup.position.set(-0.35, 1.35, 1.95);
    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.1), matWoodDark);
    doorMesh.position.set(0.425, 0, 0);
    doorMesh.castShadow = true;
    doorGroup.add(doorMesh);
    obj21.add(doorGroup);
    dayObjects.set(21, obj21);
    houseGroup.add(obj21);

    // ── Day 20: ידית הפליז ומנעול האהבה (Polished brass handle & knocker)
    const obj20 = new THREE.Group();
    const doorKnocker = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 16), matBrassGold);
    doorKnocker.position.set(0.1, 1.5, 2.02);
    const doorHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), matBrassGold);
    doorHandle.rotation.z = Math.PI / 2;
    doorHandle.position.set(0.35, 1.3, 2.02);
    obj20.add(doorKnocker, doorHandle);
    dayObjects.set(20, obj20);
    houseGroup.add(obj20);

    // ── Day 19: גגון כניסה ומחסה (Porch canopy / portico awning)
    const obj19 = new THREE.Group();
    const canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.9), matTerracottaRoof);
    canopyRoof.position.set(0.1, 2.45, 2.35);
    canopyRoof.rotation.x = 0.2;
    canopyRoof.castShadow = true;
    const canopyBraceL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), matWoodDark);
    canopyBraceL.position.set(-0.45, 2.15, 2.25);
    canopyBraceL.rotation.x = -0.4;
    const canopyBraceR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), matWoodDark);
    canopyBraceR.position.set(0.65, 2.15, 2.25);
    canopyBraceR.rotation.x = -0.4;
    obj19.add(canopyRoof, canopyBraceL, canopyBraceR);
    dayObjects.set(19, obj19);
    houseGroup.add(obj19);

    // ── Day 18: פנס כניסה מברזל יצוק (Porch lantern with real warm PointLight)
    const obj18 = new THREE.Group();
    const lanternFixture = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.14, 0.28, 6),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.2 })
    );
    lanternFixture.position.set(-0.55, 1.95, 2.08);
    const lanternBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe680 })
    );
    lanternBulb.position.set(-0.55, 1.95, 2.08);
    const porchLight = new THREE.PointLight(0xfbbf24, isDarkMode ? 1.8 : 0.8, 5);
    porchLight.position.set(-0.55, 1.95, 2.15);
    obj18.add(lanternFixture, lanternBulb, porchLight);
    dayObjects.set(18, obj18);
    houseGroup.add(obj18);

    // ── Day 17: קביעת המזוזה על המשקוף (✡️ Silver Mezuzah on the right doorpost)
    const obj17 = new THREE.Group();
    const mezuzahCase = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.04), matSilver);
    mezuzahCase.position.set(0.56, 1.7, 2.01);
    mezuzahCase.rotation.z = -0.15; // Slanted towards inside
    const mezuzahShin = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), matBrassGold);
    mezuzahShin.position.set(0.56, 1.76, 2.035);
    obj17.add(mezuzahCase, mezuzahShin);
    dayObjects.set(17, obj17);
    houseGroup.add(obj17);

    // ── Day 16: קורות הגג המרכזיות (A-Frame Timber Rafters & Trusses)
    const obj16 = new THREE.Group();
    const rafterFrontL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), matWoodDark);
    rafterFrontL.position.set(-1.15, 3.5, 1.95);
    rafterFrontL.rotation.z = -0.65;
    rafterFrontL.castShadow = true;
    const rafterFrontR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), matWoodDark);
    rafterFrontR.position.set(1.15, 3.5, 1.95);
    rafterFrontR.rotation.z = 0.65;
    rafterFrontR.castShadow = true;
    // Central Ridge Beam
    const ridgeBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 4.3, 8), matWoodDark);
    ridgeBeam.position.set(0, 4.3, 0);
    ridgeBeam.rotation.x = Math.PI / 2;
    obj16.add(rafterFrontL, rafterFrontR, ridgeBeam);
    dayObjects.set(16, obj16);
    houseGroup.add(obj16);

    // ── Day 15: רעפי החרס (צד שמאל) (Left pitch Terracotta tiled roof)
    const obj15 = new THREE.Group();
    const roofLeft = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.15, 4.5), matTerracottaRoof);
    roofLeft.position.set(-1.1, 3.55, 0);
    roofLeft.rotation.z = 0.62;
    roofLeft.castShadow = true;
    obj15.add(roofLeft);
    dayObjects.set(15, obj15);
    houseGroup.add(obj15);

    // ── Day 14: רעפי החרס של חזית הגג ורכס הגג (Right pitch roof & Ridge cap)
    const obj14 = new THREE.Group();
    const roofRight = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.15, 4.5), matTerracottaRoof);
    roofRight.position.set(1.1, 3.55, 0);
    roofRight.rotation.z = -0.62;
    roofRight.castShadow = true;
    const ridgeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.55, 12), matTerracottaRoof);
    ridgeCap.position.set(0, 4.35, 0);
    ridgeCap.rotation.x = Math.PI / 2;
    // Gable wall pediment triangle
    const gableFront = new THREE.Mesh(
      new THREE.ConeGeometry(2.2, 1.55, 4),
      matWallJerusalem
    );
    gableFront.position.set(0, 3.5, 1.94);
    gableFront.rotation.y = Math.PI / 4;
    obj14.add(roofRight, ridgeCap, gableFront);
    dayObjects.set(14, obj14);
    houseGroup.add(obj14);

    // ── Day 13: ארובת אבן כפרית (Rustic stone chimney stack & cap)
    const obj13 = new THREE.Group();
    const chimneyStack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, 0.55), matStoneBase);
    chimneyStack.position.set(-1.1, 4.2, -0.6);
    chimneyStack.castShadow = true;
    const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), matStoneBase);
    chimneyCap.position.set(-1.1, 4.95, -0.6);
    obj13.add(chimneyStack, chimneyCap);
    dayObjects.set(13, obj13);
    houseGroup.add(obj13);

    // ── Day 12: עשן ארובה מיתמר ומחמם (Chimney smoke particle system)
    const obj12 = new THREE.Group();
    const smokeCount = 35;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let s = 0; s < smokeCount; s++) {
      smokePos[s * 3] = -1.1 + (Math.random() - 0.5) * 0.3;
      smokePos[s * 3 + 1] = 5.0 + Math.random() * 2.2;
      smokePos[s * 3 + 2] = -0.6 + (Math.random() - 0.5) * 0.3;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: isDarkMode ? 0xcccccc : 0xaaaaaa,
      size: 0.35,
      transparent: true,
      opacity: 0.45
    });
    const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    smokeParticlesRef.current = smokeParticles;
    obj12.add(smokeParticles);
    dayObjects.set(12, obj12);
    houseGroup.add(obj12);

    // ── Day 11: שבשבת רוח מוזהבת על הרכס (Golden weather vane with heart)
    const obj11 = new THREE.Group();
    const vanePole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), matBrassGold);
    vanePole.position.set(0, 4.7, 1.5);
    const vaneArrowGroup = new THREE.Group();
    vaneArrowGroup.position.set(0, 5.05, 1.5);
    const vaneArrow = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 8), matBrassGold);
    vaneArrow.rotation.z = Math.PI / 2;
    const vaneHeart = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0xe11d48 }));
    vaneHeart.position.set(0.3, 0, 0);
    vaneArrowGroup.add(vaneArrow, vaneHeart);
    weatherVaneRef.current = vaneArrowGroup;
    obj11.add(vanePole, vaneArrowGroup);
    dayObjects.set(11, obj11);
    houseGroup.add(obj11);

    // ── Day 10: נברשת התקרה ותאורת הפנים החמה (Interior warm chandelier & glow)
    const obj10 = new THREE.Group();
    const interiorLight = new THREE.PointLight(0xffbe3b, isDarkMode ? 3.2 : 1.5, 9);
    interiorLight.position.set(0, 2.2, 0);
    const chandelierFixture = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), matBrassGold);
    chandelierFixture.position.set(0, 2.4, 0);
    obj10.add(interiorLight, chandelierFixture);
    dayObjects.set(10, obj10);
    houseGroup.add(obj10);

    // ── Day 9: אח עצים מבוערת בסלון (Fireplace with glowing hearth)
    const obj9 = new THREE.Group();
    const hearthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 0.45), matStoneBase);
    hearthMesh.position.set(-1.1, 0.9, -1.65);
    const fireEmbers = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff4500 })
    );
    fireEmbers.position.set(-1.1, 0.65, -1.55);
    const hearthLight = new THREE.PointLight(0xff6600, 1.2, 3);
    hearthLight.position.set(-1.1, 0.8, -1.4);
    obj9.add(hearthMesh, fireEmbers, hearthLight);
    dayObjects.set(9, obj9);
    houseGroup.add(obj9);

    // ── Day 8: שולחן האוכל והסעודות (Dining table & wooden chairs inside)
    const obj8 = new THREE.Group();
    const diningTable = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.8), matWoodDark);
    diningTable.position.set(0.6, 0.85, -0.2);
    const tableLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), matWoodDark);
    tableLeg1.position.set(0.15, 0.65, -0.5);
    const tableLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), matWoodDark);
    tableLeg2.position.set(1.05, 0.65, 0.1);
    obj8.add(diningTable, tableLeg1, tableLeg2);
    dayObjects.set(8, obj8);
    houseGroup.add(obj8);

    // ── Day 7: ארון ספרי קודש (Bookcase with holy books on the wall)
    const obj7 = new THREE.Group();
    const bookcase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.25), matWoodDark);
    bookcase.position.set(-1.6, 1.4, 0.5);
    bookcase.rotation.y = Math.PI / 2;
    // Colorful books along shelves
    for (let b = 0; b < 6; b++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.28, 0.18),
        new THREE.MeshStandardMaterial({ color: b % 2 === 0 ? 0x1e3a8a : 0x831843 })
      );
      book.position.set(-1.58, 1.1 + (b % 2) * 0.35, 0.2 + b * 0.1);
      obj7.add(book);
    }
    obj7.add(bookcase);
    dayObjects.set(7, obj7);
    houseGroup.add(obj7);

    // ── Day 6: שטיח צמר וספת מנוחה (Living room woven rug & armchair)
    const obj6 = new THREE.Group();
    const warmRug = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.02, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.9 })
    );
    warmRug.position.set(-0.5, 0.51, 0.4);
    const armchair = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.65, 0.65),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
    );
    armchair.position.set(-0.8, 0.75, 0.5);
    obj6.add(warmRug, armchair);
    dayObjects.set(6, obj6);
    houseGroup.add(obj6);

    // ── Day 5: שביל אבני מדרך בגינה (Winding flagstone garden stepping-stones)
    const obj5 = new THREE.Group();
    const pathStones = [
      [0.1, 0.05, 3.1],
      [0.25, 0.05, 3.65],
      [0.05, 0.05, 4.25],
      [-0.2, 0.05, 4.85],
      [0.1, 0.05, 5.45]
    ];
    pathStones.forEach(([sx, sy, sz], idx) => {
      const stone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32 + (idx % 2) * 0.06, 0.34, 0.08, 12),
        matStoneBase
      );
      stone.position.set(sx, sy, sz);
      stone.receiveShadow = true;
      obj5.add(stone);
    });
    dayObjects.set(5, obj5);
    houseGroup.add(obj5);

    // ── Day 4: עץ הזית הכסוף (Ancient gnarled Olive tree with canopy)
    const obj4 = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.32, 2.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 })
    );
    trunk.position.set(-3.6, 1.25, 1.8);
    trunk.castShadow = true;
    // Foliage puffs
    const leafPuff1 = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 12), matOliveFoliage);
    leafPuff1.position.set(-3.6, 2.8, 1.8);
    leafPuff1.castShadow = true;
    const leafPuff2 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 12), matOliveFoliage);
    leafPuff2.position.set(-3.1, 2.5, 1.5);
    leafPuff2.castShadow = true;
    const leafPuff3 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), matOliveFoliage);
    leafPuff3.position.set(-3.9, 2.4, 2.1);
    leafPuff3.castShadow = true;
    obj4.add(trunk, leafPuff1, leafPuff2, leafPuff3);
    dayObjects.set(4, obj4);
    houseGroup.add(obj4);

    // ── Day 3: ערוגות לבנדר ופרחי נוי (Lavender bushes along the garden)
    const obj3 = new THREE.Group();
    for (let lv = 0; lv < 7; lv++) {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), matLavender);
      bush.position.set(0.9 + (lv % 3) * 0.3, 0.22, 2.6 + lv * 0.32);
      obj3.add(bush);
    }
    dayObjects.set(3, obj3);
    houseGroup.add(obj3);

    // ── Day 2: תיבת דואר משפחתית (דוד & מיכל) (Wooden mailbox on post)
    const obj2 = new THREE.Group();
    const mailPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), matWoodDark);
    mailPost.position.set(1.2, 0.55, 4.1);
    const mailBoxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.24, 0.45),
      new THREE.MeshStandardMaterial({ color: isDarkMode ? 0x1f2937 : 0xfffcf7, roughness: 0.4 })
    );
    mailBoxMesh.position.set(1.2, 1.1, 4.1);
    mailBoxMesh.castShadow = true;
    // Red flag
    const mailFlag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.08), new THREE.MeshStandardMaterial({ color: 0xe11d48 }));
    mailFlag.position.set(1.4, 1.18, 4.1);
    obj2.add(mailPost, mailBoxMesh, mailFlag);
    dayObjects.set(2, obj2);
    houseGroup.add(obj2);

    // ── Day 1: גירלנדות של נורות פיות זוהרות (Twinkling fairy string lights)
    const obj1 = new THREE.Group();
    const fairyPoints = [
      [-3.3, 2.4, 1.8],
      [-2.4, 2.2, 1.9],
      [-1.3, 2.4, 2.2],
      [-0.2, 2.3, 2.3],
      [0.8, 2.2, 2.1],
      [1.8, 2.1, 2.0]
    ];
    fairyPoints.forEach(([fx, fy, fz]) => {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      bulb.position.set(fx, fy, fz);
      obj1.add(bulb);
    });
    dayObjects.set(1, obj1);
    houseGroup.add(obj1);

    // ── Day 0: יום החתונה • הבית המושלם (Wedding wreath on door + golden celebration aura)
    const obj0 = new THREE.Group();
    // Floral Wreath with satin ribbon on front door
    const wreathTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.06, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 })
    );
    wreathTorus.position.set(0.1, 1.7, 2.02);
    const wreathRibbon = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e })
    );
    wreathRibbon.position.set(0.1, 1.5, 2.04);
    // Golden Wedding Chuppah Light Ring above roof
    const chuppahHalo = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.04, 12, 36),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    chuppahHalo.position.set(0, 4.8, 0);
    chuppahHalo.rotation.x = Math.PI / 2;
    obj0.add(wreathTorus, wreathRibbon, chuppahHalo);

    // Golden Celebration particle fountain
    const celebCount = 80;
    const celebGeo = new THREE.BufferGeometry();
    const celebPos = new Float32Array(celebCount * 3);
    for (let c = 0; c < celebCount; c++) {
      celebPos[c * 3] = (Math.random() - 0.5) * 4.5;
      celebPos[c * 3 + 1] = 1.0 + Math.random() * 4.5;
      celebPos[c * 3 + 2] = (Math.random() - 0.5) * 4.5;
    }
    celebGeo.setAttribute('position', new THREE.BufferAttribute(celebPos, 3));
    const celebMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.15,
      transparent: true,
      opacity: 0.85
    });
    const celebrationParticles = new THREE.Points(celebGeo, celebMat);
    celebrationParticlesRef.current = celebrationParticles;
    obj0.add(celebrationParticles);

    dayObjects.set(0, obj0);
    houseGroup.add(obj0);

    // ══════════════════════════════════════════════════════════
    // AMBIENT PARTICLES (Fireflies in garden at night)
    // ══════════════════════════════════════════════════════════
    const fireflyCount = 40;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPos = new Float32Array(fireflyCount * 3);
    for (let f = 0; f < fireflyCount; f++) {
      fireflyPos[f * 3] = (Math.random() - 0.5) * 11;
      fireflyPos[f * 3 + 1] = 0.5 + Math.random() * 3.5;
      fireflyPos[f * 3 + 2] = (Math.random() - 0.5) * 11;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
    const fireflyMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: isDarkMode ? 0.16 : 0.08,
      transparent: true,
      opacity: isDarkMode ? 0.8 : 0.4
    });
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    firefliesRef.current = fireflies;
    scene.add(fireflies);

    // ══════════════════════════════════════════════════════════
    // ANIMATION RENDER LOOP
    // ══════════════════════════════════════════════════════════
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle weather vane rotation
      if (weatherVaneRef.current) {
        weatherVaneRef.current.rotation.y = Math.sin(elapsedTime * 0.8) * 0.4;
      }

      // Rising chimney smoke animation
      if (smokeParticlesRef.current) {
        const positions = smokeParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let s = 0; s < positions.length / 3; s++) {
          positions[s * 3 + 1] += 0.018; // Rise up
          positions[s * 3] += Math.sin(elapsedTime + s) * 0.003; // Drift sideways
          if (positions[s * 3 + 1] > 7.5) {
            positions[s * 3 + 1] = 5.0; // Loop back
          }
        }
        smokeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Floating fireflies animation
      if (firefliesRef.current) {
        const positions = firefliesRef.current.geometry.attributes.position.array as Float32Array;
        for (let f = 0; f < positions.length / 3; f++) {
          positions[f * 3 + 1] += Math.sin(elapsedTime * 2 + f) * 0.004;
          positions[f * 3] += Math.cos(elapsedTime * 1.5 + f) * 0.003;
        }
        firefliesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Wedding celebration sparkles rotation
      if (celebrationParticlesRef.current) {
        celebrationParticlesRef.current.rotation.y = elapsedTime * 0.25;
      }

      // Update camera controls
      controls.update();

      // Render
      renderer.render(scene, camera);
    };

    animate();

    // Resize handling with ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, [isDarkMode]);

  // ══════════════════════════════════════════════════════════════
  // UPDATE VISIBILITY OF THE 40 PIECES ACCORDING TO DISPLAY DAY
  // A piece for Day X is visible IF AND ONLY IF displayDay <= X
  // (Meaning as countdown progresses 40 -> 39 -> ... -> 0, each day unlocks a NEW piece!)
  // ══════════════════════════════════════════════════════════
  useEffect(() => {
    const map = dayObjectsMapRef.current;
    if (!map) return;

    for (let day = 40; day >= 0; day--) {
      const obj = map.get(day);
      if (obj) {
        // Unlocked when displayDay <= day
        const shouldBeVisible = displayDay <= day;
        obj.visible = shouldBeVisible;

        // On day 0 (wedding day), open the door!
        if (day === 21 && doorGroupRef.current) {
          doorGroupRef.current.rotation.y = displayDay === 0 ? -1.35 : 0;
        }
      }
    }
  }, [displayDay]);

  // Sync controls autoRotate setting
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // ══════════════════════════════════════════════════════════════
  // CINEMATIC REPLAY CONTROLS (Countdown 40 -> currentDay)
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isPlayingReplay) {
      replayTimerRef.current = setInterval(() => {
        setReplayDay((prev) => {
          if (prev <= currentDay) {
            setIsPlayingReplay(false);
            return currentDay;
          }
          return prev - 1;
        });
      }, 420);
    } else {
      if (replayTimerRef.current) {
        clearInterval(replayTimerRef.current);
      }
    }
    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [isPlayingReplay, currentDay]);

  const handleStartReplay = () => {
    setReplayDay(40);
    setIsPlayingReplay(true);
  };

  const handleStopReplay = () => {
    setIsPlayingReplay(false);
    setReplayDay(currentDay);
  };

  // Camera angle presets
  const setCameraPreset = (view: 'iso' | 'front' | 'garden' | 'top') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    switch (view) {
      case 'iso':
        camera.position.set(13, 9, 14);
        controls.target.set(0, 1.8, 0);
        break;
      case 'front':
        camera.position.set(0, 3.2, 14);
        controls.target.set(0, 1.8, 0);
        break;
      case 'garden':
        camera.position.set(4, 2.2, 10);
        controls.target.set(0, 1.2, 2.5);
        break;
      case 'top':
        camera.position.set(0.1, 18, 0.1);
        controls.target.set(0, 0, 0);
        break;
    }
    controls.update();
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center select-none">
      {/* ══════════════════════════════════════════════════════════
          THE 3D WEBGL STAGE (Real interactive Three.js viewport)
          ══════════════════════════════════════════════════════════ */}
      <div 
        className={`relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] min-h-[480px] sm:min-h-[560px] md:min-h-[620px] rounded-3xl overflow-hidden shadow-2xl border transition-all duration-700 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-[#0e131d] via-[#141a27] to-[#10141f] border-[#2e3b50] shadow-black/70' 
            : 'bg-gradient-to-b from-[#f9f5ed] via-[#f2ece0] to-[#e8decb] border-[#d8c8b2] shadow-amber-950/15'
        }`}
      >
        {/* Three.js Canvas Container */}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* ══════════════════════════════════════════════════════════
            ON-STAGE OVERLAY CONTROLS
            ══════════════════════════════════════════════════════════ */}
        
        {/* Top-Right: Cinematic Playback & Auto-Rotate */}
        <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2">
          {!isPlayingReplay ? (
            <button
              onClick={handleStartReplay}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 text-[#4A3728] dark:text-gray-200 border border-[#DACDBE] dark:border-gray-700 text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 cursor-pointer"
              title="צפייה בבניית 40 החלקים של הבית שלב אחר שלב"
            >
              <Play className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-current" />
              <span>צפה בבנייה (40 צעדים) 🎬</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStopReplay}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-600 text-white text-xs sm:text-sm font-semibold shadow-md hover:bg-rose-700 transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>עצור</span>
              </button>
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-bold backdrop-blur-md border border-amber-400/50 animate-pulse">
                יום {displayDay}: {currentStepData.housePartName}
              </span>
            </div>
          )}

          {/* 360° Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
              autoRotate
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white/80 dark:bg-gray-900/80 text-[#6B5A4B] dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-amber-50'
            }`}
            title={autoRotate ? 'עצירת סיבוב 3D אוטומטי' : 'הפעלת סיבוב 3D אוטומטי 360°'}
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Top-Left: Camera View Presets */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-2xl backdrop-blur-md bg-white/85 dark:bg-gray-900/85 border border-[#DACDBE] dark:border-gray-700 shadow-md">
          <button
            onClick={() => setCameraPreset('iso')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#5A4634] dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            מבט תלת-ממד
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#5A4634] dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            חזית ודלת
          </button>
          <button
            onClick={() => setCameraPreset('garden')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#5A4634] dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            גינה ועץ זית
          </button>
        </div>

        {/* Bottom-Right: Active Addition Card (Real-time announcement of current day's item) */}
        <div 
          className="absolute bottom-4 right-4 z-20 max-w-sm sm:max-w-md p-3.5 sm:p-4 rounded-2xl backdrop-blur-md border shadow-xl text-right transition-all"
          style={{
            backgroundColor: isDarkMode ? 'rgba(20, 26, 38, 0.92)' : 'rgba(255, 253, 248, 0.92)',
            borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.6)' : 'rgba(215, 203, 187, 0.9)'
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                {displayDay === 0 ? "יום החתונה" : `צעד ${40 - displayDay} מתוך 40`}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300/40">
              יום {displayDay}
            </span>
          </div>

          <h4 className="font-serif font-bold text-base sm:text-lg text-[#3D2C1D] dark:text-[#F3EAD8] leading-tight">
            {currentStepData.title}
          </h4>
          <p className="text-xs text-[#7A6A5A] dark:text-gray-300 mt-1 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>התווסף לבית: <strong>{currentStepData.housePartName}</strong></span>
          </p>
        </div>

        {/* Bottom-Left: 3D Gesture Hint & Progress */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border shadow-md flex items-center gap-1.5"
            style={{
              backgroundColor: isDarkMode ? 'rgba(20, 26, 38, 0.88)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(215, 205, 190, 0.85)',
              color: isDarkMode ? '#FBBF24' : '#B45309'
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{progressPercent}% מהבית נבנה</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xs text-white/80 text-[11px]">
            <span>🖱️ גררו לסיבוב 3D • גלגלת לזום</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          40-DAY SLIDER & DIRECT JUMP CONTROLS
          ══════════════════════════════════════════════════════════ */}
      <div className="w-full mt-6 px-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 mb-2 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-serif">יום 40 • הנחת אבן הפינה</span>
            <span className="text-[#C4B39F]">•</span>
            <span className="text-amber-800 dark:text-amber-300 font-bold">
              {40 - displayDay} פריטים נבנו בתלת-ממד
            </span>
          </div>
          <span className="font-serif font-bold text-amber-700 dark:text-amber-400">
            יום החתונה • הבית השלם 🏡
          </span>
        </div>

        {/* 40-Day Interactive Range Slider */}
        <div className="relative flex items-center my-2">
          <input
            type="range"
            min="0"
            max="40"
            value={40 - displayDay}
            onChange={(e) => {
              const newDay = 40 - parseInt(e.target.value, 10);
              if (onSelectDay) onSelectDay(newDay);
            }}
            className="w-full h-3 bg-[#E5DCCE] dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-amber-600 focus:outline-none"
          />
        </div>

        {/* Milestone Quick Jump Buttons (Every 5 Days) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3 pt-1 text-xs">
          {[
            { label: 'אבן הפינה', day: 40, icon: '🌱' },
            { label: 'פרקט ורצפה', day: 35, icon: '🪵' },
            { label: 'קירות אבן', day: 31, icon: '🧱' },
            { label: 'חלונות', day: 26, icon: '🪟' },
            { label: 'דלת ומזוזה', day: 17, icon: '🚪' },
            { label: 'גג וארובה', day: 13, icon: '🏠' },
            { label: 'תאורה ואח', day: 9, icon: '💡' },
            { label: 'עץ זית ושביל', day: 4, icon: '🫒' },
            { label: 'החתונה!', day: 0, icon: '💒' }
          ].map((btn) => (
            <button
              key={btn.day}
              onClick={() => {
                if (onSelectDay) onSelectDay(btn.day);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                displayDay === btn.day
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md scale-105'
                  : 'bg-white/80 dark:bg-gray-800 text-[#5A4634] dark:text-gray-300 border-[#DACDBE] dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-gray-700'
              }`}
            >
              <span>{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
