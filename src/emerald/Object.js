import { Color } from "./Color";
import { mat4, vec2, vec3, vec4 } from "./glmatrix";

class Object {
    constructor(gl, programInfo, verticesBuffer, texCoordBuffer, vertices, useTexture, texturePath, position = [0.0, 0.0, 0.0], scale = [100.0, 100.0, 1.0], rotation = [0.0, 0.0, 0.0], frameWidth = 0, frameHeight = 0, framesPerRow = 1, totalFrames = 1, animationSpeed = 1000, autoplay = true) {
        this.gl = gl;
        this.programInfo = programInfo;
        this.id = Math.random().toString(36).substring(7)
        this.verticesBuffer = verticesBuffer;
        this.texCoordBuffer = texCoordBuffer;
        this.vertices = vertices;
        this.position = vec3.fromValues(position[0], position[1], position[2]);
        this.scale = vec3.fromValues(scale[0] / 2, scale[1] / 2, scale[2] / 2);
        this.rotation = vec3.fromValues(rotation[0], rotation[1], rotation[2]);
        this.color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
        this.texturePath = texturePath;
        this.texture = null;
        this.useTexture = useTexture;
        if (useTexture) {
            this.initTexture().then(() => {});
        }
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.framesPerRow = framesPerRow;
        this.totalFrames = totalFrames;
        this.currentFrame = 0;
        this.animationSpeed = animationSpeed;
        this.lastFrameTime = 0;
        this.textureWidth = 0;
        this.textureHeight = 0;
        this.isPlaying = autoplay;
        this.playOnce = false;
        this.originalTexture = null;
        this.mirrored = false;
        this.animationType = "texturePath";
        this.currentAnimationArray = [];
        this.currentAnimationIndex = 0;
        this.shouldRevertAfterPlayingOnce = false;
        this.revertAnimation = [];
        this.parentObject = null;
        this.isActive = false;
        this.callbackFunction = () => {};
    }

    setIsActive(bool) {
        this.isActive = bool;
    }

    setParent(parent) {
        this.parentObject = parent;
    }

    getParent() {
        return this.parentObject;
    }

    getRotation() {
        return vec2.fromValues(this.rotation[0], this.rotation[1]);
    }

    setRotation(radian) {
        vec3.set(this.rotation, this.rotation[0], this.rotation[1], -radian);
    }

    getPosition() {
        return vec3.fromValues(this.position[0], this.position[1], this.position[2]);
    }

    setPosition(x, y, z) {
        vec3.set(this.position, x, y, z);
    }

    setScale(width, height) {
        vec3.set(this.scale, width, height, this.scale[2]);
    }

    getScale() {
        return vec2.fromValues(this.scale[0], this.scale[1]);
    }

    setColor(color) {
        if (color instanceof Color) {
            vec4.set(this.color, color.r / 255, color.g / 255, color.b / 255, color.a / 255)
        } else {
            console.error("[Object.js] > color is not an instance of Color class.")
        }
    }

    async initTexture() {
        const image = await this.loadImage(this.texturePath);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.textureWidth = image.width;
        this.textureHeight = image.height;
        this.originalTexture = this.texture;
    }

    updateAnimation(currentTime) {
        if (this.totalFrames > 1 && this.isPlaying && currentTime - this.lastFrameTime > this.animationSpeed) {
            if (this.animationType === "texturePath") {
                this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            } else if (this.animationType === "array") {
                this.currentFrame = this.currentAnimationArray[this.currentAnimationIndex];
                this.currentAnimationIndex++;
                if (this.currentAnimationIndex >= this.currentAnimationArray.length) {
                    if (this.playOnce) {
                        if (this.shouldRevertAfterPlayingOnce) {
                            this.currentAnimationIndex = 0;
                            this.currentAnimationArray = this.revertAnimation;
                        } else {
                            this.isPlaying = false;
                        }
                        this.playOnce = false;
                        this.callbackFunction();
                    } else {
                        this.currentAnimationIndex = 0;
                    }
                }
            }
            this.lastFrameTime = currentTime;
        }
    }

    playAnimation(animation, animationSpeed = 1000) {
        if (animation.length !== 0) {
            this.animationSpeed = animationSpeed;
            this.animationType = "array";
            this.currentAnimationArray = animation;
            this.currentAnimationIndex = 0;
            // Not tested
            // this.currentFrame = 0;
            this.isPlaying = true;
            this.playOnce = false;
        } else {
            console.error("[Object.js] | [playAnimation] > Animation cannot be empty!");
        }
    }

    setFrame(frame) {
        this.currentFrame = frame;
        this.isPlaying = false;
    }

