(function (THREE) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer();

  var star, plenet;
  const axis = new THREE.Vector3(0, 1, 0).normalize();

  window.onload = function () {
    scene.name = "scene";
    camera.position.set(150, 150, 200);
    camera.lookAt(scene.position);

    // add sunlight light
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 200, 200);
    directionalLight.name = "directional";
    scene.add(directionalLight);

    let earh = new THREE.TextureLoader().load('./images/earth-sphere.jpg', function (texture) {
      star = new THREE.Mesh(
        new THREE.SphereGeometry(50, 32, 32),
        new THREE.MeshBasicMaterial({ map: texture })
      );
      star.name = "star";
      scene.add(star);
    });


    let moon = new THREE.TextureLoader().load('./images/moon-map-3d-model.jpg', function (texture) {
      // immediately use the texture for material creation

      planet = new THREE.Mesh(
        new THREE.SphereGeometry(20, 32, 32),
        new THREE.MeshBasicMaterial({ map: texture })
      );
      planet.name = "planet";
      planet.position.set(140, 0, 0);
      scene.add(planet);

      renderer.setClearColor(0x333333);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      window.addEventListener(
        "resize",
        function () {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();

          renderer.setSize(window.innerWidth, window.innerHeight);
        },
        false
      );

      animate();

    });
  };

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  var quaternion = new THREE.Quaternion();
  function render() {
    if (star) {

      star.rotation.y += 0.0001;
    }

    quaternion.setFromAxisAngle(axis, 0.005);
    planet.position.applyQuaternion(quaternion);

    renderer.render(scene, camera);
  }
})(window.THREE);
