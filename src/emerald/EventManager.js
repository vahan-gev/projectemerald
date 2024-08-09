import { ObjectGroup } from "./ObjectGroup";
import { Scene } from "./Scene";
import {Text} from "./Text";

class EventManager {
    constructor(canvas, scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.keyDownListeners = new Map();
        this.keyUpListeners = new Map();
        this.clickListeners = new Map();
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.hoverListeners = new Map();
        this.lastHoveredObject = null;

        window.addEventListener("mousemove", this.handleMouseMove.bind(this));
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
        window.addEventListener("click", this.handleClick.bind(this));
    }

    addKeyDown(key, func) {
        if (!this.keyDownListeners.has(key)) {
            this.keyDownListeners.set(key, new Set());
        }
        this.keyDownListeners.get(key).add(func);
    }

    addKeyUp(key, func) {
        if (!this.keyUpListeners.has(key)) {
            this.keyUpListeners.set(key, new Set());
        }
        this.keyUpListeners.get(key).add(func);
    }

    removeKeyDown(key, func) {
        if (this.keyDownListeners.has(key)) {
            this.keyDownListeners.get(key).delete(func);
        }
    }

    removeKeyUp(key, func) {
        if (this.keyUpListeners.has(key)) {
            this.keyUpListeners.get(key).delete(func);
        }
    }

    handleKeyDown(event) {
        const listeners = this.keyDownListeners.get(event.key);
        if (listeners) {
            listeners.forEach(func => func(event));
        }
    }

    handleKeyUp(event) {
        const listeners = this.keyUpListeners.get(event.key);
        if (listeners) {
            listeners.forEach(func => func(event));
        }
    }

    addClickEvent(object, func) {
        if (object instanceof ObjectGroup) {
            object.getAllObjects().forEach(childObject => {
                this.addClickEvent(childObject, func);
            });
        } else {
            if (!this.clickListeners.has(object.id)) {
                this.clickListeners.set(object.id, new Set());
            }
            this.clickListeners.get(object.id).add(func);
        }
    }

    handleClick(event) {
        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();

        // Calculate click position relative to the canvas
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;

        // Convert to world coordinates
        const worldX = canvasX - this.canvasWidth / 2 - this.camera.position[0];
        const worldY = this.canvasHeight / 2 - canvasY - this.camera.position[1];

        this.scene.objects.forEach(sceneObject => {
            if (!sceneObject.isActive) return; // Skip inactive objects
            if(sceneObject instanceof Text) return; // Skip Text
            if (sceneObject instanceof ObjectGroup) {
                const clickedObject = sceneObject.isPointInChildren(worldX, worldY);
                if (clickedObject && clickedObject.isActive) {
                    const listeners = this.clickListeners.get(clickedObject.id);
                    if (listeners) {
                        listeners.forEach(func => func(event, clickedObject));
                    }
                }
            } else {
                if (this.isPointInObject(worldX, worldY, sceneObject)) {
                    const listeners = this.clickListeners.get(sceneObject.id);
                    if (listeners) {
                        listeners.forEach(func => func(event, sceneObject));
                    }
                }
            }
        });
    }


    removeClickEvent(object, func) {
        if (this.clickListeners.has(object.id)) {
            this.clickListeners.get(object.id).delete(func);
        }
    }


    isPointInObject(x, y, object) {
        if(object instanceof Text) return;
        const left = object.position[0] - object.scale[0];
        const right = object.position[0] + object.scale[0];
        const top = object.position[1] + object.scale[1];
        const bottom = object.position[1] - object.scale[1];

        return x >= left && x <= right && y >= bottom && y <= top;
    }

    addHoverEvent(object, enterFunc, leaveFunc) {
        if (object instanceof ObjectGroup) {
            object.getAllObjects().forEach(childObject => {
                this.addHoverEvent(childObject, enterFunc, leaveFunc);
            });
        } else {
            if (!this.hoverListeners.has(object.id)) {
                this.hoverListeners.set(object.id, { enter: new Set(), leave: new Set() });
            }
            this.hoverListeners.get(object.id).enter.add(enterFunc);
            this.hoverListeners.get(object.id).leave.add(leaveFunc);
        }
    }

    removeHoverEvent(object, enterFunc, leaveFunc) {
        if (object instanceof ObjectGroup) {
            object.getAllObjects().forEach(childObject => {
                this.removeHoverEvent(childObject, enterFunc, leaveFunc);
            });
        } else if (this.hoverListeners.has(object.id)) {
            const listeners = this.hoverListeners.get(object.id);
            listeners.enter.delete(enterFunc);
            listeners.leave.delete(leaveFunc);
        }
    }

    handleMouseMove(event) {
        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();

        // Calculate mouse position relative to the canvas
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;

        // Convert to world coordinates
        const worldX = canvasX - this.canvasWidth / 2 - this.camera.position[0];
        const worldY = this.canvasHeight / 2 - canvasY - this.camera.position[1];

        let hoveredObject = null;

        this.scene.objects.forEach(sceneObject => {
            if (!sceneObject.isActive) return; // Skip inactive objects

            if (sceneObject instanceof ObjectGroup) {
                const hovered = sceneObject.isPointInChildren(worldX, worldY);
                if (hovered && hovered.isActive) {
                    hoveredObject = hovered;
                }
            } else if (this.isPointInObject(worldX, worldY, sceneObject)) {
                hoveredObject = sceneObject;
            }
        });

        if (hoveredObject !== this.lastHoveredObject) {
            if (this.lastHoveredObject && this.lastHoveredObject.isActive) {
                const leaveListeners = this.hoverListeners.get(this.lastHoveredObject.id);
                if (leaveListeners) {
                    leaveListeners.leave.forEach(func => func(event, this.lastHoveredObject));
                }
            }

            if (hoveredObject && hoveredObject.isActive) {
                const enterListeners = this.hoverListeners.get(hoveredObject.id);
                if (enterListeners) {
                    enterListeners.enter.forEach(func => func(event, hoveredObject));
                }
            }

            this.lastHoveredObject = hoveredObject;
        }
    }

    changeScene(scene) {
        if (scene instanceof Scene) {
            this.scene = scene;
        } else {
            console.error("[EventManager] > Specified argument is not an instance of Scene class");
        }
    }

    clean() {
        window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        window.removeEventListener('click', this.handleClick.bind(this));
    }
}

export { EventManager };