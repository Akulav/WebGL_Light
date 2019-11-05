"use strict"
var i = 0;
var p = 2;
var canvas;
var gl;
var select;
var toDraw = []
var flag = true;
var theta = 0.0;
var aspect;
var viewerPos;
var ctm;
var ambientColor, diffuseColor, specularColor;

var coordPP = [
  vec4(0.0, 0.0, 0.0, 1),
  vec4(0.154, 0.0, 0.0, 1),
  vec4(0.154, 0.0, -0.4, 1),
  vec4(0.0, 0.0, -0.4, 1),
  vec4(-0.0, 0.62, 0.0, 1),
  vec4(0.0, 0.62, -0.4, 1),
  vec4(0.154, 0.62, -0.4, 1),
  vec4(0.154, 0.62, 0.0, 1),
]

var vertices = [
  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5, 0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0)
];

//Cone

var radiusC = 0.7;
var angleDelta = 0.05;
var verticesC = [];

for (let angle = 0; angle <= 360; angle += 0) {

  let point1 = vec3(radiusC * Math.cos(Math.PI * angle / 180), 0, radiusC * Math.sin(Math.PI * angle / 180))
  angle += angleDelta;
  let point2 = vec3(radiusC * Math.cos(Math.PI * angle / 180), 0, radiusC * Math.sin(Math.PI * angle / 180));

  verticesC.push(point1)
  verticesC.push(vec3(0, 0, 0))
  verticesC.push(point2)

  verticesC.push(point1)
  verticesC.push(vec3(0, 0.9, 0))
  verticesC.push(point2)
}

//end of cone
//start of cube

var pointsArray = [];
var pointsArrayPrism = [];
var normalsArray = [];
var normalsArrayPrism = [];

function quad(a, b, c, d) {
  var t1 = subtract(vertices[b], vertices[a]);
  var t2 = subtract(vertices[c], vertices[b]);
  var normal = cross(t1, t2);
  var normal = vec3(normal);
  pointsArray.push(vertices[a]);
  normalsArray.push(normal);
  pointsArray.push(vertices[b]);
  normalsArray.push(normal);
  pointsArray.push(vertices[c]);
  normalsArray.push(normal);
  pointsArray.push(vertices[a]);
  normalsArray.push(normal);
  pointsArray.push(vertices[c]);
  normalsArray.push(normal);
  pointsArray.push(vertices[d]);
  normalsArray.push(normal);
}
function colorCube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}
colorCube();

//end of cube
//lightPyramid

var indexPyramid = 0;
var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);
var normalsArrayPyramid = [];
var pointsArrayPyramid = [];

function triangle(a, b, c) {
  pointsArrayPyramid.push(a);
  pointsArrayPyramid.push(b);
  pointsArrayPyramid.push(c);

  normalsArrayPyramid.push(a[0], a[1], a[2], 0.0);
  normalsArrayPyramid.push(b[0], b[1], b[2], 0.0);
  normalsArrayPyramid.push(c[0], c[1], c[2], 0.0);
  indexPyramid += 3;
}

function divideTriangle(a, b, c, count) {
  if (count > 0) {

    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var bc = mix(b, c, 0.5);

    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
  }
  else {
    triangle(a, b, c);
  }
}

function tetrahedron(a, b, c, d, n) {
  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}
tetrahedron(va, vb, vc, vd, 0);

//end of pyramid
//sphere light

var indexSphere = 0;
var normalsArraySphere = [];
var pointsArraySphere = [];

function triangle2(a, b, c) {
  pointsArraySphere.push(a);
  pointsArraySphere.push(b);
  pointsArraySphere.push(c);

  normalsArraySphere.push(a[0], a[1], a[2], 0.0);
  normalsArraySphere.push(b[0], b[1], b[2], 0.0);
  normalsArraySphere.push(c[0], c[1], c[2], 0.0);
  indexSphere += 3;
}

function divideTriangle2(a, b, c, count) {
  if (count > 0) {

    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var bc = mix(b, c, 0.5);

    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);

    divideTriangle2(a, ab, ac, count - 1);
    divideTriangle2(ab, b, bc, count - 1);
    divideTriangle2(bc, c, ac, count - 1);
    divideTriangle2(ab, bc, ac, count - 1);
  }
  else {
    triangle2(a, b, c);
  }
}

