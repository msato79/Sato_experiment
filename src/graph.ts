import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GraphData } from './csv';

// 型定義
type RotationAxisType = 'centroid' | 'xz-intersection';
type ViewMode = 'auto' | 'manual';

// 定数
const NODE_SCALE = 10;
const NODE_GEOMETRY_RADIUS = 0.5;
const AXIS_LENGTH = 100;
const AXIS_COLOR_BLUE = 0x0000ff;
const LABEL_FONT_SIZE = 48;
const LABEL_OFFSET_Y = 1;

export function initScene({ nodes, edges }: GraphData) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // 透視投影に戻す
  const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.set(0, 0, 80);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 初期状態では自動モードなので手動操作を無効化
  controls.enabled = false;
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.enablePan = false;

  // 視点制御の状態管理
  let currentMode: ViewMode = 'auto';
  let autoInterval: number | null = null;
  let currentViewIndex = 0;
  
  // 自動モード中にマウスイベントをブロックする関数
  function blockMouseEvents(event: Event) {
    if (currentMode === 'auto') {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }
  
  // マウスイベントリスナーを追加
  function addMouseEventBlockers() {
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', blockMouseEvents, true);
    canvas.addEventListener('mousemove', blockMouseEvents, true);
    canvas.addEventListener('mouseup', blockMouseEvents, true);
    canvas.addEventListener('wheel', blockMouseEvents, true);
    canvas.addEventListener('contextmenu', blockMouseEvents, true);
  }
  
  // マウスイベントリスナーを削除
  function removeMouseEventBlockers() {
    const canvas = renderer.domElement;
    canvas.removeEventListener('mousedown', blockMouseEvents, true);
    canvas.removeEventListener('mousemove', blockMouseEvents, true);
    canvas.removeEventListener('mouseup', blockMouseEvents, true);
    canvas.removeEventListener('wheel', blockMouseEvents, true);
    canvas.removeEventListener('contextmenu', blockMouseEvents, true);
  }
  
  // 設定値
  let angleStep = 2;
  let intervalMilliseconds = 250;
  
  // 回転軸表示用の線オブジェクト
  let defaultRotationAxisLine: THREE.Line | null = null;
  let showBlueAxis = false;

  // グラフ回転用の変数
  let graphRotationAngle = 0;
  let graphCentroid = new THREE.Vector3(0, 0, 0);
  let graphXZCentroid = new THREE.Vector3(0, 0, 0);
  let xzCircleZAxisIntersection = new THREE.Vector3(0, 0, 0);
  let selectedRotationAxis: RotationAxisType = 'centroid';

  // グラフグループの設定
  const graphRotationGroup = new THREE.Group();
  const graphGroup = new THREE.Group();
  graphRotationGroup.add(graphGroup);
  scene.add(graphRotationGroup);

  // グラフデータ
  const nodeMap = new Map<number, THREE.Vector3>();
  const edgeLines: THREE.Line[] = [];
  const nodeGeometry = new THREE.SphereGeometry(NODE_GEOMETRY_RADIUS, 16, 16);

  // xz座標の重心と円の半径を計算
  function calculateXZCentroidAndRadius(): { centroid: THREE.Vector3; radius: number } {
    if (nodeMap.size === 0) {
      return { centroid: new THREE.Vector3(0, 0, 0), radius: 0 };
    }

    // xz座標の重心を計算
    const xzAccumulator = new THREE.Vector3(0, 0, 0);
    let nodeCount = 0;
    
    nodeMap.forEach((pos) => {
      xzAccumulator.x += pos.x;
      xzAccumulator.z += pos.z;
      nodeCount += 1;
    });
    
    const xzCentroid = new THREE.Vector3(
      xzAccumulator.x / nodeCount,
      0,
      xzAccumulator.z / nodeCount
    );

    // すべてのノードが収まる最小半径を計算
    let maxDistance = 0;
    nodeMap.forEach((pos) => {
      const dx = pos.x - xzCentroid.x;
      const dz = pos.z - xzCentroid.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      maxDistance = Math.max(maxDistance, distance);
    });

    return { centroid: xzCentroid, radius: maxDistance };
  }

  // xz重心を中心とした円とz軸の交点を計算
  function calculateXZCircleZAxisIntersection(): THREE.Vector3 {
    const { centroid, radius } = calculateXZCentroidAndRadius();
    const cx = centroid.x;
    const cz = centroid.z;

    // 円の方程式: (x - cx)^2 + (z - cz)^2 = r^2
    // z軸との交点: x = 0 なので、cx^2 + (z - cz)^2 = r^2
    // (z - cz)^2 = r^2 - cx^2
    // z = cz ± sqrt(r^2 - cx^2)

    const discriminant = radius * radius - cx * cx;
    
    if (discriminant < 0) {
      return new THREE.Vector3(0, 0, cz);
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);
    const z = cz - sqrtDiscriminant;
    
    return new THREE.Vector3(0, 0, z);
  }

  function getRotationCenter(): THREE.Vector3 {
    if (selectedRotationAxis === 'centroid') {
      return graphCentroid.clone();
    } else {
      return xzCircleZAxisIntersection.clone();
    }
  }

  function updateRotationPivotPositions() {
    const rotationCenter = getRotationCenter();
    graphRotationGroup.position.copy(rotationCenter);
    graphGroup.position.copy(rotationCenter);
    graphGroup.position.multiplyScalar(-1);

    if (defaultRotationAxisLine) {
      defaultRotationAxisLine.position.copy(rotationCenter);
    }

  }

  // 回転軸の取得（常にY軸方向）
  function getCurrentRotationAxis(): THREE.Vector3 {
    return new THREE.Vector3(0, 1, 0);
  }

  // 回転軸を切り替え
  function switchRotationAxis(axis: RotationAxisType) {
    selectedRotationAxis = axis;
    
    // UI更新
    document.querySelectorAll('.axis-button').forEach(btn => btn.classList.remove('active'));
    (document.getElementById(`${axis}-axis`) as HTMLButtonElement)?.classList.add('active');
    
    // 回転中心を更新
    updateRotationPivotPositions();
    
    // 現在の角度で再適用
    rotateGraphAroundAxis(graphRotationAngle);
    
    console.log(`Switched to ${axis} rotation axis`);
  }


  // グラフを指定された軸を中心に回転
  function rotateGraphAroundAxis(angle: number) {
    graphRotationAngle = angle;
    const currentAxis = getCurrentRotationAxis();
    const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(currentAxis, angle);
    graphRotationGroup.quaternion.copy(rotationQuaternion);
  }

  // 回転軸を表示
  function createRotationAxis() {
    if (defaultRotationAxisLine) {
      scene.remove(defaultRotationAxisLine);
      defaultRotationAxisLine.geometry?.dispose();
      (defaultRotationAxisLine.material as THREE.Material)?.dispose();
    }
    
    if (showBlueAxis) {
      const axisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -AXIS_LENGTH, 0),
        new THREE.Vector3(0, AXIS_LENGTH, 0)
      ]);
      const axisMaterial = new THREE.LineBasicMaterial({ color: AXIS_COLOR_BLUE, linewidth: 5 });
      defaultRotationAxisLine = new THREE.Line(axisGeometry, axisMaterial);
      scene.add(defaultRotationAxisLine);
    }

    updateRotationPivotPositions();
  }

  // 軸の表示/非表示を切り替え
  function toggleAxisVisibility() {
    showBlueAxis = !showBlueAxis;
    createRotationAxis();
    updateAxisVisibilityButtons();
  }
  
  // 軸の表示状態ボタンのUI更新
  function updateAxisVisibilityButtons() {
    const blueAxisButton = document.getElementById('toggle-blue-axis') as HTMLButtonElement;
    if (blueAxisButton) {
      blueAxisButton.textContent = showBlueAxis ? '青軸を非表示' : '青軸を表示';
      blueAxisButton.style.backgroundColor = showBlueAxis ? '#4B5563' : '#9CA3AF';
    }
  }

  // モード切り替え
  function switchMode(mode: ViewMode) {
    currentMode = mode;
    
    // UI更新
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    (document.getElementById(`${mode}-mode`) as HTMLButtonElement).classList.add('active');
    
    // OrbitControlsの制御
    if (mode === 'manual') {
      controls.enabled = true;
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.enablePan = true;
      // 手動モードでも自動回転を継続
      if (!autoInterval) {
        autoInterval = setInterval(autoGraphRotation, intervalMilliseconds) as unknown as number;
      }
      // マウスイベントブロッカーを削除
      removeMouseEventBlockers();
    } else {
      // 自動モードでは手動操作を無効化
      controls.enabled = false;
      controls.enableRotate = false;
      controls.enableZoom = false;
      controls.enablePan = false;
      
      // 自動モードの場合は自動切り替えを開始
      if (!autoInterval) {
        autoInterval = setInterval(autoGraphRotation, intervalMilliseconds) as unknown as number;
      }
      // 自動モードではマウスイベントブロッカーを追加
      addMouseEventBlockers();
    }
  }


  // シーンをクリア
  function clearScene() {
    while (graphGroup.children.length > 0) {
      const child = graphGroup.children[0];
      graphGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Sprite) {
        child.geometry?.dispose();
        (child.material as THREE.Material)?.dispose();
      }
    }
    
    if (defaultRotationAxisLine) {
      scene.remove(defaultRotationAxisLine);
      defaultRotationAxisLine.geometry?.dispose();
      (defaultRotationAxisLine.material as THREE.Material)?.dispose();
      defaultRotationAxisLine = null;
    }
  }

  // ノードのラベルを作成
  function createNodeLabel(nodeId: number, position: THREE.Vector3): THREE.Sprite {
    const labelCanvas = document.createElement('canvas');
    const context = labelCanvas.getContext('2d')!;
    const text = `${nodeId}`;
    context.font = `${LABEL_FONT_SIZE}px Arial`;
    const textWidth = context.measureText(text).width;

    labelCanvas.width = textWidth;
    labelCanvas.height = LABEL_FONT_SIZE * 1.4;

    const ctx = labelCanvas.getContext('2d')!;
    ctx.font = `${LABEL_FONT_SIZE}px Arial`;
    ctx.fillStyle = 'black';
    ctx.fillText(text, 0, LABEL_FONT_SIZE);

    const texture = new THREE.CanvasTexture(labelCanvas);
    texture.minFilter = THREE.LinearFilter;

    const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const label = new THREE.Sprite(labelMaterial);
    label.scale.set(1, 1.5, 1);
    label.position.copy(position.clone().add(new THREE.Vector3(0, LABEL_OFFSET_Y, 0)));
    
    return label;
  }

  // ノードを作成
  function createNode(position: THREE.Vector3): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
      opacity: 1
    });
    const sphere = new THREE.Mesh(nodeGeometry, material);
    sphere.position.copy(position);
    return sphere;
  }

  // エッジを作成
  function createEdge(from: THREE.Vector3, to: THREE.Vector3): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: false,
    });
    return new THREE.Line(geometry, edgeMaterial);
  }

  // グラフデータを読み込み
  function loadGraphData(newData: GraphData) {
    clearScene();
    nodeMap.clear();
    edgeLines.length = 0;
    defaultRotationAxisLine = null;
    graphRotationAngle = 0;
    graphRotationGroup.rotation.set(0, 0, 0);

    // ノードの位置を計算し、重心を計算
    const centroidAccumulator = new THREE.Vector3(0, 0, 0);
    let nodeCount = 0;

    newData.nodes.forEach(node => {
      const pos = new THREE.Vector3(node.x * NODE_SCALE, node.y * NODE_SCALE, node.z * NODE_SCALE);
      nodeMap.set(node.id, pos);
      centroidAccumulator.add(pos);
      nodeCount += 1;
    });

    // ノードとラベルを作成
    newData.nodes.forEach(node => {
      const pos = nodeMap.get(node.id)!;
      const label = createNodeLabel(node.id, pos);
      const sphere = createNode(pos);
      graphGroup.add(label);
      graphGroup.add(sphere);
    });

    // エッジを作成
    newData.edges.forEach(edge => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (from && to) {
        const line = createEdge(from, to);
        graphGroup.add(line);
        edgeLines.push(line);
      }
    });
    
    // 重心とxz重心を計算
    if (nodeCount > 0) {
      graphCentroid = centroidAccumulator.divideScalar(nodeCount);
      const xzData = calculateXZCentroidAndRadius();
      graphXZCentroid = xzData.centroid;
      xzCircleZAxisIntersection = calculateXZCircleZAxisIntersection();
    } else {
      graphCentroid.set(0, 0, 0);
      graphXZCentroid.set(0, 0, 0);
      xzCircleZAxisIntersection.set(0, 0, 0);
    }

    updateRotationPivotPositions();
    createRotationAxis();
    rotateGraphAroundAxis(graphRotationAngle);
    
    const angleDisplay = document.getElementById('angle-display')!;
    angleDisplay.innerText = `角度: 0° - 新しいデータ読み込み完了`;
  }

  const fileInput = document.getElementById('file-input') as HTMLInputElement;

  fileInput.addEventListener('change', event => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const parsedData = parseCSV(text); // CSVをパースする関数を呼び出す
        loadGraphData(parsedData);
      };
      reader.readAsText(file);
    }
  });

  window.addEventListener('resize', () => {
    // PerspectiveCamera用リサイズ処理
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  loadGraphData({ nodes, edges });
  
  // 回転軸を表示
  createRotationAxis();
  
  // 軸の表示状態ボタンの初期化
  updateAxisVisibilityButtons();

  // 動的なカメラ角度を計算
  function calculateCameraAngles(): number[] {
    const angleStepRadians = (angleStep * Math.PI) / 180;
    return [0, angleStepRadians];
  }

  // イベントリスナーの初期化
  setupEventListeners();

  // 初期状態で自動モードを開始（グラフ回転）
  autoInterval = setInterval(autoGraphRotation, intervalMilliseconds) as unknown as number;
  
  // 初期状態では自動モードなのでマウスイベントブロッカーを追加
  addMouseEventBlockers();

  // 自動モード用のグラフ回転
  function autoGraphRotation() {
    const cameraAngles = calculateCameraAngles();
    currentViewIndex = (currentViewIndex + 1) % cameraAngles.length;
    const angle = cameraAngles[currentViewIndex];
    rotateGraphAroundAxis(angle);

    const degree = Math.round((angle * 180) / Math.PI);
    const angleDisplay = document.getElementById('angle-display')!;
    angleDisplay.innerText = `角度: ${degree}°`;
  }

  // イベントリスナーの設定
  function setupEventListeners() {
    // 設定入力フィールドイベント
    const angleStepInput = document.getElementById('angle-step-input') as HTMLInputElement;
    const intervalInput = document.getElementById('interval-input') as HTMLInputElement;
    
    angleStepInput.addEventListener('input', () => {
      angleStep = parseInt(angleStepInput.value, 10);
      // 自動モードがアクティブな場合は新しく設定を適用
      if (currentMode === 'auto') {
          if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = setInterval(autoGraphRotation, intervalMilliseconds) as unknown as number;
          }
      }
    });
    
    intervalInput.addEventListener('input', () => {
      intervalMilliseconds = parseInt(intervalInput.value, 10);
      // 自動モードがアクティブな場合は新しく設定を適用
      if (currentMode === 'auto') {
          if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = setInterval(autoGraphRotation, intervalMilliseconds) as unknown as number;
          }
      }
    });
    
    // モード切り替えボタン
    (document.getElementById('auto-mode') as HTMLButtonElement).addEventListener('click', () => {
      switchMode('auto');
      // 自動モードでのグラフ回転を再開
      autoInterval = setInterval(autoGraphRotation, intervalMilliseconds) as unknown as number;
    });

    (document.getElementById('manual-mode') as HTMLButtonElement).addEventListener('click', () => {
      switchMode('manual');
    });

    // 回転軸切り替えボタン
    (document.getElementById('centroid-axis') as HTMLButtonElement).addEventListener('click', () => {
      switchRotationAxis('centroid');
    });

    (document.getElementById('xz-intersection-axis') as HTMLButtonElement).addEventListener('click', () => {
      switchRotationAxis('xz-intersection');
    });

    // 軸の表示/非表示ボタン
    (document.getElementById('toggle-blue-axis') as HTMLButtonElement).addEventListener('click', () => {
      toggleAxisVisibility();
    });
  }

  animate();
}

function parseCSV(csvText: string): GraphData {
  const lines = csvText.split('\n');
  const nodes: { id: number; x: number; y: number; z: number }[] = [];
  const edges: { from: number; to: number }[] = [];

  lines.forEach(line => {
    const [type, ...values] = line.split(',');
    if (type === 'N') { // ノードの行
      const [id, x, y, z] = values.map(Number);
      nodes.push({ id, x, y, z });
    } else if (type === 'E') { // エッジの行
      const [from, to] = values.map(Number);
      edges.push({ from, to });
    }
  });

  return { nodes, edges };
}