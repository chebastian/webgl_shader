  /* 
   * To change this template, choose Tools | Templates
   * and open the template in the editor.
   */

  var gl;
  var canvas;

  var cubeVerticesBuffer;
  var cubeVerticesTextureCoordBuffer;
  var cubeVerticesIndexBuffer;
  var cubeVerticesIndexBuffer;
  var cubeRotation = 0.0;
  var lastCubeUpdateTime = null;

  var cubeImage;
  var cubeTexture;

  var mvMatrix;
  var shaderProgram;
  var vertexPositionAttribute;
  var contrastAttribute;
  var vertexNormalAttribute;
  var textureCoordAttribute;
  var perspectiveMatrix;


  var testLocation;
  var testVariable;

  function initGL(canvas)
  {
      gl = null;
      
      try
      {
          gl = canvas.getContext("webgl");
      }
      catch(e)
      {
      }
      
      // If we don't have a GL context, give up now
    if (!gl) {
      alert("Unable to initialize WebGL. Your browser may not support it.");
      gl = null;
    }
    
    return gl;
  }

  function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");
    
    // Create the shader program
    
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    // If creating the shader program failed, alert
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program.");
    }
    
    gl.useProgram(shaderProgram);
    
    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    
    textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);
    
    vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(vertexNormalAttribute);


    //Test variable
    testVariable = 0.5;
    testLocation = gl.getUniformLocation(shaderProgram,"uTest");
    gl.uniform3f(testLocation,testVariable,testVariable,testVariable);

  }

  function getShader(gl, id) {
    var shaderScript, theSource, currentChild;
    
    shaderScript = document.getElementById(id);
    
    if (!shaderScript) {
      return null;
    }
    
    theSource = "";
    currentChild = shaderScript.firstChild;
    
    while(currentChild) {
      if (currentChild.nodeType == currentChild.TEXT_NODE) {
        theSource += currentChild.textContent;
      }
      
      currentChild = currentChild.nextSibling;
    }
    
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
       // Unknown shader type
       return null;
    }
    
    gl.shaderSource(shader, theSource);
      
    // Compile the shader program
    gl.compileShader(shader);  
      
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
        return null;  
    }
      
    return shader;
  }

  var horizAspect = 480.0/640.0;


  function initBuffers() {
    
    // Create a buffer for the cube's vertices.
    
    cubeVerticesBuffer = gl.createBuffer();
    
    // Select the cubeVerticesBuffer as the one to apply vertex
    // operations to from here out.
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    
    // Now create an array of vertices for the cube.
    
    var vertices = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      
      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,
      
      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,
      
      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
      
      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,
      
      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
    ];
    
    // Now pass the list of vertices into WebGL to build the shape. We
    // do this by creating a Float32Array from the JavaScript array,
    // then use it to fill the current vertex buffer.
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Set up the normals for the vertices, so that we can compute lighting.
    
    cubeVerticesNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
    
    var vertexNormals = [
      // Front
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
      
      // Back
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
      
      // Top
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
      
      // Bottom
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
      
      // Right
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
      
      // Left
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                  gl.STATIC_DRAW);
    
    // Map the texture onto the cube's faces.
    
    cubeVerticesTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
    
    var textureCoordinates = [
      // Front
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Back
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Top
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Bottom
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Right
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Left
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                  gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex array for each face's vertices.
    
    cubeVerticesIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
    
    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    
    var cubeVertexIndices = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23    // left
    ]
    
    // Now send the element array to GL
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
  }

  function initTextures() {
    cubeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,cubeTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([255, 255, 255, 255])); // red
    
    cubeImage = new Image();
    cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
    cubeImage.src = "tex.png";
  }

  function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  //
  //MATRIX
  //


  function loadIdentity() {
    mvMatrix = Matrix.I(4);
  }

  function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
  }

  function mvTranslate(v) {
    multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
  }

  function setMatrixUniforms() {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
    
    var normalMatrix = mvMatrix.inverse();
    normalMatrix = normalMatrix.transpose();
    var nUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
    gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()));
  }

  var mvMatrixStack = [];

  function mvPushMatrix(m) {
    if (m) {
      mvMatrixStack.push(m.dup());
      mvMatrix = m.dup();
    } else {
      mvMatrixStack.push(mvMatrix.dup());
    }
  }

  function mvPopMatrix() {
    if (!mvMatrixStack.length) {
      throw("Can't pop from an empty matrix stack.");
    }
    
    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
  }

  function mvRotate(angle, v) {
    var inRadians = angle * Math.PI / 180.0;
    
    var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
  }