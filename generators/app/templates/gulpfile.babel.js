import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins'
import browserSync from 'browser-sync'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import runSequence from 'run-sequence'
import browserify from 'browserify'
import watchify from 'watchify'
import babel from 'babelify'
import del from 'del'

const $ = gulpLoadPlugins()
const bs = browserSync.create()


function destination(path) {
  return [paths.dest, path].join('/')
}


const paths = {
  dest: 'dist',
  scripts: {
    entry: 'src/scripts/index.js',
    watch: 'src/scripts/**/*.js'
  },
  styles: {
    entry: 'src/styles/index.scss',
    watch: 'src/styles/**/*.scss'
  },
  templates: {
    base: 'src/templates/pages/',
    data: 'src/templates/data/',
    src: 'src/templates/pages/**/*.html',
    watch: 'src/templates/**/*'
  }
}


gulp.task('styles', () => styles(true))
gulp.task('styles:build', () => styles())
function styles(development) {
  return gulp.src(paths.styles.entry)
    .pipe($.plumber())
    .pipe($.if(development, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: development ? 'expanded' : 'compressed',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
    }))
    .pipe($.if(development, $.sourcemaps.write()))
    .pipe($.concat('style.css'))
    .pipe(gulp.dest(destination('styles')))
    .pipe($.if(development, bs.reload({ stream: true })))
}


gulp.task('scripts', () => scripts(true))
gulp.task('scripts:build', () => scripts())
function scripts(development) {
  let bundler = browserify(
    paths.scripts.entry,
    { debug: development }
  ).transform(babel)

  if (development) {
    bundler = watchify(bundler)
  }

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) {
        console.error(err)
        this.emit('end')
      })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe($.if(development, $.sourcemaps.init({ loadMaps: true })))
      .pipe($.if(development, $.sourcemaps.write('.')))
      .pipe($.rename('bundle.js'))
      .pipe(gulp.dest(destination('scripts')))
      .pipe($.if(development, bs.reload({ stream: true })))
  }

  if (development) {
    bundler.on('update', rebundle)
  }

  rebundle()
}


gulp.task('templates', () => templates(true))
gulp.task('templates:build', () => templates())
function templates(development) {
  return gulp.src(paths.templates.src, {
        base: paths.templates.base
      })
      .pipe($.swig({
        defaults: { cache: false },
        load_json: true,
        json_path: paths.templates.data
      }))
      .pipe(gulp.dest(destination()))
      .pipe($.if(development, bs.reload({ stream: true })))
}


gulp.task('clean', () => {
  del(paths.dest, { force: true })
})


gulp.task('browser-sync', ['styles', 'scripts', 'templates'], () => {
  bs.init({
    server: paths.dest,
    open: false,
    reloadOnRestart: true,
    notify: false
  })

  gulp.watch('dist/**/*').on('change', bs.reload)

  gulp.watch(paths.styles.watch, ['styles'])
  gulp.watch(paths.templates.watch, ['templates'])
})


gulp.task('serve', () => {
  runSequence('clean', 'browser-sync')
})


gulp.task('build', () => {
  runSequence('clean', [
    'styles:build',
    'scripts:build',
    'templates:build'
  ])
})


gulp.task('default', ['build'])
