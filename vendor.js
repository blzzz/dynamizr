define([    
    'jquery',
],function($){

// alert('VENDOR');


/*********** GLOBAL PROPIERTIES **********/
var undef;
var ua = navigator.userAgent.toLowerCase();
var isMobile = (function(a){
    a = navigator.userAgent||navigator.vendor||window.opera;
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))
})();

	
	

    
/*********** DEVICE HARDWARE **********/
Device = (function(){
    
    /*
     * 
     * private props & methods
     * 
     */
        
    var os = {
        
        /* mobile os  */
        ios: /(ipad|iphone|ipod)/.test(ua),
        android: /android/.test(ua),
        firefox: /firefox/.test(ua) && isMobile,
        blackberry: /blackberry|rim/.test(ua),
        
        /* desktop os  */
        macos: /mac\sos\sx/.test(ua),
        windows: /windows/.test(ua)
        
    }; 
   
    var isTablet = false;
    
    if( os.ios ){
        
        /* check iOS device */
        os.ios = {
            ipod: /ipod/.test(ua),
            iphone: /iphone/.test(ua),
            ipad: /ipad/.test(ua)
        };
        
        /* allow iphones and ipods to hide safaris address bar */
        if( dev = os.ios.iphone || os.ios.ipod ){
            dev.hideAddressBar = function(){
                if( this.isIOS && !this.inStandaloneMode ){
                    window.scrollTo(0,1);
                    setTimeout( function(){
                       window.scrollTo(0,1);
                       $('body').addClass('addressbar-hidden');
                    },0 );
                }   
            };
        }
        
        /* check browser mode */
        os.ios.inStandaloneMode = 'standalone' in window.navigator && navigator.standalone;
        os.ios.isIOS7 = ua.match(/OS 7_\d/i) != null;

        /* is it an iPad? */
        isTablet = os.ios.ipad;
    
    }else if( os.android ){
        
        isTablet = !(/mobile/.test(ua));
        
    }else if( os.blackberry ){
        
        isTablet = !(/rim\stablet/.test(ua));
        
    }
    
            
    /*
     * 
     * public props & methods
     * 
     */
    
    return {
         
       /* devices operating system */  
       os: os,
       
       /* is device a mobile device / handheld? */ 
       isMobile: isMobile,
       isHandheld: isMobile,
       
       /* is device a tablet? */ 
       isTablet: isTablet, 
       
       /* is device a desktop? */ 
       isDeskop: !isTablet && !isMobile, 
       
       /* does device support touch interaction? */ 
       hasTouch: 'ontouchstart' in window,
       
       /* does device has a retina display? */ 
       isRetina: window.devicePixelRatio > 1,
       
       /* does device support orientation? */ 
       hasOrientation: 'orientation' in window,
       hasOrientationTrigger: os.ios,
       
    };
    
})();
    
    	

	
	
	
	
	
	
	
/*********** BROWSER CLIENT **********/
var Browser = (function(){
    
    /*
     * 
     * private props & methods
     * 
     */
    
    var dummyStyle = document.createElement('div').style;
    
    var alias = (function () {
        var vendors = 't,webkitT,MozT,msT,OT'.split(','),
            t,
            i = 0,
            l = vendors.length;

        for ( ; i < l; i++ ) {
            t = vendors[i] + 'ransform';
            if ( t in dummyStyle ) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }
        return false;
    })();
    
    var cssPrefix = alias ? '-' + alias.toLowerCase() + '-' : '';
    
    var version = (function(){
        var N=navigator.appName, ua=navigator.userAgent, tem;
        var M=ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
        if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
        M=M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];
        return M[1];
    })();
    
    
    var internetExplorerVersion = (function(){
        var undef,
            v = 3,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');    
        while (
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
            all[0]
        );
        return v > 4 ? v : undef;    
    }());
    
    var isInternetExplorer = internetExplorerVersion != undef;
    
    var prefixStyle = function(style) {
        if ( alias === '' ) return style;    
        style = style.charAt(0).toUpperCase() + style.substr(1);
        return alias + style;
    };
    
    var events = {
        orientationchange: Device.hasOrientationTrigger ? 'orientationchange' : 'resize',
        resize: Device.hasOrientation ? 'viewportresize' : 'resize',
        down: Device.hasTouch ? 'touchstart' : 'mousedown',
        move: Device.hasTouch ? 'touchmove' : 'mousemove',
        up: Device.hasTouch ? 'touchend' : 'mouseup',
        cancel: Device.hasTouch ? 'touchcancel' : 'mouseup',
        wheel: alias == 'Moz' ? 'DOMMouseScroll' : 'mousewheel'
    };
    
    
    
    /*
     * 
     * public props & methods
     * 
     */
    if (isInternetExplorer && internetExplorerVersion <= 9){
        console = false;
    }
    
    return {
        
        
        /* alias/prefix like 'webkit' or 'moz' */
        alias: alias, 
        
        /* cssPrefix like '-webkit-' */
        cssPrefix: cssPrefix,
        
        /* check for properties */
        has3d: prefixStyle('perspective') in dummyStyle,
        hasTransform: !!alias,
        hasPushState: !!history.pushState,
        hasConsole: !!console,
        
        /* check if browser is internet explorer */
        isIE: isInternetExplorer,
        isInternetExplorer: isInternetExplorer,
        
        /* check internet explorer version */
        isIElt9: internetExplorerVersion < 9,
        isIE9: internetExplorerVersion == 9,
        isIEgt9: internetExplorerVersion > 9,
        isIEgt10: internetExplorerVersion > 10,
        isIElt11: internetExplorerVersion < 11,
        
        /* get browser version */
        version: version || 'an unknown version',
        
        /* get a prefixed style */
        prefixStyle: prefixStyle,
        
        /* interaction events */
        events: events
        
        
    };
    
})(this);



