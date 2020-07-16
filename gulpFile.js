const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const fs = require("fs")
const path = require('path');
const gifResize = require('@gumlet/gif-resize')

var paths = {
    src: './src/pages/blog',
    dest: './src/pages/blog'
}

function resizeImages(imgFolder) {
    gulp.src(imgFolder + '/*.+(png|jpg)')
        .pipe(imagemin())
        .pipe(gulp.dest(imgFolder));
    
    fs.readdir(imgFolder, function(err, images) {
        images.forEach(image => {
            if(path.extname(image) === ".gif") {
                const bufferFile = fs.readFileSync(imgFolder+"\\" +image);
                const startingSize = Buffer.byteLength(bufferFile);
                gifResize()(bufferFile).then(buffer => {
                    if (buffer.byteLength < startingSize) {
                        var stream = fs.createWriteStream(imgFolder + "\\" + image)
                        stream.write(buffer)
                        stream.end
                        console.log(`Resize ${image}: ${(startingSize - Buffer.byteLength(buffer))/1000}kb`);
                    }
                })
            }
        })
    })
}

function imageLoop () {
    fs.readdir(paths.src, function(err, folders) {
        for (var i = 0; i < folders.length; i++) {

            var imgFolderPath = path.join(paths.src, folders[i], '/img');
            if (fs.existsSync(imgFolderPath)) {
                resizeImages(imgFolderPath);
            }
        }
    });
}


gulp.task("default", imageLoop);
