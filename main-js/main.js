
(function (THREE) {

    let scene, camera, renderer;
    let arToolkitSource, arToolkitContext;
    let markerRoot;

    let earth;
    let moon;
    let plane;

    let fov;
    let zoom = 1.0;
    let quaternio;
    let zoomUnit = 0.053;
    let earthSpeedRotation = 0.0081;
    let moonSpeedRotation = 0.0025;

    const axis = new THREE.Vector3(0, 1, 0).normalize();
    initialize();
    animate();

    function initialize() {
        scene = new THREE.Scene();

        let ambientLight = new THREE.AmbientLight(0xcccccc, 0.2);
        scene.add(ambientLight);

        camera = new THREE.PerspectiveCamera(45, 320 / 240, 0.1, 1000);
        camera.position = new THREE.Vector3(350, 350, 350);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        scene.add(camera);

        fov = camera.fov;

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        // set full size for android
        if (window.navigator.platform != 'Android' && window.navigator.platform != 'Linux armv7l') {
            renderer.setSize(window.innerWidth, window.innerHeight);
        } else {
            renderer.setSize(1476, 2668);
        }

        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0px'
        renderer.domElement.style.left = '0px'
        document.body.appendChild(renderer.domElement);

        /* Initialize Event Listener for mouse wheel */
        document.addEventListener('mousewheel', onMouseWheel, false);

        /* Initialize Event Listener for click zoom in */
        const $zoomIn = document.getElementById('zoomIn');
        $zoomIn.addEventListener('click', zoomIn, false);

        /* Initialize Event Listener for click zoom out */
        const $zoomOut = document.getElementById('zoomOut');
        $zoomOut.addEventListener('click', zoomOut, false);

        /* Initialize Event Listener for click zoom out */
        const $speedUp = document.getElementById('speedUp');
        $speedUp.addEventListener('click', speedUp, false);

        /* Initialize Event Listener for click zoom out */
        const $speedDown = document.getElementById('speedDown');
        $speedDown.addEventListener('click', speedDown, false);

        /* setup arToolkitSource */
        arToolkitSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam',
        });

        function onResize() {
            arToolkitSource.onResize()
            arToolkitSource.copySizeTo(renderer.domElement)
            if (arToolkitContext.arController !== null) {
                arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
            }
        }

        arToolkitSource.init(function onReady() {
            onResize()
        });

        /* handle resize event */
        window.addEventListener('resize', function () {
            onResize();
        });

        ////////////////////////////////////////////////////////////
        // setup arToolkitContext
        ////////////////////////////////////////////////////////////

        // create atToolkitContext
        arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: 'data/camera_para.dat',
            detectionMode: 'mono'
        });

        // copy projection matrix to camera when initialization complete
        arToolkitContext.init(function onCompleted() {
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        });

        ////////////////////////////////////////////////////////////
        // setup markerRoots
        ////////////////////////////////////////////////////////////

        /* build markerControls */
        markerRoot = new THREE.Group();
        scene.add(markerRoot);

        /* setup marker */
        new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
            type: 'pattern', patternUrl: 'data/letterA.patt',
        })

        /* create Earth object */
        let earthSphere = new THREE.SphereGeometry(0.8, 32, 32);
        let loader = new THREE.TextureLoader();
        let earthTexture = loader.load('images/earth-sphere.jpg', render);
        let earthMaterial = new THREE.MeshLambertMaterial({ map: earthTexture, opacity: 1 });

        earth = new THREE.Mesh(earthSphere, earthMaterial);
        earth.name = 'earth'
        earth.position.y = 1.5; // initial position
        markerRoot.add(earth); // add earth in environment


        /* create Moon object */
        let moonSphere = new THREE.SphereGeometry(0.3, 32, 32);
        let moonTexture = loader.load('images/moon-map-3d-model.jpg', render);
        let moonMaterial = new THREE.MeshLambertMaterial({ map: moonTexture, opacity: 0.95 });

        moon = new THREE.Mesh(moonSphere, moonMaterial);
        moon.name = 'moon';
        moon.position.set(1.2, 1.8, 0); // initial position
        markerRoot.add(moon); // add moon in environment

        /* Initial Sunlight */
        let sunLight = new THREE.PointLight(0xffffff, 1.5, 90, 2);
        /* PointLight( color : Integer, intensity : Float, distance : Number, decay : Float )
        color - (optional) hexadecimal color of the light. Default is 0xffffff (white).
        intensity - (optional) numeric value of the light's strength/intensity. Default is 1.
        distance - Maximum range of the light. Default is 0 (no limit).
        decay - The amount the light dims along the distance of the light. Default is 1. For physically correct lighting, set this to 2.
        */

        /* create sun object/dot */
        sunLight.add(
            new THREE.Mesh(
                new THREE.SphereBufferGeometry(0.05, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xffff00 })
            )
        );
        sunLight.position.set(1.1, 3, 2); // initial sun position
        markerRoot.add(sunLight); // add sun in environment

        let geometry1 = new THREE.CircleGeometry(2, 32); // radius, tube radius
        let texture1 = loader.load('images/milkyway.jpeg');

        // shader-based material
        let starMaterial = new THREE.MeshLambertMaterial({ map: texture1, opacity: 0.999 });

        plane = new THREE.Mesh(geometry1, starMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.scale.z = 0.10;

        markerRoot.add(plane);


        quaternion = new THREE.Quaternion();
    }

    function update() {
        // if (markerRoot.visible) { // uncomment if if you wish to spin the objects in background

        earth.rotation.y += earthSpeedRotation;
        quaternion.setFromAxisAngle(axis, moonSpeedRotation);
        moon.position.applyQuaternion(quaternion);

        // }

        // update artoolkit on every frame
        if (arToolkitSource.ready !== false)
            arToolkitContext.update(arToolkitSource.domElement);
    }

    function render() {
        camera.fov = fov * zoom;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
    }

    function animate() {
        requestAnimationFrame(animate);
        update();
        render();
    }
    /* Function for mouse wheel (Event Listener) */
    function onMouseWheel(e) {
        zoom += e.deltaY / 1000;
        // debugger
        console.log(e.deltaY / 1000)
    }

    function zoomIn() {
        zoom += -zoomUnit;
    }

    function zoomOut() {
        zoom += zoomUnit;
    }

    function speedUp() {
        const _earthSpeedRotation = 0.0081;
        const _moonSpeedRotation = 0.0025;
        earthSpeedRotation += _earthSpeedRotation;
        moonSpeedRotation += _moonSpeedRotation;
    }

    function speedDown(e) {
        const _earthSpeedRotation = 0.0081;
        const _moonSpeedRotation = 0.0025;
        /* prevent spinning rearwards */
        if (earthSpeedRotation > 0 || moonSpeedRotation > 0) {
            earthSpeedRotation += -_earthSpeedRotation;
            moonSpeedRotation += -_moonSpeedRotation;
        }
    }

})(window.THREE);
