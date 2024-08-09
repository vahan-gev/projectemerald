const VERTEX_SHADER = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying vec2 vTexCoord;
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTexCoord = aTextureCoord;
    }
`;

const FRAGMENT_SHADER = `
    #ifdef GL_ES
    precision highp float;
    #endif
    uniform bool useTexture;
    uniform vec4 uColor;
    uniform sampler2D uSampler;
    varying vec2 vTexCoord;
    void main() {
        if (useTexture) {
            gl_FragColor = texture2D(uSampler, vTexCoord);
            if (gl_FragColor.a < 0.01) discard;
        } else {
            gl_FragColor = uColor;
        }
    }
`;

export { VERTEX_SHADER, FRAGMENT_SHADER };