/*********** VIEW PORT **********/    
var Viewport = (function(){
    
    var orientation;
    
    // add orientation support methods
    if( Device.hasOrientation ){
        
        orientation = {
            
            /* current orientation mode */
            landscape: false,
            portrait: false,
            
            /* get current orientation */
            get: function(){ 
                return this.landscape ? 'landscape' : 'portrait'; 
            },
            
            /* set new orientation value */
            set: function( newOrientation ){
                this._previousOrientation = newOrientation;
                var isLandscape = Device.hasOrientationTrigger ? (newOrientation == -90 || newOrientation == 90) : $(window).width() > $(window).height();
                this.portrait = isLandscape ? false : true;
                this.landscape = isLandscape ? true : false;
            },
            
            /* handle event fired by an orientation change trigger */
            handleChange: function(e){
                
                var isUntracked = this._previousOrientation == undef,
                    hasChanged = window.orientation !== this._previousOrientation;
                
                if( isUntracked || hasChanged ){                    
                    this.set( window.orientation );
                    if( !isUntracked ){ $(window).trigger('viewportresize'); }                    
                }               
            }
            
        };
        
        var orientationChange = Browser.events.orientationchange;
        $(window).bind( 
            orientationChange, 
            function(){ orientation.handleChange(); }
        );
        orientation.handleChange();
        
        
        
    }
    
    
    /*
     * 
     * public props & methods
     * 
     */
    
    return {
        
        /* viewport's orientation properties/methods */
        orientation: orientation,        
        
    };
    
})(this);


