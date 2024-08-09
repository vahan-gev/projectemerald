import { mat4, vec2, vec3 } from "./glmatrix";

class ObjectGroup {
    constructor(children = []) {
        this._children = children;
        this.id = Math.random().toString(36).substring(7);
        this.position = vec3.fromValues(0.0, 0.0, 0.0);
        this.rotation = vec3.fromValues(0.0, 0.0, 0.0);
        this.scale = vec3.fromValues(1.0, 1.0, 1.0);
        this.parentObject = null;
        this.isActive = false;
        for (let i = 0; i < this._children.length; i++) {
            this._children[i].setParent(this);
        }
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

    add(object) {
        this._children.push(object);
        object.setParent(this);
    }

    remove(object) {
        this._children = this._children.filter(child => child.id !== object.id);
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

    isPointInChildren(worldX, worldY) {
        return this._children.find(child => {
            if (child instanceof ObjectGroup) {
                return child.isPointInChildren(worldX, worldY);
            }
            return this.isPointInObject(worldX, worldY, child);
        });
    }

    isPointInObject(worldX, worldY, object) {
        const worldPos = this.getWorldPosition(object);
        const halfWidth = object.scale[0];
        const halfHeight = object.scale[1];
        const left = worldPos[0] - halfWidth;
        const right = worldPos[0] + halfWidth;
        const top = worldPos[1] + halfHeight;
        const bottom = worldPos[1] - halfHeight;

        return worldX >= left && worldX <= right && worldY >= bottom && worldY <= top;
    }

    getWorldPosition(object) {
        let worldPos = vec3.create();
        vec3.add(worldPos, this.position, object.position);

        // If this ObjectGroup has a parent, recursively add its position
        if (this.parentObject) {
            const parentWorldPos = this.parentObject.getWorldPosition(this);
            vec3.add(worldPos, parentWorldPos, worldPos);
        }

        return worldPos;
    }

    getAllObjects() {
        return this._children.reduce((acc, child) => {
            if (child instanceof ObjectGroup) {
                return [...acc, ...child.getAllObjects()];
            }
            return [...acc, child];
        }, []);
    }

    draw(gl, globalViewMatrix, transform, currentTime) {
        let objectGroupTransformMatrix = mat4.create();
        mat4.translate(objectGroupTransformMatrix, objectGroupTransformMatrix, this.position);
        mat4.rotate(objectGroupTransformMatrix, objectGroupTransformMatrix, this.rotation[0], [1, 0, 0]);
        mat4.rotate(objectGroupTransformMatrix, objectGroupTransformMatrix, this.rotation[1], [0, 1, 0]);
        mat4.rotate(objectGroupTransformMatrix, objectGroupTransformMatrix, this.rotation[2], [0, 0, 1]);
        mat4.scale(objectGroupTransformMatrix, objectGroupTransformMatrix, this.scale);

        let finalTransformMatrix = mat4.create();
        mat4.mul(finalTransformMatrix, globalViewMatrix, objectGroupTransformMatrix);
        gl.uniformMatrix4fv(transform, false, new Float32Array(finalTransformMatrix));

        this._children.forEach(child => {
            if (child instanceof ObjectGroup) {
                child.draw(gl, finalTransformMatrix, transform, currentTime);
            } else {
                child?.draw(finalTransformMatrix, transform, currentTime);
            }
        });
    }
}

export { ObjectGroup };