    playAnimationOnce(animation, defaultAnimation = null, animationSpeed = 1000, callbackFunction = null) {
        if (animation.length !== 0) {
            this.animationSpeed = animationSpeed;
            this.animationType = "array";
            this.currentAnimationArray = animation;
            this.currentAnimationIndex = 0;
            // Not tested
            // this.currentFrame = 0;
            this.isPlaying = true;
            this.playOnce = true;
            if (defaultAnimation !== null && defaultAnimation.length > 0) {
                this.shouldRevertAfterPlayingOnce = true;
                this.revertAnimation = defaultAnimation;
            } else {
                this.shouldRevertAfterPlayingOnce = false;
                this.revertAnimation = [];
            }

            if(callbackFunction) {
                this.callbackFunction = callbackFunction;
            }

        } else {
            console.error("[Object.js] | [playAnimationOnce] > Animation cannot be empty!");
        }
    }

    stopAnimation() {
        this.currentFrame = 0;
        this.isPlaying = false;
        this.playOnce = false;
        this.texture = this.originalTexture;
    }

    collidesWith(otherObject) {
        if (otherObject.isActive === false || this.isActive === false) {
            return false;
        }

        const thisBBox = this.getBoundingBox();
        const otherBBox = otherObject.getBoundingBox();

        // Check for overlap
        return (thisBBox.left < otherBBox.right &&
            thisBBox.right > otherBBox.left &&
            thisBBox.top > otherBBox.bottom &&
            thisBBox.bottom < otherBBox.top);
    }

    getBoundingBox() {
        const halfWidth = this.scale[0];
        const halfHeight = this.scale[1];
        let x = this.position[0];
        let y = this.position[1];

        // Consider parent ObjectGroup's position
        if (this.parentObject) {
            x += this.parentObject.position[0];
            y += this.parentObject.position[1];
        }

        return {
            left: x - halfWidth,
            right: x + halfWidth,
            top: y + halfHeight,
            bottom: y - halfHeight
        };
    }
    draw(globalViewMatrix, transform, currentTime) {
        let objectTransformMatrix = mat4.create();
        mat4.translate(objectTransformMatrix, objectTransformMatrix, this.position);
        mat4.rotate(objectTransformMatrix, objectTransformMatrix, this.rotation[0], [1, 0, 0]);
        mat4.rotate(objectTransformMatrix, objectTransformMatrix, this.rotation[1], [0, 1, 0]);
        mat4.rotate(objectTransformMatrix, objectTransformMatrix, this.rotation[2], [0, 0, 1]);
        mat4.scale(objectTransformMatrix, objectTransformMatrix, this.scale);

        let finalTransformMatrix = mat4.create();
        mat4.mul(finalTransformMatrix, globalViewMatrix, objectTransformMatrix);
        this.gl.uniform1i(this.programInfo.uniformLocations.useTexture, this.useTexture);
        if (!this.useTexture) {
            this.gl.uniform4fv(this.programInfo.uniformLocations.color, this.color);
        }
        this.gl.uniformMatrix4fv(transform, false, new Float32Array(finalTransformMatrix));

        // Bind and set vertex position buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.verticesBuffer);
        this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexPosition,
            2,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

        // Bind and set texture coordinate buffer
        if (this.useTexture) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.aTexCoord,
                2,
                this.gl.FLOAT,
                false,
                0,
                0
            );
            this.gl.enableVertexAttribArray(this.programInfo.attribLocations.aTexCoord);

            if (this.texture) {
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            }

            this.updateAnimation(currentTime);

            let texLeft, texRight, texTop, texBottom;

            if (this.frameWidth > 0 && this.frameHeight > 0) {
                // Spritesheet animation
                const col = this.currentFrame % this.framesPerRow;
                const row = Math.floor(this.currentFrame / this.framesPerRow);

                texLeft = (col + 1) * this.frameWidth / this.textureWidth;
                texRight = col * this.frameWidth / this.textureWidth;
                texTop = row * this.frameHeight / this.textureHeight;
                texBottom = (row + 1) * this.frameHeight / this.textureHeight;
            } else {
                // Static image
                texLeft = 1.0;
                texRight = 0.0;
                texTop = 0.0;
                texBottom = 1.0;
            }
            // If mirrored change texLeft and texRight in places
            const texCoords = this.mirrored ? new Float32Array([
                texRight, texBottom,
                texLeft, texBottom,
                texRight, texTop,
                texLeft, texTop,
            ]) : new Float32Array([
                texLeft, texBottom,
                texRight, texBottom,
                texLeft, texTop,
                texRight, texTop,
            ]);
            // Update texture coordinate buffer
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
        }

        const drawMode = this.vertices.length === 8 ? this.gl.TRIANGLE_STRIP : this.gl.TRIANGLES;
        this.gl.drawArrays(drawMode, 0, this.vertices.length / 2);
    }

    loadImage = (path) => new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (err) => reject(err));
        image.src = path;
    });
}

export { Object };