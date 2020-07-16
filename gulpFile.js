const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const fs = require("fs")
const path = require('path');

var paths = {
    src: './src/pages/blog',
    dest: './src/pages/blog'
}

function resizeImages(imgFolder) {
    return gulp.src(imgFolder + '/*.+(png|jpg)')
        .pipe(imagemin())
        .pipe(gulp.dest(imgFolder));
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
