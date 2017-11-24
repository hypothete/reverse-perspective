var can = document.querySelector('canvas');
var scene = new THREE.Scene();
var w = 20 * window.innerWidth / window.innerHeight;
var h = 20;
var camera = new THREE.OrthographicCamera( -w/2, w/2, h/2, -h/2, -1000, 1000);
var renderer = new THREE.WebGLRenderer({ canvas: can, antialias: true });
var slider = document.querySelector('#slider');
var sliderLabel = document.querySelector('#slider-label');
var capturer;

camera.position.set(-3,-2,-10);
camera.lookAt(new THREE.Vector3(0,0,0));
renderer.setSize(window.innerWidth, window.innerHeight);

var material = new THREE.MeshNormalMaterial();

slider.oninput = function () {
  var val = Number(slider.value);
  camera.projectionMatrix.elements[11] = sliderLabel.textContent = val;
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
    camera.rotation.y = 2*xOff/can.width - 1;
    camera.rotation.y = 2*Math.atan(2*xOff/can.width - 1);
    camera.rotation.x = -(Math.PI-Math.atan(2*yOff/can.height-1));
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

effItUp();

animate();
