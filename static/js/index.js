window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function() {
    // Check for click events on the navbar burger icon
    var options = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: false,
			autoplay: false,
			autoplaySpeed: 100000,
    }
		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
    bulmaSlider.attach();
})

const container = document.getElementById('smpl-container');

// ----------- Three.js 基本设置 -----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0,1,0);
controls.update();

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2,4,2);
scene.add(light);

// ----------- SMPL 父子关系 -----------
const parents = [
  -1, 0, 0, 0,
  1, 2, 3,
  1, 2, 3,
  0, 4, 5, 6,
  7, 8, 9,
  10,11,12,13,
  14,15,16
];

// ----------- SMPL 默认骨架位置（单位米，示例） -----------
const jointRest = [
  [0,0,0],          // pelvis
  [0,-0.1,0], [0,-0.4,0], [0,-0.7,0],  // left leg
  [0,-0.1,0], [0,-0.4,0], [0,-0.7,0],  // right leg
  [0,0.2,0], [0,0.4,0], [0,0.6,0],     // spine
  [0.2,0.7,0], [0.4,0.7,0], [0.6,0.7,0], // right arm
  [-0.2,0.7,0], [-0.4,0.7,0], [-0.6,0.7,0], // left arm
  [0,0.9,0], [0,1.0,0], [0,1.1,0], [0,1.2,0], [0,1.3,0], [0,1.4,0], [0,1.5,0] // head
];

// ----------- 示例旋转数据（axis-angle: [x,y,z]） -----------
let axisAngle = [
  [0,0,0],[0,0,0],[0,0,0],[0,0,0],
  [0,0,0],[0,0,0],[0,0,0],
  [0,0,0],[0,0,0],[0,0,0],
  [0,0,0],[0,0,0],[0,0,0],
  [0,0,0],[0,0,0],[0,0,0],
  [0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]
];

// 将 axis-angle 转换成 Matrix4
let rotations = axisAngle.map(v=>{
  const axis = new THREE.Vector3(v[0],v[1],v[2]);
  const angle = axis.length();
  if(angle===0) return new THREE.Matrix4().identity();
  axis.normalize();
  return new THREE.Matrix4().makeRotationAxis(axis, angle);
});

// ----------- 正向运动学计算全局关节位置 -----------
function computeGlobalJoints(){
  let globals = [];
  for(let i=0;i<24;i++){
    let pos = new THREE.Vector3(...jointRest[i]);
    let mat = new THREE.Matrix4().copy(rotations[i]);
    if(parents[i]>=0){
      let parentMat = globals[parents[i]].clone();
      parentMat.multiply(mat);
      mat = parentMat;
    }
    globals.push(mat);
  }

  let positions = [];
  for(let i=0;i<24;i++){
    let p = new THREE.Vector3(...jointRest[i]);
    p.applyMatrix4(globals[i]);
    positions.push(p);
  }
  return positions;
}

// ----------- 绘制骨架 -----------
function drawSkeleton(){
  const joints = computeGlobalJoints();
  const points = [];
  for(let i=0;i<24;i++){
    if(parents[i]===-1) continue;
    points.push(joints[i]);
    points.push(joints[parents[i]]);
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({color:0x00ffcc});
  return new THREE.LineSegments(geometry, material);
}

let skeleton = drawSkeleton();
scene.add(skeleton);

// ----------- 渲染循环 -----------
function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
animate();

// ----------- 窗口自适应 -----------
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
