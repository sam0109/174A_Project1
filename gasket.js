
var gl;
var points;

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
	vec4(0.5, 0.5, 0.5, 1.0),
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
	vec3 (-0.01, -0.01, -0.01),
	vec3 (-0.01, -0.01, 1.01),
	vec3 (-0.01, -0.01, -0.01),
	vec3 (-0.01, 1.01, -0.01),
	vec3 (-0.01, -0.01, -0.01),
	vec3 (1.01, -0.01, -0.01),
	vec3 (1.01, 1.01, -0.01),
	vec3 (1.01, 1.01, 1.01),
	vec3 (1.01, 1.01, -0.01),
	vec3 (-0.01, 1.01, -0.01),
	vec3 (1.01, 1.01, -0.01),
	vec3 (-0.01, 1.01, -0.01),
	vec3 (-0.01, 1.01, 1.01),
	vec3 (1.01, 1.01, 1.01),
	vec3 (-0.01, 1.01, 1.01),
	vec3 (-0.01, -0.01, 1.01),
	vec3 (-0.01, 1.01, 1.01),
	vec3 (-0.01, 1.01, -0.01),
	vec3 (1.01, -0.01, 1.01),
	vec3 (-0.01, -0.01, 1.01),
	vec3 (1.01, -0.01, 1.01),
	vec3 (1.01, 1.01, 1.01),
	vec3 (1.01, -0.01, 1.01),
	vec3 (1.01, -0.01, -0.01)
]

	
var white = new Float32Array(4);
	white[0] = 1.0;
	white[1] = 1.0;
	white[2] = 1.0;
	white[3] = 1.0;

var mPerspective;
var mColor;
var mTransformation;
var cubeBuffer;
var j = 0;
	
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the scene
    //

	// Initialize the transformation matrices

    // First, initialize the cube strip
	
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
	
	var projection =  perspective(60, canvas.width/canvas.height, 0.1, 100);
	mPerspective = gl.getUniformLocation(program, "mPerspective");
	gl.uniformMatrix4fv(mPerspective, false, new flatten(projection));
	
	mTransformation = gl.getUniformLocation( program, "mTransformation" );
	mColor = gl.getUniformLocation( program, "mColor" );
	
	window.onkeydown = function (event) {
		var key = String.fromCharCode(event.keyCode);
		switch(key) {
			case 'C':
			j = (j + 1) % 8;
			break;
		}
	};
	// render it:
	render();
}

function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
	requestAnimFrame(render);
}