var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');

gulp.task('sass', function () {
  gulp.src('./sass/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./styles'));
});

gulp.task('watch', ['sass'], function () {
  gulp.watch(['./sass/**/*.scss'], ['sass']);
});

gulp.task('default', ['watch']);
