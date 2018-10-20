var args = require('yargs').argv;
var replace = require('gulp-replace');
var config = require('./gulp.config')();
var del = require('del');
var gulp = require('gulp');
var path = require('path');
var cleanCSS = require('gulp-clean-css');
var runSequence = require('run-sequence');
var wiredep = require('wiredep').stream;
var pkg = require('./package.json');
var _ = require('lodash');
var $ = require('gulp-load-plugins')({lazy: true});
var port = process.env.PORT || config.defaultPort;

/**
 * yargs variables can be passed in to alter the behavior, when present.
 * Example: gulp build --verbose
 * --verbose  : Various tasks will produce more output to the console.
 */

gulp.task('help', $.taskListing);

/**
 * Bump the version
 * --type=patch  (*.*.x) (DEFAULT)
 * --type=pre  (*.*.*-x)
 * --type=minor  (*.x.*)
 * --type=major  (x.*.*)
 */
gulp.task('bump', function() {

    var options = {};

    if (args.ver) {
        options.version = args.ver;
    }
    else if (args.type) {
        options.type = args.type;
    }

    return gulp
        .src('./package.json')
        .pipe($.plumber())
        .pipe($.print())
        .pipe($.bump(options))
        .pipe(gulp.dest('./'));
});

gulp.task('vet', function() {

    return gulp
        .src(config.scriptsPath.src)
        .pipe($.plumber())
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'))
        .pipe($.jscs());
});

gulp.task('default', ['dev']);

gulp.task('dev', ['dev-inject'], function() {
    gulp.src(config.server.dev.src)
        .pipe($.plumber())
        .pipe($.webserver({
            livereload: true,
            directoryListing: false,
            open: true,
            fallback: 'index.html',
            host: config.server.dev.host,
            proxies: config.server.dev.proxies
        }));
});

gulp.task('dev-inject', function() {

    runSequence(
        'dev-less',
        'dev-inject-css',
        'dev-inject-scripts'
    );

});

