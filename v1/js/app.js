/**
 * Country Selector
 * @author Callum Prentice / http://callum.com/
 */
var camera, scene, renderer, controls, stats;
var radius = 0.995;
var base_globe = 0;
var footprint_layer = 0;

var intersected_object = [];
var overlay_element = 0;
var hover_scale = 1.01;

function start_app() {
    init();
    animate();
}

function init() {
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setClearColor(0x000000, 0.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = false;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4500);
    camera.position.z = 100;

    scene.add(new THREE.AmbientLight(0xffffff));

    var directionalLight1 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
    directionalLight1.position.set(-1, 1, 1).normalize();
    scene.add(directionalLight1);

    var directionalLight2 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
    directionalLight2.position.set(-1, 1, -1).normalize();
    //scene.add(directionalLight2);

    var directionalLight3 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
    directionalLight3.position.set(1, 1, -1).normalize();
    //scene.add(directionalLight3);

    var directionalLight4 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
    directionalLight4.position.set(1, 1, 1).normalize();
    //scene.add(directionalLight4);

    var segments = 64;

    base_globe = new THREE.Object3D();
    base_globe.scale.set(20, 20, 20);
    scene.add(base_globe);
    footprint_layer = new THREE.Object3D();
    footprint_layer.scale.set(20, 20, 20);
    scene.add(footprint_layer);

    sea_texture = THREE.ImageUtils.loadTexture('textures/earth2.png', THREE.UVMapping, function () {
        //sea_texture.wrapS = THREE.ClampToEdgeWrapping;
        //sea_texture.wrapT = THREE.ClampToEdgeWrapping;
         //sea_texture.repeat.set(1, 1);
         //sea_texture.wrapS = THREE.RepeatWrapping;
         //sea_texture.offset.x = radians / ( 2 * Math.PI );
        base_globe.add(new THREE.Mesh(
        new THREE.SphereGeometry(radius, segments, segments,Math.PI/2.0),
        new THREE.MeshPhongMaterial({
            transparent: true,
            depthTest: true,
            depthWrite: true,
            opacity: 0.95,
            map: sea_texture,
            wireframe: false,
            shininess: 80,
            color: 0xffffff
        })));

        for (var name in country_data) {
            geometry = new Tessalator3D(country_data[name], 0);

            var continents = ["EU", "AN", "AS", "OC", "SA", "AF", "NA"];
            var color = new THREE.Color(0xff0000);
            color.setHSL(continents.indexOf(country_data[name].data.cont) * (1 / 7), Math.random() * 0.25 + 0.65, Math.random() / 2 + 0.25);
            var mesh = country_data[name].mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                color: color,
                transparent: true,
                wireframe: false,
                opacity: 0.5
            }));
            mesh.name = "land";
            mesh.userData.country = name;
            footprint_layer.add(mesh);
        }
     });

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 1.0;
    controls.noZoom = false;
    controls.noPan = true;
    controls.staticMoving = false;
    controls.minDistance = 23.0;
    controls.maxDistance = 70.0;
    controls.dynamicDampingFactor = 0.1;

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    if (intersected_object !== 0) {
        //intersected_object.scale.set(1.0, 1.0, 1.0);
        //intersected_object.material.opacity = 0.9;
        for(var i = 0;i < intersected_object.length;i++) {
                    intersected_object[i].material.opacity = 0.5;
                }
    }

    event.preventDefault();
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    var vector = new THREE.Vector3(mouseX, mouseY, -1);
    vector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize(),0,camera.position.length());
    var intersects = raycaster.intersectObject(footprint_layer, true);
    if (intersects.length > 0) {
        if (intersects[0].point !== null) {
            if (intersects[0].object.name === "land") {
                //console.log(intersects[0].object.userData.country);
                //console.log("items: "+intersects.length)

                if (overlay_element === 0) {
                    overlay_element = document.getElementById("overlay");
                }

                //intersects[0].object.scale.set(hover_scale, hover_scale, hover_scale);
                var label = "";
                for(var i = 0;i < intersects.length;i++) {
                    intersects[i].object.material.opacity = 0.9;
                    intersected_object[i] = intersects[i].object;
                    label = label +" + "+intersects[i].object.userData.country;
                }
                overlay_element.innerHTML = label;
               //intersects[0].object.material.opacity = 0.1;
                //intersected_object = intersects[0].object;
            } else {
                overlay_element.innerHTML = "";
            }
        } else {
            overlay_element.innerHTML = "";
        }
    } else {
            overlay_element.innerHTML = "";
    }
}

function animate(time) {
    requestAnimationFrame(animate);
    controls.update();
    stats.update();
    renderer.render(scene, camera);
    //console.log("z"+camera.position.z)
}