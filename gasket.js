
var gl;
var points;

var crosshairMatrix = 
[
	vec4(1,0,0,0),
	vec4(0,1,0,0),
	vec4(0,0,1,0),
	vec4(0,0,0,1)
]

var cubeMatrix = 
[
	translate(10, 10, -20),
	translate(-10, 10, -20),
	translate(10, -10, -20),
	translate(-10, -10, -20),
	translate(10, 10, -40),
	translate(-10, 10, -40),
	translate(10, -10, -40),
	translate(-10, -10, -40)
]

var colors = 
[
	vec4(0.5, 0.75, 1.0, 1.0),
	vec4(1.0, 0.0, 0.0, 1.0),
	vec4(0.0, 1.0, 0.0, 1.0),
	vec4(1.0, 1.0, 0.0, 1.0),
	vec4(0.0, 0.0, 1.0, 1.0),
	vec4(1.0, 0.0, 1.0, 1.0),
	vec4(0.0, 1.0, 1.0, 1.0),
	vec4(1.0, 0.5, 0.5, 1.0)
]

var points = 
[					//cube coordinates
	vec3 (0, 0, 1),
	vec3 (1, 0, 1),
	vec3 (0, 0, 0),
	vec3 (1, 0, 0),
	vec3 (1, 1, 0),
	vec3 (1, 0, 1),
	vec3 (1, 1, 1),
	vec3 (1, 1, 0),
	vec3 (0, 0, 1),
	vec3 (0, 0, 1),
	vec3 (0, 1, 1),
	vec3 (0, 0, 0),
	vec3 (0, 1, 0),
	vec3 (1, 1, 0),
	vec3 (0, 1, 1),
	vec3 (1, 1, 1),
					//line coordinates
	vec3 (-0.001, -0.001, -0.001),
	vec3 (-0.001, -0.001, 1.001),
	vec3 (-0.001, -0.001, -0.001),
	vec3 (-0.001, 1.001, -0.001),
	vec3 (-0.001, -0.001, -0.001),
	vec3 (1.001, -0.001, -0.001),
	vec3 (1.001, 1.001, -0.001),
	vec3 (1.001, 1.001, 1.001),
	vec3 (1.001, 1.001, -0.001),
	vec3 (-0.001, 1.001, -0.001),
	vec3 (1.001, 1.001, -0.001),
	vec3 (1.001, -0.001, -0.001),
	vec3 (-0.001, 1.001, 1.001),
	vec3 (1.001, 1.001, 1.001),
	vec3 (-0.001, 1.001, 1.001),
	vec3 (-0.001, -0.001, 1.001),
	vec3 (-0.001, 1.001, 1.001),
	vec3 (-0.001, 1.001, -0.001),
	vec3 (1.001, -0.001, 1.001),
	vec3 (-0.001, -0.001, 1.001),
	vec3 (1.001, -0.001, 1.001),
	vec3 (1.001, 1.001, 1.001),
	vec3 (1.001, -0.001, 1.001),
	vec3 (1.001, -0.001, -0.001),
	vec3 (.1, 0, -.15),
	vec3 (-.1, 0, -.15),
	vec3 (0, .1, -.15),
	vec3 (0, -.1, -.15)
]

	
var white = new Float32Array(4);
	white[0] = 1.0;
	white[1] = 1.0;
	white[2] = 1.0;
	white[3] = 1.0;

var mPerspective;
var projection;
var mColor;
var mTransformation;
var cubeBuffer;
var mCameraMovement;
var cameraPos;
var crosshair = false;
var hFOV = 60;
var j = 0;
	
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var cubeBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	projection =  perspective(hFOV, canvas.width/canvas.height, 0.1, 100);
	mPerspective = gl.getUniformLocation(program, "mPerspective");
	gl.uniformMatrix4fv(mPerspective, false, new flatten(projection));
	
	mTransformation = gl.getUniformLocation( program, "mTransformation" );
	mColor = gl.getUniformLocation( program, "mColor" );
	mCameraMovement = gl.getUniformLocation( program, "mCameraMovement" );
	
	var xPos = 0;
	var yPos = 0;
	var zPos = 0;
	var azim = 0.0;
	cameraPos = 
	[
		vec4(1,0,0,0),
		vec4(0,1,0,0),
		vec4(0,0,1,0),
		vec4(0,0,0,1)
	]
	window.addEventListener("keydown", function () {
		switch(event.keyCode) {
			case 67: //"c"
				j = (j + 1) % 8;
			break;
			case 37: //"left"
				azim += -1;
			break;
			case 38: //"up"
				yPos += 0.25;
			break;
			case 39: //"right"
				azim += 1;
			break;
			case 40: //"down"
				yPos += -0.25;
			break;
			case 73: //"i"
				xPos += -0.25 * Math.sin((Math.PI / 180) * -azim);
				zPos += -0.25 * Math.cos((Math.PI / 180) * -azim);
			break;
			case 74: //"j"
				xPos += -0.25 * Math.cos((Math.PI / 180) * azim);
				zPos += -0.25 * Math.sin((Math.PI / 180) * azim);
			break;
			case 75: //"k"
				xPos += 0.25 * Math.cos((Math.PI / 180) * azim);
				zPos += 0.25 * Math.sin((Math.PI / 180) * azim);
			break;
			case 77: //"m"
				xPos += 0.25 * Math.sin((Math.PI / 180) * -azim);
				zPos += 0.25 * Math.cos((Math.PI / 180) * -azim);
			break;
			case 82: //"r"
				xPos = 0;
				yPos = 0;
				zPos = 0;
				azim = 0.0;
			break;
			case 78: //"n"
				hFOV--;
			break;
			case 87: //"w"
				hFOV++;
			break;
			case 187: //"+"
				crosshair = !crosshair;
			break;
		}
		cameraPos = mult(rotate(azim, [0,1,0]), translate(-xPos, -yPos, -zPos));
		projection =  perspective(hFOV, canvas.width/canvas.height, 0.1, 100);
		gl.uniformMatrix4fv(mPerspective, false, new flatten(projection));
	});
	// render it:
	render();
}

function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.uniformMatrix4fv(mCameraMovement, false, new flatten(cameraPos));
	for(var i = 0; i < 8; i++, j = (j + 1) % 8)
	{
		gl.uniformMatrix4fv(mTransformation, false, new flatten(cubeMatrix[i]));
		gl.uniform4fv(mColor, flatten(colors[j]));
		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 16);
	}
	gl.uniform4fv(mColor, white);
	for(var i = 0; i < cubeMatrix.length; i++)
	{
		gl.uniformMatrix4fv(mTransformation, false, new flatten(cubeMatrix[i]));
		gl.drawArrays( gl.LINES, 16, 24);
	}
	if(crosshair)
	{
		gl.uniformMatrix4fv(mTransformation, false, new flatten(crosshairMatrix));
		gl.uniformMatrix4fv(mPerspective, false, new flatten(crosshairMatrix));
		gl.uniformMatrix4fv(mCameraMovement, false, new flatten(crosshairMatrix));
		gl.drawArrays( gl.LINES, 40, 4);
		gl.uniformMatrix4fv(mPerspective, false, new flatten(projection));
	}
	requestAnimFrame(render);
}