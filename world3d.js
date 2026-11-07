// world3d.js - Không gian 3D Chùa Vô Lượng (Three.js) & Hệ thống Animation Nhân Vật (Đi bộ, Lạy dập đầu, Thắp hương, Gõ mõ, Lần tràng hạt, Thỉnh chuông, Thả đèn, Quét lá)

class TempleWorld3D {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Camera orbit & zoom
    this.camYaw = 0; // Nhìn về hướng Bắc (-Z) nơi có Cổng Tam Quan & Chánh Điện
    this.camPitch = 0.42;
    this.camDist = 11.5;
    this.isDragging = false;
    this.dragMoved = false;
    this.prevPointer = { x: 0, y: 0 };

    // Player state: Bắt đầu xuất hiện TRƯỚC CỔNG CHÙA (z = 31, cổng Tam Quan ở z = 23)
    this.playerConfig = {
      type: "monk",
      robeColor: "#d9822b",
      sashColor: "#9e5414",
      name: "Tịnh Nghiêm 50",
      hat: false,
      halo: false,
      companion: "cat"
    };

    this.player = {
      group: null,
      hips: null,
      torso: null,
      headGroup: null,
      leftArm: null,
      rightArm: null,
      leftLeg: null,
      rightLeg: null,
      props: {},
      pos: new THREE.Vector3(0, 0, 31.5),
      rotY: Math.PI, // Quay mặt về hướng cổng chùa (-Z)
      targetPos: null,
      walkSpeed: 5.5,
      runSpeed: 9.0,
      state: "idle", // idle, walk, bow, incense, beads, chant, meditate, bell, fortune, lantern, sweep
      stateTime: 0,
      bowCount: 0,
      strikePulse: 0
    };

    this.companionObj = null;
    this.hasEnteredTemple = false;
    this.currentZone = "outside"; // outside, courtyard, mainhall
    this.activeHotspot = null;

    // Input keys & joystick
    this.keys = {};
    this.joyVec = { x: 0, y: 0 };

    // World animated objects
    this.npcs = [];
    this.koiFish = [];
    this.floatingLanterns = [];
    this.smokeParticles = [];
    this.ripples = [];
    this.leaves = [];
    this.bellPendulum = null;
    this.bellSwingVel = 0;
    this.bellSwingAngle = 0;
    this.burnerIncenseGroup = null;
    this.targetMarker = null;

    // Hotspots tương tác trong chùa
    this.hotspots = [
      {
        id: "gate",
        name: "Cổng Tam Quan",
        prompt: "Bước qua Cổng Tam Quan vào Chùa",
        pos: new THREE.Vector3(0, 0, 25.5),
        radius: 5.2,
        onlyOutside: true
      },
      {
        id: "incense",
        name: "Lư Hương Đại Đồng",
        prompt: "Thắp hương & Dâng lời nguyện (+5 Công đức)",
        pos: new THREE.Vector3(0, 0, -2.2),
        radius: 3.8
      },
      {
        id: "mainhall_altar",
        name: "Bàn Thờ Phật Tam Thế (Chánh Điện)",
        prompt: "Lạy Phật dập đầu 3 lạy (+2 Công đức)",
        pos: new THREE.Vector3(0, 0.6, -15.5),
        radius: 4.5
      },
      {
        id: "wooden_fish",
        name: "Bồ Đoàn Tụng Kinh & Mõ Gỗ",
        prompt: "Ngồi Bồ Đoàn Gõ Mõ Tụng Kinh",
        pos: new THREE.Vector3(3.2, 0.6, -14.8),
        radius: 3.2
      },
      {
        id: "beads_mat",
        name: "Bồ Đoàn Niệm Phật 108 Hạt",
        prompt: "Ngồi Lần Tràng Hạt 108 Hạt",
        pos: new THREE.Vector3(-3.2, 0.6, -14.8),
        radius: 3.2
      },
      {
        id: "bell_tower",
        name: "Gác Chuông Hai Tầng",
        prompt: "Thỉnh Đại Hồng Chuông (+3 Công đức)",
        pos: new THREE.Vector3(-11.5, 0, 2.0),
        radius: 4.0
      },
      {
        id: "fortune_tower",
        name: "Ống Xăm Gác Trống",
        prompt: "Lắc ống tre Xin Xăm đầu năm",
        pos: new THREE.Vector3(11.5, 0, 2.0),
        radius: 4.0
      },
      {
        id: "lotus_pond",
        name: "Hồ Sen Cá Koi",
        prompt: "Thả Đèn Hoa Đăng cầu nguyện (+3 Công đức)",
        pos: new THREE.Vector3(-5.8, 0, 12.5),
        radius: 4.2
      },
      {
        id: "bodhi_tree",
        name: "Cây Bồ Đề Cổ Thụ",
        prompt: "Quét lá Bồ Đề rơi (+1 Công đức / lá)",
        pos: new THREE.Vector3(9.5, 0, 13.0),
        radius: 4.2
      }
    ];

