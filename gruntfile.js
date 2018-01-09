var path =require('path');
module.exports = function(grunt) {
    grunt.initConfig({
        
        pkg : grunt.file.readJSON('package.json'),
       
        jshint : {
            myFiles : ['./index.js','./routes/**/*.js']
        },
        nodemon : {
            script : './index.js'
        },
        watch:{
             express: {
                dev: {
                    options: {
                        port: 5000,
                        bases: ['/public'],
                        keepalive: true,
                        server: path.resolve('./index.js')
                    }
                }
            },
        },
      
        html_reorderify: {
            reorder: {
                options: {
                    first: ['id', 'class', 'style'],
                    last: [],
                },
                files: [
                    {
                        expand: true,
                        cwd: 'views',
                        src: ['**/*.html'],
                        dest: '/views',
                        ext: '.html',
                    },
                ],
            },
        },
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.registerTask('default', ['jshint','nodemon']);
   
};
    