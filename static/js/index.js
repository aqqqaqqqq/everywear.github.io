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
        console.error('smpl-container not found！');
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

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 5, 5);
    keyLight.castShadow = false;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-5, 2, 2);
    fillLight.castShadow = false;
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
    rimLight.position.set(0, 3, -5);
    rimLight.castShadow = false;
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    // ============ 动画相关 ============
    let mixer = null;
    let currentModel = null;
    const clock = new THREE.Clock();
    const loader = new GLTFLoader();

    function disposeModel(model) {
        if (!model) return;

        model.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();

            if (obj.material) {
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                materials.forEach(m => {
                    for (const key in m) {
                        if (m[key] && m[key].isTexture) m[key].dispose();
                    }
                    m.dispose();
                });
            }
        });
    }

    // ==============================
    // 加载 GLB 函数（动态切换）
    // ==============================
    function loadGLB(path) {

        // clear old model
        if (currentModel) {
            scene.remove(currentModel);

            if (mixer) {
                mixer.stopAllAction();
                mixer.uncacheRoot(currentModel);
                mixer = null;
            }

            disposeModel(currentModel);
            currentModel = null;

            renderer.clear(); // 清理缓存
        }

        loader.load(path, function(gltf) {
            currentModel = gltf.scene;
            scene.add(currentModel);

            // ===== 播放动画 =====
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(currentModel);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                console.log("Loaded animation:", path);
            } else {
                console.warn("No animation found in", path);
            }

            // ===== 模型居中 =====
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = new THREE.Vector3();
            box.getCenter(center);

            // 默认视角重置
            camera.position.set(center.x, center.y, center.z + 3);
            controls.target.copy(center);
            controls.update();

        }, undefined, err => {
            console.error("Failed to load GLB:", err);
        });
    }

    // ==============================
    // 监听下拉框
    // ==============================
    const selector = document.getElementById("glb-selector");
    if (selector) {
        selector.addEventListener("change", function() {
            loadGLB(this.value);
        });

        // 初始加载默认模型
        loadGLB(selector.value);
    }

    // ==============================
    // Render Loop
    // ==============================
    function animate() {
        requestAnimationFrame(animate);

        if (mixer) mixer.update(clock.getDelta());

        renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});
