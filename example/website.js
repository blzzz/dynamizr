define([
    'jquery',
    'underscore',
    'backbone',
    'core/vendor'
],
function($, _, Backbone, vendor ) {
    
    var website = /** @lends Website */{
        
        /**
         * @class Globales Objekt welches statische Eigenschaften zur Webseite enthält
         * @constructs
         */
       initialize: function(){
          
          var self = this;
          
          // set log configuration
          vendor.log_config( self.logConfigOptions );
          
          // trigger dom ready event
          $(document).ready(function(){
              self.trigger('domReady',self);
          });
          
        },
        
        logConfigOptions: {
            
            enableLogs: true,
            showTags: '*',//'main moduleloader',
            showDeltaTime: true,
            showExtraInfos: false,
            
        },
        
        // private vars
        router: undef,
        frontend: undef,
        loadingOverlay: undef, // die Ladeanimation ist so global gespeichert und kann über das globale website Objekt von überall her zugegriffen werden
        imagePreloadSelector: 'img:not(.dont-preload)',

        /**
         * Root-Pfad unter welchem die Webseite läuft
         * @type {string}
         */
        root: '/dynamizr/example',
                
        /**
         * Zonen mit Bildschirmbreiten für responsive Design
         * @type {object[]}
         * @property {string} from - unterer Grenzwert in Pixel 
         * @property {string} to - oberer Grenzwert in Pixel
         */
        widthZones: {
            'mobile': {
                to: 768
            },
            'tablet': {
                from: 768,
                to: 1024
            },
            'desktop_small': {
                from: 1024,
                to: 1360
            },
            'desktop': {
                from: 1360
            }
            
        },
        
       
        /**
         * Frontend Module die beim initialen Start der Webseite einmal instanziert werden
         * @type {object[]}
         * @property {string} module - Modul Name mit Pfad
         * @property {string} options - Zusätzliche Optionen die dem Modul beim Instanzieren an den Konstruktor übergeben werden
         */
        frontendModules: {
            
            '#header': {
                module: 'modules/header',
                options: {

                }
            }
        },
        


        /**
         * Sektionen als Array mit jQuery Selektoren welche bei einem Seitenwechsel mit den neuen Inhalten geladen werden
         * @type {string[]}
         */
        dynamicSections: {
         
            'section': {
                transition:'example/transitions/section',
                options: {
                  speed: 500,
                    avoidOutro:true,
                    condition: function( isInitial ){
                      return true;
                    }
                }
            }
                       
        },
        
        

        /**
         * Page Module welche beim Laden jeder neuen Seite neu instanziert werden
         * @type {object[]}
         * @property {string} module - Modul Name mit Pfad
         * @property {string} options - Zusätzliche Optionen die dem Modul beim Instanzieren an den Konstruktor übergeben werden
         */
        pageModules: {
           
            '.fancybox': {
                module: 'modules/gallery'
            }          
            
        },
        
        
        /**
         * FancyBox2 Eigenschaften: [Dokumentation]{@link http://fancyapps.com/fancybox/#docs}
         */
        fancyboxOptions: {
            openEffect: 'elastic',
            closeEffect: 'elastic'
        },
        
        /**
         * Spinning Wheel Eigenschaften: [Dokumentation]{@link http://fgnass.github.io/spin.js/#usage}
         */
        spinOptions: {},
        
    };


    // Mix Backbone.Events, modules, and layout management into the app object.
    window.website = _.extend(website, Backbone.Events);
    return window.website;
   
   
});