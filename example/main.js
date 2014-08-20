var undef;

require([
  
  'website',
  'core/frontend',  
  'core/vendor',

  'managers/widthzone',
  'managers/transition',
  'managers/Loadingindicator',  
  'managers/googleanalytics' 

],

/**
 * Main Funktion: Da wo alles beginnt
 * @function main
 * @global
 */ 
function( website, Frontend, vendor, WidthZoneManager, TransitionManger, LoadingIndicator, TrackingManager ) {

    
    /**  CONFIGURE WEBSITES MANAGERS  **/
    
    website.WidthManager =          WidthZoneManager.config( website.widthZones );
    website.TransitionManager =     TransitionManger.config( website.dynamicSections, ':has(.inside)' );
    website.LoadingIndicator =      LoadingIndicator.config( '#loading-indicator', website.spinOptions);
    website.TrackingManager =       TrackingManager.config( 'UA-XXXXXXXX' );




    /**  ADD WEBSITES EVENT BASED BEHAVIOURS  **/
    
    website.bind( 'domReady' ,function(){  vendor.log('DOM READY','main event');

        website.frontend = new Frontend({
            pushState: true
        });
        

        website.TransitionManager.load(function(){
            website.frontend.run();
            website.WidthManager.triggerReadyEvent();            
        });

    });


    website.bind( 'pageRequested' , function( route ){  vendor.log('PAGE REQUESTED → "'+route.alias+'"','main event');

        website.LoadingIndicator.start();  
        website.frontend.fetchPage(route.path);

    });


    website.bind( 'frontendReady' , function(modules){  vendor.log('FRONTEND MODULES READY','main event');  
        
        website.frontend.callEachInstances('onWidthZoneReady', website.WidthManager.detectZone() );      
        website.frontend.appendPage();
        
    });


    website.bind( 'pageFetched', function( page, data, isInitial ){ vendor.log('PAGE FETCHED','main event');
        
        website.frontend.appendPage( page );
        
    });
    

    website.bind( 'pagePreloaded' , function( page ){  vendor.log( '('+page.index+') PAGE PRELOADED', 'website-event event' );

        // ...add preload behaviour here

    });
    

    website.bind( 'pageReady' , function( currPage, prevPage ){  vendor.log('('+currPage.index+') PAGE READY', 'main event');  
        
        website.TrackingManager.trackPageView();

        website.LoadingIndicator.stop();

        
        if( prevPage == undef || prevPage.index !== currPage.index ){

            vendor.log( '('+currPage.index+') START TRANSITION', 'transition' );
            website.TransitionManager.start( prevPage, currPage );

        }

        // show body content, prevent FOUC
        if( prevPage == undef ){
            $('body').css({ visibility:'visible' });                        
        }
        
    });
    

    website.bind( 'widthZoneReady widthZoneChanged' , function( zone, obj, isReadyEvent ){  vendor.log('WIDTH ZONE DEFINED → '+zone,'main event resize');
        
        if( !isReadyEvent ){
            website.frontend.callEachInstances('onWidthZoneChange', obj );
            website.TransitionManager.callEachInstances('onWidthZoneChange', obj );
        }
        website.frontend.addBodyClass(zone, _.keys(website.widthZones) );

    });
    
    website.bind( 'widthZoneResized' , function( zone, obj ){  vendor.log( 'WIDTH ZONE RESIZED → '+zone+' @'+$(window).width(), 'main event resize' );
        
        website.frontend.callEachInstances('onWidthZoneResize', obj );
        website.TransitionManager.callEachInstances('onWidthZoneResize', obj );
        
    });   


    website.TransitionManager.bind('transitionDone', function( currPage, prevPage, transitions ){   vendor.log( '('+currPage.index+') TRANSITION DONE', 'transition' ); 
        
        website.frontend.setActivePage( currPage );
        website.frontend.callEachInstances('showUp', currPage, true );
        
    });

    /*** initialize website by waiting for dom ready event ***/
    website.initialize();

});
