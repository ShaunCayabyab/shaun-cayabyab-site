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

//image processing
gulp.task('images', function(){
	var out = folder.build + 'images/';
	return gulp.src(folder.src + 'images/**/*')
		.pipe(newer(out))
		.pipe(imagemin({ optimizationLevel: 5 }))
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