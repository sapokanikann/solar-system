var renderer;
var scene;
var camera;
var mesh;
var torus;

var myControls = new function () {
    this.color = "#c50000";
    this.metalness = 0.1;
    this.roughness = 0.5;
}

var myGUI = new dat.GUI();

myGUI.addColor(myControls, 'color')
myGUI.add(myControls, 'metalness', 0, 1)
myGUI.add(myControls, 'roughness', 0, 1)

function updateCanvas() {
    const myPath = '../img/';

    scene = new THREE.Scene();
    const background = new THREE.CubeTextureLoader().setPath(`${myPath}`).load(['front.png', 'back.png', 'top.png', 'bottom.png', 'left.png', 'right.png']);

    scene.background = background;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 35);

    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xFFFFFF, 3);
    light.position.set(1, 10, 6);
    scene.add(light);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 6;
    controls.maxDistance = 100;

    const mercuryButton = document.querySelector('[mercury]');
    const venusButton = document.querySelector('[venus]');
    const earthButton = document.querySelector('[earth]');
    const marsButton = document.querySelector('[mars]');
    const jupiterButton = document.querySelector('[jupiter]');
    const saturnButton = document.querySelector('[saturn]');
    const uranusButton = document.querySelector('[uranus]');
    const neptuneButton = document.querySelector('[neptune]');

    const createTexSphere = (r, map) => {
        const sphereGeo = new THREE.SphereGeometry(r, 20, 20);
        const sphereMat = new THREE.MeshStandardMaterial({
            map
        });
        return new THREE.Mesh(sphereGeo, sphereMat);
    }

    const createPlanet = (r = .4, map, xPos = 0, yPos = 0, zRot = 0) => {
        const sphere = createTexSphere(r, map);
        const pivot = new THREE.Object3D();
        sphere.rotateX(180);
        pivot.add(sphere);
        sphere.position.set(xPos, yPos, 0);
        pivot.rotation.x = 1.8;
        pivot.rotation.z = zRot;
        return {
            sphere,
            pivot
        }
    }

    const createSaturn = (r = .4, map, xPos = 0, yPos = 0, zRot = 0) => {
        const sphere = createTexSphere(r, map);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.rotateX(180);
        const pivot = new THREE.Object3D();
        pivot.add(sphere);
        sphere.position.set(xPos, yPos, 0);
        const ringGeo = new THREE.TorusGeometry(2, 0.2, 30, 200);
        const ringMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#ffbb53"),
            shading: THREE.FlatShading
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(xPos, yPos, 0)
        ring.castShadow = true;
        ring.receiveShadow = true;
        pivot.add(ring);
        pivot.rotation.x = 1.8;
        pivot.rotation.z = zRot;
        return {
            sphere,
            ring,
            pivot
        }
    }

    const mapSun = new THREE.ImageUtils.loadTexture('/img/sun.jpg', THREE.SphericalRefractionMapping);
    const mapMer = new THREE.ImageUtils.loadTexture('/img/mercury.jpg', THREE.SphericalRefractionMapping);
    const mapVen = new THREE.ImageUtils.loadTexture('/img/venus.jpg', THREE.SphericalRefractionMapping);
    const mapEar = new THREE.ImageUtils.loadTexture('/img/earth.jpg', THREE.SphericalRefractionMapping);
    const mapMar = new THREE.ImageUtils.loadTexture('/img/mars.jpg', THREE.SphericalRefractionMapping);
    const mapJup = new THREE.ImageUtils.loadTexture('/img/jupiter.jpg', THREE.SphericalRefractionMapping);
    const mapSat = new THREE.ImageUtils.loadTexture('/img/saturn.jpg', THREE.SphericalRefractionMapping);
    const mapUra = new THREE.ImageUtils.loadTexture('/img/uranus.jpg', THREE.SphericalRefractionMapping);
    const mapNep = new THREE.ImageUtils.loadTexture('/img/neptune.jpg', THREE.SphericalRefractionMapping);

    const sun = createTexSphere(3.2, mapSun);
    const mercury = createPlanet(.35, mapMer, 5);
    const venus = createPlanet(.55, mapVen, 7);
    const earth = createPlanet(.7, mapEar, 10);
    const mars = createPlanet(.45, mapMar, 12);
    const jupiter = createPlanet(1.9, mapJup, 25, 0, -4);
    const saturn = createSaturn(1.5, mapSat, 31, 10, -3);
    const uranus = createPlanet(0.9, mapUra, 37, 10, -1);
    const neptune = createPlanet(0.95, mapNep, 42, 15, -2);

    const mapAst = new THREE.ImageUtils.loadTexture('/img/asteroid.jpg', THREE.SphericalRefractionMapping);

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const asteroids = [];
    const asteroidsAmount = 100;

    for (let i = 0; i < asteroidsAmount; i++) {
        var planet = createPlanet(.15, mapAst);
        planet.sphere.position.set(getRandomIntInclusive(14, 16), getRandomIntInclusive(1, 5), getRandomIntInclusive(1, 4));
        planet.pivot.rotation.x = 2;
        planet.pivot.rotation.z = Math.random() * -100;
        sun.add(planet.pivot);
        asteroids.push(planet);
    }

    sun.add(mercury.pivot, venus.pivot, earth.pivot, mars.pivot, jupiter.pivot, saturn.pivot, uranus.pivot, neptune.pivot);

    const geometry = new THREE.TorusGeometry(0.5, 0.1, 30, 200);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        metalness: 0.1,
        roughness: 0.5,
    });
    torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    const selectPlanet = (planet, rangex, rangey = 0) => {
        torus.position.set(rangex, rangey, -2);
        planet.pivot.add(torus);
    }

    mercuryButton.addEventListener('click', () => selectPlanet(mercury, 5));
    venusButton.addEventListener('click', () => selectPlanet(venus, 7));
    earthButton.addEventListener('click', () => selectPlanet(earth, 10));
    marsButton.addEventListener('click', () => selectPlanet(mars, 12));
    jupiterButton.addEventListener('click', () => selectPlanet(jupiter, 25));
    saturnButton.addEventListener('click', () => selectPlanet(saturn, 31, 10));
    uranusButton.addEventListener('click', () => selectPlanet(uranus, 37, 10));
    neptuneButton.addEventListener('click', () => selectPlanet(neptune, 42, 15));

    const loop = function () {
        for (let i = 0; i < asteroidsAmount; i++) asteroids[i].pivot.rotation.z -= 0.009;
        mercury.pivot.rotation.z -= 0.03;
        venus.pivot.rotation.z -= 0.02;
        earth.pivot.rotation.z -= 0.015;
        mars.pivot.rotation.z -= 0.018;
        jupiter.pivot.rotation.z -= 0.008;
        saturn.pivot.rotation.z -= 0.006;
        uranus.pivot.rotation.z -= 0.002;
        neptune.pivot.rotation.z -= 0.001;

        requestAnimationFrame(loop);
    };

    loop();
    scene.add(sun);
    animate();
}

var animate = function () {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    torus.material.color.set(myControls.color);
    torus.material.metalness = myControls.metalness;
    torus.material.roughness = myControls.roughness;
}

function handleResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', handleResize, false);
