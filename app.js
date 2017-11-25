var can = document.querySelector('canvas');
var scene = new THREE.Scene();
var w = 20 * window.innerWidth / window.innerHeight;
var h = 20;
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
  //camera.position.z = Math.min(0, -100 + Math.max(1000*val/Number(slider.max), 0));
  //console.log(camera.position.z);
};

can.addEventListener('wheel', function (evt) {
  evt.preventDefault();
  camera.projectionMatrix.elements[11] += 0.001*evt.deltaY/Math.abs(evt.deltaY);
  slider.value = sliderLabel.textContent = camera.projectionMatrix.elements[11];
  //camera.position.z = Math.min(0, -100 + Math.max(1000*Number(slider.value)/Number(slider.max), 0));
  //console.log(camera.position.z);
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
  if (capturer || (!evt.shiftKey)) return;
  capturer = new CCapture( {
	  framerate: 60,
    format: 'webm',
    verbose: true
  });
  capturer.start();
  setTimeout(function () {
    capturer.stop();
    capturer.save();
    capturer = null;
  }, 3000);
});

window.onresize = function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.left = -10 * window.innerWidth / window.innerHeight;
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

  // effItUp();
  buildItUp();
  animate();
});

function makeEff () {
  var par = new THREE.Object3D();
  var tbGeo = new THREE.BoxBufferGeometry(3,1,1);
  var topBar = new THREE.Mesh( tbGeo, material );
  topBar.position.set(0,2,0);

  var dnGeo = new THREE.BoxBufferGeometry(1,4,1);
  var dnBar = new THREE.Mesh( dnGeo, material );
  dnBar.position.set(1,-0.5,0);

  var mdGeo = new THREE.BoxBufferGeometry(1,1,1);
  var mdBar = new THREE.Mesh( mdGeo, material );
  mdBar.position.set(0,0,0);

  par.add(topBar, dnBar, mdBar);
  return par;
}

function effItUp() {
  var sp = 11;
  var nn = 5;
  var nm = 9;
  for (var i=0; i<nn; i++) {
    for (var j=0; j<nn; j++) {
      for(var k=0; k<nm; k++) {
        var newEff = makeEff();
        newEff.position.x = (i-nn/2)*sp;
        newEff.position.y = (j-nn/2)*sp;
        newEff.position.z = k*sp;
        newEff.rotation.x = 0.2*Math.random()-0.1;
        newEff.rotation.y = 0.2*Math.random()-0.1;
        newEff.rotation.z = 0.2*Math.random()-0.1;
        scene.add(newEff);
      }
    }
  }
}

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
