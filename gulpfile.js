// Gulp.js configuration
var
  // modules
  gulp = require('gulp'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  htmlclean = require('gulp-htmlclean'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  assets = require('postcss-assets'),
  autoprefixer = require('gulp-autoprefixer'),
  cssnano = require('gulp-cssnano'),
  mqpacker = require('css-mqpacker'),
  smushit = require('gulp-smushit'),
  browserSync = require('browser-sync').create(),

  // development mode?
  devBuild = (process.env.NODE_ENV !== 'production'),

  // folders
  folder = {
    src: 'public/src/',
    build: 'public/build/'
  }
;

//build variables for... building
var ftp = require('vinyl-ftp');
var gutil = require('gulp-util');
var minimist = require('minimist');
var args = minimist(process.argv.slice(2));

//image processing
gulp.task('images', function(){
	var out = folder.build + 'images/';
	return gulp.src(folder.src + 'images/**/*')
		.pipe(imagemin({ optimizationLevel: 10 }))
		//.pipe(smushit({
		//	verbose: true
		//}))
		.pipe(gulp.dest(out));
});

gulp.task('smushit', function(){
	var out = folder.build + 'images/';
	return gulp.src(folder.src + 'images/**/*')
		.pipe(smushit({
			verbose: true
		}))
		.pipe(gulp.dest(out));
});

// HTML processing
gulp.task('html', ['images'], function() {
  var
    out = 'public/',
    page = gulp.src(folder.src + 'html/**/*')
      .pipe(newer(out));

  // minify production code
  if (!devBuild) {
    page = page.pipe(htmlclean());
  }

  return page.pipe(gulp.dest(out));
});


//css processing
gulp.task('css', ['images'], function(){

	var postCssOpts = [
	assets({ loadPaths: ['images/'] }),
	autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
	];

	if(!devBuild){
		postCssOpts.push(cssnano);
	}

	return gulp.src(folder.src + 'scss/app.scss')
		.pipe(sass({
			outputStyle: 'nested',
			imagePath: 'images/',
			precision: 3,
			errLogToConsole: true
		}))
		//.pipe(postcss(postCssOpts))
		.pipe(cssnano())
		.pipe(gulp.dest(folder.build + 'css/'))
		.pipe(browserSync.stream());

});

//watch tasks
gulp.task('watch', function(){

	//Start browserSync
	browserSync.init({
		server: {
			baseDir: "./public/"
		}
	});

	//image changes
	gulp.watch(folder.src + 'images/**/*', ['images']);

	//html changes
	gulp.watch(folder.src + 'html/**/*', ['html']);

	//css changes
	gulp.watch(folder.src + 'scss/**/*', ['css']);

	//sync browser
	gulp.watch('public/*.html').on('change', browserSync.reload);

});

//build task
gulp.task('build', ['html', 'css']);

//deploy task
gulp.task('deploy', function() {
  var remotePath = 'dev.shaun-cayabyab.com/';
  var buildPath = 'dev.shaun-cayabyab.com/build/';
  var conn = ftp.create({
    host: 'ftp.shaun-cayabyab.com',
    user: args.user,
    password: args.password,
    log: gutil.log
  });
  gulp.src(['./public/index.html'])
    .pipe(conn.newer(remotePath))
    .pipe(conn.dest(remotePath));
  gulp.src(['./public/build/**/*'])
  	.pipe(conn.newer(buildPath))
  	.pipe(conn.dest(buildPath));
});