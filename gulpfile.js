var gulp = require('gulp'),
  del = require('del'),
  runSequence = require('run-sequence'),
  bower = require('gulp-bower'),
  sass = require('gulp-sass'),
  jshint = require('gulp-jshint'),
  karma = require('gulp-karma'),
  protractor = require("gulp-protractor").protractor,
  webdriver = require("gulp-protractor").webdriver_standalone,
  webdriverUpdate = require('gulp-protractor').webdriver_update,
  browserSync = require('browser-sync').create(),
  bsMock = require('bs-mock').init();

// --- main ---

gulp.task('build', function () {
  return runSequence('dependencies', 'html', 'css', 'js', 'lib');
});

gulp.task('dev', ['html:watch', 'css:watch', 'js:watch'], function () {
  browserSync.init({
    server: {
      baseDir: './dist',
      middleware: function (req, res, next) {
        if (bsMock.process(req, res)) {
          console.log("Served from mocks");
        }
        next();
      }
    },
    open: false
  });

  gulp.watch(['dist/**'], browserSync.reload);
});

gulp.task('default', ['build']);

// --- misc ---

gulp.task('clean', function () {
  return del(['dist']);
});

gulp.task('clean-dependencies', function () {
  return del(['app/lib']);
});

gulp.task('dependencies', function () {
  return bower({ cmd: 'update'});
});

// --- html ---

var htmlSrc = ['./app/index.html', './app/partials/**/*.html'];

gulp.task('html', function () {
  return gulp.src(htmlSrc, {base: './app'}).pipe(gulp.dest('dist'));
});

gulp.task('html:watch', function () {
  gulp.watch(htmlSrc, ['html']);
});

// --- css ---

var scssSrc = ['./app/scss/**/*.scss'];
var cssSrc = ['./app/css/**/*.css'];

gulp.task('scss', function () {
  return gulp.src(scssSrc).pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('app/css'));
});

gulp.task('css:copy', function () {
  return gulp.src(cssSrc, {base: './app'}).pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
  return runSequence('scss', 'css:copy');
});

gulp.task('css:watch', function () {
  gulp.watch(scssSrc, ['css']);
});

// --- js ---

var jsSrc = ['./app/js/**/*.js'];
var jsTestSrc = ['./test/unit/**/*.js'];

gulp.task('lint', function () {
  return gulp.src(jsSrc)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('js:copy', function () {
  return gulp.src(jsSrc, {base: './app'}).pipe(gulp.dest('dist'));
});

gulp.task('js:test-unit', ['lint'], function () {
  return gulp.src('./none')
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('js', function () {
  return runSequence('js:copy');//'js:test-unit',
});

gulp.task('js:watch', function () {
  gulp.watch(jsSrc.concat(jsTestSrc), ['js']);
});

// --- lib ---

var libSrc = ['./app/lib/**'];

gulp.task('lib', function () {
  return gulp.src(libSrc, {base: "./app"}).pipe(gulp.dest('dist'));
});

gulp.task('lib:watch', function () {
  gulp.src(libSrc, ['lib']);
});

// --- e2e ---

gulp.task('webdriver_update', webdriverUpdate);
gulp.task('webdriver', ['webdriver_update'], webdriver);

gulp.task('test-e2e', function () {
  return gulp.src(['test/e2e/**/*.js'])
    .pipe(protractor({
      configFile: "./protractor.config.js"
    }))
    .on('error', function(e) { throw e });
});

// --- utils ---

process.on('uncaughtException', console.error.bind(console));
