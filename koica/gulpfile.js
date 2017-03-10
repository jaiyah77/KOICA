'use strict';

// #node-modules
const path     = require('path');
const gulp     = require('gulp');
const lazypipe = require('lazypipe');

// #gulp-modules
const sourcemaps  = require('gulp-sourcemaps');
const sass        = require('gulp-sass');
const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync').create(); // browser-sync 호출
const plumber     = require('gulp-plumber');
const postcss     = require('gulp-postcss'); // css 후처리기

// #notification
const notify = require("gulp-notify"); // 메시지 알림 기능(에러 메시지 등..)
// related postcss modules
const autoprefixer = require('autoprefixer');

var paths = {
	dist : 'html',
	scss : 'html/sass',
	css : 'html/css',
	// template: 'templates',
};

var config = {
	browserSync : true,
	notify: true, // 운영체제에서 컴파일 결과 알림 기능
};

gulp.task('html', () => {
	return gulp
		.src(paths.dist + '/**/*.html')
		/** HTML 파일을 browserSync 로 브라우저에 반영 */
		.pipe(browserSync.reload({ stream : true }));
});

/**
 * include html task (html 인클루드할 경우에 사용)
 */
/*gulp.task('include', () => {
 return gulp
 .src([paths.template + '/!**!/!*.html', '!./templates/include/!*.html'])
 .pipe(fileinclude({
 prefix: '@@',
 basepath: '@file'
 }))
 .pipe(gulp.dest('dist'))
 .pipe(browserSync.reload({ stream : true }));
 });*/

/**
 * OS 에서 알림(오류등)팝업 설정
 */
var globalOptions = {
	notify : !config.notify ? {} : { // false 이면 빈 객체로 실행하지 않고 true 라면 에러 메시지 알림 기능 실행
		errorHandler : notify.onError({
			title: '<%= error.relativePath %>',
			message: '<%= error.line %> line - <%= error.messageOriginal %>',
			sound: "Pop"
		})
	}
};

// sass 컴파일 함수
function sassPipe(build) {
	var options = {
		sass : {
			outputStyle: 'expanded',
			indentType: 'tab',
			indentWidth: 1, // 들여 쓰기에 사용할 공간 또는 탭의 수를 결정
			precision: 3, //십진수 다음에 오는 자릿수를 결정하는 데 사용
			sourceComments: false
		},
		autoprefixer: {
			browsers: config.pc ?
				['last 2 versions', "Edge > 0", "ie >= 8"] : // PC 옵션
				["Android > 0","iOS > 0","FirefoxAndroid > 0"] // 모바일 옵션
		}
	};
	
	options.postcss = [
		autoprefixer(options.autoprefixer)
	];
	
	// 파이프란 한 프로그램 프로세스에서 다른 프로세스로 정보를 전달하는 기술
	// Lazy Loading 이란?
	// 이미지와 같이 사이즈가 큰 데이터를 로딩할 때 사용자의 브라우져 화면에 나타나지 않은 이미지까지 로딩을 하면 페이지 로딩이 느려질 수 있습니다.
	// lazy loading은 사용자 브라우져에 보이는 이미지만 로딩하고 다른 이미지들은 사용자가 스크롤 하면서 이미지에 가까워지면 로딩됩니다.
	
	// Lazypipe 를 사용하면 늦게 초기화(lazily-initialized)한 파이프 라인을 만들 수 있습니다.
	// gulp 같이 부분적인 파이프 라인을 재사용하려는 환경에서 사용하기 위한 용도
	var returnPipe = lazypipe().pipe(sass,options.sass); // sass 걸프모듈과 sass 옵션값 전달
	
	// build 인 매개변수가 참이면
	// lazypipe 를 통해서 sass 옵션을 실하고 postcss 인 후처리를 통해 autoprefiexer 플러그인을 사용하도록 한다.
	if(build) {
		returnPipe = returnPipe.pipe(postcss,options.postcss);
	}
	
	return returnPipe();
}

gulp.task('sass', () => {
	return gulp
		.src(path.join(paths.scss, '/**/*.scss')) // Read scss
		.pipe(plumber(globalOptions.notify)) // 에러 발생시 pipe 연결을 끊지 않고 notify 메시지를 출력
		.pipe(sourcemaps.init()) // scss 디버깅을 위해 소스맵을 생성
		.on('error', sass.logError)
		.pipe(sassPipe(true))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.join(paths.css)))
		/** SCSS 컴파일을 수행한 후 browserSync 로 브라우저에 반영 */
		.pipe(browserSync.reload({
			stream : true
		}));
});

/**
 * browserSync 등록
 */
gulp.task('browserSync', ['sass'], () => {
	var options = {
		browserSync : {
			port : 8080,
			server: {
				baseDir: paths.dist, // 웹서버 루트 경로 설정
			}
		}
	};
	
	if (config.browserSync) {
		browserSync.init(options.browserSync);
		
		// watch 등록
		gulp.watch([path.join(paths.dist, '/**/*.html')], ['html']);
		
		gulp.watch([path.join(paths.scss, '/**/*')], ['sass'])
			.on('change', browserSync.reload);
		
		/** 스크립트 수정시 지속적인 관찰을 하도록 정의 */
		gulp.watch([path.join(paths.dist, '/js/**/*')])
			.on('change', browserSync.reload);
		
		/** 이미지가 추가, 삭제시에 지속적인 관찰을 하도록 정의 */
		gulp.watch([path.join(paths.dist, '/images/**/*')])
			.on('change', browserSync.reload);
	}
});

gulp.task('default', ['browserSync']);