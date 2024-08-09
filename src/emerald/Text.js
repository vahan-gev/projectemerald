import { Color } from "./Color";
import { mat4, vec3, vec4 } from "./glmatrix";

class Text {
    constructor(gl, programInfo, canvas, position, scale, text, fontName, fontSize = 24, color = new Color(255, 255, 255, 255), fontPath = null) {
        this.gl = gl;
        this.programInfo = programInfo;
        this.canvas = canvas;
        this.position = vec3.fromValues(position[0], position[1], 0);
        this.scale = vec3.fromValues(scale[0], scale[1], 1);
        this.color = vec4.fromValues(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
        this.text = text;
        this.fontName = fontName;
        this.fontSize = fontSize;
        this.fontPath = fontPath;
        this.texture = null;
        this.verticesBuffer = null;
        this.texCoordBuffer = null;
        this.isActive = true;
        this.textureWidth = 0;
        this.textureHeight = 0;

        this.initBuffers();
        this.init();
    }

    async init() {
        if (this.fontPath) {
            await this.loadFont(this.fontName, this.fontPath);
        }
        await this.generateTextTexture();
    }

    async loadFont(fontName, url) {
        const fontFace = new FontFace(fontName, `url(${url})`);
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);
    }

    get font() {
        return `${this.fontSize}px ${this.fontName}`;
    }

    async generateTextTexture() {
        await document.fonts.load(this.font);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const scaleFactor = 4;

        ctx.font = this.font;
        const metrics = ctx.measureText(this.text);
        const padding = Math.ceil(this.fontSize * 0.5);
        this.textureWidth = Math.ceil(metrics.width);
        this.textureHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);

        canvas.width = this.nextPowerOfTwo(this.textureWidth * scaleFactor);
        canvas.height = this.nextPowerOfTwo(this.textureHeight * scaleFactor);
        // canvas.height = this.nextPowerOfTwo((this.textureHeight + padding) * scaleFactor);
        ctx.scale(scaleFactor, scaleFactor);
        ctx.font = this.font;
        ctx.fillStyle = `rgba(${this.color[0] * 255}, ${this.color[1] * 255}, ${this.color[2] * 255}, ${this.color[3]})`;
        ctx.textBaseline = 'top';
        ctx.fillText(this.text, 0, padding);
        const dataURL = canvas.toDataURL('image/png');

        const image = new Image();
        await new Promise((resolve) => {
            image.onload = resolve;
            image.src = dataURL;
        });

        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }

    nextPowerOfTwo(n) {
        return Math.pow(2, Math.ceil(Math.log2(n)));
    }

    initBuffers() {
        const vertices = new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            1, 1,
        ]);

        const texCoords = new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            1, 1,
        ]);

        this.verticesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.verticesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
    }

    async setText(newText) {
        this.text = newText;
        await this.generateTextTexture();
    }

    async setFont(fontName, fontSize, fontPath = null) {
        this.fontName = fontName;
        this.fontSize = fontSize;
        if (fontPath) {
            this.fontPath = fontPath;
            await this.loadFont(fontName, fontPath);
        }
        await this.generateTextTexture();
    }

    setColor(color) {
        if (color instanceof Color) {
            vec4.set(this.color, color.r / 255, color.g / 255, color.b / 255, color.a / 255);
            this.generateTextTexture();
        } else {
            console.error("[TextObject.js] > color is not an instance of Color class.");
        }
    }

    setPosition(x, y) {
        vec3.set(this.position, x, y, this.position[2]);
    }

    setIsActive(bool) {
        this.isActive = bool;
    }

    draw(globalViewMatrix) {
        if (!this.isActive || !this.texture) return;

        this.gl.useProgram(this.programInfo.program);

        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, globalViewMatrix, this.position);
        mat4.scale(modelViewMatrix, modelViewMatrix, [this.textureWidth * this.scale[0], this.textureHeight * this.scale[1], 1]);

        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.globalViewMatrix, false, modelViewMatrix);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.verticesBuffer);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.aTexCoord, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.aTexCoord);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);

        this.gl.uniform4fv(this.programInfo.uniformLocations.color, [1, 1, 1, 1]);
        this.gl.uniform1i(this.programInfo.uniformLocations.useTexture, 1);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        this.gl.disable(this.gl.BLEND);
    }
}

export { Text };