    this.init();
  }

  init() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a120b);
    this.scene.fog = new THREE.FogExp2(0x1e140c, 0.013);

    this.camera = new THREE.PerspectiveCamera(48, w / h, 0.5, 160);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.setupLights();
    this.buildEnvironment();
    this.buildTamQuanGate();
    this.buildLotusPond();
    this.buildStatuesAndPagoda();
    this.buildBellAndDrumTowers();
    this.buildBronzeBurner();
    this.buildMainHall();
    this.buildBodhiTreeAndLeaves();
    this.buildPlayer();
    this.buildCompanion();
    this.buildNPCs();
    this.buildTargetMarker();

    this.bindEvents();
    this.animate();
  }

  setupLights() {
    const hemi = new THREE.HemisphereLight(0xffe6b8, 0x382818, 0.85);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffdf9e, 1.15);
    sun.position.set(22, 36, 26);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 100;
    const d = 38;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    this.scene.add(sun);

    // Ánh sáng ấm trong Chánh Điện & Lư Hương
    const altarLight = new THREE.PointLight(0xffbb55, 1.6, 24);
    altarLight.position.set(0, 5.5, -17.5);
    this.scene.add(altarLight);

    const gateLight = new THREE.PointLight(0xff9944, 1.1, 18);
    gateLight.position.set(0, 5.0, 23.0);
    this.scene.add(gateLight);
  }

  // Tạo mái chùa cong truyền thống Việt Nam
  createCurvedRoof(width, depth, height, colorHex = 0x8c2d19) {
    const group = new THREE.Group();
    const roofMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.65 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xe6b84c, roughness: 0.35, metalness: 0.4 });

    const bodyGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.72, height, 4);
    const body = new THREE.Mesh(bodyGeo, roofMat);
    body.rotation.y = Math.PI / 4;
    body.scale.set(width / Math.max(width, depth), 1, depth / Math.max(width, depth));
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Đao mái cong 4 góc
    const corners = [
      [-width / 2, -depth / 2],
      [width / 2, -depth / 2],
      [-width / 2, depth / 2],
      [width / 2, depth / 2]
    ];
    corners.forEach(([cx, cz]) => {
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 6), goldMat);
      tip.position.set(cx * 0.96, 0.32, cz * 0.96);
      tip.rotation.z = cx > 0 ? -0.35 : 0.35;
      tip.rotation.x = cz > 0 ? 0.35 : -0.35;
      group.add(tip);
    });

    // Đỉnh nóc vàng
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(width * 0.55, 0.22, 0.26), goldMat);
    ridge.position.y = height * 0.92;
    group.add(ridge);

    return group;
  }

  buildEnvironment() {
    // Nền cỏ xanh trầm ấm xung quanh chùa
    const groundGeo = new THREE.PlaneGeometry(140, 140);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2b3b24, roughness: 0.92 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.groundMesh = ground;

    // Sân gạch tàu & đường đá dẫn từ ngoài Cổng Tam Quan (z=38) vào tới Chánh Điện (z=-24)
    const courtyardGeo = new THREE.BoxGeometry(36, 0.12, 48);
    const courtyardMat = new THREE.MeshStandardMaterial({ color: 0x594433, roughness: 0.85 });
    const courtyard = new THREE.Mesh(courtyardGeo, courtyardMat);
    courtyard.position.set(0, 0.06, -1);
    courtyard.receiveShadow = true;
    this.scene.add(courtyard);

    // Đường đá lớn từ trước Cổng Tam Quan thẳng lên Chánh Điện
    const pathGeo = new THREE.BoxGeometry(6.8, 0.16, 56);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x8c7b65, roughness: 0.75 });
    const mainPath = new THREE.Mesh(pathGeo, pathMat);
    mainPath.position.set(0, 0.08, 10);
    mainPath.receiveShadow = true;
    this.scene.add(mainPath);

    // Tường bao quanh chùa (màu vàng cổ kính, chừa lối Cổng Tam Quan ở giữa z = 23)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd9b36c, roughness: 0.8 });
    const roofTileMat = new THREE.MeshStandardMaterial({ color: 0x7d2918, roughness: 0.7 });

    const makeWallSegment = (w, d, x, z) => {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(w, 2.3, d), wallMat);
      base.position.y = 1.15;
      base.castShadow = true;
      base.receiveShadow = true;
      g.add(base);
      const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3), roofTileMat);
      top.position.y = 2.4;
      g.add(top);
      g.position.set(x, 0, z);
      this.scene.add(g);
    };

    // Tường mặt trước hai bên Cổng Tam Quan
    makeWallSegment(11, 0.5, -12.5, 23);
    makeWallSegment(11, 0.5, 12.5, 23);
    // Tường hai bên tả hữu và phía sau
    makeWallSegment(0.5, 48, -18, -1);
    makeWallSegment(0.5, 48, 18, -1);
    makeWallSegment(36, 0.5, 0, -25);

    // Đèn đá dọc lối đi
    for (let z = 28; z >= -2; z -= 6.5) {
      if (Math.abs(z - 23) < 2.5) continue;
      this.createStoneLantern(-4.2, z);
      this.createStoneLantern(4.2, z);
    }
  }

  createStoneLantern(x, z) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x998e7e, roughness: 0.85 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd479 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.4, 6), stoneMat);
    base.position.y = 0.2;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.3, 6), stoneMat);
    pole.position.y = 1.05;
    const lightBox = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), glowMat);
    lightBox.position.y = 1.9;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.45, 6), stoneMat);
    cap.position.y = 2.35;

    g.add(base, pole, lightBox, cap);
    g.position.set(x, 0, z);
    this.scene.add(g);
  }

  // Cổng Tam Quan 3 lối truyền thống ở z = 23
  buildTamQuanGate() {
    const gate = new THREE.Group();
    gate.position.set(0, 0, 23);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8f2819, roughness: 0.6 });
    const stoneBaseMat = new THREE.MeshStandardMaterial({ color: 0x7a7062, roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.35, metalness: 0.3 });
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xff4d2e });

    // 4 cột trụ lớn tạo thành 3 lối đi (Tam Quan)
    const pillarX = [-6.2, -2.4, 2.4, 6.2];
    pillarX.forEach((px, idx) => {
      const isCenter = idx === 1 || idx === 2;
      const h = isCenter ? 6.2 : 4.8;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.6, 12), stoneBaseMat);
      base.position.set(px, 0.3, 0);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, h, 14), pillarMat);
      col.position.set(px, h / 2 + 0.3, 0);
      col.castShadow = true;

      // Câu đối vàng trên cột
      const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.24, h * 0.62, 0.08), goldMat);
      plaque.position.set(px, h * 0.52, 0.34);

      gate.add(base, col, plaque);
    });

    // Xà ngang & Bảng tên "CHÙA VÔ LƯỢNG" ở cổng giữa
    const centerBeam = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.75, 0.9), pillarMat);
    centerBeam.position.set(0, 5.8, 0);
    gate.add(centerBeam);

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.95, 0.25), goldMat);
    signBoard.position.set(0, 6.1, 0.48);
    gate.add(signBoard);

    // Mái 2 tầng cổng chính + 2 mái cổng phụ
    const mainRoof1 = this.createCurvedRoof(6.6, 3.2, 1.35, 0x8c2d19);
    mainRoof1.position.set(0, 6.3, 0);
    const mainRoof2 = this.createCurvedRoof(5.0, 2.5, 1.15, 0x8c2d19);
    mainRoof2.position.set(0, 7.5, 0);

    const leftRoof = this.createCurvedRoof(4.6, 2.6, 1.1, 0x8c2d19);
    leftRoof.position.set(-4.3, 4.9, 0);
    const rightRoof = this.createCurvedRoof(4.6, 2.6, 1.1, 0x8c2d19);
    rightRoof.position.set(4.3, 4.9, 0);

    gate.add(mainRoof1, mainRoof2, leftRoof, rightRoof);

    // Đèn lồng đỏ treo dưới cổng Tam Quan
    [-4.3, -1.5, 1.5, 4.3].forEach((lx) => {
      const ly = Math.abs(lx) < 2 ? 5.1 : 4.2;
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), lanternMat);
      lantern.scale.y = 1.25;
      lantern.position.set(lx, ly, 0);
      gate.add(lantern);
    });

    this.scene.add(gate);
  }

  // Hồ Sen Cá Koi & Đèn Hoa Đăng bên trái sân chùa
  buildLotusPond() {
    const pondGroup = new THREE.Group();
    pondGroup.position.set(-9.5, 0, 12.5);

    // Thành hồ đá
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x7d7265, roughness: 0.85 });
    const border = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.45, 7.2), borderMat);
    border.position.y = 0.22;
    pondGroup.add(border);

    // Mặt nước xanh ngọc
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1b5c63,
      roughness: 0.2,
      metalness: 0.3
    });
    const water = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.36, 6.4), waterMat);
    water.position.y = 0.24;
    pondGroup.add(water);

    // Lá sen & Hoa sen hồng trên mặt hồ
    const padMat = new THREE.MeshStandardMaterial({ color: 0x3b7a3e, roughness: 0.7 });
    const lotusMat = new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.4 });
    const padCoords = [
      [-2.5, -1.8], [-1.2, 1.5], [1.8, -1.4], [2.4, 1.6], [0.2, -0.5], [-2.2, 0.6]
    ];
    padCoords.forEach(([px, pz], i) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 12), padMat);
      pad.position.set(px, 0.44, pz);
      pondGroup.add(pad);
      if (i % 2 === 0) {
        const flower = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.35, 8), lotusMat);
        flower.position.set(px, 0.62, pz);
        pondGroup.add(flower);
      }
    });

    // Đàn cá Koi bơi trong hồ
    for (let i = 0; i < 6; i++) {
      const koiColor = i % 2 === 0 ? 0xff5722 : 0xffb300;
      const koi = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.55, 6),
        new THREE.MeshStandardMaterial({ color: koiColor, roughness: 0.3 })
      );
      koi.rotation.x = Math.PI / 2;
      koi.position.set((Math.random() - 0.5) * 5, 0.39, (Math.random() - 0.5) * 4);
      pondGroup.add(koi);
      this.koiFish.push({
        mesh: koi,
        angle: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.5,
        radius: 1.2 + Math.random() * 1.4,
        cx: (Math.random() - 0.5) * 2.5,
        cz: (Math.random() - 0.5) * 1.8
      });
    }

    this.pondGroup = pondGroup;
    this.scene.add(pondGroup);

    // Thả sẵn 3 ngọn đèn hoa đăng lung linh trên hồ
    this.spawnFloatingLantern(-9.8, 12.2);
    this.spawnFloatingLantern(-8.2, 13.4);
    this.spawnFloatingLantern(-10.6, 11.4);
  }

  spawnFloatingLantern(x = -8.5 + (Math.random() - 0.5) * 3, z = 12.5 + (Math.random() - 0.5) * 3) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.18, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: 0xf06292 })
    );
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe57f })
    );
    core.position.y = 0.12;
    g.add(base, core);
    g.position.set(x, 0.46, z);
    this.scene.add(g);
    this.floatingLanterns.push({
      mesh: g,
      baseX: x,
      baseZ: z,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Tượng Quan Âm Bạch Ngọc (bên trái) & Bảo Tháp 9 Tầng (bên phải)
  buildStatuesAndPagoda() {
    // Tượng Quan Âm trắng bên trái
    const qaGroup = new THREE.Group();
    qaGroup.position.set(-11.5, 0, -6.5);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfcfaf2, roughness: 0.35 });
    const lotusMat = new THREE.MeshStandardMaterial({ color: 0xe6b85c, roughness: 0.45 });

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 1.5, 12), lotusMat);
    pedestal.position.y = 0.75;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.72, 3.2, 12), whiteMat);
    body.position.y = 3.1;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 14, 14), whiteMat);
    head.position.y = 5.0;
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.88, 24),
      new THREE.MeshBasicMaterial({ color: 0xffe082, side: THREE.DoubleSide })
    );
    halo.position.set(0, 5.0, -0.25);

    qaGroup.add(pedestal, body, head, halo);
    this.scene.add(qaGroup);

    // Bảo Tháp Cửu Phẩm (bên phải)
    const pagoda = new THREE.Group();
    pagoda.position.set(12.2, 0, -6.5);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xb88954, roughness: 0.7 });
    for (let i = 0; i < 7; i++) {
      const scale = 1 - i * 0.1;
      const y = i * 1.15;
      const tier = new THREE.Mesh(new THREE.CylinderGeometry(1.3 * scale, 1.45 * scale, 0.9, 6), towerMat);
      tier.position.y = y + 0.45;
      tier.castShadow = true;
      const roof = this.createCurvedRoof(2.8 * scale, 2.8 * scale, 0.48, 0x8c2d19);
      roof.position.y = y + 0.85;
      pagoda.add(tier, roof);
    }
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.6, roughness: 0.2 })
    );
    spire.position.y = 8.6;
    pagoda.add(spire);
    this.scene.add(pagoda);
  }

  // Gác Chuông (Trái) & Gác Trống + Ống Xăm (Phải)
  buildBellAndDrumTowers() {
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8a2a19, roughness: 0.65 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x786d5f, roughness: 0.85 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xc9963b, metalness: 0.65, roughness: 0.3 });

    // 1. Gác Chuông (-11.5, 0, 2)
    const bellTower = new THREE.Group();
    bellTower.position.set(-11.5, 0, 2.0);
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, 4.4), stoneMat);
    base1.position.y = 0.3;
    bellTower.add(base1);

    [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].forEach(([px, pz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 4.2, 10), pillarMat);
      col.position.set(px, 2.7, pz);
      col.castShadow = true;
      bellTower.add(col);
    });

    const roofB = this.createCurvedRoof(5.2, 5.2, 1.6, 0x8c2d19);
    roofB.position.y = 4.8;
    bellTower.add(roofB);

    // Đại Hồng Chuông treo lơ lửng có thể đung đưa khi thỉnh
    this.bellPendulum = new THREE.Group();
    this.bellPendulum.position.set(0, 4.3, 0);
    const bellCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.72, 1.45, 16), bronzeMat);
    bellCylinder.position.y = -0.9;
    bellCylinder.castShadow = true;
    this.bellPendulum.add(bellCylinder);
    bellTower.add(this.bellPendulum);
    this.scene.add(bellTower);

    // 2. Gác Trống & Bàn Xin Xăm (11.5, 0, 2)
    const drumTower = new THREE.Group();
    drumTower.position.set(11.5, 0, 2.0);
    const base2 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, 4.4), stoneMat);
    base2.position.y = 0.3;
    drumTower.add(base2);

    [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].forEach(([px, pz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 4.2, 10), pillarMat);
      col.position.set(px, 2.7, pz);
      col.castShadow = true;
      drumTower.add(col);
    });

    const roofD = this.createCurvedRoof(5.2, 5.2, 1.6, 0x8c2d19);
    roofD.position.y = 4.8;
    drumTower.add(roofD);

    // Bàn án thư & Ống Xăm Tre
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 1.0), pillarMat);
    table.position.set(0, 1.0, 0.6);
    const bambooTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: 0xd4a24e, roughness: 0.5 })
    );
    bambooTube.position.set(0, 1.65, 0.6);
    drumTower.add(table, bambooTube);

    this.scene.add(drumTower);
  }

  // Lư Hương Đại Đồng trước thềm Chánh Điện (0, 0, -2.2)
  buildBronzeBurner() {
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(0, 0, -2.2);

    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb8863b, metalness: 0.55, roughness: 0.38 });
    const ashMat = new THREE.MeshStandardMaterial({ color: 0xcfc6b8, roughness: 0.9 });

    // Bệ đá
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.65, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: 0x7a7062 })
    );
    ped.position.y = 0.22;
    burnerGroup.add(ped);

    // Thân lư đồng
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.85, 1.25, 16), bronzeMat);
    body.position.y = 1.15;
    body.castShadow = true;
    burnerGroup.add(body);

    // Lớp tro hương bên trong
    const ash = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.1, 16), ashMat);
    ash.position.y = 1.75;
    burnerGroup.add(ash);

    // Nhóm các nén hương đang cháy trong lư
    this.burnerIncenseGroup = new THREE.Group();
    this.burnerIncenseGroup.position.y = 1.8;
    burnerGroup.add(this.burnerIncenseGroup);

    // Cắm sẵn 5 nén hương ban đầu
    for (let i = 0; i < 5; i++) {
      this.addIncenseStickToBurner((i - 2) * 0.15, (Math.random() - 0.5) * 0.2);
    }

    this.scene.add(burnerGroup);
  }

  addIncenseStickToBurner(offsetX = (Math.random() - 0.5) * 0.6, offsetZ = (Math.random() - 0.5) * 0.4) {
    if (!this.burnerIncenseGroup) return;
    const stick = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.65, 6),
      new THREE.MeshBasicMaterial({ color: 0xb71c1c })
    );
    stem.position.y = 0.32;
    const ember = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff6d00 })
    );
    ember.position.y = 0.66;
    stick.add(stem, ember);
    stick.position.set(offsetX, 0, offsetZ);
    this.burnerIncenseGroup.add(stick);
  }

  // Ngôi Chánh Điện Tam Bảo (z từ -8 đến -22)
  buildMainHall() {
    const hall = new THREE.Group();
    hall.position.set(0, 0, -15.5);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x857867, roughness: 0.8 });
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x9e241b, roughness: 0.75 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x5c341d, roughness: 0.6 });
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8f2416, roughness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffca4b, metalness: 0.65, roughness: 0.25 });

    // Nền thềm đá Chánh Điện cao 0.6m
    const platform = new THREE.Mesh(new THREE.BoxGeometry(20, 0.6, 13), stoneMat);
    platform.position.y = 0.3;
    platform.receiveShadow = true;
    hall.add(platform);

    // Sàn gỗ lim trong Chánh Điện
    const woodFloor = new THREE.Mesh(new THREE.BoxGeometry(18.6, 0.64, 11.6), floorMat);
    woodFloor.position.y = 0.31;
    woodFloor.receiveShadow = true;
    hall.add(woodFloor);

    // Bậc thềm & Thảm đỏ dẫn lên Chánh Điện
    for (let s = 0; s < 4; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.15, 0.7), stoneMat);
      step.position.set(0, s * 0.15 + 0.075, 6.8 - s * 0.55);
      hall.add(step);
    }
    const carpet = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.66, 13.5), carpetMat);
    carpet.position.set(0, 0.33, 1.2);
    hall.add(carpet);

    // Hàng cột lim đỏ son thếp vàng (mở thoáng mặt trước để camera nhìn rõ nhân vật hành lễ bên trong)
    const cols = [
      [-8.2, 5.2], [-4.2, 5.2], [4.2, 5.2], [8.2, 5.2],
      [-8.2, 0], [8.2, 0],
      [-8.2, -5.2], [-4.2, -5.2], [4.2, -5.2], [8.2, -5.2]
    ];
    cols.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 6.2, 12), pillarMat);
      col.position.set(cx, 3.6, cz);
      col.castShadow = true;
      hall.add(col);
    });

    // Tường hậu cung phía sau bàn thờ Phật
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(17.2, 6.0, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x691b12, roughness: 0.7 })
    );
    backWall.position.set(0, 3.5, -5.4);
    hall.add(backWall);

    // Bàn thờ Tam Thế Phật
    const altarBase = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.5, 2.6), pillarMat);
    altarBase.position.set(0, 1.35, -3.6);
    altarBase.castShadow = true;
    hall.add(altarBase);

    const altarTrim = new THREE.Mesh(new THREE.BoxGeometry(10.7, 0.22, 2.8), goldMat);
    altarTrim.position.set(0, 2.1, -3.6);
    hall.add(altarTrim);

    // Ba pho tượng Phật Tam Thế bằng vàng có hào quang tỏa sáng
    [-3.2, 0, 3.2].forEach((bx, idx) => {
      const scale = idx === 1 ? 1.18 : 0.95;
      const bGroup = new THREE.Group();
      bGroup.position.set(bx, 2.2, -3.6);
      bGroup.scale.setScalar(scale);

      // Đài sen vàng
      const lotusThrone = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.75, 0.45, 12), goldMat);
      lotusThrone.position.y = 0.22;
      // Thân tượng ngồi kiết già
      const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.9, 0.42, 12), goldMat);
      legs.position.y = 0.62;
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.65, 1.15, 12), goldMat);
      torso.position.y = 1.35;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 14), goldMat);
      head.position.y = 2.15;
      const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), goldMat);
      ushnisha.position.y = 2.52;

      // Vòng hào quang sau lưng Phật
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.85, 1.18, 28),
        new THREE.MeshBasicMaterial({ color: 0xffe57f, side: THREE.DoubleSide })
      );
      halo.position.set(0, 1.95, -0.35);

      bGroup.add(lotusThrone, legs, torso, head, ushnisha, halo);
      hall.add(bGroup);
    });

    // 3 Chiếu Bồ Đoàn (đệm quỳ lạy / ngồi thiền / tụng kinh)
    const cushionPositions = [
      { x: 0, z: 0.4, color: 0xd9822b },     // Giữa: Bồ đoàn Lạy Phật
      { x: -3.2, z: 0.9, color: 0xb8742a },  // Trái: Bồ đoàn Tràng hạt
      { x: 3.2, z: 0.9, color: 0xb8742a }    // Phải: Bồ đoàn Tụng kinh & Mõ gỗ
    ];
    cushionPositions.forEach((cp) => {
      const cushion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.82, 0.18, 18),
        new THREE.MeshStandardMaterial({ color: cp.color, roughness: 0.7 })
      );
      cushion.position.set(cp.x, 0.69, cp.z);
      hall.add(cushion);
    });

    // Cái Mõ Gỗ lớn bên cạnh Bồ đoàn bên phải (3.2, 0.7, -0.1)
    const woodenFish = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xa63a24, roughness: 0.4 })
    );
    woodenFish.scale.set(1.2, 0.85, 1.0);
    woodenFish.position.set(3.8, 0.85, -0.1);
    hall.add(woodenFish);

    // Mái Chánh Điện (đặt cao để không che khuất tầm nhìn vào bàn thờ Phật)
    const hallRoof1 = this.createCurvedRoof(22, 15, 2.6, 0x8c2d19);
    hallRoof1.position.y = 6.6;
    const hallRoof2 = this.createCurvedRoof(17, 11.5, 2.2, 0x8c2d19);
    hallRoof2.position.y = 8.8;
    hall.add(hallRoof1, hallRoof2);

    this.scene.add(hall);
  }

  // Cây Bồ Đề Cổ Thụ & Lá vàng rơi trên sân (9.5, 0, 13.0)
  buildBodhiTreeAndLeaves() {
    const tree = new THREE.Group();
    tree.position.set(9.5, 0, 13.0);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.95, 3.8, 10),
      new THREE.MeshStandardMaterial({ color: 0x5c4028, roughness: 0.9 })
    );
    trunk.position.y = 1.9;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x3f7036, roughness: 0.8 });
    const crowns = [
      [0, 4.6, 0, 2.6],
      [-1.6, 3.9, 0.8, 1.9],
      [1.6, 4.0, -0.6, 2.0],
      [0.4, 3.8, 1.5, 1.8]
    ];
    crowns.forEach(([cx, cy, cz, r]) => {
      const crown = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), foliageMat);
      crown.position.set(cx, cy, cz);
      crown.castShadow = true;
      tree.add(crown);
    });

    this.scene.add(tree);

    // Tạo 12 chiếc lá bồ đề vàng rơi quanh gốc cây để người chơi quét lá
    const leafMat = new THREE.MeshBasicMaterial({ color: 0xf5b942, side: THREE.DoubleSide });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 1.8 + (i % 3) * 1.1;
      const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.18, 6), leafMat);
      leaf.rotation.x = -Math.PI / 2;
      leaf.position.set(9.5 + Math.cos(angle) * dist, 0.14, 13.0 + Math.sin(angle) * dist);
      this.scene.add(leaf);
      this.leaves.push(leaf);
    }
  }

  // Tạo mô hình nhân vật 3D Chibi có khớp tay, chân, lưng, đầu & đạo cụ hành lễ
  createCharacterMesh(config) {
    const root = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cfa6, roughness: 0.55 });
    const robeMat = new THREE.MeshStandardMaterial({ color: config.robeColor || "#d9822b", roughness: 0.65 });
    const sashMat = new THREE.MeshStandardMaterial({ color: config.sashColor || "#9e5414", roughness: 0.7 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x26170c, roughness: 0.5 });

    // Hông (Hips) làm tâm chuyển động quỳ/ngồi
    const hips = new THREE.Group();
    hips.position.y = 0.75;
    root.add(hips);

    // Hai chân
    const legGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.65, 10);
    const leftLeg = new THREE.Mesh(legGeo, darkMat);
    leftLeg.position.set(-0.18, -0.32, 0);
    const rightLeg = new THREE.Mesh(legGeo, darkMat);
    rightLeg.position.set(0.18, -0.32, 0);
    hips.add(leftLeg, rightLeg);

    // Thân trên (Torso) làm tâm cúi lạy (bow / dập đầu)
    const torso = new THREE.Group();
    hips.add(torso);

    const robeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 0.98, 14), robeMat);
    robeBody.position.y = 0.35;
    robeBody.castShadow = true;
    torso.add(robeBody);

    const sash = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.43, 0.16, 14), sashMat);
    sash.position.y = 0.25;
    torso.add(sash);

    // Tràng hạt đeo cổ
    const neckBeads = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.04, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x5c3618, roughness: 0.6 })
    );
    neckBeads.rotation.x = Math.PI / 2 + 0.25;
    neckBeads.position.set(0, 0.78, 0.06);
    torso.add(neckBeads);

    // Đầu (Head)
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.18;
    torso.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.44, 18, 16), skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Mắt to tròn
    const eyeGeo = new THREE.SphereGeometry(0.055, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, darkMat);
    leftEye.position.set(-0.15, 0.02, 0.39);
    const rightEye = new THREE.Mesh(eyeGeo, darkMat);
    rightEye.position.set(0.15, 0.02, 0.39);
    headGroup.add(leftEye, rightEye);

    // Tóc theo loại nhân vật (Tiểu tăng / Phật tử nam / Phật tử nữ)
    const hairGroup = new THREE.Group();
    if (config.type === "male") {
      const hairCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.455, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
        darkMat
      );
      hairCap.rotation.x = -0.18;
      hairGroup.add(hairCap);
    } else if (config.type === "female") {
      const hairCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.46, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
        darkMat
      );
      hairCap.rotation.x = -0.22;
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), darkMat);
      bun.position.set(0, 0.32, -0.35);
      hairGroup.add(hairCap, bun);
    }
    headGroup.add(hairGroup);

    // Nón lá & Hào quang (tùy chọn)
    const conicalHat = new THREE.Mesh(
      new THREE.ConeGeometry(0.68, 0.36, 16),
      new THREE.MeshStandardMaterial({ color: 0xe6cf9c, roughness: 0.7 })
    );
    conicalHat.position.y = 0.42;
    conicalHat.visible = !!config.hat;
    headGroup.add(conicalHat);

    const charHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.68, 24),
      new THREE.MeshBasicMaterial({ color: 0xffe082, side: THREE.DoubleSide })
    );
    charHalo.position.set(0, 0.1, -0.32);
    charHalo.visible = !!config.halo;
    headGroup.add(charHalo);

    // Hai cánh tay (Left & Right Arm)
    const armGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.56, 10);
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.42, 0.72, 0);
    const leftSleeve = new THREE.Mesh(armGeo, robeMat);
    leftSleeve.position.y = -0.22;
    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
    leftHand.position.y = -0.5;
    leftArm.add(leftSleeve, leftHand);
    torso.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.42, 0.72, 0);
    const rightSleeve = new THREE.Mesh(armGeo, robeMat);
    rightSleeve.position.y = -0.22;
    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
    rightHand.position.y = -0.5;
    rightArm.add(rightSleeve, rightHand);
    torso.add(rightArm);

    // Đạo cụ trên tay nhân vật khi thực hiện nghi thức:
    // 1. Ba nén hương đỏ rực khi Thắp Hương
    const incenseProp = new THREE.Group();
    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.65, 6),
        new THREE.MeshBasicMaterial({ color: 0xd32f2f })
      );
      stick.position.set(i * 0.04, 0.3, 0);
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff9100 })
      );
      tip.position.set(i * 0.04, 0.63, 0);
      incenseProp.add(stick, tip);
    }
    incenseProp.position.set(0, 0.65, 0.48);
    incenseProp.visible = false;
    torso.add(incenseProp);

    // 2. Dùi gõ mõ trên tay phải
    const malletProp = new THREE.Group();
    const malletStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6),
      new THREE.MeshStandardMaterial({ color: 0x8d5524 })
    );
    malletStick.rotation.x = Math.PI / 2;
    malletStick.position.z = 0.2;
    const malletHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xd9822b })
    );
    malletHead.position.z = 0.42;
    malletProp.add(malletStick, malletHead);
    malletProp.position.set(0, -0.5, 0);
    malletProp.visible = false;
    rightArm.add(malletProp);

    // 3. Chổi tre khi quét lá
    const broomProp = new THREE.Group();
    const broomPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6),
      new THREE.MeshStandardMaterial({ color: 0xc29b53 })
    );
    const broomBrush = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.48, 8),
      new THREE.MeshStandardMaterial({ color: 0xd9b86c })
    );
    broomBrush.position.y = -0.65;
    broomProp.add(broomPole, broomBrush);
    broomProp.position.set(0, -0.35, 0.25);
    broomProp.rotation.x = 0.35;
    broomProp.visible = false;
    rightArm.add(broomProp);

    // 4. Vòng hào quang thiền định / tràng hạt xoay quanh người
    const auraSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 18, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd54f, transparent: true, opacity: 0.18, wireframe: true })
    );
    auraSphere.position.y = 0.9;
    auraSphere.visible = false;
    root.add(auraSphere);

    return {
      root,
      hips,
      torso,
      headGroup,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      robeMat,
      sashMat,
      hairGroup,
      conicalHat,
      charHalo,
      props: {
        incense: incenseProp,
        mallet: malletProp,
        broom: broomProp,
        aura: auraSphere
      }
    };
  }

  buildPlayer() {
    if (this.player.group) {
      this.scene.remove(this.player.group);
    }
    const built = this.createCharacterMesh(this.playerConfig);
    this.player.group = built.root;
    this.player.hips = built.hips;
    this.player.torso = built.torso;
    this.player.headGroup = built.headGroup;
    this.player.leftArm = built.leftArm;
    this.player.rightArm = built.rightArm;
    this.player.leftLeg = built.leftLeg;
    this.player.rightLeg = built.rightLeg;
    this.player.props = built.props;

    this.player.group.position.copy(this.player.pos);
    this.player.group.rotation.y = this.player.rotY;
    this.scene.add(this.player.group);
  }

  updatePlayerAppearance(newConfig) {
    Object.assign(this.playerConfig, newConfig);
    const curPos = this.player.pos.clone();
    const curRot = this.player.rotY;
    this.buildPlayer();
    this.player.pos.copy(curPos);
    this.player.rotY = curRot;
    this.player.group.position.copy(curPos);
    this.player.group.rotation.y = curRot;
    this.buildCompanion();
  }

  // Linh thú đi theo nhân vật
  buildCompanion() {
    if (this.companionObj) {
      this.scene.remove(this.companionObj);
      this.companionObj = null;
    }
    const type = this.playerConfig.companion;
    if (!type || type === "none") return;

    const g = new THREE.Group();
    const colorMap = {
      cat: 0xf5a642,
      sparrow: 0x9ec4e8,
      rabbit: 0xfff5eb,
      turtle: 0x689f38,
      crane: 0xffffff
    };
    const mat = new THREE.MeshStandardMaterial({ color: colorMap[type] || 0xf5a642, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), mat);
    body.scale.set(1, 0.85, 1.25);
    body.position.y = 0.24;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), mat);
    head.position.set(0, 0.42, 0.22);
    g.add(body, head);

    // Tai mèo / thỏ
    if (type === "cat" || type === "rabbit") {
      const earH = type === "rabbit" ? 0.26 : 0.12;
      const earGeo = new THREE.ConeGeometry(0.06, earH, 6);
      const earL = new THREE.Mesh(earGeo, mat);
      earL.position.set(-0.09, 0.58, 0.22);
      const earR = new THREE.Mesh(earGeo, mat);
      earR.position.set(0.09, 0.58, 0.22);
      g.add(earL, earR);
    }

    g.position.set(this.player.pos.x - 1.2, this.player.pos.y, this.player.pos.z + 1.0);
    this.scene.add(g);
    this.companionObj = g;
  }

  // Tạo các NPC Sư Thầy đi dạo, Chú Tiểu quét lá, Phật tử lễ chùa
  buildNPCs() {
    const npcDefs = [
      {
        name: "Sư Thầy Thích Tâm An",
        type: "monk",
        robeColor: "#c97a1d",
        sashColor: "#7a440d",
        x: -3.8,
        z: 6.0,
        patrolZ: [2.0, 14.0],
        dir: 1
      },
      {
        name: "Chú Tiểu Tịnh Không",
        type: "monk",
        robeColor: "#e86f2c",
        sashColor: "#9e4212",
        x: 6.8,
        z: 11.5,
        patrolZ: [8.0, 15.0],
        dir: -1
      },
      {
        name: "Phật Tử Diệu Liên",
        type: "female",
        robeColor: "#64768c",
        sashColor: "#3f4d5e",
        x: -2.2,
        z: -4.5,
        patrolZ: [-6.5, 1.5],
        dir: 1
      }
    ];

    npcDefs.forEach((def) => {
      const built = this.createCharacterMesh(def);
      built.root.position.set(def.x, 0, def.z);
      this.scene.add(built.root);
      this.npcs.push({
        ...def,
        mesh: built,
        phase: Math.random() * 10
      });
    });
  }

  buildTargetMarker() {
    const ringGeo = new THREE.RingGeometry(0.32, 0.48, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd54f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.targetMarker = new THREE.Mesh(ringGeo, ringMat);
    this.targetMarker.rotation.x = -Math.PI / 2;
    this.targetMarker.visible = false;
    this.scene.add(this.targetMarker);
  }

  // Tạo hiệu ứng vòng sóng hào quang vàng dưới đất khi lạy Phật, gõ mõ, thỉnh chuông
  spawnGoldenRipple(x, y, z, maxScale = 4.0, colorHex = 0xffd54f) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.55, 32),
      new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y + 0.08, z);
    this.scene.add(mesh);
    this.ripples.push({ mesh, scale: 1, maxScale, opacity: 0.9 });
  }

  // Tạo làn khói trầm hương bay lên từ Lư Hương
  spawnIncenseSmoke(count = 6) {
    for (let i = 0; i < count; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0xf5efe6,
          transparent: true,
          opacity: 0.55
        })
      );
      puff.position.set(
        (Math.random() - 0.5) * 0.6,
        2.3 + Math.random() * 0.3,
        -2.2 + (Math.random() - 0.5) * 0.4
      );
      this.scene.add(puff);
      this.smokeParticles.push({
        mesh: puff,
        vy: 0.7 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        life: 1.0
      });
    }
  }

  // Chuyển nhanh vị trí nhân vật hoặc cho nhân vật tự đi tới điểm hành lễ
  walkTo(x, z, onArrive = null) {
    this.resetPlayerPose();
    this.player.state = "walk";
    this.player.targetPos = new THREE.Vector3(x, this.getFloorHeight(x, z), z);
    this.player.onArrive = onArrive;
    if (this.targetMarker) {
      this.targetMarker.position.set(x, this.player.targetPos.y + 0.12, z);
      this.targetMarker.visible = true;
    }
  }

  teleportTo(zone) {
    this.resetPlayerPose();
    this.player.targetPos = null;
    if (this.targetMarker) this.targetMarker.visible = false;

    if (zone === "gate") {
      this.player.pos.set(0, 0, 31.0);
      this.player.rotY = Math.PI;
    } else if (zone === "courtyard") {
      this.player.pos.set(0, 0, 14.0);
      this.player.rotY = Math.PI;
    } else if (zone === "mainhall") {
      this.player.pos.set(0, 0.6, -13.2);
      this.player.rotY = Math.PI;
    }
    this.checkZoneTransition();
  }

  getFloorHeight(x, z) {
    // Nền Chánh Điện cao 0.6m
    if (Math.abs(x) < 9.8 && z < -8.5 && z > -22.2) {
      return 0.6;
    }
    return 0;
  }

  resetPlayerPose() {
    const p = this.player;
    p.state = "idle";
    p.stateTime = 0;
    p.hips.position.set(0, 0.75, 0);
    p.hips.rotation.set(0, 0, 0);
    p.torso.position.set(0, 0, 0);
    p.torso.rotation.set(0, 0, 0);
    p.headGroup.rotation.set(0, 0, 0);
    p.leftArm.rotation.set(0, 0, 0);
    p.rightArm.rotation.set(0, 0, 0);
    p.leftLeg.rotation.set(0, 0, 0);
    p.rightLeg.rotation.set(0, 0, 0);

    Object.values(p.props).forEach((prop) => {
      if (prop) prop.visible = false;
    });
  }

  // Kích hoạt các Animation Nghi Thức Hành Lễ của nhân vật
  startRitualAction(actionName) {
    const p = this.player;
    p.targetPos = null;
    if (this.targetMarker) this.targetMarker.visible = false;
    this.resetPlayerPose();

    p.state = actionName;
    p.stateTime = 0;
    p.rotY = Math.PI; // Hướng mặt về phía bàn thờ Phật (-Z)

    if (actionName === "bow") {
      // Lạy Phật (chắp tay -> quỳ xuống -> dập đầu 3 lạy)
      p.bowCount = 0;
      window.templeAudio?.playBowlChime();
      this.spawnGoldenRipple(p.pos.x, p.pos.y, p.pos.z, 3.8);
    } else if (actionName === "incense") {
      // Cầm 3 nén hương dâng lễ trước Lư Hương Đồng
      p.props.incense.visible = true;
      this.addIncenseStickToBurner();
      this.spawnIncenseSmoke(10);
      this.spawnGoldenRipple(0, 0, -2.2, 4.2, 0xffab40);
    } else if (actionName === "beads") {
      // Ngồi xếp bằng lần tràng hạt 108 hạt
      p.props.aura.visible = true;
    } else if (actionName === "chant") {
      // Ngồi trước mõ gỗ gõ mõ tụng kinh
      p.props.mallet.visible = true;
    } else if (actionName === "meditate") {
      // Ngồi thiền định
      p.props.aura.visible = true;
    } else if (actionName === "bell") {
      // Thỉnh Đại Hồng Chuông
      this.bellSwingVel = 1.65;
      window.templeAudio?.playGreatBell();
      this.spawnGoldenRipple(-11.5, 0, 2.0, 9.5, 0xffd54f);
    } else if (actionName === "fortune") {
      // Lắc ống xăm
      window.templeAudio?.playFortuneShake();
    } else if (actionName === "lantern") {
      // Thả đèn hoa đăng xuống Hồ Sen
      this.spawnFloatingLantern();
      this.spawnGoldenRipple(-7.5, 0.4, 12.5, 3.5, 0xf48fb1);
    } else if (actionName === "sweep") {
      // Cầm chổi tre quét lá Bồ Đề
      p.props.broom.visible = true;
    }
  }

  // Mỗi nhịp gõ mõ (bấm tay hoặc tự động) nhân vật vung dùi gõ xuống mõ
  triggerWoodenFishStrike() {
    this.player.strikePulse = 1.0;
    window.templeAudio?.playWoodenFish();
    this.spawnGoldenRipple(this.player.pos.x, this.player.pos.y, this.player.pos.z, 2.8, 0xffca28);
  }

  // Mỗi lần bấm hạt tràng hạt
  triggerBeadPulse() {
    this.player.strikePulse = 0.8;
    window.templeAudio?.playBeadClick();
    this.spawnGoldenRipple(this.player.pos.x, this.player.pos.y, this.player.pos.z, 2.2, 0xffe082);
  }

  bindEvents() {
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    const dom = this.renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    dom.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      this.dragMoved = false;
      this.prevPointer.x = e.clientX;
      this.prevPointer.y = e.clientY;
    });

    window.addEventListener("pointermove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevPointer.x;
      const dy = e.clientY - this.prevPointer.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        this.dragMoved = true;
      }
      this.camYaw -= dx * 0.0065;
      this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch + dy * 0.005));
      this.prevPointer.x = e.clientX;
      this.prevPointer.y = e.clientY;
    });

    window.addEventListener("pointerup", (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      // Click xuống mặt đất để nhân vật tự đi tới điểm đó
      if (!this.dragMoved && e.target === dom) {
        const rect = dom.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        const hits = raycaster.intersectObject(this.groundMesh);
        if (hits.length > 0) {
          const pt = hits[0].point;
          const clampedX = Math.max(-16.5, Math.min(16.5, pt.x));
          const clampedZ = Math.max(-21.0, Math.min(36.0, pt.z));
          this.walkTo(clampedX, clampedZ);
        }
      }
    });

    dom.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.zoomCamera(e.deltaY * 0.01);
    }, { passive: false });

    window.addEventListener("resize", () => {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  zoomCamera(delta) {
    this.camDist = Math.max(5.5, Math.min(24.0, this.camDist + delta));
  }

  checkZoneTransition() {
    const z = this.player.pos.z;
    let newZone = "courtyard";
    if (z > 22.8) {
      newZone = "outside";
    } else if (z < -8.5 && Math.abs(this.player.pos.x) < 10) {
      newZone = "mainhall";
    }

    // Khi nhân vật lần đầu bước qua Cổng Tam Quan (z <= 22.8)
    if (!this.hasEnteredTemple && z <= 22.8) {
      this.hasEnteredTemple = true;
      window.templeAudio?.playGreatBell();
      this.spawnGoldenRipple(this.player.pos.x, 0, 22.0, 6.0, 0xffd54f);
      if (this.callbacks.onEnterTemple) {
        this.callbacks.onEnterTemple();
      }
    }

    if (newZone !== this.currentZone) {
      this.currentZone = newZone;
      if (this.callbacks.onZoneChange) {
        this.callbacks.onZoneChange(newZone);
      }
    }
  }

  updatePlayerAnimation(dt) {
    const p = this.player;
    p.stateTime += dt;
    if (p.strikePulse > 0) {
      p.strikePulse = Math.max(0, p.strikePulse - dt * 4.5);
    }

    if (p.state === "walk") {
      const freq = 11.0;
      const swing = Math.sin(p.stateTime * freq) * 0.55;
      p.leftLeg.rotation.x = swing;
      p.rightLeg.rotation.x = -swing;
      p.leftArm.rotation.x = -swing * 0.75;
      p.rightArm.rotation.x = swing * 0.75;
      p.hips.position.y = 0.75 + Math.abs(Math.sin(p.stateTime * freq)) * 0.06;
    } else if (p.state === "idle") {
      const breath = Math.sin(p.stateTime * 2.4) * 0.03;
      p.hips.position.y = 0.75 + breath;
      p.leftArm.rotation.x = breath;
      p.rightArm.rotation.x = breath;
    } else if (p.state === "bow") {
      // Animation Lạy Phật Dập Đầu (chu kỳ 3.2 giây / 1 lạy):
      // 0.0 - 0.7s: Đứng trang nghiêm chắp tay trước ngực
      // 0.7 - 1.3s: Quỳ xuống chiếu bồ đoàn
      // 1.3 - 2.3s: Cúi gập lưng dập đầu sát đất, hai bàn tay xòe nâng chân Phật
      // 2.3 - 3.2s: Ngẩng lên chắp tay hoàn thành 1 lạy
      const cycleDuration = 3.2;
      const cycle = p.stateTime % cycleDuration;
      const currentBowIdx = Math.floor(p.stateTime / cycleDuration);

      if (currentBowIdx > p.bowCount && currentBowIdx < 3) {
        p.bowCount = currentBowIdx;
        window.templeAudio?.playBowlChime();
        this.spawnGoldenRipple(p.pos.x, p.pos.y, p.pos.z, 3.8);
        if (this.callbacks.onBowComplete) {
          this.callbacks.onBowComplete(currentBowIdx);
        }
      }

      if (p.stateTime >= cycleDuration * 3) {
        if (this.callbacks.onBowComplete) {
          this.callbacks.onBowComplete(3, true);
        }
        this.resetPlayerPose();
        return;
      }

      if (cycle < 0.7) {
        // Giai đoạn 1: Chắp tay trước ngực
        const k = cycle / 0.7;
        p.hips.position.y = 0.75;
        p.torso.rotation.x = k * 0.18;
        p.leftArm.rotation.set(-0.95 * k, 0, -0.38 * k);
        p.rightArm.rotation.set(-0.95 * k, 0, 0.38 * k);
      } else if (cycle < 1.3) {
        // Giai đoạn 2: Quỳ gối xuống bồ đoàn
        const k = (cycle - 0.7) / 0.6;
        p.hips.position.y = 0.75 - k * 0.34;
        p.leftLeg.rotation.x = -k * 1.35;
        p.rightLeg.rotation.x = -k * 1.35;
        p.torso.rotation.x = 0.18 + k * 0.25;
        p.leftArm.rotation.set(-0.95, 0, -0.38);
        p.rightArm.rotation.set(-0.95, 0, 0.38);
      } else if (cycle < 2.3) {
        // Giai đoạn 3: Dập đầu sát chiếu (cúi gập thân trước + vươn hai tay)
        const sub = (cycle - 1.3) / 1.0;
        const dip = Math.sin(sub * Math.PI); // Đỉnh điểm dập đầu ở sub = 0.5
        p.hips.position.y = 0.41 - dip * 0.08;
        p.leftLeg.rotation.x = -1.35;
        p.rightLeg.rotation.x = -1.35;
        p.torso.rotation.x = 0.43 + dip * 1.05; // Cúi gập sâu sát đất
        p.headGroup.rotation.x = dip * 0.38;
        p.leftArm.rotation.set(-0.95 - dip * 0.85, 0, -0.38 + dip * 0.2);
        p.rightArm.rotation.set(-0.95 - dip * 0.85, 0, 0.38 - dip * 0.2);
      } else {
        // Giai đoạn 4: Nâng người đứng dậy chắp tay
        const k = 1 - (cycle - 2.3) / 0.9;
        p.hips.position.y = 0.75 - k * 0.34;
        p.leftLeg.rotation.x = -k * 1.35;
        p.rightLeg.rotation.x = -k * 1.35;
        p.torso.rotation.x = k * 0.35;
        p.headGroup.rotation.x = 0;
        p.leftArm.rotation.set(-0.95, 0, -0.38);
        p.rightArm.rotation.set(-0.95, 0, 0.38);
      }
    } else if (p.state === "incense") {
      // Animation Thắp Hương: Hai tay nâng 3 nén hương ngang trán và vái 3 vái
      const bowWave = Math.sin(p.stateTime * 4.2) * 0.32;
      p.torso.rotation.x = Math.max(0, bowWave);
      p.headGroup.rotation.x = Math.max(0, bowWave * 0.6);
      p.leftArm.rotation.set(-1.35, 0, -0.32);
      p.rightArm.rotation.set(-1.35, 0, 0.32);
    } else if (p.state === "beads" || p.state === "meditate") {
      // Ngồi kiết già trên bồ đoàn
      p.hips.position.y = 0.42;
      p.leftLeg.rotation.set(-1.2, 0, 0.5);
      p.rightLeg.rotation.set(-1.2, 0, -0.5);
      p.leftArm.rotation.set(-0.75, 0, -0.35);
      p.rightArm.rotation.set(-0.75 - p.strikePulse * 0.35, 0, 0.35);
      if (p.props.aura) {
        const s = 1 + Math.sin(p.stateTime * 1.6) * 0.12;
        p.props.aura.scale.setScalar(s);
        p.props.aura.rotation.y += dt * 0.4;
      }
    } else if (p.state === "chant") {
      // Ngồi gõ mõ tụng kinh: Tay phải cầm dùi gõ nhịp xuống mõ
      p.hips.position.y = 0.42;
      p.leftLeg.rotation.set(-1.2, 0, 0.5);
      p.rightLeg.rotation.set(-1.2, 0, -0.5);
      p.leftArm.rotation.set(-0.7, 0, -0.3);
      p.rightArm.rotation.set(-0.85 + p.strikePulse * 0.65, 0, 0.15);
      p.torso.rotation.x = Math.sin(p.stateTime * 3.0) * 0.05 + p.strikePulse * 0.08;
    } else if (p.state === "sweep") {
      // Quét lá Bồ Đề: Hai tay cầm chổi đưa qua lại
      const sw = Math.sin(p.stateTime * 6.0) * 0.55;
      p.torso.rotation.y = sw * 0.35;
      p.torso.rotation.x = 0.22;
      p.rightArm.rotation.set(-0.75, 0, sw);
      p.leftArm.rotation.set(-0.65, 0, sw * 0.8);
      if (p.stateTime > 2.2) {
        this.resetPlayerPose();
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const p = this.player;

    // 1. Xử lý di chuyển bằng bàn phím WASD / Mũi tên / Joystick
    let moveX = this.joyVec.x;
    let moveZ = this.joyVec.y;
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) moveZ -= 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) moveZ += 1;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) moveX -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) moveX += 1;

    const isRunning = this.keys["ShiftLeft"] || this.keys["ShiftRight"];
    const speed = isRunning ? p.runSpeed : p.walkSpeed;

    if (Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05) {
      if (p.state !== "walk") {
        this.resetPlayerPose();
        p.state = "walk";
      }
      p.targetPos = null;
      if (this.targetMarker) this.targetMarker.visible = false;

      // Chuyển hướng theo góc xoay camera
      const len = Math.hypot(moveX, moveZ);
      const nx = moveX / len;
      const nz = moveZ / len;
      const sinY = Math.sin(this.camYaw);
      const cosY = Math.cos(this.camYaw);
      const wx = nx * cosY + nz * sinY;
      const wz = -nx * sinY + nz * cosY;

      p.pos.x = Math.max(-16.5, Math.min(16.5, p.pos.x + wx * speed * dt));
      p.pos.z = Math.max(-21.0, Math.min(36.0, p.pos.z + wz * speed * dt));
      p.pos.y = this.getFloorHeight(p.pos.x, p.pos.z);
      p.rotY = Math.atan2(wx, wz);
      this.checkZoneTransition();
    } else if (p.targetPos) {
      // Di chuyển tự động tới điểm click chuột
      const dx = p.targetPos.x - p.pos.x;
      const dz = p.targetPos.z - p.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.25) {
        p.pos.x = p.targetPos.x;
        p.pos.z = p.targetPos.z;
        p.pos.y = this.getFloorHeight(p.pos.x, p.pos.z);
        p.targetPos = null;
        if (this.targetMarker) this.targetMarker.visible = false;
        this.resetPlayerPose();
        this.checkZoneTransition();
        if (p.onArrive) {
          const cb = p.onArrive;
          p.onArrive = null;
          cb();
        }
      } else {
        p.state = "walk";
        const step = Math.min(dist, speed * dt);
        p.pos.x += (dx / dist) * step;
        p.pos.z += (dz / dist) * step;
        p.pos.y = this.getFloorHeight(p.pos.x, p.pos.z);
        p.rotY = Math.atan2(dx, dz);
        this.checkZoneTransition();
      }
    } else if (p.state === "walk") {
      this.resetPlayerPose();
    }

    // 2. Cập nhật vị trí & animation nhân vật
    this.updatePlayerAnimation(dt);
    p.group.position.copy(p.pos);
    p.group.rotation.y = p.rotY;

    // 3. Cập nhật Linh Thú đi theo sau nhân vật
    if (this.companionObj) {
      const targetX = p.pos.x - Math.sin(p.rotY) * 1.35 + Math.cos(p.rotY) * 0.75;
      const targetZ = p.pos.z - Math.cos(p.rotY) * 1.35 - Math.sin(p.rotY) * 0.75;
      this.companionObj.position.x += (targetX - this.companionObj.position.x) * 4.5 * dt;
      this.companionObj.position.z += (targetZ - this.companionObj.position.z) * 4.5 * dt;
      this.companionObj.position.y = p.pos.y + Math.abs(Math.sin(this.clock.elapsedTime * 5)) * 0.08;
      this.companionObj.rotation.y = p.rotY;
    }

    // 4. Kiểm tra điểm tương tác gần nhất (Hotspot [E])
    let nearest = null;
    let minDist = Infinity;
    this.hotspots.forEach((h) => {
      if (h.onlyOutside && this.hasEnteredTemple && this.currentZone !== "outside") return;
      const d = Math.hypot(p.pos.x - h.pos.x, p.pos.z - h.pos.z);
      if (d <= h.radius && d < minDist) {
        minDist = d;
        nearest = h;
      }
    });
    if (nearest?.id !== this.activeHotspot?.id) {
      this.activeHotspot = nearest;
      if (this.callbacks.onHotspotChange) {
        this.callbacks.onHotspotChange(nearest);
      }
    }

    // 5. Cập nhật Chuông Chùa đung đưa, Cá Koi bơi, Đèn hoa đăng trôi, Khói hương, Sóng hào quang
    if (this.bellPendulum) {
      this.bellSwingVel -= this.bellSwingAngle * 9.5 * dt;
      this.bellSwingVel *= 0.97;
      this.bellSwingAngle += this.bellSwingVel * dt;
      this.bellPendulum.rotation.z = this.bellSwingAngle;
    }

    const elapsed = this.clock.elapsedTime;
    this.koiFish.forEach((k) => {
      k.angle += k.speed * dt;
      const nx = k.cx + Math.cos(k.angle) * k.radius;
      const nz = k.cz + Math.sin(k.angle) * k.radius;
      k.mesh.rotation.z = -k.angle;
      k.mesh.position.x = nx;
      k.mesh.position.z = nz;
    });

    this.floatingLanterns.forEach((fl) => {
      fl.mesh.position.x = fl.baseX + Math.sin(elapsed * 0.6 + fl.phase) * 0.35;
      fl.mesh.position.z = fl.baseZ + Math.cos(elapsed * 0.5 + fl.phase) * 0.25;
    });

    // Khói hương thường xuyên bốc lên từ Lư Hương Đồng
    if (Math.random() < 0.22) {
      this.spawnIncenseSmoke(1);
    }
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const sp = this.smokeParticles[i];
      sp.life -= dt * 0.45;
      sp.mesh.position.y += sp.vy * dt;
      sp.mesh.position.x += Math.sin(elapsed * 2 + i) * 0.18 * dt;
      sp.mesh.scale.setScalar(1 + (1 - sp.life) * 1.8);
      sp.mesh.material.opacity = Math.max(0, sp.life * 0.45);
      if (sp.life <= 0) {
        this.scene.remove(sp.mesh);
        this.smokeParticles.splice(i, 1);
      }
    }

    // Vòng sóng hào quang vàng dưới đất
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rp = this.ripples[i];
      rp.scale += dt * 4.2;
      rp.opacity -= dt * 0.72;
      rp.mesh.scale.setScalar(rp.scale);
      rp.mesh.material.opacity = Math.max(0, rp.opacity);
      if (rp.opacity <= 0) {
        this.scene.remove(rp.mesh);
        this.ripples.splice(i, 1);
      }
    }

    // NPC đi dạo trên sân chùa
    this.npcs.forEach((npc) => {
      npc.z += npc.dir * 1.15 * dt;
      if (npc.z > npc.patrolZ[1]) npc.dir = -1;
      if (npc.z < npc.patrolZ[0]) npc.dir = 1;
      npc.mesh.root.position.z = npc.z;
      npc.mesh.root.rotation.y = npc.dir > 0 ? 0 : Math.PI;
      const sw = Math.sin(elapsed * 5 + npc.phase) * 0.35;
      npc.mesh.leftLeg.rotation.x = sw;
      npc.mesh.rightLeg.rotation.x = -sw;
      npc.mesh.leftArm.rotation.x = -sw * 0.6;
      npc.mesh.rightArm.rotation.x = sw * 0.6;
    });

    // 6. Cập nhật Camera bám theo nhân vật
    const lookTarget = new THREE.Vector3(p.pos.x, p.pos.y + 1.4, p.pos.z);
    const camX = lookTarget.x + Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
    const camY = lookTarget.y + Math.sin(this.camPitch) * this.camDist;
    const camZ = lookTarget.z + Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
    this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.18);
    this.camera.lookAt(lookTarget);

    this.renderer.render(this.scene, this.camera);
  }
}

window.TempleWorld3D = TempleWorld3D;

