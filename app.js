var can = document.querySelector('canvas');
var scene = new THREE.Scene();
var cZ = 50;
var w = cZ * window.innerWidth / window.innerHeight;
var h = cZ;
var camera = new THREE.OrthographicCamera( -w/2, w/2, h/2, -h/2, -1000, 1000);
var renderer = new THREE.WebGLRenderer({ canvas: can, antialias: true });
var slider = document.querySelector('#slider');
var sliderLabel = document.querySelector('#slider-label');
var capturer;
var obJloader = new THREE.OBJLoader();
var bases, mids, roofs;

camera.position.set(-16,24,-16);
camera.lookAt(new THREE.Vector3(-16,24,1000));
camera.rotation.order = 'YXZ';
renderer.setSize(window.innerWidth, window.innerHeight);
camera.projectionMatrix.elements[11] = sliderLabel.textContent = Number(slider.value);

var material = new THREE.MeshNormalMaterial();

var planeGeo = new THREE.PlaneBufferGeometry(336,336,100,100);
var planeMesh = new THREE.Mesh(planeGeo, material);
planeMesh.rotation.x = -Math.PI/2;
planeMesh.position.set(0,0,160);
scene.add(planeMesh);

slider.oninput = function () {
  camera.projectionMatrix.elements[11] = sliderLabel.textContent = Number(slider.value);
};

can.addEventListener('wheel', function (evt) {
  evt.preventDefault();
  camera.projectionMatrix.elements[11] += 0.001*evt.deltaY/Math.abs(evt.deltaY);
  slider.value = sliderLabel.textContent = camera.projectionMatrix.elements[11];
});

can.addEventListener('mousemove', function (evt) {
  if (evt.buttons) {
    var xOff = evt.offsetX;
    var yOff = evt.offsetY;
    camera.rotation.x = Math.PI+(yOff/can.height - 0.5);
    camera.rotation.y = 2*Math.atan(2*xOff/can.width - 1);
  }
});

can.addEventListener('click', function (evt) {
  setTimeout(function () {
    if (capturer || (!evt.shiftKey)) return;
    console.log('started');
    capturer = new CCapture( {
  	  framerate: 60,
      format: 'gif',
      workersPath: 'vendor/'
    });
    capturer.start();
    setTimeout(function () {
      capturer.stop();
      capturer.save();
      capturer = null;
      console.log('ended');
    }, 1000);
  }, 1000);
});

window.onresize = function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.left = -(cZ/2) * window.innerWidth / window.innerHeight;
  camera.right = -camera.left;
  camera.updateProjectionMatrix();
};

var baseFiles = ['objs/base1.obj','objs/base2.obj','objs/base3.obj','objs/base4.obj','objs/base5.obj'];
var midFiles = ['objs/mid1.obj','objs/mid2.obj','objs/mid3.obj','objs/mid4.obj','objs/mid5.obj'];
var roofFiles = ['objs/roof1.obj','objs/roof2.obj','objs/roof3.obj','objs/roof4.obj','objs/roof5.obj'];

Promise.all([
  loadBldgs(baseFiles),
  loadBldgs(midFiles),
  loadBldgs(roofFiles)
])
.then(function (bundle) {
  bases = bundle[0];
  mids = bundle[1];
  roofs = bundle[2];

  buildItUp();
  animate();
});

function animate () {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (capturer) {
    capturer.capture(can);
  }
}

function loadObj (filename) {
  return new Promise ( function (res, rej) {
    obJloader.load(filename, function (loadedObj) {
      res(loadedObj.children[0].geometry);
    }, null, rej);
  });
}

function loadBldgs (filenames) {
  return Promise.all(filenames.map(loadObj));
}

function pick (arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

function makeBldg () {
  var bldg = new THREE.Object3D();
  var baseGeo = pick(bases);
  var roofGeo = pick(roofs);
  var roofHeight = 16;
  var numMids = Math.round(Math.random() * 2);
  var baseMesh = new THREE.Mesh(baseGeo, material);
  bldg.add(baseMesh);
  for (var i=0; i<numMids; i++) {
    var midGeo = pick(mids);
    var midMesh = new THREE.Mesh(midGeo, material);
    midMesh.position.set(0,roofHeight,0);
    roofHeight += 16;
    midMesh.rotation.y = Math.PI * Math.round(Math.random() * 3) / 2;
    bldg.add(midMesh);
  }
  var roofMesh = new THREE.Mesh(roofGeo, material);
  roofMesh.position.set(0,roofHeight,0);
  roofMesh.rotation.y = Math.PI * Math.round(Math.random() * 3) / 2;
  bldg.add(roofMesh);
  return bldg;
}

function buildItUp () {
  for (var i=0; i<10; i++) {
    for (var j=0; j<5; j++) {
      var rX = i * 32 - 160;
      var rZ = j * 64;
      var rY = 0;
      var newBldg = makeBldg();
      newBldg.rotation.y = Math.PI * Math.round(Math.random() * 3) / 2;
      newBldg.position.set(rX, rY, rZ);
      scene.add(newBldg);
    }
  }
}
