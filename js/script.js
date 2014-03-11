/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var vertexPositionAttribute;
var squareVerticesBuffer;
var shaderProgram;

var rot = 0.0;

function start()
{
    canvas = document.getElementById("mainCanvas");
    gl = initGL(canvas);
    initBuffers();
    initShaders();
    
    initTextures();
    
    if(gl)
    {
        gl.viewport(0,0,canvas.width,canvas.height);
        render();
        setInterval(update,15);
    }
}


function update()
{
    render();
}

function render()
{
    gl.clearColor(1.0, 1.0, 1.0, 1.0);                      // Set clear color to black, fully opaque
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
  
  loadIdentity();
  mvTranslate([Math.sin(rot/100.0), 0.0, -6.0]);
   mvPushMatrix();
  mvRotate(rot,[0,1,-1]);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  // Set the texture coordinates attribute for the vertices.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  
  // Bind the normals buffer to the shader attribute.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
  
  // Specify the texture to map onto the faces.
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
 
   // Draw the cube.
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  
  // Restore the original matrix
  
  updateRotation();
  updateColor();
   mvPopMatrix();
}

function updateRotation()
{
    var curr = (new Date).getTime();
    if(lastCubeUpdateTime)
    {
        var delta = curr - lastCubeUpdateTime;
        var slider = document.getElementById("contrast");
        var d = slider.value;
        console.log(d);
        var modified = d / 100.0;
        console.log(modified);
        rot += (delta * (60*modified)) / 1000.0;

       // gl.uniform3f(testLocation,modified,modified,modified);
    }
    
    lastCubeUpdateTime = curr;   
}

function updateColor()
{
        var slider = document.getElementById("color");
        var d = slider.value;
        var modified = d / 100.0;
        gl.uniform3f(testLocation,modified,modified,modified);
}

function updateDisp()
{
        var slider = document.getElementById("disp");
        var d = slider.value;
        var modified = d / 100.0;
        gl.uniform3f(testLocation,modified,modified,modified);
}

function test()
{
    console.log("TEST");
}
