
import './App.css';
import {useEffect, useRef} from "react";
import {Emerald} from "./emerald/Emerald";
import {Color} from "./emerald/Color";
import {Scene} from "./emerald/Scene";
import {EventManager} from "./emerald/EventManager";
import {Texture} from "./emerald/Texture";
import buttonTexture from "./assets/sprites/temp/button.png"
import {FPSCounter} from "./emerald/FPSCounter";
function App() {
    const CANVAS_WIDTH = document.documentElement.clientWidth;
    const CANVAS_HEIGHT = document.documentElement.clientHeight;
    const canvasRef = useRef();
    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return undefined;
        const emerald = new Emerald(canvas);
        emerald.setBackgroundColor(new Color(232, 207, 166, 255));
        const menu = new Scene();
        const menuEventManager = new EventManager(canvas, menu, emerald.camera);
        const fpsCounter = new FPSCounter();
        const button = new Texture(
            emerald.gl,
            emerald.programInfo,
            true,
            buttonTexture,
            [0, 0, 0],
            [360, 120, 1],  // 360x120 pixels
            [0, 0, 0],
            96,
            32,
            2,
            2,
            180,
            false,
        );
        menu.add(button);
        menuEventManager.addHoverEvent(button,
            (event, obj) => {
                button.setFrame(1);
                console.log(event + " : " + obj?.getPosition());
            },
            (event, obj) => {
                button.setFrame(0);
                console.log(event + " : " + obj?.getPosition());
            }
        )

        menuEventManager.addClickEvent(button, () => {
            alert("Button Clicked");
        });

        const animate = () => {
            fpsCounter.update();
            emerald.drawScene(menu);
            window.requestAnimationFrame(animate);
        };
        animate();

        return () => {
            menuEventManager.clean();
        };
    }, []);
    return (
        <div className="App">
            <canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={canvasRef}>
                <p>Your browser doesn't support this feature</p>
            </canvas>
        </div>
    );
}

export default App;