function tetrahedron2(a, b, c, d, n) {
  divideTriangle2(a, b, c, n);
  divideTriangle2(d, c, b, n);
  divideTriangle2(a, d, b, n);
  divideTriangle2(a, c, d, n);
}
tetrahedron2(va, vb, vc, vd, 8);

//end sphere light
//initialization

window.onload = init;
function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }
  aspect = canvas.width / canvas.height;
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 9000000, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);
  /*
    var bufferColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
    var vColors = gl.getAttribLocation(program, "vColors");
    gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(vColors);
  */
  document.addEventListener("keydown", keyDownTextField, false);
  function keyDownTextField(e) {
    var keyCode = e.keyCode;
    if (keyCode == 87) {
      select.trCoeff[1] += 0.1;
    }
    if (keyCode == 83) {
      select.trCoeff[1] -= 0.1;
    }
    if (keyCode == 65) {
      select.trCoeff[0] -= 0.1;
    }
    if (keyCode == 68) {
      select.trCoeff[0] += 0.1;
    }
    if (keyCode == 32) {
      if (p % 2 == 0) {
        select.flag = true;
        p++;
      }
      else {
        select.flag = false;
        p++;
      }
    }
    if (keyCode == 46) {
      var e = document.getElementById("SelectObject");
      var index = e.selectedIndex
      toDraw.splice(index, 1)
      e.remove(e.selectedIndex);
    }
  }

  function detectMouseWheelDirection(e) {
    var delta = null,
      direction = false;
    if (!e) {
      e = window.event;
    }
    if (e.wheelDelta) {
      delta = e.wheelDelta / 60;
    } else if (e.detail) {
      delta = -e.detail / 2;
    }
    if (delta !== null) {
      direction = delta > 0 ? 'up' : 'down';
    }
    return direction;
  }
  function handleMouseWheelDirection(direction) {
    if (direction == 'down') {
      select.coeff -= 0.1;
    } else if (direction == 'up') {
      select.coeff += 0.1;
    } else {
    }
  }
  document.onmousewheel = function (e) {
    handleMouseWheelDirection(detectMouseWheelDirection(e));
  };
  if (window.addEventListener) {
    document.addEventListener('DOMMouseScroll', function (e) {
      handleMouseWheelDirection(detectMouseWheelDirection(e));
    });
  }
  document.getElementById("further").onclick = function () {
    select.trCoeff[2] -= 0.1;
  };
  document.getElementById("closer").onclick = function () {
    select.trCoeff[2] += 0.1;
  };
  document.getElementById("Button9").onclick = function () {
    var cube = new Drawable(pointsArray, program, normalsArray);
    toDraw.push(cube);
    select = cube;
    var selected = document.getElementById("SelectObject");
    var opt = toDraw[i];
    var el = document.createElement("option");
    el.textContent = "Cube" + i;
    el.value = opt;
    selected.appendChild(el);
    i++;
  }
  document.getElementById("Button11").onclick = function () {
    var Pyramid = new Drawable(pointsArrayPyramid, program, normalsArrayPyramid);
    toDraw.push(Pyramid);
    select = Pyramid;
    var selected = document.getElementById("SelectObject");
    var opt = toDraw[i];
    var el = document.createElement("option");
    el.textContent = "Pyramid" + i;
    el.value = opt;
    selected.appendChild(el);
    i++;
  }
  document.getElementById("Button12").onclick = function () {
    var sphere = new Drawable(pointsArraySphere, program, normalsArraySphere);
    toDraw.push(sphere);
    select = sphere;
    var selected = document.getElementById("SelectObject");
    var opt = toDraw[i];
    var el = document.createElement("option");
    el.textContent = "Sphere" + i;
    el.value = opt;
    selected.appendChild(el);
    i++;
  }
  document.getElementById("Button13").onclick = function () {
    var Cone = new Drawable(verticesC, program, normalsArray);
    toDraw.push(Cone);
    select = Cone;
    var selected = document.getElementById("SelectObject");
    var opt = toDraw[i];
    var el = document.createElement("option");
    el.textContent = "Cone" + i;
    el.value = opt;
    selected.appendChild(el);
    i++;
  }
  document.getElementById("Shine").onclick = function () {
    var selected = document.getElementById("SelectObject");
    var opt = toDraw[i];
    select.materialShininess += 10;
  }
  document.getElementById("Shine-").onclick = function () {
    var selected = document.getElementById("SelectObject");
    var opt = toDraw[i];
    select.materialShininess -= 10;
  }

  document.getElementById("SelectObject").onclick = function () {
    var e = document.getElementById("SelectObject");
    select = toDraw[e.selectedIndex];
  };
  document.getElementById("SelectColor").onclick = function () {
    var e = document.getElementById("SelectColor").value;

    if (e == "Red") {
      for (i = 0; i <= toDraw.length; i++) {
        select = toDraw[i];
        select.lightDiffuse = vec4(0.6, 0.2, 0.2, 1)
        select.lightSpecular = vec4(0.6, 0.2, 0.2, 1)
        select.diffuseProduct = mult(select.lightDiffuse, select.materialDiffuse);
        select.specularProduct = mult(select.lightSpecular, select.materialSpecular);
      }
    }
    if (e == "Default") {
      for (i = 0; i <= toDraw.length; i++) {
        select = toDraw[i];
        select.lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
        select.lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
        select.diffuseProduct = mult(select.lightDiffuse, select.materialDiffuse);
        select.specularProduct = mult(select.lightSpecular, select.materialSpecular);
      }
    }

    if (e == "Green") {
      for (i = 0; i <= toDraw.length; i++) {
        select = toDraw[i];
        select.lightDiffuse = vec4(0.5, 0.6, 0.7, 1)
        select.lightSpecular = vec4(0.5, 0.2, 0.7, 1)
        select.diffuseProduct = mult(select.lightDiffuse, select.materialDiffuse);
        select.specularProduct = mult(select.lightSpecular, select.materialSpecular);
      }
    }
    if (e == "Random") {
      for (i = 0; i <= toDraw.length; i++) {
        select = toDraw[i];
        select.lightDiffuse = vec4(Math.random() * 1 + 0, Math.random() * 1 + 0, Math.random() * 1 + 0, 1)
        select.lightSpecular = vec4(Math.random() * 1 + 0, Math.random() * 1 + 0, Math.random() * 1 + 0, 1)
        select.diffuseProduct = mult(select.lightDiffuse, select.materialDiffuse);
        select.specularProduct = mult(select.lightSpecular, select.materialSpecular);
      }
    }

  };
  document.getElementById("xButton").onclick = function () {
    select.axis = select.xAxis;
    select.flag = false;
  };
  document.getElementById("yButton").onclick = function () {
    select.axis = select.yAxis;
    select.flag = false;
  };
  document.getElementById("zButton").onclick = function () {
    select.axis = select.zAxis;
    select.flag = false;
  };
  document.getElementById("zFarSlider").onchange = function (event) {
    toDraw.forEach(element => {
      element.far = event.target.value;
    })
  };
  document.getElementById("zNearSlider").onchange = function (event) {
    toDraw.forEach(element => {
      element.near = event.target.value;
    })
  };
  document.getElementById("radiusSlider").onchange = function (event) {
    toDraw.forEach(element => {
      element.radius = event.target.value;
    })
  };
  document.getElementById("thetaSlider").onchange = function (event) {
    toDraw.forEach(element => {
      element.thetas = event.target.value * Math.PI / 180;
    })
  };
  document.getElementById("phiSlider").onchange = function (event) {
    toDraw.forEach(element => {
      element.phi = event.target.value;
    })
  };
  document.getElementById("aspectSlider").onchange = function (event) {
    toDraw.forEach(element => {
      element.aspect = event.target.value;
    })
  };
  document.getElementById("fovSlider").onchange = function (event) {
    toDraw.forEach(element => {
      element.fovy = event.target.value;
    })
  };
  document.getElementById("LightX").onchange = function (event) {
    toDraw.forEach(element => {
      element.lightPosition[0] = event.target.value;
    })
  };
  document.getElementById("LightY").onchange = function (event) {
    toDraw.forEach(element => {
      element.lightPosition[1] = event.target.value;
    })
  };
  document.getElementById("LightZ").onchange = function (event) {
    toDraw.forEach(element => {
      element.lightPosition[2] = event.target.value;
    })
  };
  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  toDraw.forEach(element => { element.draw(); })
  requestAnimFrame(render);
}

