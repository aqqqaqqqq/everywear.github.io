window.addEventListener('load', function() {
    // ----------- Bulma 初始化 -----------
    var carousels = bulmaCarousel.attach('.carousel', {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: false,
        autoplay: false,
    });
    bulmaSlider.attach();

    // ----------- SMPL Viewer 初始化 -----------
    const container = document.getElementById('smpl-container');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.5, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 注意：这里改为 new OrbitControls（而非 THREE.OrbitControls）
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    // 灯光
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 1, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(3, 10, 10);
    scene.add(dirLight);

    // 注意：这里改为 new GLTFLoader（而非 THREE.GLTFLoader）
    const loader = new GLTFLoader();
    loader.load('static/models/smpl_model.glb', function(gltf) {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);
    }, undefined, function(error) {
        console.error('Error loading SMPL model:', error);
    });

    // 渲染循环
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // 窗口缩放
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});
