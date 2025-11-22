import * as THREE from 'three';
import { GraphData } from '../csv';
import { Condition, AxisOffset, GraphViewerAPI } from '../types/experiment';

const NODE_SCALE = 10;
const NODE_GEOMETRY_RADIUS = 0.8; // Increased to make all nodes more visible
const ROTATION_INTERVAL_MS = 250;

// Rotation angles for different conditions
const SMALL_ROTATION_ANGLE = (2 * Math.PI) / 180; // 2 degrees in radians
const LARGE_ROTATION_ANGLE = (5 * Math.PI) / 180; // 6 degrees in radians
const AXIS_OFFSET_DISTANCE = 20; // Distance to offset rotation axis in Z direction

export function createGraphViewer(container: HTMLElement): GraphViewerAPI {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Camera will be set based on condition
  let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  let is2D = false;

  // Renderer with high quality settings
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance", // Use high-performance GPU if available
    precision: "highp" // High precision shaders
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // High DPI support (cap at 2x for performance)
  renderer.setSize(container.clientWidth, container.clientHeight);
  // Ensure canvas doesn't block pointer events for buttons
  renderer.domElement.style.position = 'relative';
  renderer.domElement.style.zIndex = '1';
  container.appendChild(renderer.domElement);

  // Graph groups
  const graphRotationGroup = new THREE.Group();
  const graphGroup = new THREE.Group();
  graphRotationGroup.add(graphGroup);
  scene.add(graphRotationGroup);

  // Graph data
  const nodeMap = new Map<number, THREE.Vector3>();
  const nodeMeshes = new Map<number, THREE.Mesh>();
  const edgeLines: THREE.Line[] = [];
  // Increase sphere segments for higher resolution (32x32 instead of 16x16)
  const nodeGeometry = new THREE.SphereGeometry(NODE_GEOMETRY_RADIUS, 32, 32);
  
  // Store original graph data for reloading when condition changes
  let originalGraphData: GraphData | null = null;
  
  // Calculate bounding box of the graph
  function calculateBoundingBox(): { min: THREE.Vector3; max: THREE.Vector3; size: THREE.Vector3 } | null {
    if (nodeMap.size === 0) return null;
    
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    nodeMap.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      minZ = Math.min(minZ, pos.z);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
      maxZ = Math.max(maxZ, pos.z);
    });
    
    const min = new THREE.Vector3(minX, minY, minZ);
    const max = new THREE.Vector3(maxX, maxY, maxZ);
    const size = new THREE.Vector3(maxX - minX, maxY - minY, maxZ - minZ);
    
    return { min, max, size };
  }
  
  // Adjust camera based on graph bounding box
  function adjustCameraToFitGraph() {
    const bbox = calculateBoundingBox();
    if (!bbox) return;
    
    // Calculate the maximum distance from center to any node, including node radius
    // Add node radius to ensure nodes are not clipped at edges
    const nodeRadius = NODE_GEOMETRY_RADIUS;
    let maxDistanceFromCenter = 0;
    nodeMap.forEach(pos => {
      const distance = pos.distanceTo(graphCentroid);
      maxDistanceFromCenter = Math.max(maxDistanceFromCenter, distance);
    });
    
    // Add node radius to ensure nodes are fully visible
    maxDistanceFromCenter += nodeRadius;
    
    const aspect = container.clientWidth / container.clientHeight;
    
    if (is2D && camera instanceof THREE.OrthographicCamera) {
      // 2D: Ensure all nodes and edges are visible with minimal padding
      const padding = 1.05; // Slightly increased padding to prevent clipping
      const viewSize = Math.max(maxDistanceFromCenter * padding, 1);
      
      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();
    } else if (!is2D && camera instanceof THREE.PerspectiveCamera) {
      // 3D: Ensure all nodes and edges are visible with minimal padding
      const fov = camera.fov * (Math.PI / 180);
      const padding = 1.05; // Slightly increased padding to prevent clipping
      const distance = (maxDistanceFromCenter * 2 * padding) / (2 * Math.tan(fov / 2));
      
      // Minimum distance to ensure visibility
      const minDistance = 18;
      const cameraDistance = Math.max(distance, minDistance);
      
      camera.position.set(0, 0, cameraDistance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
  }

  // Rotation state
  let currentCondition: Condition = 'B';
  let currentAxisOffset: AxisOffset = 0;
  let rotationInterval: number | null = null;
  let rotationDirection = 1; // 1 for positive, -1 for negative
  let graphCentroid = new THREE.Vector3(0, 0, 0);
  let highlightedNodes = new Set<number>();
  let selectedNodes = new Set<number>(); // For Task B: selected nodes (yellow/orange)
  let startNodeId: number | null = null;
  let targetNodeId: number | null = null;
  let hoveredNodeId: number | null = null;
  let isRotationPaused = false;

  // Raycaster for node click detection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Initialize with default camera (3D perspective)
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000); // Reduced FOV from 75 to 60
  camera.position.set(0, 0, 50);
  camera.lookAt(0, 0, 0);

  // Mouse click handler
  let onNodeClickCallback: ((nodeId: number) => void) | undefined;

  function handleMouseClick(event: MouseEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(Array.from(nodeMeshes.values()));

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object as THREE.Mesh;
      // Find node ID from mesh using userData
      const nodeId = clickedMesh.userData.nodeId;
      if (nodeId !== undefined) {
        onNodeClickCallback?.(nodeId);
      }
    }
  }

  renderer.domElement.addEventListener('click', handleMouseClick);
  
  // Mouse move handler for hover effect
  function handleMouseMove(event: MouseEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(Array.from(nodeMeshes.values()));

    // Remove hover effect from previous node
    if (hoveredNodeId !== null) {
      const prevMesh = nodeMeshes.get(hoveredNodeId);
      if (prevMesh) {
        // Restore original color based on node type
        if (prevMesh.userData.nodeId === startNodeId) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
        } else if (prevMesh.userData.nodeId === targetNodeId) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x0000ff); // Blue
        } else if (highlightedNodes.has(hoveredNodeId)) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
        } else if (selectedNodes.has(hoveredNodeId)) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00); // Orange/Yellow
        } else {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x000000); // Black
        }
      }
      hoveredNodeId = null;
    }

    // Add hover effect to current node
    if (intersects.length > 0) {
      const hoveredMesh = intersects[0].object as THREE.Mesh;
      const nodeId = hoveredMesh.userData.nodeId;
      if (nodeId !== undefined) {
        hoveredNodeId = nodeId;
        (hoveredMesh.material as THREE.MeshBasicMaterial).color.setHex(0xff0000); // Red
      }
    }
  }

  renderer.domElement.addEventListener('mousemove', handleMouseMove);
  
  // Mouse leave handler to clear hover effect
  function handleMouseLeave() {
    if (hoveredNodeId !== null) {
      const prevMesh = nodeMeshes.get(hoveredNodeId);
      if (prevMesh) {
        // Restore original color based on node type
        if (hoveredNodeId === startNodeId) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
        } else if (hoveredNodeId === targetNodeId) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x0000ff); // Blue
        } else if (highlightedNodes.has(hoveredNodeId)) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
        } else if (selectedNodes.has(hoveredNodeId)) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00); // Orange/Yellow
        } else {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x000000); // Black
        }
      }
      hoveredNodeId = null;
    }
  }

  renderer.domElement.addEventListener('mouseleave', handleMouseLeave);
  
  // Function to set click callback
  function setOnNodeClick(callback: (nodeId: number) => void) {
    onNodeClickCallback = callback;
  }


  // Update rotation pivot position
  function updateRotationPivot() {
    const rotationCenter = graphCentroid.clone();
    
    // Apply axis offset in Z direction
    if (currentAxisOffset === 1) {
      rotationCenter.z += AXIS_OFFSET_DISTANCE;
    }

    graphRotationGroup.position.copy(rotationCenter);
    graphGroup.position.copy(rotationCenter.clone().multiplyScalar(-1));
  }

  // Rotate graph around Y-axis
  function rotateGraph(angle: number) {
    const rotationAxis = new THREE.Vector3(0, 1, 0);
    const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
    graphRotationGroup.quaternion.copy(rotationQuaternion);
  }

  // Start rotation animation
  function startRotation() {
    if (rotationInterval) {
      clearInterval(rotationInterval);
    }

    if ((currentCondition === 'C' || currentCondition === 'D') && !isRotationPaused) {
      const angle = currentCondition === 'C' ? SMALL_ROTATION_ANGLE : LARGE_ROTATION_ANGLE;
      
      rotationInterval = window.setInterval(() => {
        if (!isRotationPaused) {
          const currentAngle = rotationDirection * angle;
          rotateGraph(currentAngle);
          rotationDirection *= -1; // Alternate direction
        }
      }, ROTATION_INTERVAL_MS);
    }
  }

  // Pause rotation
  function pauseRotation() {
    console.log('pauseRotation called');
    isRotationPaused = true;
    if (rotationInterval) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
  }

  // Resume rotation
  function resumeRotation() {
    console.log('resumeRotation called');
    isRotationPaused = false;
    // Restart rotation if condition requires it
    if (currentCondition === 'C' || currentCondition === 'D') {
      startRotation();
    }
  }

  // Stop rotation
  function stopRotation() {
    if (rotationInterval) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
    rotateGraph(0); // Reset to 0 angle
  }


  // Create node mesh
  function createNode(position: THREE.Vector3, nodeId: number): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
      opacity: 1,
    });
    const sphere = new THREE.Mesh(nodeGeometry, material);
    sphere.position.copy(position);
    sphere.userData = { nodeId }; // Store node ID for click detection
    return sphere;
  }

  // Create edge
  function createEdge(from: THREE.Vector3, to: THREE.Vector3): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: false,
    });
    return new THREE.Line(geometry, edgeMaterial);
  }

  // Clear scene
  function clearScene() {
    while (graphGroup.children.length > 0) {
      const child = graphGroup.children[0];
      graphGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry?.dispose();
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.Material)?.dispose();
        }
      }
    }
    nodeMap.clear();
    nodeMeshes.clear();
    edgeLines.length = 0;
    highlightedNodes.clear();
    selectedNodes.clear();
  }

  // Load graph data
  function loadGraph(data: GraphData) {
    // Store original data
    originalGraphData = data;
    
    // Reload with current condition
    reloadGraph();
  }
  
  // Reload graph with current condition
  function reloadGraph() {
    if (!originalGraphData) return;
    
    clearScene();

    const centroidAccumulator = new THREE.Vector3(0, 0, 0);
    let nodeCount = 0;

    // Process nodes
    originalGraphData.nodes.forEach(node => {
      let pos = new THREE.Vector3(
        node.x * NODE_SCALE,
        node.y * NODE_SCALE,
        node.z * NODE_SCALE
      );

      // For 2D condition, project to XY plane
      if (is2D) {
        pos.z = 0;
      }

      nodeMap.set(node.id, pos);
      centroidAccumulator.add(pos);
      nodeCount += 1;
    });

    // Calculate centroid
    if (nodeCount > 0) {
      graphCentroid = centroidAccumulator.divideScalar(nodeCount);
      if (is2D) {
        graphCentroid.z = 0;
      }
    }

    // Create nodes
    originalGraphData.nodes.forEach(node => {
      const pos = nodeMap.get(node.id)!;
      const mesh = createNode(pos, node.id);
      
      graphGroup.add(mesh);
      nodeMeshes.set(node.id, mesh);
      
      // Restore node colors based on type
      if (node.id === startNodeId) {
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
      } else if (node.id === targetNodeId) {
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x0000ff); // Blue
      } else if (highlightedNodes.has(node.id)) {
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
      } else if (selectedNodes.has(node.id)) {
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00); // Orange/Yellow
      }
    });

    // Create edges
    originalGraphData.edges.forEach(edge => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (from && to) {
        const line = createEdge(from, to);
        graphGroup.add(line);
        edgeLines.push(line);
      }
    });

    updateRotationPivot();
    
    // Adjust camera to fit graph
    adjustCameraToFitGraph();
    
    // Start or stop rotation based on condition (only if not paused)
    if (currentCondition === 'B') {
      stopRotation();
    } else if ((currentCondition === 'C' || currentCondition === 'D') && !isRotationPaused) {
      startRotation();
    }
  }

  // Set display condition
  function setCondition(condition: Condition, axisOffset: AxisOffset) {
    const prevCondition = currentCondition;
    currentCondition = condition;
    currentAxisOffset = axisOffset;

    // Stop current rotation
    stopRotation();

    // Remove old camera if it exists and condition changed
    if (prevCondition !== condition && camera) {
      scene.remove(camera);
    }

    // Set camera based on condition (only if condition changed)
    if (prevCondition !== condition) {
      if (condition === 'A') {
        // 2D: Orthographic camera
        is2D = true;
        const aspect = container.clientWidth / container.clientHeight;
        const viewSize = 100;
        camera = new THREE.OrthographicCamera(
          -viewSize * aspect,
          viewSize * aspect,
          viewSize,
          -viewSize,
          0.1,
          1000
        );
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);
      } else {
        // 3D: Perspective camera
        is2D = false;
        camera = new THREE.PerspectiveCamera(
          60, // Reduced FOV from 75 to 60 to reduce perspective distortion
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);
      }

      scene.add(camera);
    }

    // Update rotation pivot (axis offset might have changed)
    updateRotationPivot();

    // Reload graph with new condition if graph is loaded
    if (originalGraphData) {
      reloadGraph();
    } else {
      if ((condition === 'C' || condition === 'D') && !isRotationPaused) {
        startRotation();
      }
    }
  }

  // Set start and target nodes with different colors
  function setStartNode(nodeId: number | null) {
    // Clear previous start node color
    if (startNodeId !== null) {
      const prevMesh = nodeMeshes.get(startNodeId);
      if (prevMesh && startNodeId !== targetNodeId) {
        // Only reset if not target node
        if (!hoveredNodeId || hoveredNodeId !== startNodeId) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x000000);
        }
      }
    }
    
    startNodeId = nodeId;
    
    // Set new start node color (green)
    if (nodeId !== null) {
      const mesh = nodeMeshes.get(nodeId);
      if (mesh) {
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
      }
    }
  }
  
  function setTargetNode(nodeId: number | null) {
    // Clear previous target node color
    if (targetNodeId !== null) {
      const prevMesh = nodeMeshes.get(targetNodeId);
      if (prevMesh && targetNodeId !== startNodeId) {
        // Only reset if not start node
        if (!hoveredNodeId || hoveredNodeId !== targetNodeId) {
          (prevMesh.material as THREE.MeshBasicMaterial).color.setHex(0x000000);
        }
      }
    }
    
    targetNodeId = nodeId;
    
    // Set new target node color (blue)
    if (nodeId !== null) {
      const mesh = nodeMeshes.get(nodeId);
      if (mesh) {
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x0000ff); // Blue
      }
    }
  }

  // Highlight node (green for highlighted nodes)
  function highlightNode(nodeId: number, highlight: boolean) {
    const mesh = nodeMeshes.get(nodeId);
    if (!mesh) return;

    if (highlight) {
      highlightedNodes.add(nodeId);
      // Don't override start/target node colors or selected nodes
      if (nodeId !== startNodeId && nodeId !== targetNodeId && !selectedNodes.has(nodeId)) {
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
      }
    } else {
      highlightedNodes.delete(nodeId);
      // Only reset to black if not hovered, start, target, or selected
      if (!hoveredNodeId || hoveredNodeId !== nodeId) {
        if (nodeId === startNodeId) {
          (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
        } else if (nodeId === targetNodeId) {
          (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x0000ff); // Blue
        } else if (selectedNodes.has(nodeId)) {
          (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00); // Orange/Yellow
        } else {
          (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x000000); // Black
        }
      }
    }
  }

  // Set selected nodes (for Task B: highlight selected nodes in yellow/orange)
  function setSelectedNodes(nodeIds: number[]) {
    // Clear previous selected nodes
    selectedNodes.forEach(nodeId => {
      const mesh = nodeMeshes.get(nodeId);
      if (mesh && nodeId !== startNodeId && nodeId !== targetNodeId) {
        if (!hoveredNodeId || hoveredNodeId !== nodeId) {
          (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x000000); // Black
        }
      }
    });
    
    selectedNodes.clear();
    
    // Set new selected nodes color (orange/yellow)
    nodeIds.forEach(nodeId => {
      selectedNodes.add(nodeId);
      const mesh = nodeMeshes.get(nodeId);
      if (mesh && nodeId !== startNodeId && nodeId !== targetNodeId) {
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00); // Orange/Yellow
      }
    });
  }

  // Handle window resize
  function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Maintain high DPI support (cap at 2x for performance)
    renderer.setSize(width, height);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    
    // Adjust camera to fit graph after resize
    adjustCameraToFitGraph();
  }

  window.addEventListener('resize', handleResize);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // 3Dの場合、ノードのサイズを距離に応じて調整して奥のノードも見やすくする
    if (!is2D && camera instanceof THREE.PerspectiveCamera) {
      const cameraPosition = camera.position.clone();
      const baseScale = 1.0;
      const minScale = 0.8; // 最小スケール（60%）- 奥のノードをより大きく表示
      const maxScale = 1.2; // 最大スケール（120%）- 手前のノードが大きくなりすぎないように
      const referenceDistance = 40; // 基準距離を小さくして、奥のノードがより大きくなるように
      
      nodeMeshes.forEach((mesh) => {
        const nodePosition = new THREE.Vector3();
        mesh.getWorldPosition(nodePosition);
        const distance = cameraPosition.distanceTo(nodePosition);
        
        // 距離に応じたスケール計算
        // 基準距離からの比率でスケールを計算し、最大・最小スケールで制限
        // 距離が遠いほど小さくなるが、最小スケールで保証される
        const scaleRatio = referenceDistance / Math.max(distance, 1);
        const scale = Math.max(minScale, Math.min(maxScale, baseScale * scaleRatio));
        mesh.scale.set(scale, scale, scale);
      });
    } else if (is2D) {
      // 2Dの場合はスケールをリセット
      nodeMeshes.forEach((mesh) => {
        mesh.scale.set(1, 1, 1);
      });
    }
    
    renderer.render(scene, camera);
  }
  animate();

  // Return API
  return {
    loadGraph,
    setCondition,
    highlightNode,
    setStartNode,
    setTargetNode,
    setSelectedNodes,
    onNodeClick: setOnNodeClick,
    pauseRotation,
    resumeRotation,
    destroy: () => {
      stopRotation();
      clearScene();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleMouseClick);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseleave', handleMouseLeave);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    },
  };
}

