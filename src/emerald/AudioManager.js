class AudioManager {
    constructor() {
        this.sounds = new Map();
    }

    add(path, name) {
        if (!this.sounds.has(name)) {
            const audio = new Audio(path);
            this.sounds.set(name, {
                audio,
                id: Math.random().toString(36).substring(7)
            });
            return true;
        }
        return false;
    }

    remove(name) {
        return this.sounds.delete(name);
    }

    play(name) {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.audio.play();
            return true;
        }
        return false;
    }

    stop(name) {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.audio.pause();
            sound.audio.currentTime = 0;
            return true;
        }
        return false;
    }

    stopAll() {
        this.sounds.forEach(sound => {
            sound.audio.pause();
            sound.audio.currentTime = 0;
        });
    }

    getSound(name) {
        return this.sounds.get(name);
    }
}

export { AudioManager };