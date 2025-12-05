import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

window.addEventListener('load', function() {
    var carousels = bulmaCarousel.attach('.carousel', {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: false,
        autoplay: false,
    });
    bulmaSlider.attach();

    const container = document.getElementById('smpl-container');
    if (!container) {
        console.error('smpl-container 元素不存在！');
        return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0.5, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.8, 0);
    controls.enableReset = false;
    controls.minDistance = 2.0;
    controls.maxDistance = 5.0;
    controls.update();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 2, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(3, 5, 5);
    scene.add(dirLight);

    // ============ 动画相关 ============
    let mixer;                 // AnimationMixer
    let clock = new THREE.Clock();   // 计算动画 deltaTime

    // ============ 加载 GLB ============
    const loader = new GLTFLoader();
    loader.load('static/models/smpl_animated.glb', function(gltf) {

        const model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);

        // ================= 播放动画 =================
        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
            console.log("Animation loaded and playing.");
        } else {
            console.warn("GLB 中不包含动画！");
        }

        // ================= 自动模型居中 =================
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        console.log("模型中心:", center);

        camera.position.y = center.y - 0.2;
        controls.target.copy(center);
        controls.update();
        
    }, undefined, function(error) {
        console.error('Error loading animated SMPL model:', error);
    });

    function animate() {
        requestAnimationFrame(animate);

        // 更新动画
        if (mixer) {
            const delta = clock.getDelta();
            mixer.update(delta);
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});
