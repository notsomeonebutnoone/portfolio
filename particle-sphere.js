import {
  Scene, PerspectiveCamera, WebGLRenderer, Color, SphereGeometry,
  MeshBasicMaterial, InstancedMesh, Matrix4, Group, Vector3,
  Float32BufferAttribute, AdditiveBlending
} from './node_modules/three/build/three.module.js';

const canvas = document.getElementById('particle-sphere');
if (canvas) {
  const container = canvas.parentElement;
  const config = {
    particlesCount: 10000,
    particleScale: 4,
    speed: 20,
    smoothing: 7,
    scale: 8,
    stopOnHover: false,
    rotationDirection: 'clockwise',
    dragSpeed: 5,
    drag: true,
    cursorOn: true,
    cursorRadiusUI: 75,
    cursorStrengthUI: 10,
    clickForce: 5,
    sphereColor: '#FF0000'
  };

  const mapLinear = (value, inMin, inMax, outMin, outMax) =>
    outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  const speedN = config.speed / 10;
  const smoothingN = config.smoothing / 10;
  const scaleN = config.scale / 10;
  const dragN = config.dragSpeed / 10;
  const sizeN = config.particleScale / 10;
  const strengthN = config.cursorStrengthUI / 10;
  const rotationSpeed = mapLinear(speedN, .1, 1, .01, .05);
  const scaleMultiplier = mapLinear(Math.max(0, Math.min(1, scaleN)), 0, 1, .25, 1.25);
  const particleSize = mapLinear(Math.max(.1, Math.min(1, sizeN)), .1, 1, .01, .1);
  const cursorStrength = mapLinear(Math.max(0, Math.min(1, strengthN)), 0, 1, 0, 15);
  const lerpFactor = smoothingN === 0 ? 1 : mapLinear(smoothingN, 0, 1, .4, .03);
  const velocityDecay = mapLinear(smoothingN, 0, 1, .7, .96);
  const RETURN_FORCE = .015;
  const FRICTION = .94;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new Scene();
  const canvasOverflowMultiplier = 2.5;
  const baseFOV = 50;
  const adjustedFOV = 2 * Math.atan(Math.tan((baseFOV * Math.PI) / 360) * canvasOverflowMultiplier) * (180 / Math.PI);
  const camera = new PerspectiveCamera(adjustedFOV, 1, .1, 1000);
  camera.position.z = Math.max(3, scaleMultiplier + 1);
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = 'srgb';

  const geometry = new SphereGeometry(particleSize * .15, 8, 8);
  const material = new MeshBasicMaterial({
    color: 0xffffff,
    blending: AdditiveBlending,
    transparent: false
  });
  const particles = new InstancedMesh(geometry, material, config.particlesCount);
  const base = [];
  const displacement = [];
  const scatterVelocity = [];
  const instanceColors = new Float32Array(config.particlesCount * 3);
  const baseColor = new Color(config.sphereColor);
  const matrix = new Matrix4();
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < config.particlesCount; i++) {
    const y = 1 - (i / (config.particlesCount - 1)) * 2;
    const ringRadius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const point = new Vector3(
      Math.cos(theta) * ringRadius * scaleMultiplier,
      y * scaleMultiplier,
      Math.sin(theta) * ringRadius * scaleMultiplier
    );
    base.push(point);
    displacement.push(new Vector3());
    scatterVelocity.push(new Vector3());
    matrix.setPosition(point);
    particles.setMatrixAt(i, matrix);
    instanceColors[i * 3] = baseColor.r;
    instanceColors[i * 3 + 1] = baseColor.g;
    instanceColors[i * 3 + 2] = baseColor.b;
  }
  particles.instanceColor = new Float32BufferAttribute(instanceColors, 3);
  particles.instanceMatrix.setUsage(35048);
  const group = new Group();
  group.add(particles);
  scene.add(group);

  let width = 0;
  let height = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let isHovering = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let lastDragTime = 0;
  let lastFrameTime = performance.now();
  const rotation = { x: 0, y: 0 };
  const targetRotation = { x: 0, y: 0 };
  const dragVelocity = { x: 0, y: 0 };
  const pointer = { x: -9999, y: -9999, active: false };
  const tempLocal = new Vector3();
  const tempWorld = new Vector3();
  const tempProjected = new Vector3();
  const inverseGroup = new Matrix4();

  const resize = () => {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvasWidth = width * canvasOverflowMultiplier;
    canvasHeight = height * canvasOverflowMultiplier;
    offsetX = (canvasWidth - width) / 2;
    offsetY = (canvasHeight - height) / 2;
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();
    camera.position.z = Math.max(3, scaleMultiplier + 1);
    renderer.setSize(canvasWidth, canvasHeight, false);
    canvas.style.left = `${-offsetX}px`;
    canvas.style.top = `${-offsetY}px`;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
  };

  const setPointer = event => {
    const rect = container.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    pointer.active = localX >= 0 && localX <= rect.width && localY >= 0 && localY <= rect.height;
    if (pointer.active) {
      pointer.x = localX + offsetX;
      pointer.y = localY + offsetY;
    }
  };

  const scatterAt = (clientX, clientY) => {
    const rect = container.getBoundingClientRect();
    const clickX = clientX - rect.left + offsetX;
    const clickY = clientY - rect.top + offsetY;
    group.updateMatrixWorld(true);
    inverseGroup.copy(group.matrixWorld).invert();
    const clickRay = new Vector3((clickX / canvasWidth) * 2 - 1, 1 - (clickY / canvasHeight) * 2, .5).unproject(camera);
    const cameraWorld = new Vector3().setFromMatrixPosition(camera.matrixWorld);
    const clickDirection = clickRay.sub(cameraWorld).normalize();
    const clickWorld = cameraWorld.clone().addScaledVector(clickDirection, cameraWorld.length());
    for (let i = 0; i < config.particlesCount; i++) {
      tempLocal.copy(base[i]).add(displacement[i]);
      tempWorld.copy(tempLocal).applyMatrix4(group.matrixWorld);
      tempProjected.copy(tempWorld).project(camera);
      const screenX = (tempProjected.x * .5 + .5) * canvasWidth;
      const screenY = (-tempProjected.y * .5 + .5) * canvasHeight;
      const dx = clickX - screenX;
      const dy = clickY - screenY;
      const distance = Math.hypot(dx, dy);
      if (distance >= config.cursorRadiusUI || distance <= 0) continue;
      const force = ((config.cursorRadiusUI - distance) / config.cursorRadiusUI) * config.clickForce;
      const radial = tempWorld.clone().sub(clickWorld);
      if (radial.lengthSq() < .000001) continue;
      const worldScatter = radial.normalize().multiplyScalar(force * .5);
      const localScatter = worldScatter.transformDirection(inverseGroup);
      scatterVelocity[i].add(localScatter);
    }
  };

  canvas.addEventListener('pointerdown', event => {
    if (!config.drag) return;
    isDragging = true;
    dragVelocity.x = 0;
    dragVelocity.y = 0;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    lastDragTime = performance.now();
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    setPointer(event);
    isHovering = true;
    if (!isDragging) return;
    const now = performance.now();
    const elapsed = now - lastDragTime;
    const dx = event.clientX - lastMouseX;
    const dy = event.clientY - lastMouseY;
    const factor = mapLinear(dragN, 0, 1, .001, .02);
    targetRotation.x += dx * factor;
    targetRotation.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.y + dy * factor));
    if (elapsed > 0) {
      const normalized = (1000 / 60) / elapsed;
      dragVelocity.x = dx * factor * .3 * normalized;
      dragVelocity.y = dy * factor * .3 * normalized;
    }
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    lastDragTime = now;
  });
  const endDrag = () => { isDragging = false; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => {
    endDrag();
    isHovering = false;
    pointer.active = false;
  });
  canvas.addEventListener('click', event => scatterAt(event.clientX, event.clientY));

  const animate = now => {
    const deltaFactor = Math.min(3, (now - lastFrameTime) / (1000 / 60));
    lastFrameTime = now;
    if (!reducedMotion && !isDragging && !(config.stopOnHover && isHovering)) {
      targetRotation.x += rotationSpeed * .1 * deltaFactor;
    }
    if (!isDragging) {
      targetRotation.x += dragVelocity.x * deltaFactor;
      targetRotation.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.y + dragVelocity.y * deltaFactor));
      dragVelocity.x *= Math.pow(velocityDecay, deltaFactor);
      dragVelocity.y *= Math.pow(velocityDecay, deltaFactor);
    }
    const timeLerpFactor = 1 - Math.pow(1 - lerpFactor, deltaFactor);
    rotation.x += (targetRotation.x - rotation.x) * timeLerpFactor;
    rotation.y += (targetRotation.y - rotation.y) * timeLerpFactor;
    rotation.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.y));
    group.rotation.y = rotation.x;
    group.rotation.x = rotation.y;
    group.updateMatrixWorld(true);
    inverseGroup.copy(group.matrixWorld).invert();

    for (let i = 0; i < config.particlesCount; i++) {
      const move = displacement[i];
      const scatter = scatterVelocity[i];

      if (config.cursorOn && pointer.active && !isDragging) {
        tempLocal.copy(base[i]).add(move);
        tempWorld.copy(tempLocal).applyMatrix4(group.matrixWorld);
        tempProjected.copy(tempWorld).project(camera);
        const screenX = (tempProjected.x * .5 + .5) * canvasWidth;
        const screenY = (-tempProjected.y * .5 + .5) * canvasHeight;
        const dx = pointer.x - screenX;
        const dy = pointer.y - screenY;
        const distance = Math.hypot(dx, dy);
        if (distance < config.cursorRadiusUI && distance > 0 && tempWorld.z > 0) {
          const force = (config.cursorRadiusUI - distance) / config.cursorRadiusUI;
          const angle = Math.atan2(dy, dx);
          const amount = force * cursorStrength * speedN * deltaFactor;
          const repulsionX = -Math.cos(angle) * amount * .01;
          const repulsionY = Math.sin(angle) * amount * .01;
          const cameraRight = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize();
          const cameraUp = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize();
          const worldRepulsion = new Vector3().addScaledVector(cameraRight, repulsionX).addScaledVector(cameraUp, repulsionY);
          move.add(worldRepulsion.transformDirection(inverseGroup));
        }
      }
      move.multiplyScalar(Math.pow(FRICTION, deltaFactor));
      move.multiplyScalar(1 - RETURN_FORCE * speedN * deltaFactor);
      move.addScaledVector(scatter, deltaFactor * .1);
      scatter.multiplyScalar(Math.pow(.95, deltaFactor));
      scatter.multiplyScalar(1 - RETURN_FORCE * speedN * deltaFactor);
      matrix.setPosition(tempLocal.copy(base[i]).add(move));
      particles.setMatrixAt(i, matrix);
    }
    particles.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  resize();
  new ResizeObserver(resize).observe(container);
  requestAnimationFrame(animate);
}
