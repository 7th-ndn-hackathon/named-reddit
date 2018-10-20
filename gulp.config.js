module.exports = function () {
    var src = './src/';
    var report = './report/';
    var temp = './.tmp/';
    var wiredep = require('wiredep');
    var bower = {
        json: require('./bower.json'),
        directory: './src/bower_components/',
        ignorePath: '../..'
    };

    var config = {
        src: src,
        index: src + 'index.html',
        bower: bower,
        temp: temp,
        buildPath: './build/',
        event: 'think/2019ems/ui',
        testbuildPath: {
            src: './testbuild',
            build: {
                src: './build/**/**/*.*',
                dest: './testbuild'
            },
            data: {
                src: './src/data/**/**/*.*',
                dest: './testbuild/data'
            }
        },
        server: {
            dev: {
                src: './src',
                host: '127.0.0.1',
                proxies: [
                    {source: '/src', target: 'http://127.0.0.1:8000'}
                ]
            },
            testbuild: {
                src: './testbuild',
                host: '127.0.0.1',
                proxies: [
                    {source: '/testbuild', target: 'http://127.0.0.1:8000'}
                ]
            }
        },
        lessPath: {
            src: './src/styles/*.less',
            dest: './src/styles'
        },
        cssPath: {
            src: './src/styles/*.css',
            dest: {
                inject: './src',
                build: './build/styles'
            }
        },
        scriptsPath: {
            src: [
                './src/app/**/*.js',
                '!./src/app/**/*.spec.js'
            ],
            dest: {
                inject: './src',
                build: './build/js'
            },
            order: [
                '**/app.module.js',
                '**/*.module.js',
                '**/*.controller.js',
                '**/*.js'
            ]
        },
        wiredepPath: {
            options: {
                bowerJson: bower.json,
                directory: bower.directory,
                ignorePath: bower.ignorePath,
                fileTypes: { /*RELATIVE PATH NEEDS TO BE ACCURATE FOR WIREDEP TO PICK UP DEPENDENCIES*/
                    html: {
                        replace: {
                            js: '<script src="/src/{{filePath}}"></script>',
                            css: '<link rel="stylesheet" href="/src/{{filePath}}" />'
                        }
                    }
                }

            }
        },
        htmlcachePath: {
            src: './src/app/**/*.html',
            dest: './.tmp',
            file: 'htmlcache.js',
            options: {
                module: 'app.core',
                root: 'app/',
                standalone: false
            },
            replace: {
                'htmlcache': 'js/htmlcache.js'
            }
        },
        imagesPath: {
            src: './src/images/**/*.{png,jpeg,jpg,svg,gif}',
            dest: './build/images'
        },
        fontsPath: {
            src: bower.directory + 'font-awesome/fonts/**/*.*',
            dest: './build/fonts'
        },
        zipPath: {
            src: './build/**/*',
            dest: './'
        },
        versionPath: {
            src: './src/app/core/config.js',
            dest: './src/app/core/'
        }

    };

    return config;
};
