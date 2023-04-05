import gulp, {series, parallel} from 'gulp';
import del from 'del';
import replace from 'gulp-replace';
import { append } from 'gulp-insert';
import { log } from 'gulp-util';
import { clone } from 'gulp-git';

const SRC_REPO = 'https://github.com/doabit/semantic-ui-sass';
const TEMP_DIR = '.temp';

function clean () {
  return del(['./.temp', './semantic-ui.scss', './semantic-ui.js', './scss', './icons', './images', './js']);
}

function fetch (done) {
  clone(SRC_REPO, { args: TEMP_DIR, quiet: true }, done);
}

function moveScss () {
  return gulp.src(`${TEMP_DIR}/app/assets/stylesheets/semantic-ui/**/*.scss`)
    .pipe(replace(/semantic-ui\/icons/g, '#{\$icons-font-path}/icons'))
    .pipe(replace(/semantic-ui\/brand-icons/g, '#{\$icons-font-path}/brand-icons'))
    .pipe(replace(/semantic-ui\/outline-icons/g, '#{\$icons-font-path}/outline-icons'))
    .pipe(replace(/semantic-ui\/flags\.png/g, '#{\$flags-image-path}/flags.png'))
    .pipe(replace(/font-url\(/g, 'url('))
    .pipe(gulp.dest('./scss/'));
}

function moveSemantic () {
  return gulp.src(`${TEMP_DIR}/app/assets/stylesheets/semantic-ui.scss`)
    .pipe(replace(/semantic-ui/g, `scss`))
    .pipe(gulp.dest('./'));
}

function moveImages() {
  return gulp.src(`${TEMP_DIR}/app/assets/images/semantic-ui/**/*`)
    .pipe(gulp.dest('./images/'));
}

function moveIcons () {
  return gulp.src(`${TEMP_DIR}/app/assets/fonts/semantic-ui/**/*`)
  .pipe(gulp.dest('./icons/'));
}

function moveJavascript () {
  return gulp.src(`${TEMP_DIR}/app/assets/javascripts/semantic-ui/**/*`)
    .pipe(gulp.dest('./js/'));
}
function moveJs () {
  return gulp.src(`${TEMP_DIR}/app/assets/javascripts/semantic-ui.js`)
    .pipe(replace(/\/\/= require semantic-ui\/(.+)/g, `require('./js/$1');`))
    .pipe(gulp.dest('./'));
}
function appendToVariables() {
  return gulp.src('./scss/globals/_variables.scss')
    .pipe(append(`$icons-font-path: '../../icons' !default;\n`))
    .pipe(append(`$flags-image-path: '../../images' !default;\n`))
    .pipe(gulp.dest('./scss/globals'));
}

export const build = series(
  clean, 
  fetch, 
  parallel(
    series(moveScss, moveSemantic), 
    moveImages, 
    moveIcons, 
    series(moveJavascript, moveJs)
  ),
  appendToVariables
);

export const test = () => {
  return log('testing...');
}