class Drawable {
  constructor(vertices, program, normalsArray) {
    this.program = program;
    this.normalsArray = normalsArray;
    this.indexPyramid = indexPyramid;
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    /*
        this.cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        */
    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    this.vNormal = gl.getAttribLocation(this.program, "vNormal");
    gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vNormal);

    this.vAttributeLocation = gl.getAttribLocation(program, 'vPosition');
    //this.cAttributeLocation = gl.getAttribLocation(program, 'vColors');
    this.translationLocation = gl.getUniformLocation(program, 'translation');
    this.scaleLocation = gl.getUniformLocation(program, 'scale');
    this.vertices = vertices;
    this.thetaLoc = gl.getUniformLocation(program, 'theta');
    this.theta = [0, 0, 0];
    this.trCoeff = [0, 0, 0];
    this.trCoeffLoc = gl.getUniformLocation(program, "trCoeff");
    this.coeff = 0.3;
    this.coeffLoc = gl.getUniformLocation(program, "coeff");
    this.xAxis = 0;
    this.yAxis = 1;
    this.zAxis = 2;
    this.flag = false;
    this.near = 0.3;
    this.far = 8.0;
    this.radius = 4.0;
    this.thetas = 0.0;
    this.phi = 0.0;
    this.dr = 5.0 * Math.PI / 180.0;
    this.fovy = 45.0;
    this.aspect = 1.0;
    this.counter = 0;
    this.at = vec3(0.0, 0.0, 0.0);
    this.up = vec3(0.0, 1.0, 0.0);
    this.modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    this.projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    this.increase = Math.PI * 2 / 1000;
    this.lightPosition = vec4(0.0, 0.75, 1.0, 0.0);
    this.lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
    this.lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    this.lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
    this.materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
    this.materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
    this.materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
    this.materialShininess = 100;
    this.ctm = ctm;
    this.ambientColor = ambientColor;
    this.diffuseColor = diffuseColor;
    this.specularColor = specularColor;
    this.viewerPos = viewerPos;
    this.viewerPos = vec3(0.0, 0.0, -20.0);
    this.projection = ortho(-1, 1, -1, 1, -100, 100);
    this.ambientProduct = mult(this.lightAmbient, this.materialAmbient);
    this.diffuseProduct = mult(this.lightDiffuse, this.materialDiffuse);
    this.specularProduct = mult(this.lightSpecular, this.materialSpecular);

  }
  draw() {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.vertexAttribPointer(this.vAttributeLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);

    this.vertices.length == 36 ? gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 0, 0) : gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.vNormal);
    //gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
    //gl.vertexAttribPointer(this.cAttributeLocation, 4, gl.FLOAT, false, 0, 0); // DESCRIBE THE DATA: EACH vertex has 4 values of type FLOAT
    //gl.enableVertexAttribArray(this.cAttributeLocation);
    this.eye = vec3(this.radius * Math.sin(this.thetas) * Math.cos(this.phi), this.radius * Math.sin(this.thetas) * Math.sin(this.phi), this.radius * Math.cos(this.thetas));
    this.modelViewMatrix = lookAt(this.eye, this.at, this.up);
    this.projectionMatrix = perspective(this.fovy, this.aspect, this.near, this.far);

    gl.uniform4fv(gl.getUniformLocation(this.program, "ambientProduct"), flatten(this.ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(this.program, "diffuseProduct"), flatten(this.diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(this.program, "specularProduct"), flatten(this.specularProduct));
    gl.uniform4fv(gl.getUniformLocation(this.program, "lightPosition"), flatten(this.lightPosition));
    gl.uniform1f(gl.getUniformLocation(this.program, "shininess"), this.materialShininess);
    gl.uniform3fv(this.thetaLoc, this.theta);
    gl.uniform3fv(this.trCoeffLoc, this.trCoeff);

    if (!this.flag) {
      this.theta[this.axis] += 0.1;
    }

    gl.uniformMatrix4fv(this.modelViewMatrixLoc, false, flatten(this.modelViewMatrix));
    gl.uniformMatrix4fv(this.projectionMatrixLoc, false, flatten(this.projectionMatrix));
    gl.uniform1f(this.coeffLoc, this.coeff);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);
  }
}