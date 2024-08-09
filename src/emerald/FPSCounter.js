class FPSCounter {
    constructor() {
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.fpsElement = document.createElement('div');
        this.fpsElement.style.position = 'absolute';
        this.fpsElement.style.top = '10px';
        this.fpsElement.style.left = '10px';
        this.fpsElement.style.color = 'white';
        this.fpsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.fpsElement.style.padding = '5px';
        this.fpsElement.style.fontFamily = 'Arial';
        this.fpsElement.style.fontSize = '14px';
        document.body.appendChild(this.fpsElement);
        this.accumulatedTime = 0;
    }

    update() {
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.accumulatedTime += delta;
        this.frameCount++;

        if (this.accumulatedTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.accumulatedTime = 0;
            this.fpsElement.textContent = `FPS: ${this.fps}`;
        }
    }
}

export { FPSCounter }


// class FPSCounter {
//     constructor() {
//         this.lastFrameTime = performance.now();
//         this.frameCount = 0;
//         this.fps = 0;
//         this.fpsElement = document.createElement('div');
//         this.fpsElement.style.position = 'absolute';
//         this.fpsElement.style.top = '10px';
//         this.fpsElement.style.left = '10px';
//         this.fpsElement.style.color = 'white';
//         this.fpsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
//         this.fpsElement.style.padding = '5px';
//         this.fpsElement.style.fontFamily = 'Arial';
//         this.fpsElement.style.fontSize = '14px';
//         document.body.appendChild(this.fpsElement);
//         this.accumulatedTime = 0;
//         this.startBenchmark();
//     }
//
//     startBenchmark() {
//         const benchmark = () => {
//             this.update();
//             // Call benchmark continuously, without waiting for the next animation frame
//             setTimeout(benchmark, 0);
//         };
//         benchmark();
//     }
//
//     update() {
//         const now = performance.now();
//         const delta = now - this.lastFrameTime;
//         this.lastFrameTime = now;
//         this.accumulatedTime += delta;
//         this.frameCount++;
//
//         if (this.accumulatedTime >= 1000) {
//             this.fps = this.frameCount;
//             this.frameCount = 0;
//             this.accumulatedTime = 0;
//             this.fpsElement.textContent = `FPS: ${this.fps}`;
//         }
//     }
// }
//
// export { FPSCounter }
