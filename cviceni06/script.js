window.onload = function() {
    var gl = document.getElementById("webgl_canvas").getContext("experimental-webgl");

    // Create vertex shader
    var vertexShaderCode = document.querySelector("#vs").textContent;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    // Create fragment shader
    var fragmentShaderCode = document.querySelector("#fs").textContent;
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    // Create program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Create buffer for positions of vertices
    var posLoc = gl.getAttribLocation(program, "pos");
    gl.enableVertexAttribArray(posLoc);
    // Create buffer for position of vertices
    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    // We need many vertices, because each vertex need
    // own value of normal and UV

    //parametry "kulatosti"
    var n = 100;
    var m = 100;
    //velikost planety
    var radius = 2.5;

    var vertex = [];
    var data = [];
    var textCoord = [];

    for (var i = 0; i <= n; i++) {
        var theta = i * Math.PI / n;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var k = 0; k <= m; k++) {

            var phi = k * 2 * Math.PI / m;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (k / m);
            var v = 1 - (i / n);

            data.push(x);
            data.push(y);
            data.push(z);

            textCoord.push(u);
            textCoord.push(v);

            vertex.push(radius * x);
            vertex.push(radius * y);
            vertex.push(radius * z);
        }
    }

    var indexData = [];
    for (var i = 0; i < n; i++) {
        for (var k = 0; k < m; k++) {

            var val1 = i * (m + 1) + k;
            var val2 = val1 + m + 1;

            indexData.push(val1);
            indexData.push(val2);
            indexData.push(val1 + 1);

            indexData.push(val2);
            indexData.push(val2 + 1);
            indexData.push(val1 + 1);
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    // Create buffer for UV coordinates
    var uvLoc = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uvLoc);
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textCoord), gl.STATIC_DRAW);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    // Create buffer for vertex normals
    var normalLoc = gl.getAttribLocation(program, "normal");
    gl.enableVertexAttribArray(normalLoc);
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, true, 0, 0);

    // Create index buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    this.console.log(indexData);
    //had to change the data type
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);

    // Create and load image used as texture
    var image = new Image();
    image.src = "./globe_texture.jpg";
    image.onload = function() {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        var samplerLoc = gl.getUniformLocation(program, "sampler");
        gl.uniform1i(samplerLoc, 0); // nula odpovídá gl.TEXTURE0
    };

    // Create matrix for model
    var modelMatrix = mat4.create();
    mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.8, 0.8, 0.8));
    var modelLocation = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelLocation, false, modelMatrix);

    // Create matrix for view
    var viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -5));
    var viewLocation = gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(viewLocation, false, viewMatrix);

    // Create matrix for projection
    var projMatrix = mat4.create();
    mat4.perspective(projMatrix, Math.PI / 3, 1, 0.1, 100);
    var projLocation = gl.getUniformLocation(program, "projMatrix");
    gl.uniformMatrix4fv(projLocation, false, projMatrix);

    // Create matrix for transformation of normal vectors
    var normalMatrix = mat3.create();
    var normalLocation = gl.getUniformLocation(program, "normalMatrix");
    mat3.normalFromMat4(normalMatrix, modelMatrix);
    gl.uniformMatrix3fv(normalLocation, false, normalMatrix);

    // Enable depth test
    gl.enable(gl.DEPTH_TEST);

    // Create polyfill to make it working in the most modern browsers
    window.requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||

        function(cb) { setTimeout(cb, 1000 / 60); };

    var render = function() {
        mat4.rotateX(modelMatrix, modelMatrix, 0.005);
        mat4.rotateY(modelMatrix, modelMatrix, 0.01);
        gl.uniformMatrix4fv(modelLocation, false, modelMatrix);

        mat3.normalFromMat4(normalMatrix, modelMatrix);
        gl.uniformMatrix3fv(normalLocation, false, normalMatrix);

        gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(render);
    }

    render();
}