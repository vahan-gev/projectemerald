import { ObjectGroup } from "./ObjectGroup";

class Scene {
    constructor(objects = []) {
        this.objects = objects;
    }

    add(object) {
        if (object instanceof ObjectGroup) {
            object.setIsActive(true);
            this.setActiveRecursive(object, true);
        } else {
            object.setIsActive(true);
        }
        if (!this.objects.some(obj => obj.id === object.id)) {
            this.objects.push(object);
        }
    }

    remove(object) {
        if (object instanceof ObjectGroup) {
            this.setActiveRecursive(object, false);
            object.setIsActive(false);
        } else {
            object.setIsActive(false);
        }
        this.objects = this.objects.filter(obj => obj?.id !== object?.id);
    }

    setIsActive(bool) {
        for (let object of this.objects) {
            this.setActiveRecursive(object, bool);
        }
    }

    setActiveRecursive(object, bool) {
        if (object instanceof ObjectGroup) {
            for (let child of object._children) {
                this.setActiveRecursive(child, bool);
            }
        } else {
            object.setIsActive(bool);
        }
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator
    [Symbol.iterator]() {
        let index = -1;
        const data = this.objects;

        return {
            next: () => ({ value: data[++index], done: !(index in data) })
        };
    }

    forEach(callback) {
        for (const obj of this.objects) {
            callback(obj);
        }
    }
}

export { Scene }