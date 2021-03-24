class FramePlayer extends EventTarget {
    id = "";
    /** @type {Number} */
    downloadStarted = null;

    /** @type {Number} */
    playStartedTime = null;
    /** @type {Number} */
    playStoppedTime = null;

    /** @type {CustomEvent} */
    onPlayEvent = null;
    /** @type {CustomEvent} */
    onPauseEvent = null;

    base_url = "http://localhost:3000";
    total_images = 7;

    frameWidth = 50
    frameHeight = 50

    /** @type {[String]} */
    element_urls = [];

    // represents all the cutted frames' urls
    imagePieces = []

    fps = 0
    totalSeconds = 0

    playInterval = null;

    progressBarElement = null;

    videoTimeInterval = null;
    videoTime = 0;

    initialize() {
        this.frameWidth = 640 / 5;
        this.frameHeight = 360 / 5;

        this.element_urls = [];

        this.progressBarElement = document.getElementById('bar');
    }

    calculateTSAfterDownload() {
        this.totalSeconds = this.imagePieces.length / this.fps
    }

    // for testing purposes
    renderAll() {
        for (let img of this.imagePieces) {
            let image = new Image();
            image.crossOrigin = "Anonymous";
            image.src = img;
            document.body.appendChild(image);
        }
    }

    render() {
        let elem = document.getElementById(this.id);
        elem.src = this.imagePieces[this.currentFrameIndex];
    }

    updateProgress() {
        let progressPercentage = (this.currentFrameIndex * 100) / this.imagePieces.length;
        this.progressBarElement.style.width = `${progressPercentage}%`;
    }

    constructor(id, fps = 10) {
        super();
        this.id = id;
        this.fps = fps;

        this.initialize();

        this.downloadStarted = window.performance.now();

        for (let i = 0; i < this.total_images; i++) {
            let currentImageUrl = `${this.base_url}/images/${i}.jpg`;
            fetch(currentImageUrl)
                .then(response => {
                    if (!response.ok) {
                        console.error(`Breaked from fetching image => ${currentImageUrl} ; Index => ${i}`);
                        return;
                    }

                    let blob = response.blob();
                    return blob
                }).then(images => {
                    let usableUrl = URL.createObjectURL(images);
                    this.element_urls.push(usableUrl);

                    let image = new Image();
                    image.crossOrigin = "Anonymous";
                    image.src = usableUrl;

                    image.onload = function () {
                        player.cutImageToFrames(image);
                    }

                }).catch(error => {
                    console.error(error);
                });
        }
    }

    // private method
    /**
     * 
     * @param {Image} image 
     */
    cutImageToFrames(image) {
        var canvas = document.createElement('canvas');
        canvas.width = this.frameWidth;
        canvas.height = this.frameHeight;
        var context = canvas.getContext('2d');

        let frameX = 5,
            frameY = 5;

        for (let i = 0; i < frameX; i++) {
            let x = i;

            for (let m = 0; m < frameY; m++) {
                let y = m;
                context.drawImage(image, x * this.frameWidth, y * this.frameHeight, this.frameWidth, this.frameHeight, 0, 0, canvas.width, canvas.height);
                this.imagePieces.push(canvas.toDataURL());
            }
        }

        if (this.imagePieces.length >= frameX * frameY * this.total_images) {
            this.render();
            this.calculateTSAfterDownload();
            const downloadFinished = window.performance.now();
            let ondownloadcomplete = new CustomEvent('downloadcomplete', { bubbles: true, detail: downloadFinished - this.downloadStarted });
            this.dispatchEvent(ondownloadcomplete);
        }
    }

    getCalcPlayTimeMS() {
        return window.performance.now() - this.playStartedTime;
    }

    play() {
        const tnow = window.performance.now();
        this.playStartedTime = tnow;
        let calculatedMs = tnow - this.playStartedTime;
       
        if (this.onPlayEvent == null) {
            this.onPlayEvent = new CustomEvent('play', { bubbles: true, cancelable: true, detail: this.getCalcPlayTimeMS() });
        }

        this.progressBarElement.style.width = "0%";
        clearInterval(this.playInterval);
        this.playInterval = setInterval(() => {
            this.renderCurrentFrame();
            this.currentFrameIndex += 1;
        }, 1000 / this.fps);

        this.dispatchEvent(this.onPlayEvent);
        return calculatedMs;
    }



    renderCurrentFrame() {
        if (this.currentFrameIndex < 0 || this.currentFrameIndex > this.imagePieces.length - 1) {
            clearInterval(this.playInterval);
            if (this.onEndEvent == null) {
                this.onEndEvent = new CustomEvent('end', { bubbles: true, cancelable: false, detail: null });
            }
            this.dispatchEvent(this.onEndEvent);
            this.currentFrameIndex = 0;
            this.render();
            this.progressBarElement.style.width = "0%";
            toggleButtons(document.getElementById('video-button'));
            return;
        }

        let elem = document.getElementById(this.id);
        elem.src = this.imagePieces[this.currentFrameIndex];

        this.updateProgress();
    }

    currentFrameIndex = 0;

    pause() {
        const tnow = window.performance.now();

        const calculatedMs = this.playStartedTime - tnow;
        clearInterval(this.playInterval);

        if (this.onPauseEvent == null) {
            this.onPauseEvent = new CustomEvent('pause', { bubbles: true, cancelable: true, detail: calculatedMs });
        }
        this.dispatchEvent(this.onPauseEvent);
    }

    seek(targetFrame) {
        targetFrame = this.clamp(targetFrame, 0, this.imagePieces.length);
        this.currentFrameIndex = targetFrame;
        this.render();
        this.updateProgress();
        // Stop if its playing 
        clearInterval(this.playInterval);
        let elem = document.getElementById('video-button');
        if (elem.classList.contains('pause-button')) {
            toggleButtons(elem);
        }
    }

    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    // static get isPlaying {}

    // private method, only invoke in constructor
    downloadImages() {
        let dt = new Date("2020-01-21");
        let player = document.getElementById(this.id);
        let ondownloadcomplete = new CustomEvent('ondownloadcomplete', { bubbles: true, detail: 12 });
        player.dispatchEvent(ondownloadcomplete);
    }
    // wrapper for custom events
    on(type, cb) {
        let msdEventTypes = ['downloadcomplete', 'play', 'pause'];

        if (type == "end") {
            this.addEventListener(type, (event) => { cb(); });
        } else if (msdEventTypes.findIndex(p => p == type) > -1) {
            this.addEventListener(type, (event) => {
                cb(event.detail);
            });
        } else {
            throw new Exception("Unexpected event type");
        }
    }

}

let player = new FramePlayer("playerImage");
player.on('downloadcomplete', function (ms) {
    console.log('download completed in ' + ms);
});

player.on('play', function (ms) {
    console.log('play started ' + ms);
})

player.on('pause', function (ms) {
    console.log('paused ' + ms);
});

player.on('end', function () {
    console.log('end happened');
})