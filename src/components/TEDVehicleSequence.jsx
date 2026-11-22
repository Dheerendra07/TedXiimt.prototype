import React, { useEffect, useRef } from 'react';

const ASSETS = [
  {
    id: 'tractor',
    kind: 'vehicle',
    url: 'https://tevy.dev/models/semi-truck/v1/lod0.glb',
    targetWidth: 4.15,
    targetHeight: 3.5,
    yaw: -0.18,
    wheels: ['wheel_FL', 'wheel_FR', 'wheel_ML', 'wheel_MR', 'wheel_RL', 'wheel_RR'],
    doors: ['door_L', 'door_R'],
  },
  {
    id: 'muscle',
    kind: 'vehicle',
    url: 'https://tevy.dev/models/muscle-car/v1/lod0.glb',
    targetWidth: 4.0,
    targetHeight: 2.65,
    yaw: 0.02,
    wheels: ['wheel_FL', 'wheel_FR', 'wheel_RL', 'wheel_RR'],
    doors: ['door_L', 'door_R'],
    panels: ['bonnet', 'boot'],
  },
  {
    id: 'hover',
    kind: 'vehicle',
    url: 'https://tevy.dev/models/hover-car/v1/lod0.glb',
    targetWidth: 4.05,
    targetHeight: 2.8,
    yaw: 0.2,
    doors: ['door_FL', 'door_FR', 'door_RL', 'door_RR'],
    panels: ['thruster_FL', 'thruster_FR', 'thruster_RL', 'thruster_RR'],
  },
  {
    id: 'droid',
    kind: 'robot',
    url: 'https://tevy.dev/models/service-droid/v1/lod0.glb',
    targetWidth: 3.0,
    targetHeight: 3.45,
    yaw: -0.12,
  },
  {
    id: 'loader',
    kind: 'robot',
    url: 'https://tevy.dev/models/industrial-exosuit-loader/v1/lod0.glb',
    targetWidth: 4.0,
    targetHeight: 3.85,
    yaw: 0,
  },
  {
    id: 'quadruped',
    kind: 'robot',
    url: 'https://tevy.dev/models/quadruped-robot/v1/lod0.glb',
    targetWidth: 4.0,
    targetHeight: 3.3,
    yaw: 0.16,
  },
];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeOut = (value) => {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
};
const easeInOut = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const restRecords = (root, names) => names
  .map((name) => {
    const node = root.getObjectByName(name);
    return node ? { node, rotation: node.rotation.clone(), quaternion: node.quaternion.clone() } : null;
  })
  .filter(Boolean);

const setRestAxis = (record, axis, value) => {
  record.node.rotation.copy(record.rotation);
  record.node.rotation[axis] += value;
};

function makeDust(THREE, scene, x, tint) {
  const count = 180;
  const positions = new Float32Array(count * 3);
  const seeds = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + Math.random() * 0.35;
    return {
      angle,
      radius: 0.18 + Math.random() * 0.78,
      height: 0.12 + Math.random() * 0.82,
      depth: (Math.random() - 0.5) * 0.85,
      drift: 0.45 + Math.random() * 1.4,
    };
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: tint,
    size: 0.07,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.position.set(x, 0.04, 0.2);
  points.frustumCulled = false;
  scene.add(points);
  return { points, positions, seeds };
}

function animateDust(cloud, elapsed, start, duration) {
  const progress = clamp((elapsed - start) / duration);
  cloud.points.material.opacity = Math.sin(progress * Math.PI) * 0.76;
  const expansion = 0.2 + progress * 2.25;
  cloud.seeds.forEach((seed, index) => {
    const offset = index * 3;
    cloud.positions[offset] = Math.cos(seed.angle) * seed.radius * expansion;
    cloud.positions[offset + 1] = seed.height * progress + 0.04;
    cloud.positions[offset + 2] = seed.depth + Math.sin(seed.angle) * progress * seed.drift;
  });
  cloud.points.geometry.attributes.position.needsUpdate = true;
}