var Logger = (function(){
    
    var tagsToShow = [];
    var alwaysShowErrorTagged = true;
    var showDeltaTime = false;
    var showExtraInfos = false;
    var launchTime = (new Date()).getTime();
    
    
    var doTagsAllowOutput = function( tags ){
        
        if( tags == undef || tagsToShow.length == 0 ){
            return true;
        }
        
        if( tagsToShow[0] == '*' ){
            return true;
        }
        
        var tag_array = tags.split(' ');
        for (var i=0, numMatches = 0; i < tag_array.length; i++) {
          if( tagsToShow.indexOf( tag_array[i] ) !== -1 ){
              return true;
          }else{
              return false;
          }
        };
        
        return true; //return numMatches === tagsToShow.length;
    };
    
    return {
        
        log_config: function( options ){
            
            if( !options || !Browser.hasConsole || !options.enableLogs ){
                return;
            } 
            
            if( options.showTags ){
                var showThese;
                if( options.showTags == '*' ){
                    tagsToShow = ['*'];
                    showThese = '<all tags>';
                }else{
                    tagsToShow = _.compact( options.showTags.split(' ') );
                    showThese = tagsToShow.join(',');
                }
                var introMessage = 'There will be log output for these tags: '+showThese;
                var line = '';
                for (var i=0; i < introMessage.length; i++) {
                  line += '=';
                }
                console.log( line+'\n'+introMessage+'\n'+line );
            } 
            
            if( options.showDeltaTime ){
                showDeltaTime = options.showDeltaTime;
            } 
            if( options.showExtraInfos ){
                showExtraInfos = options.showExtraInfos;
            } 
            
            if( options.alwaysShowErrorTagged ){
                alwaysShowErrorTagged = options.alwaysShowErrorTagged;
            }
            
            if( alwaysShowErrorTagged && tagsToShow.indexOf('error') !== -1 ){
                tagsToShow.push('error');
            }
            
        },
        
        log: function( message, tags ){
            
            if( tagsToShow.length == 0 ) {
                return;
            } 
             
            if( Browser.hasConsole && doTagsAllowOutput( tags ) ){
                
                // output log message in a line
                console.log( message );
                
                // output extra informations in multiple lines
                var extras = {};
                if( tagsToShow.length > 0 ){
                    taggedWith = tags || ' <untagged> ';
                    extras.taggedWith = taggedWith;
                }
                if( showDeltaTime ){
                    extras.deltaTime = (new Date()).getTime() - launchTime;
                }
                if ( showExtraInfos ){
                    for ( var extra in extras ){
                        console.log( '   ↳ '+extra+': '+extras[ extra ] );
                    }
                }
            } 
        }
    };
    
}(this));


var Vendor = /** @lends Vendor */{
    
    /**
     * @class Liefert globale statische Informationen zum Gerät, Browser oder Viewport
     * @constructs
     */
    initialize: function(){
       
    },
    
    
    /**
     * Informationen zum Gerät
     * @type {object}
     * @property {string} os - Betriebsystem 
     * @property {boolean} isMobile - Ist es ein Mobiles Gerät
     * @property {boolean} isHandheld - Ist es ein Handheld
     * @property {boolean} isTablet - Ist es ein Tablet
     * @property {boolean} isDeskop - Ist es ein Desktop-Computer
     * @property {boolean} hasTouch - Ist es ein Touchfähiges Gerät 
     * @property {boolean} isRegina - Hat der Bildschirm eine Retina Auflösung
     * @property {boolean} hasOrientation - Wird ein Unterscheiden von horizontaler und vertikaler Orientierung unsterstzüt
     * @property {boolean} hasOrientationTrigger - Feuert der Wechsel von horzontal zu vertikal ein Event  
     */
    device: Device,
    
    
    /**
     * Informationen zum Browser
     * @property {string} alias - Alias/Prefix wie 'webkit' oder 'moz'
     * @property {string} cssPrefix - CSS Prefix wie -webkit-
     * @property {boolean} has3d - Wird eine 3D Perspektive unterstützt
     * @property {boolean} hasTransform
     * @property {boolean} hasPushState - Wird das Überschreiben der Browser Adressbar unterstützt
     * @property {boolean} isIE - Ist es ein Internet Explorer
     * @property {boolean} isInternetExplorer - Alias von isIE
     * @property {boolean} isIElt9 - ist die IE Version kleiner als 9
     * @property {boolean} isIEgt9 - ist die IE Version grösser als 9
     * @property {boolean} version - Browser Version
     * @property {boolean} prefixStyle
     * @property {object} events
     */
    browser: Browser,

    
    /**
     * Information zum Viewport
     * @type {object}
     * @property {object} orientation - 
     */
    viewport: Viewport
    
};
return window.Vendor = $.extend( {}, Logger, Vendor);
    
});