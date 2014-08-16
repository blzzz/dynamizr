define([

    'jquery',
    'underscore',
    'backbone',
    'website',
    'scaffold/vendor'
    
], function( $, _, Backbone, website, vendor ){

var undef;
var WidthZoneManager = /** @lends WidthZoneManager */{
    
   original_zones: {},
   
   zones: [],
   
   currentZone: { zone: '' },

   currWindowWidth: undef,
   currWindowHeight: undef,
   
   waitTime: 100,

   /**
    * Fügt die Zonen an
    * @param {WidthZoneBlueprint} zones
    */
   config: function( zones ){
        var self = this;


        // validate width zones
        if(typeof zones !== 'object' ){
            throw Error('width zones must be structured as an object with sub objects (zones)');
        }
        this.original_zones = zones;
        var zoneObj, zoneArray = [];
        for( zone in zones ){
            zoneObj = zones[ zone ];
            if( !zoneObj.from ){
                zoneObj.from = 0;
            }
            zoneArray.push( $.extend( { zone:zone }, zoneObj) );
        }
        

        // sort by the 'from' property
        zoneArray.sort(function(a,b){
            if (a.from < b.from) return -1;
            if (a.from > b.from) return 1;
            return 0;
        });
        self.zones = zoneArray;
        

        // bind resize handler
        var resizeEvent = vendor.browser.events.resize;
        var resizeHandler = _.debounce( function(e){ self.triggerResizeEvent(); }, self.waitTime );
        $(window).bind( resizeEvent, resizeHandler);
        

        // return resize handler
        return self;

   },

   handleResize: function(){
        var self = this; 
        self.triggerResizeEvent();
   },


   detectZone: function( zones ){
        var self = this;
        var winWidth = self.getViewportSize().width;   
        
        if( zones != undef ){
            self.addWidthZones( zones );
        }

        // check for matching width zone
        var currentZone;
        for (var i=0, zone, from, to; i < self.zones.length; i++) {
            zone  = self.zones[i];
            from = zone.from || 0;  
            to = zone.to || (winWidth + 1);
            if( winWidth > from && winWidth <= to ){
                currentZone = zone;
                break;
            }
        }
        return currentZone;    
    },
   
   getWidthZone: function( zone ){
       
       return this.original_zones[ zone ];
       
   },


   getViewportSize: function() {
        var element = window, 
            prefix = 'inner';
        if (!('innerWidth' in window )) {
            prefix = 'client';
            element = document.documentElement || document.body;
        }
        return { width : element[ prefix+'Width' ] , height : element[ prefix+'Height' ] };
    },

    width: function(){
        var self = this;
        return self.currWindowWidth;
    },

    height: function(){
        var self = this;
        return self.currWindowHeight;
    },

    triggerReadyEvent: function(){
        var self = this;
        self.currentZone = self.detectZone();
        self.triggerResizeEvent( true );
   },
   
   /**
    * Erstellt die Listener zu den WidthZones
    * @fires Website@widthZoneChanged
    * @fires Website@widthZoneResized
    */
   triggerResizeEvent: function( forceReadyEvent ){
        var self = this;
        
        var hasZoneChanged = false,
            sizes = self.getViewportSize()
            winWidth = sizes.width, 
            winHeight = sizes.height,
            hasWindowSizeChanged = winWidth != self.currWindowWidth || winHeight != self.currWindowHeight;
        
        self.currWindowWidth = winWidth;
        self.currWindowHeight = winHeight;

        if( !forceReadyEvent ){
            
            // get current state data
            var previousZone = self.currentZone;
            self.currentZone = self.detectZone();
            hasZoneChanged = previousZone.zone != self.currentZone.zone;

        }
        

        // trigger event if matching width zone is an other zone than before
        if( hasZoneChanged || forceReadyEvent ){
            
            /**
             * Alle Frontend Module sind geladen und bereit
             * @event Website#widthZoneChanged
             * @property {string} - Der Name der Zone
             * @property {object} - Alle Parameter zur Zone
             */
            website.trigger( forceReadyEvent ? 'widthZoneReady' : 'widthZoneChanged', self.currentZone.zone, this.currentZone, forceReadyEvent);
            
        }else if( hasWindowSizeChanged ){
            
            /**
             * Wenn die Breite innerhalb einer Zone sich verändert
             * @event Website#widthZoneResized
             * @property {string} - Der Name der Zone
             * @property {object} - Alle Parameter zur Zone
             */
            website.trigger( 'widthZoneResized', this.currentZone.zone, this.currentZone, forceReadyEvent );
 
        }
         
   }

};

return WidthZoneManager;
    
});
