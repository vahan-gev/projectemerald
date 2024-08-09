import { FRAGMENT_SHADER, VERTEX_SHADER } from "./Shaders";
import { initShaderProgram } from "./GLUtils";
import { mat4, vec3 } from "./glmatrix";
import {Color} from "./Color";
import {ObjectGroup} from "./ObjectGroup";

class Emerald {
    constructor(canvas) {
        const gl = canvas.getContext("webgl", { antialias: true });
        if (!gl) {
            console.error("[Emerald.js] > No WebGL context found");
            return undefined;
        }

        const shaderProgram = initShaderProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);

        this.gl = gl;
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                aTexCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                globalViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
                color: gl.getUniformLocation(shaderProgram, "uColor"),
                useTexture: gl.getUniformLocation(shaderProgram, "useTexture"),
            },
        };
        this.camera = {
            position: vec3.fromValues(0.0, 0.0, 0.0),
            scale: vec3.fromValues(1.0, 1.0, 1.0),
            rotation: vec3.fromValues(0.0, 0.0, 0.0),
            setPosition(x, y, z) {
                vec3.set(this.position, -x, -y, -z);
            }
        }
        this.backgroundColor = {
            r: 0.0,
            g: 0.0,
            b: 0.0,
            a: 1.0
        }
    }

    setBackgroundColor(color) {
        if(color instanceof Color) {
            this.backgroundColor = {
                r: color.r / 255,
                g: color.g / 255,
                b: color.b / 255,
                a: color.a / 255
            }
        } else {
            console.error("[Emerald.js] > color is not an instance of Color class.")
        }
    }
    // Buggy (events don't work correctly when zoom changes from 1)
    setZoom(float) {
        vec3.set(this.camera.scale, float, float, float);
    }

    getZoom() {
        return this.camera.scale[0];
    }

    drawScene(scene) {
        this.gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const projectionMatrix = mat4.create();
        const left = -this.gl.canvas.clientWidth / 2;
        const right = this.gl.canvas.clientWidth / 2;
        const bottom = -this.gl.canvas.clientHeight / 2;
        const top = this.gl.canvas.clientHeight / 2;
        const near = -100;
        const far = 100;
        mat4.ortho(projectionMatrix, left, right, bottom, top, near, far);

        const globalViewMatrix = mat4.create();
        mat4.translate(globalViewMatrix, globalViewMatrix, this.camera.position); // Translation
        mat4.rotate(globalViewMatrix, globalViewMatrix, this.camera.rotation[0], [1, 0, 0]); // X-axis rotation
        mat4.rotate(globalViewMatrix, globalViewMatrix, this.camera.rotation[1], [0, 1, 0]); // Y-axis rotation
        mat4.rotate(globalViewMatrix, globalViewMatrix, this.camera.rotation[2], [0, 0, 1]); // Z-axis rotation
        mat4.scale(globalViewMatrix, globalViewMatrix, this.camera.scale); // Scale

        this.gl.useProgram(this.programInfo.program);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.globalViewMatrix, false, globalViewMatrix);

        scene.forEach((object) => {
            if(object instanceof ObjectGroup) {
                object.draw(this.gl, globalViewMatrix, this.programInfo.uniformLocations.globalViewMatrix, performance.now());
            } else {
                object.draw(globalViewMatrix, this.programInfo.uniformLocations.globalViewMatrix, performance.now());
            }
        });
    }
}

export { Emerald };
