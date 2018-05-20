var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var inject = require('gulp-inject');
var gulpif = require('gulp-if');
var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

var pageFilesPath = 'src/pages'

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

gulp.task('buildDev', function() {
    var folders = getFolders(pageFilesPath);
    if (folders.length === 0) return done();

    var hash = encode((+new Date).toString(36));
    var baseJsPath = 'src/base.js';
    var baseScssPath = 'src/base.scss';
    var baseHtmlPath = 'src/base.html';
    var configPath = 'config/dev.config.js';

    gulp.src(configPath)
        .pipe(concat('config.js'))
        .pipe(gulp.dest('dist'));

    for(var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        var jsPath = pageFilesPath + '/' + folder + '/' + folder + '.js';
        var scssPath = pageFilesPath + '/' + folder + '/' + folder + '.scss';
        var htmlPath = pageFilesPath + '/' + folder + '/' + folder + '.html';
        var jsExists = false;
        var scssExists = false;

        if(fs.existsSync(jsPath)) {
            jsExists = true;

            gulp.src(jsPath)
                .pipe(concat(folder + '.js'))
                .pipe(gulp.dest('dist'));

            gulp.watch(jsPath, function() {
                gulp.src(jsPath)
                    .pipe(concat(folder + '.js'))
                    .pipe(gulp.dest('dist'));
            })
        }

        if(fs.existsSync(scssPath)) {
            scssExists = true;

            gulp.src(scssPath)
                .pipe(sass())
                .pipe(concat(folder + '.css'))
                .pipe(gulp.dest('dist'));

            gulp.watch(scssPath, function() {
                gulp.src(scssPath)
                    .pipe(sass())
                    .pipe(concat(folder + '.css'))
                    .pipe(gulp.dest('dist'));
            })
        }

        gulp.src(baseHtmlPath)
            .pipe(inject(gulp.src([htmlPath]), {
                starttag: '<!-- inject:pageContent -->',
                transform: function(filepath, file) {
                    return file.contents.toString();
                }
            }))
            .pipe(gulpif(jsExists, 
                inject(gulp.src([baseJsPath, configPath, jsPath], {read: false}), {
                    starttag: '<!-- inject:js -->',
                    transform : function (filePath, file, i, length) {
                        var newPath = filePath.replace('/src/', '').replace('pages/', '').replace(folder + '/', '').replace('/' + configPath, 'config.js');
                        return '<script type="text/javascript" src="' + newPath + '?ver=' + hash + '"></script>';
                    }
                }),
                inject(gulp.src([baseJsPath, configPath], {read: false}), {
                    starttag: '<!-- inject:js -->',
                    transform : function (filePath, file, i, length) {
                        var newPath = filePath.replace('/src/', '').replace('/' + configPath, 'config.js');
                        return '<script type="text/javascript" src="' + newPath + '?ver=' + hash + '"></script>';
                    }
                })
            ))
            .pipe(gulpif(scssExists, 
                inject(gulp.src([baseScssPath, scssPath], {read: false}), {
                    starttag: '<!-- inject:css -->',
                    transform : function (filePath, file, i, length) {
                        var newPath = filePath.replace('/src/', '').replace('pages/', '').replace(folder + '/', '').replace('scss', 'css');
                        return '<link rel="stylesheet" href="' + newPath + '?ver=' + hash + '">';
                    }
                }),
                inject(gulp.src(baseScssPath, {read: false}), {
                    starttag: '<!-- inject:css -->',
                    transform : function (filePath, file, i, length) {
                        var newPath = filePath.replace('/src/', '').replace('scss', 'css');
                        return '<link  rel="stylesheet" href="' + newPath + '?ver=' + hash + '">';
                    }
                })
            ))
            .pipe(concat(folder + '.html'))
            .pipe(gulp.dest('dist'));

        gulp.watch(htmlPath, function() {
            gulp.src(baseHtmlPath)
                .pipe(inject(gulp.src([htmlPath]), {
                    starttag: '<!-- inject:pageContent -->',
                    transform: function(filepath, file) {
                        return file.contents.toString();
                    }
                }))
                .pipe(concat(folder + '.html'))
                .pipe(gulp.dest('dist'));
        })
    }

    gulp.src(baseScssPath)
        .pipe(sass())
        .pipe(concat('base.css'))
        .pipe(gulp.dest('dist'))

    gulp.src(baseJsPath)
        .pipe(concat('base.js'))
        .pipe(gulp.dest('dist'))
});

