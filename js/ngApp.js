/**
*  Module
*
* Description
*/
"use strict";

var app = angular.module('ngApp', [
	'ui.router']);
app.config(function($stateProvider, $urlRouterProvider){
	$stateProvider

		.state('videoTag',
		{
			url: '',
			templateUrl: 'tpls/video.html',
		})
		.state('javascriptAPI', {
			url: '/js-api',
			templateUrl: 'tpls/api.html',
			controller: 'jsApiCtrl'
		})
    .state('videoAttributes', {
        url: '/video-attrs',
        templateUrl: 'tpls/videoAttrs.html',
        controller: 'videoAttrsCtrl',
    })
    .state('takePhoto', {
        url: '/photo',
        templateUrl: 'tpls/take-photo.html',
        controller: 'photoCtrl as photo'
    })
    .state('audio', {
        url: '/audio',
        templateUrl: 'tpls/audio.html',
        controller: 'audioCtrl as audio',
    })
    .state('camAudio', {
        url: '/cam-with-audio',
        templateUrl: 'tpls/camAudio.html',
        controller: 'vidAudioCtrl as vid'
    })
    .state('camFilters', {
        url: '/filters',
        templateUrl: 'tpls/filters.html',
        controller: 'filtersCtrl as filter'
    })
    .state('summary', {
        url: '/end',
        templateUrl: 'sumup.html'
    })
});

app.directive('changeFilter', function(){
    return {
        restrict: 'A',
        scope: {},
        link: function(scope, element){
            var filters = ['grayscale', 'sepia', 'blur', 'brightness',
               'contrast', 'hue-rotate', 'hue-rotate2',
               'hue-rotate3', 'saturate', 'invert', ''],
                idx = 0;
            String.prototype.capitalizeFirstLetter = function() {
                return this.charAt(0).toUpperCase() + this.slice(1);
            }
            angular.element(element).on("click", function(){
            if(idx-1 >= 0){
                angular.element(element).removeClass(filters[(idx-1) % filters.length]);
            }
            angular.element(element).next().html(filters[idx % filters.length].capitalizeFirstLetter());
            angular.element(element).addClass(filters[++idx % filters.length]);
            })
        }
    }
})

app.service('audioService', function(){
    var that = this;
    
    var context = new AudioContext(),
        filter = context.createBiquadFilter();
    
    this.stopRecord = function(){
            if(that.microphone){
                var tmp = that.microphone.disconnect();
            }
    }
    this.recordSound = function(){
        window.AudioContext = window.AudioContext ||
                        window.webkitAudioContext ||
                        window.mozAudioContext;
        navigator.getUserMedia = navigator.getUserMedia ||
                                navigator.webkitGetUserMedia ||
                                navigator.mozGetUserMedia;
        
        navigator.getUserMedia({audio: true}, function(stream) {
            that.stream = stream;
            that.microphone = context.createMediaStreamSource(stream),
            filter.type = "bandpass";
            filter.frequency.value = 500;
            filter.gain.value = 500;
            that.microphone.connect(filter);
            filter.connect(context.destination);
        },
        function errorCallback(){});
    }
})

app.service('camService', function(){
        var videoEl = null,
            context = new AudioContext(),
            filter = context.createBiquadFilter();
    
    
        this.camWithAudio = function(){
        if(!videoObj) {
                var videoObj = { "video": true, "audio": true };
        }
        var errBack = function(error) {};
            
        if(document.querySelector('video')){
            var videoEl = document.querySelector('video');
            navigator.getUserMedia = navigator.getUserMedia ||
                                navigator.webkitGetUserMedia ||
                                navigator.mozGetUserMedia;
                navigator.getUserMedia(videoObj, function(stream){
                    
                    videoEl.src = window.URL.createObjectURL(stream);
                    
                    var microphone = context.createMediaElementSource(videoEl);
                    filter.type = "bandpass";
                    filter.frequency.value = 500;
                    filter.gain.value = 500;
                    microphone.connect(filter);
                    filter.connect(context.destination);
                    videoEl.play();
                    videoEl.muted = 'true';
                }, errBack);
            }
        }
        
    	this.camStart = function(videObj){            
        if(!videoObj) {
                var videoObj = { "video": true };
        }
        var errBack = function(error) {
                console.log("Video capture error: ", error.code);
        };
        if(document.querySelector('video')){
            var videoEl = document.querySelector('video');
            navigator.getUserMedia = navigator.webkitGetUserMedia ||
                                    navigator.mozGetUserMedia ||
                                    navigator.getUserMedia;

                navigator.getUserMedia(videoObj, function(stream){
                    videoEl.src = window.URL.createObjectURL(stream);
                    videoEl.play();
                }, errBack);    
                 
        }
    }
        this.camStop = function(){
            if(videoEl){
                if(navigator.getUserMedia){
                    videoEl.pause();
                    videoEl.src=null;
                } else if(navigator.mozGetUserMedia){
                    videoEl.pause();
                    videoEl.mozSrcObject=null;
                } else if(navigator.webkitGetUserMedia){
                    videoEl.pause();
                    videoEl.src="";
                }
            }
        }
        
        this.takePhoto = function(){
            var	videoEl = document.querySelector("video");
            var canvas = document.querySelector('.photo');
            if(canvas.offsetWidth === 0){
                canvas.height = videoEl.offsetHeight;
                canvas.width = videoEl.offsetWidth;
            }
            var context = canvas.getContext('2d');
            context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        }
        
});

app.controller('jsApiCtrl', [
	'$scope',
    'camService',
	function($scope, camService){
        camService.camStart();
	}]);

app.controller('videoAttrsCtrl', [
	'$scope',
    'camService',
	function($scope, camService){
        camService.camStart();
	}]);

app.controller('appCtrl', [
    '$scope',
    'camService',
    function($scope, camService){ 
        this.startCam = function(){
            camService.camStart();
        }
        this.closeCam = function(){
            camService.camStop();
        }
    }
]);

app.controller('photoCtrl', [
              '$scope',
              'camService',
	function($scope, camService){
        camService.camStart();
        this.takePhoto = camService.takePhoto;
	}]);
app.controller('audioCtrl', [
    '$scope',
    'audioService',
    function($scope, audioService){
        this.startMicrophone = audioService.recordSound;
        this.stopMicrophone = audioService.stopRecord;
    }]);
app.controller('vidAudioCtrl', [
    '$scope',
    'camService',
    function($scope, camService){
        camService.camWithAudio();
    }
]);

app.controller('filtersCtrl', [
    '$scope',
    'camService',
    function($scope, camService){
        camService.camStart();
    }
])