gulp.task('dev-less', function () {

    return gulp
        .src(config.lessPath.src)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
        .pipe($.less())
        .pipe($.concat('less.css'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(config.lessPath.dest));
});

gulp.task('dev-inject-css', function() {

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe(inject(config.cssPath.src))
        .pipe(gulp.dest(config.cssPath.dest.inject));
});

gulp.task('dev-inject-scripts', function() {

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe(wiredep(config.wiredepPath.options))
        .pipe(inject(config.scriptsPath.src, '', config.scriptsPath.order))
        .pipe(gulp.dest(config.scriptsPath.dest.inject));
});

gulp.task('build', function () {

    runSequence(
        'dev-inject',
        'build-clean-temp',
        'build-clean-build',
        'build-htmlcache',
        'build-images',
        'build-uigrid',
        'build-fonts',
        'build-version',
        'build-deploy',
        'build-replace',
        'build-clean-temp',
        'build-zip',
        'build-notify'
    );

});

gulp.task('build-clean-temp', function() {
    return del.sync(config.temp);
});

gulp.task('build-clean-build', function() {
    return del.sync(config.buildPath);
});

gulp.task('build-htmlcache', function() {

    return gulp
        .src(config.htmlcachePath.src)
        .pipe($.plumber())
        .pipe($.if(args.verbose, $.bytediff.start()))
        .pipe($.htmlmin({collapseWhitespace: true}))
        .pipe($.if(args.verbose, $.bytediff.stop(bytediffFormatter)))
        .pipe($.angularTemplatecache(
            config.htmlcachePath.file,
            config.htmlcachePath.options
        ))
        .pipe(gulp.dest(config.htmlcachePath.dest));
});

gulp.task('build-images', function() {

    return gulp
        .src(config.imagesPath.src)
        .pipe($.plumber())
        .pipe($.imagemin({ optimizationLevel: 4 }))
        .pipe(gulp.dest(config.imagesPath.dest));
});

gulp.task('build-uigrid', function(){

    return gulp
        .src([
            config.bower.directory+'/angular-ui-grid/ui-grid.ttf',
            config.bower.directory+'/angular-ui-grid/ui-grid.woff'
        ])
        .pipe($.plumber())
        .pipe(gulp.dest(config.buildPath+'/styles/'));
});

gulp.task('build-fonts', function() {

    return gulp
        .src(config.fontsPath.src)
        .pipe($.plumber())
        .pipe(gulp.dest(config.fontsPath.dest));
});

gulp.task('build-version', function(){

    var today = new Date();

    return gulp
        .src(config.versionPath.src)
        .pipe(replace(/appDate: '.+'/g,'appDate: \'' + today + '\''))
        .pipe(replace(/appVersion: '.+'/g,'appVersion: \'' + pkg.version + '\''))
        .pipe(gulp.dest(config.versionPath.dest));
});

gulp.task('build-deploy', function() {

    var assets = $.useref.assets({searchPath: './'});
    var cssFilter = $.filter('**/*.css');
    var jsAppFilter = $.filter('**/app.js');
    var jslibFilter = $.filter('**/lib.js');

    var templateCache = config.temp + config.htmlcachePath.file;

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe(inject(templateCache, 'htmlcache')) // Inject htmlcache to be concatonated with app.js files
        .pipe(assets) // Gather all build assets from the html with useref
        .pipe(cssFilter)
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(cssFilter.restore())
        .pipe(jsAppFilter)
        .pipe($.uglify())
        .pipe(getHeader()) // Prepend package info to app.js
        .pipe(jsAppFilter.restore())
        .pipe(jslibFilter)
        .pipe($.uglify())
        .pipe(jslibFilter.restore())
        .pipe($.rev()) // Take inventory of the file names for future rev numbers
        .pipe(assets.restore()) // Apply the concat and file replacement with useref
        .pipe($.useref())
        .pipe($.revReplace()) // Replace the file names in the html with cache bust names
        .pipe(gulp.dest(config.buildPath));
});

gulp.task('build-replace', function(){

    return gulp
        .src(config.buildPath + 'index.html')
        .pipe($.replace('<base href="/">', '<base href="/events/tools/' + config.event + '/screens/administration/">'))
        .pipe(gulp.dest(config.buildPath));
});

gulp.task('build-replace-onsite', function(){

    return gulp
        .src(config.buildPath + 'index.html')
        .pipe($.replace('/screens/', '/onsite/'))
        .pipe(gulp.dest(config.buildPath));
});

gulp.task('build-zip', function () {

    return gulp
        .src(config.zipPath.src)
        .pipe($.plumber())
        .pipe($.zip(pkg.version + '-' + pkg.name + '.zip'))
        .pipe(gulp.dest(config.zipPath.dest));
});

gulp.task('build-notify', function(){

    var msg = {
        title: 'Build Successful!',
        subtitle: 'Look inside "build" folder for your prize!',
        message: 'Sanity check: `gulp testbuild`'
    };

    log(msg);
    notify(msg);
});

gulp.task('testbuild', function() {

    runSequence(
        'testbuild-clean',
        'testbuild-copy-build',
        'testbuild-copy-data',
        'testbuild-replace',
        'testbuild-server'
    );
});

gulp.task('testbuild-clean', function() {
    return del.sync(config.testbuildPath.src);
});

gulp.task('testbuild-copy-build', function() {

    return gulp
        .src(config.testbuildPath.build.src)
        .pipe($.plumber())
        .pipe(gulp.dest(config.testbuildPath.build.dest));
});

gulp.task('testbuild-copy-data', function() {

    return gulp
        .src(config.testbuildPath.data.src)
        .pipe($.plumber())
        .pipe(gulp.dest(config.testbuildPath.data.dest));
});

gulp.task('testbuild-replace', function(){

    return gulp
        .src(config.testbuildPath.build.dest + '/index.html')
        .pipe($.replace('<base href="/events/tools/' + config.event + '/screens/administration/">', '<base href="/">'))
        .pipe(gulp.dest(config.testbuildPath.build.dest));
});

gulp.task('testbuild-server', function () {

    return gulp
        .src(config.server.testbuild.src)
        .pipe($.plumber())
        .pipe($.webserver({
            livereload: true,
            directoryListing: false,
            open: true,
            fallback: 'index.html',
            host: config.server.testbuild.host,
            proxies: config.server.testbuild.proxies
        }));
});

/*HELPER FUNCTIONS*/

/**
 * Inject files in a sorted sequence at a specified inject label
 * @param   {Array} src   glob pattern for source files
 * @param   {String} label   The label name
 * @param   {Array} order   glob pattern for sort order of the files
 * @returns {Stream}   The stream
 */
function inject(src, label, order) {
    log('injecting: ' + src);
    var options = {read: false};
    if (label) {
        options.name = 'inject:' + label;
    }

    return $.inject(orderSrc(src, order), options);
}

/**
 * Order a stream
 * @param   {Stream} src   The gulp.src stream
 * @param   {Array} order Glob array pattern
 * @returns {Stream} The ordered stream
 */
function orderSrc (src, order) {
    //order = order || ['**/*'];
    return gulp
        .src(src)
        .pipe($.if(order, $.order(order)));
}

/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
    var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
    return data.fileName + ' went from ' +
        (data.startSize / 1000).toFixed(2) + ' kB to ' +
        (data.endSize / 1000).toFixed(2) + ' kB and is ' +
        formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted perentage
 */
function formatPercent(num, precision) {
    return (num * 100).toFixed(precision);
}

/**
 * Format and return the header for files
 * @return {String}           Formatted file header
 */
function getHeader() {

    var template = ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @authors <%= pkg.authors %>',
        ' * @version v<%= pkg.version %>',
        ' */',
        ''
    ].join('\n');
    return $.header(template, {
        pkg: pkg
    });
}

/**
 * Log a message or series of messages
 * Can pass in a string, object or array.
 */
function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log(msg[item]);
            }
        }
    } else {
        $.util.log(msg);
    }
}

/**
 * Show OS level notification using node-notifier
 */
function notify(options) {
    var notifier = require('node-notifier');
    var notifyOptions = {
        sound: 'Bottle',
        contentImage: path.join(__dirname, 'logo.png'),
        icon: path.join(__dirname, 'logo.png')
    };
    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);
}

module.exports = gulp;