gulp.task('buildProd', function() {
    var folders = getFolders(pageFilesPath);
    if (folders.length === 0) return done();

    var hash = encode((+new Date).toString(36));
    var baseJsPath = 'src/base.js';
    var baseScssPath = 'src/base.scss';
    var baseHtmlPath = 'src/base.html';
    var configPath = 'config/prod.config.js';

    for(var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        var jsPath = pageFilesPath + '/' + folder + '/' + folder + '.js';
        var scssPath = pageFilesPath + '/' + folder + '/' + folder + '.scss';
        var htmlPath = pageFilesPath + '/' + folder + '/' + folder + '.html';
        var jsExists = false;
        var scssExists = false;

        if(fs.existsSync(jsPath)) {
            jsExists = true;

            gulp.src(jsPath)
                .pipe(uglify())
                .pipe(concat(folder + '.js'))
                .pipe(gulp.dest('dist'));
        }

        if(fs.existsSync(scssPath)) {
            scssExists = true;

            gulp.src(scssPath)
                .pipe(sass({style: 'compressed'}))
                .pipe(cleanCSS())
                .pipe(concat(folder + '.css'))
                .pipe(gulp.dest('dist'));
        }

        gulp.src(baseHtmlPath)
            .pipe(inject(gulp.src([htmlPath]), {
                starttag: '<!-- inject:pageContent -->',
                transform: function(filepath, file) {
                    return file.contents.toString();
                }
            }))
            .pipe(gulpif(jsExists, 
                inject(gulp.src([baseJsPath, configPath, jsPath], {read: false}), {
                    starttag: '<!-- inject:js -->',
                    transform : function (filePath, file, i, length) {
                        var newPath = filePath.replace('/src/', '').replace('pages/', '').replace(folder + '/', '').replace('/' + configPath, 'config.js');
                        return '<script type="text/javascript" src="' + newPath + '?ver=' + hash + '"></script>';
                    }
                }),
                inject(gulp.src([baseJsPath, configPath], {read: false}), {
                    starttag: '<!-- inject:js -->',
                    transform : function (filePath, file, i, length) {
                        var newPath = filePath.replace('/src/', '').replace('/' + configPath, 'config.js');
                        return '<script type="text/javascript" src="' + newPath + '?ver=' + hash + '"></script>';
                    }
                })
            ))
            .pipe(gulpif(scssExists, 
                inject(gulp.src([baseScssPath, scssPath], {read: false}), {
                    starttag: '<!-- inject:css -->',
                    transform : function (filePath, file, i, length) {
                        var newPath = filePath.replace('/src/', '').replace('pages/', '').replace(folder + '/', '').replace('scss', 'css');
                        return '<link rel="stylesheet" href="' + newPath + '?ver=' + hash + '">';
                    }
                }),
                inject(gulp.src(baseScssPath, {read: false}), {
                    starttag: '<!-- inject:css -->',
                    transform : function (filePath, file, i, length) {
                        var newPath = filePath.replace('/src/', '').replace('scss', 'css');
                        return '<link  rel="stylesheet" href="' + newPath + '?ver=' + hash + '">';
                    }
                })
            ))
            .pipe(concat(folder + '.html'))
            .pipe(gulp.dest('dist'));
    }

    gulp.src(baseScssPath)
        .pipe(sass())
        .pipe(concat('base.css'))
        .pipe(gulp.dest('dist'))

    gulp.src(baseJsPath)
        .pipe(concat('base.js'))
        .pipe(gulp.dest('dist'))

    gulp.src('config/prod.config.js')
        .pipe(concat('config.js'))
        .pipe(gulp.dest('dist'));
});

var encode = function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = _utf8_encode(input);

    while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
}

_utf8_encode = function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }
    }
    return utftext;
}