export default function TEDVehicleSequence({ onReady, disabled = false }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || disabled) {
      onReady?.();
      return undefined;
    }

    let cancelled = false;
    let renderer;
    let scene;
    let camera;
    let resizeObserver;
    let animationFrame = 0;
    let startAt = 0;
    let readyCalled = false;
    let pmrem;
    let environment;
    const disposables = [];
    const vehicles = [];
    const robots = [];
    const dust = [];

    const signalReady = () => {
      if (readyCalled || cancelled) return;
      readyCalled = true;
      onReady?.();
    };

    const cleanup = () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      renderer?.setAnimationLoop(null);
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss?.();
        if (renderer.domElement?.parentNode === host) host.removeChild(renderer.domElement);
      }
      disposables.forEach((item) => item?.dispose?.());
      environment?.dispose?.();
      pmrem?.dispose?.();
    };

    const initialize = async () => {
      try {
        const [
          THREE,
          { GLTFLoader },
          { KTX2Loader },
          { MeshoptDecoder },
          { RoomEnvironment },
        ] = await Promise.all([
          import(/* @vite-ignore */ 'three'),
          import(/* @vite-ignore */ 'three/addons/loaders/GLTFLoader.js'),
          import(/* @vite-ignore */ 'three/addons/loaders/KTX2Loader.js'),
          import(/* @vite-ignore */ 'three/addons/libs/meshopt_decoder.module.js'),
          import(/* @vite-ignore */ 'three/addons/environments/RoomEnvironment.js'),
        ]);

        if (cancelled) return;

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.className = 'tedx-3d-stage__canvas';
        renderer.domElement.setAttribute('aria-hidden', 'true');
        host.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        camera.position.set(0, 4.45, 11);
        camera.lookAt(0, 1.5, 0);

        scene.add(new THREE.HemisphereLight(0xe8eef7, 0x12151b, 2.1));

        const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
        keyLight.position.set(-4, 9, 7);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.camera.left = -12;
        keyLight.shadow.camera.right = 12;
        keyLight.shadow.camera.top = 8;
        keyLight.shadow.camera.bottom = -6;
        keyLight.shadow.bias = -0.0003;
        scene.add(keyLight);

        const redRim = new THREE.PointLight(0xeb0028, 28, 20, 2);
        redRim.position.set(-6, 3.2, -3);
        scene.add(redRim);

        const coolRim = new THREE.PointLight(0x9bc5e3, 22, 20, 2);
        coolRim.position.set(6, 3.7, -3);
        scene.add(coolRim);

        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(25, 11),
          new THREE.ShadowMaterial({ color: 0x030406, opacity: 0.34 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.035;
        ground.receiveShadow = true;
        scene.add(ground);
        disposables.push(ground.geometry, ground.material);

        const stageLines = new THREE.Group();
        for (let index = -5; index <= 5; index += 1) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(index * 2.1, 0.008, -4.2),
            new THREE.Vector3(index * 2.1, 0.008, 4.2),
          ]);
          const material = new THREE.LineBasicMaterial({
            color: index === 0 ? 0xeb0028 : 0x9aa6b2,
            transparent: true,
            opacity: index === 0 ? 0.38 : 0.12,
          });
          stageLines.add(new THREE.Line(geometry, material));
          disposables.push(geometry, material);
        }
        scene.add(stageLines);

        pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        environment = pmrem.fromScene(room, 0.045).texture;
        scene.environment = environment;
        room.dispose?.();

        const ktx2 = new KTX2Loader()
          .setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/libs/basis/')
          .detectSupport(renderer);
        const loader = new GLTFLoader()
          .setKTX2Loader(ktx2)
          .setMeshoptDecoder(MeshoptDecoder);

        const loaded = await Promise.all(ASSETS.map(async (config) => {
          try {
            const gltf = await loader.loadAsync(config.url);
            return { config, gltf };
          } catch (error) {
            console.warn('[TEDx 3D] Model could not be loaded: ' + config.id, error);
            return null;
          }
        }));

        if (cancelled) return;

        const available = loaded.filter(Boolean);
        if (!available.some((entry) => entry.config.kind === 'vehicle')
          || !available.some((entry) => entry.config.kind === 'robot')) {
          throw new Error('Not enough 3D models loaded to play the vehicle-to-robot scene.');
        }

        const resize = () => {
          if (!renderer || !camera || !host.isConnected) return;
          const width = Math.max(host.clientWidth, 320);
          const height = Math.max(host.clientHeight, 250);
          const mobile = width < 620;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.fov = mobile ? 35 : 32;
          camera.position.set(0, mobile ? 4.45 : 4.45, mobile ? 8.4 : 11);
          camera.lookAt(0, mobile ? 1.45 : 1.5, 0);
          camera.updateProjectionMatrix();
        };

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();

        const width = Math.max(host.clientWidth, 320);
        const mobile = width < 620;
        const xPositions = mobile ? [-3.0, 0, 3.0] : [-4.1, 0, 4.1];

        available.forEach(({ config, gltf }) => {
          const root = gltf.scene;

          if (config.id === 'tractor') {
            ['trailer', 'trailer_wheel_1L', 'trailer_wheel_1R', 'trailer_wheel_2L', 'trailer_wheel_2R', 'trailer_wheel_3L', 'trailer_wheel_3R'].forEach((name) => {
              root.getObjectByName(name)?.removeFromParent();
            });
          }

          root.updateMatrixWorld(true);
          const bounds = new THREE.Box3().setFromObject(root);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());
          const factor = Math.min(
            (mobile ? config.targetWidth * 0.78 : config.targetWidth) / Math.max(size.x, size.z, 0.001),
            (mobile ? config.targetHeight * 0.9 : config.targetHeight) / Math.max(size.y, 0.001),
          );

          root.scale.setScalar(factor);
          root.position.set(-center.x * factor, -bounds.min.y * factor, -center.z * factor);
          root.traverse((object) => {
            if (!object.isMesh) return;
            object.castShadow = true;
            object.receiveShadow = true;
          });

          const group = new THREE.Group();
          group.name = 'stage-' + config.id;
          group.position.set(xPositions[config.kind === 'vehicle' ? vehicles.length : robots.length], 0, 0);
          group.rotation.y = config.yaw;
          group.add(root);
          group.scale.setScalar(0.001);
          group.position.y = config.kind === 'vehicle' ? 4.6 : -2.3;
          scene.add(group);

          const slot = {
            config,
            root,
            group,
            nodes: {},
          };

          if (config.kind === 'vehicle') {
            slot.nodes.wheels = restRecords(root, config.wheels || []);
            slot.nodes.doors = restRecords(root, config.doors || []);
            slot.nodes.panels = restRecords(root, config.panels || []);
            vehicles.push(slot);
          } else if (config.id === 'droid') {
            slot.nodes.head = restRecords(root, ['head']);
            slot.nodes.arms = restRecords(root, [
              'shoulder_L', 'elbow_L', 'wrist_L',
              'shoulder_R', 'elbow_R', 'wrist_R',
              'finger_A_L', 'finger_B_L', 'thumb_L',
              'finger_A_R', 'finger_B_R', 'thumb_R',
            ]);
            slot.nodes.wheels = restRecords(root, ['wheel_L', 'wheel_R']);
            robots.push(slot);
          } else if (config.id === 'loader') {
            slot.nodes.arms = restRecords(root, [
              'shoulder_L', 'elbow_L', 'wrist_L',
              'shoulder_R', 'elbow_R', 'wrist_R',
            ]);
            slot.nodes.claws = restRecords(root, [
              'claw_upper_L', 'claw_lower_L',
              'claw_upper_R', 'claw_lower_R',
            ]);
            slot.nodes.legs = restRecords(root, ['hip_L', 'knee_L', 'hip_R', 'knee_R']);
            robots.push(slot);
          } else if (config.id === 'quadruped') {
            slot.nodes.head = restRecords(root, ['head']);
            slot.nodes.legs = restRecords(root, [
              'hip_FL', 'thigh_FL', 'shin_FL',
              'hip_FR', 'thigh_FR', 'shin_FR',
              'hip_RL', 'thigh_RL', 'shin_RL',
              'hip_RR', 'thigh_RR', 'shin_RR',
            ]);
            robots.push(slot);
          }
        });

        for (let index = 0; index < 3; index += 1) {
          const ringMaterial = new THREE.MeshBasicMaterial({
            color: index === 1 ? 0xeb0028 : 0xa7bdce,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.78, 0.83, 64), ringMaterial);
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(xPositions[index], 0.018, 0.2);
          scene.add(ring);
          const vehicleDust = makeDust(THREE, scene, xPositions[index], 0xc3b9b1);
          const robotDust = makeDust(THREE, scene, xPositions[index], 0xb8c5cf);
          dust.push({ ring, vehicleDust, robotDust });
          disposables.push(ring.geometry, ringMaterial,
            vehicleDust.points.geometry, vehicleDust.points.material,
            robotDust.points.geometry, robotDust.points.material);
        }

        if (cancelled) return;
        signalReady();
        startAt = performance.now();

        const animateWheels = (records, elapsed, speed) => {
          records?.forEach((record, index) => {
            record.node.quaternion.copy(record.quaternion);
            record.node.rotateX(elapsed * speed * (index % 2 === 0 ? 1 : -1));
          });
        };

        const animateVehiclePanels = (slot, elapsed) => {
          const opening = easeInOut((elapsed - 2.85) / 0.8);
          slot.nodes.doors?.forEach((record, index) => {
            record.node.rotation.copy(record.rotation);
            record.node.rotation.y += (index % 2 === 0 ? 1 : -1) * opening * 0.62;
          });
          slot.nodes.panels?.forEach((record, index) => {
            record.node.rotation.copy(record.rotation);
            const name = record.node.name.toLowerCase();
            const openingAngle = name.includes('thruster') ? 0.24 : 0.34;
            record.node.rotation.x += opening * openingAngle * (index % 2 === 0 ? 1 : -1);
          });
        };

        const animateRobot = (slot, elapsed, index) => {
          const localTime = Math.max(0, elapsed - 4.85);
          if (slot.config.id === 'droid') {
            slot.nodes.head.forEach((record) => setRestAxis(record, 'y', Math.sin(localTime * 1.5) * 0.15));
            slot.nodes.arms.forEach((record, partIndex) => {
              const side = partIndex < 6 ? 1 : -1;
              setRestAxis(record, 'z', Math.sin(localTime * 2 + partIndex * 0.42) * 0.12 * side);
            });
            animateWheels(slot.nodes.wheels, localTime, 0.45);
          } else if (slot.config.id === 'loader') {
            slot.nodes.arms.forEach((record, partIndex) => {
              const side = partIndex < 3 ? 1 : -1;
              setRestAxis(record, 'z', Math.sin(localTime * 1.2 + partIndex * 0.35) * 0.11 * side);
            });
            slot.nodes.claws.forEach((record, partIndex) => {
              setRestAxis(record, 'x', Math.sin(localTime * 1.45 + partIndex) * 0.1);
            });
            slot.nodes.legs.forEach((record, partIndex) => {
              setRestAxis(record, 'x', Math.sin(localTime * 1.15 + partIndex * Math.PI) * 0.06);
            });
          } else if (slot.config.id === 'quadruped') {
            slot.nodes.head.forEach((record) => setRestAxis(record, 'y', Math.sin(localTime * 1.45) * 0.12));
            slot.nodes.legs.forEach((record, partIndex) => {
              const phase = localTime * 3.6 + (partIndex % 3) * 1.42 + (partIndex > 5 ? Math.PI : 0);
              const amplitude = record.node.name.startsWith('shin') ? 0.12 : 0.21;
              setRestAxis(record, 'x', Math.sin(phase) * amplitude);
            });
          }
          slot.group.rotation.z = Math.sin(localTime * 1.4 + index) * 0.012;
        };

        const tick = () => {
          if (cancelled) return;
          const elapsed = (performance.now() - startAt) / 1000;

          vehicles.forEach((slot, index) => {
            const landing = easeOut((elapsed - 0.12 - index * 0.1) / 0.92);
            const dissolve = easeInOut((elapsed - 3.85) / 0.66);
            const scale = Math.max(0.001, landing * (1 - dissolve));
            slot.group.scale.setScalar(scale);
            slot.group.position.y = (1 - landing) * 4.3 + Math.sin(elapsed * 14 + index) * 0.11 * (1 - landing);
            slot.group.rotation.y = slot.config.yaw + Math.sin(elapsed * 0.65 + index) * 0.022;
            slot.group.rotation.z = Math.sin(elapsed * 12 + index) * 0.018 * (1 - landing);
            slot.group.visible = elapsed < 4.75;
            if (elapsed < 3.9) animateWheels(slot.nodes.wheels, elapsed, 1.2);
            if (elapsed > 2.7 && elapsed < 4.7) animateVehiclePanels(slot, elapsed);
          });

          robots.forEach((slot, index) => {
            const reveal = easeOut((elapsed - 4.12 - index * 0.12) / 0.96);
            const settle = Math.sin(Math.max(0, elapsed - 4.9) * 10 + index) * 0.025 * reveal;
            const exit = easeInOut((elapsed - 8.35) / 0.55);
            slot.group.scale.setScalar(Math.max(0.001, reveal * (1 - exit)));
            slot.group.position.y = (1 - reveal) * -2.3 + settle;
            slot.group.rotation.y = slot.config.yaw + Math.sin(elapsed * 0.52 + index) * 0.026;
            slot.group.visible = elapsed > 4 && elapsed < 8.95;
            if (elapsed > 4.65 && elapsed < 8.65) animateRobot(slot, elapsed, index);
          });

          dust.forEach((cloud, index) => {
            animateDust(cloud.vehicleDust, elapsed, 0.48 + index * 0.12, 1.75);
            animateDust(cloud.robotDust, elapsed, 4.65 + index * 0.12, 1.55);
            const pulse = easeOut((elapsed - 0.82 - index * 0.1) / 0.9);
            cloud.ring.scale.setScalar(0.35 + pulse * 1.75);
            cloud.ring.material.opacity = Math.max(0, Math.sin(pulse * Math.PI)) * 0.38;
          });

          renderer.render(scene, camera);
          if (elapsed < 9.2) {
            animationFrame = requestAnimationFrame(tick);
          }
        };

        tick();
      } catch (error) {
        console.error('[TEDx 3D] Scene initialization failed', error);
        signalReady();
      }
    };

    initialize();
    return cleanup;
  }, [onReady]);

  return <div ref={hostRef} className="tedx-hero__transform-scene" aria-hidden="true" />;
}
