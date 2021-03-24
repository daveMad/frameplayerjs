// const handler = require('serve-handler');
const http = require('http');
const fs = require('fs').promises;
const path = require('path')

const mediaTypes = {
    jpg: 'image/jpeg',
    html: 'text/html'
    /* add more media types */
}

const publicFolder = process.argv.length > 2 ? process.argv[2] : '.'

const server = http.createServer((req, res) => {
    let url = req.url;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');

    let filepath = path.join(publicFolder, url)

    if (url == "/") {
        filepath = "index.html"
    }

    fs.readFile(filepath).then((data, err) => {

        let mediaType = 'text/html'
        const ext = path.extname(filepath)
        if (ext.length > 0 && mediaTypes.hasOwnProperty(ext.slice(1))) {
            mediaType = mediaTypes[ext.slice(1)]
        }

        res.setHeader('Content-Type', mediaType)
        res.end(data)
    });
});


server.listen(3000, () => {
    console.log('Running at http://localhost:3000');
});