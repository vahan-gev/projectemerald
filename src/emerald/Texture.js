import { initVertexBuffer } from "./GLUtils";
import { Object } from "./Object";

class Texture extends Object {
  constructor(gl, programInfo, useTexture, texturePath = {}, position = [0.0, 0.0, 0.0], scale = [100.0, 100.0, 1.0], rotation = [0.0, 0.0, 0.0], frameWidth = 0, frameHeight = 0, framesPerRow = 1, totalFrames = 1, animationSpeed = 1000, autoPlay = true) {
    const vertices = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    const verticesBuffer = initVertexBuffer(gl, vertices);
    const textureCoordinates = [
      1.0, 1.0,  // Top-right
      0.0, 1.0,  // Top-left
      1.0, 0.0,  // Bottom-right
      0.0, 0.0,  // Bottom-left
    ];
    const texCoordBuffer = initVertexBuffer(gl, textureCoordinates);

    super(gl, programInfo, verticesBuffer, texCoordBuffer, vertices, useTexture, texturePath, position, scale, rotation, frameWidth, frameHeight, framesPerRow, totalFrames, animationSpeed, autoPlay);
  }
}

export { Texture }