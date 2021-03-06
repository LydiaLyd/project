"use strict";

var gulp = require("gulp"),
    // MARKUP
    // jade = require("gulp-jade"),
    // htmlcomb = require("gulp-htmlcomb"), // упорядочивает аттрибуты
    htmlmin = require("gulp-htmlmin"),
    // STYLE
    less = require("gulp-less"),
    autoprefixer = require("gulp-autoprefixer"),
    combineMq = require("gulp-combine-mq"),
    csso = require("gulp-csso"),
    // SCRIPTS
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    // IMAGES
    // spritesmith = require("gulp.spritesmith"),
    imagemin = require("gulp-imagemin"),
    // OTHER
    plumber = require("gulp-plumber"),
    rename = require("gulp-rename"),
    livereload = require("gulp-livereload"),
    del = require("del"),
    gulpSequence = require("gulp-sequence"),
    merge = require("merge-stream");

// Компиляция разметки
gulp.task("markup", function() {
  return gulp.src(["source/*.html"])
  // return gulp.src(["source/jade/*.jade",
  //                  "!source/jade/layout.jade",
  //                  "!source/jade/mixins.jade"])
    .pipe(plumber())
    // .pipe(jade())
    // .pipe(htmlcomb())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"))
    .pipe(livereload());
});

// Компиляция стилей
gulp.task("style", function() {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer({browsers: ["last 2 versions", "ie 10"]}))
    .pipe(combineMq())
    .pipe(csso())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("build/css"))
    .pipe(livereload());
});

// Конкатенация своих скриптов
gulp.task("scripts", function() {
  return gulp.src("source/js/*.js")
    .pipe(plumber())
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(livereload());
});

// Конкатенация вендорных скриптов
gulp.task("vendor", function() {
  return gulp.src("source/js/vendor/*.js")
    .pipe(plumber())
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(rename("vendor.min.js"))
    .pipe(gulp.dest("build/js"));
});

// Сборка спрайта
gulp.task("sprite", function () {
  var spriteData = gulp.src("source/img/sprite/*.png").pipe(spritesmith({
    imgName: "sprite.png",
    imgPath: "../img/sprite.png",
    cssName: "sprite.less",
    padding: 3,
    algorithm: "top-down"
  }));

  var imgStream = spriteData.img
    .pipe(gulp.dest("source/img/"));

  var cssStream = spriteData.css
    .pipe(gulp.dest("source/less"));

  return merge(imgStream, cssStream);
});

// Оптимизация изображений
gulp.task("images", function() {
  return gulp.src("source/img/*.{png,jpg,svg}")
    .pipe(imagemin())
    .pipe(gulp.dest("build/img"));
});

// Перенести шрифты из source/ в build/
gulp.task("fonts", function() {
  return gulp.src("source/font/*")
    .pipe(gulp.dest("build/font"));
});

// Удалить папку build/
gulp.task("clean", function() {
  return del(["build"]);
});

// Сборка проекта
gulp.task("build", function(callback) {
  gulpSequence("clean", ["markup", "style", "scripts", "vendor", "fonts"/*, "sprite"*/], "images", callback);
});

// Отслеживание изменений в файлах
gulp.task("watch", ["markup", "style", "scripts"], function() {
  livereload.listen();
  gulp.watch("source/*.html", ["markup"]);
  // gulp.watch("source/jade/**/*.jade", ["markup"]);
  gulp.watch("source/less/**/*.less", ["style"]);
  gulp.watch("source/js/*.js", ["scripts"]);
  gulp.watch("source/js/vendor/*.js", ["vendor"]);
  gulp.watch("source/img/*.{png,jpg,svg}", ["images"]);
  gulp.watch("source/img/sprite/*.png", ["sprite"]);
});

// Сборка проекта + отслеживание изменений
gulp.task("default", function(callback) {
  gulpSequence(["markup", "style", "scripts", "vendor", "fonts", "images"], "watch", callback);
});
