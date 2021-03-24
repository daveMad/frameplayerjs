# frameplayerjs

 A custom video player made up of images which I call as => **frameplayer**, written in pure js. 

> It was an interview project, and I developed this simple player overnight, it has long way to go to be actually usable

### How to use?
- Open up git bash in the root directory
- Type `bash serve.sh`
- Should be running on localhost:3000!

### Current Features
- Load images from node server
- Cut out frames from the parent images using `canvas`
- An array holds all the frames, and when video starts the target frame is rendered using an index
- FPS is set to 10 for testing purposes, but it can be changed in the constructor function in `frame-player.js` 
- Seeking to prev or next frames is available, just click on the bar below the video image, no seconds are being displayed currently
- Pause / Resume is also available

### Missing Key Features
- As the name says, it is just a frame player, but Audio support would be cool
- Support for uploading image sets which should contain frames
