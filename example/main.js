var undef;

require([
  
  'website',
  'core/frontend',  
  'core/vendor',

  'managers/widthzone',
  'managers/transition',
  'managers/loadingindicator',  

],

/**
 * Main Funktion: Da wo alles beginnt
 * @function main
 * @global
 */ 
function(website, Frontend, vendor, WidthZoneManager, TransitionManger, LoadingIndicator ) {

    
    var googleAnalyticsAccount = 'UA-XXXXXXXX';
    

    /* CONFIGURATE MANAGERS */
    
    website.widthManager =          WidthZoneManager.config( website.widthZones );
    website.transitionManager =     TransitionManger.config( website.dynamicSections, ':has(.mod_article,.mod_grid_navigation)' );
    website.loadingIndicator =      LoadingIndicator.config( '#loading-overlay', website.spinOptions);



    /* BIND WEBSITE EVENTS */

    website.bind('domReady', function(){
        
        vendor.log( 'DOM READY', 'main event' );

        // initalize the frontend
        website.frontend = new Frontend({
            disableTouchMoveEvents: false,
            pushState: true
        });
        
        website.transitionManager.load(function(){

            website.frontend.run();

            // send ready event to width zone manager
            website.widthManager.triggerReadyEvent();

        });

    });


    website.bind('pageRequested', function(route){
        
        vendor.log( 'PAGE REQUESTED → "'+route.alias+'"', 'main event' );

        website.loadingIndicator.start();  
         
    });


    website.bind('frontendReady', function(modules){
        
        vendor.log( 'FRONTEND MODULES READY', 'main event' );  
        website.frontend.callEachInstances('onWidthZoneReady', website.widthManager.detectZone() );      
        website.frontend.appendPage();
        
    });


    website.bind('pageFetched', function(page, data, isInitial ){

        vendor.log( 'PAGE FETCHED', 'main event' );
        website.frontend.appendPage( page );
        
    });
    

    website.bind('pagePreloaded',function(page){

        vendor.log( '('+page.index+') PAGE PRELOADED', 'website-event event' );

    });
    

    website.bind('pageReady', function(page, prevPage){
        

        // track page, page view by google analytics
        if( window._gaq != undef ){
            window._gaq.push(['_setAccount', googleAnalyticsAccount ]);
            window._gaq.push(['_trackPageview']);
        }        


        vendor.log( '('+page.index+') PAGE READY', 'main event' );        
        website.loadingIndicator.stop();

        
        // show body content, prevent FOUC
        if( prevPage == undef ){
            $('body').css({ visibility:'visible' });                        
        }
        
    });
    
    website.bind('widthZoneReady widthZoneChanged', function( zone, obj, isReadyEvent ){
        
        vendor.log( 'WIDTH ZONE DEFINED → '+zone, 'main event resize' );
        if( !isReadyEvent ){
            website.frontend.callEachInstances('onWidthZoneChange', obj );
            website.transitionManager.callEachInstances('onWidthZoneChange', obj );
        }
        website.frontend.addBodyClass(zone, _.keys(website.widthZones) );

    });
    
    website.bind('widthZoneResized', function( zone, obj ){

        vendor.log( 'WIDTH ZONE RESIZED → '+zone+' @'+$(window).width(), 'main event resize' );
        website.frontend.callEachInstances('onWidthZoneResize', obj );
        website.transitionManager.callEachInstances('onWidthZoneResize', obj );
        
    });   


    /*** initialize website by waiting for dom ready event ***/
    website.initialize();

});
