import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

window.addEventListener('load', function() {
    const gallery = document.getElementById("videoGalleryStairs");
    if (gallery) {
        const leftBtn = document.getElementById("scrollLeftBtnStairs");
        const rightBtn = document.getElementById("scrollRightBtnStairs");
        const items = gallery.querySelectorAll(".video-item");
        const videoWidth = 170;
        const gap = 10;
        const slideWidth = videoWidth + gap;
        const viewportWidth = document.querySelector(".video-viewport").offsetWidth;
        const totalWidth = items.length * slideWidth - gap;
        const maxOffset = -(totalWidth - viewportWidth);
        rightBtn.addEventListener("click", () => {
            offset -= videoWidth;
            if (offset < maxOffset) offset = maxOffset;
            gallery.style.transform = `translateX(${offset}px)`;
        });
        leftBtn.addEventListener("click", () => {
            offset += videoWidth;
            if (offset > 0) offset = 0;
            gallery.style.transform = `translateX(${offset}px)`;
        });
    }
    
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
    let currentModel = null;
    let mixer = null;
    let loadId = 0; // 每次加载都会递增
    
    function loadGLB(path) {
        const thisLoadId = ++loadId; // 记录当前加载编号
    
        // 移除旧模型
        if (currentModel) {
            scene.remove(currentModel);
            if (mixer) {
                mixer.stopAllAction();
                mixer.uncacheRoot(currentModel);
                mixer = null;
            }
            disposeModel(currentModel);
            currentModel = null;
            renderer.clear();
        }
    
        loader.load(path, function(gltf) {
            // 检查是否仍然是最新加载
            if (thisLoadId !== loadId) {
                // 已经被新的加载覆盖，直接丢弃
                disposeModel(gltf.scene);
                return;
            }
    
            currentModel = gltf.scene;

            let hasVertexColors = false;
            currentModel.traverse((child) => {
                if (child.isMesh && child.geometry && child.geometry.attributes.color) {
                    hasVertexColors = true;
                    console.log("找到顶点颜色属性:", child.geometry.attributes.color);
                }
            });
            
            if (hasVertexColors) {
                // 正确应用顶点颜色，同时保留材质的其他属性
                currentModel.traverse((child) => {
                    if (child.isMesh && child.geometry && child.geometry.attributes.color) {
                        // 方法1: 在原始材质基础上启用顶点颜色
                        if (child.material) {
                            // 创建材质副本，避免修改原始材质
                            const newMaterial = child.material.clone();
                            newMaterial.vertexColors = true;
                            newMaterial.needsUpdate = true;
                            child.material = newMaterial;
                        } else {
                            // 如果没有材质，创建一个新材质
                            child.material = new THREE.MeshStandardMaterial({
                                vertexColors: true,
                                side: THREE.DoubleSide,
                                metalness: 0.3,
                                roughness: 0.7,
                                flatShading: false
                            });
                        }
                        
                        // 确保几何体标记为需要更新
                        child.geometry.attributes.color.needsUpdate = true;
                        child.geometry.attributes.position.needsUpdate = true;
                    }
                });
            } else {
                console.warn("模型没有顶点颜色属性");
            }
            
            scene.add(currentModel);
    
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(currentModel);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
            }
    
            // 模型居中
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = new THREE.Vector3();
            box.getCenter(center);
    
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
