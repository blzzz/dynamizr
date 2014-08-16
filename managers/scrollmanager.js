define([
	'jquery'
],function($){

var undef;
return {
	
	doLog: false,

	speed: 300,
	useAnimation: true,

	// use $(document), $(window) or $('body') to read width, height and scrollTop/Left from
	$getProvider: $(document), 
	
	// use element to apply height, width and scroll positions to
	$setProvider: $('body'),

	prevValues: {
		top:0, left:0, width:0, height:0
	},	

	config: function( params ){
		
		params = params || {};
		this.speed = params.speed || this.speed; 
		this.useAnimation = params.useAnimation || this.useAnimation; 
		this.doLog = params.doLog || this.doLog; 
		// $(window).bind('scroll', function(e){
            
  		// });

		return this;
	},

	setProviders: function( $getProvider, $setProvider, css ){

		if( _.isObject(css) ){
			this.$getProvider.css( css );
			this.$setProvider.css( css );
		}

		this.$getProvider = $getProvider;
		this.$setProvider = $setProvider;

	},

	overflow: function( makeVisible ){

		// get overflow's visibility
		if( makeVisible == undef ){
			return this.$setProvider.css('overflow') === 'visible';
		}

		// set overflow
		var overflow = typeof makeVisible === 'boolean' ? (makeVisible?'visible':'hidden') : makeVisible;
		this.$setProvider.css('overflow',overflow);
	},

	height: function( value, completeCallback ){

		// get height
		if( value==undef ){
			return this.$getProvider.height();
		}

		// set height
		this.prevValues.height = this.height();
		var useAnimation = typeof completeCallback === 'function' || this.useAnimation;
		if( useAnimation ){
			// if( completeCallback == undef){
			// 	var $setProvider = this.$setProvider;
			// 	completeCallback = function(){ $setProvider.css({overflow:'visible'}); }
			// }
			this.$setProvider.stop().animate({
				height:value
			},{
				duration:this.speed,
				complete:completeCallback
			});
		}else{
			this.$setProvider.stop().animate({
				height:value
			});
		}

		if( this.doLog ){
			console.log( 'SCROLL: '+(useAnimation ? 'animate':'set')+' height to '+value );
		}
	},

	width: function( value, useAnimation ){
		
		// get width
		if( value==undef ){
			return this.$getProvider.width();
		}

		// set width
		this.prevValues.width = this.width();
		useAnimation = useAnimation || this.useAnimation;
		if( useAnimation ){
			this.$setProvider.stop().animate({
				width:value
			});
		}else{
			this.$setProvider.stop().css({
				width:value
			});
		}
	},
	
	top: function( value, useAnimation ){

		// get top
		if( value==undef ){
			return this.$getProvider.scrollTop();
		}

		// set top
		this.prevValues.top = this.top();
		useAnimation = useAnimation || this.useAnimation;
		var $setProvider = $('html,body');
		if( useAnimation ){
			$setProvider.stop().animate({
				scrollTop:value
			});
		}else{
			$setProvider.stop().css({
				scrollTop:value
			});
		}

		if( this.doLog ){
			console.log( 'SCROLL: '+(useAnimation ? 'animate':'set')+' top position to '+value );
		}

	},

	bottom: function( value, useAnimation ){

		var winHeight = $(window).height();

		// get bottom
		if( value==undef ){
			var paneBottom = this.top() + winHeight;
			return this.height() - paneBottom;
		}

		useAnimation = useAnimation || this.useAnimation;
		var bottom = this.height() - winHeight - value
		var $setProvider = $('html,body');
		if( useAnimation ){
			$setProvider.stop().animate({
				scrollTop:bottom
			});
		}else{
			$setProvider.stop().css({
				scrollTop:bottom
			});
		}

	},

	left: function( value, useAnimation ){

		// get left
		if( value==undef ){
			return this.$getProvider.scrollLeft();
		}

		// set left
		this.prevValues.left = this.left();
		useAnimation = useAnimation || this.useAnimation;
		var $setProvider = $('html,body');
		if( useAnimation ){
			$setProvider.stop().animate({
				scrollLeft:value
			});
		}else{
			$setProvider.stop().animate({
				scrollLeft:value
			});
		}

	},

	set: function( params, useAnimation ){
		var css = {};
		_.each(params, function( value, prop ){
			switch(prop){
				case 'top': css.scrollTop = value; break;
				case 'left': css.scrollLeft = value; break;
				default: 
					if( this[ prop ]){ 
						css[ prop ] = value 
					};
			}
		},this);
		if( useAnimation ){
			this.$setProvider.stop().animate( css, this.speed );
		}else{
			this.$setProvider.stop().css( css );
		}
		return this;
	}

};	

});