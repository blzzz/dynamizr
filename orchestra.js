define([
    'jquery',
    'website',
    'backbone',
],

function($, website, Backbone) {
    
    return Backbone.View.extend(
    /** @lends Module.prototype */
    {

        /**
         * Selector der dynamicSection
         * @type {string}
         */
        sectionSelector: undef,
        speed: 0,
        forceIntro: false,
        frontendModuleInstances: [], // dirty stuff

        /**
         * @class Abstrakte Klasse für die Transition Animationen der dynamic Sections
         * @constructs
         */
        initialize: function(){
            var self = this;
            
            self.initOrchestra();
            
        },
        
        /**
         * Konstruktor, falls die initialize Funktion bei einer Vererbung überschrieben wird, kann der super-Konstruktor also diese Funktion separat gerufen werden.
         */
        initOrchestra: function(){
            var self = this;
            
            self.sectionSelector = this.options.selector;
            
            
            if (this.options.speed != undef){
                self.speed = this.options.speed;
            }
            
            if (this.options.forceTransition != undef){
                self.forceTransition = this.options.forceTransition;
            }

            if (this.options.prepare != undef){
                self.prepare = this.options.prepare;
            }

            if (this.options.soloTransition != undef){
                self.soloTransition = this.options.soloTransition;
            }

            if (this.options.avoidOutro != undef){
                self.avoidOutro = this.options.avoidOutro;
            }
            
            if (this.options.insertPath != undef){
                self.insertPath = this.options.insertPath;
            }

            if (this.options.condition != undef){
                self.condition = this.options.condition;
            }
            
        },

        change: function( callback ){
            var self = this;
            self.$fromContent.hide();
            self.$toContent.show();
            callback.call();
        },

        fade: function( callback ){

            var self = this;
            
            if (self.$fromContent == undef){
                
                self.$toContent.hide();
                self.$toContent.fadeIn(self.speed*2, function(){
                    callback.call();                    
                });
                
            }else{
                
                self.$toContent.hide();
                self.$fromContent.fadeOut(self.speed, function(){
                    self.$toContent.fadeIn(self.speed, function(){
                        callback.call();
                    });
                });
                
            }

        },

        crossfade: function( callback ){

            var self = this;
            
            if (self.$fromContent == undef){
                
                self.fade( callback );
                
            }else{
                
                self.$fromContent.fadeOut(self.speed);
                self.$toContent.hide();
                self.$toContent.fadeIn(self.speed, function(){
                    callback.call();
                });

            }

        },
        

        
        /**
         * transition fromPage toPage, der callback muss aufgerufen werden und darf keinesfalls 2x aufgerufen werden! 
         * @param {Page} from - zurzeit sichtbare Seite (bereits mit <div class="garbage"> gewrappt)
         * @param {Page} to - die fertig geladene Seite (enthält <div class="loading"> wrappers in der dynamic section)
         * @param {function} callback
         */
        prepare: function( fromPage, toPage, $from, $to, func ){
            return {};
        },

        playIntro: function( o, callback ){
            var self = this;
            callback.call();
            // self.$el.trigger('transitionDone',{ type:'intro' });
        },

        playTransition: function( o, callback ){
            var self = this;
            callback.call();
            // self.$el.trigger('transitionDone',{ type:'transition' });
        },

        playOutro: function( o, callback ){
            var self = this;
            callback.call();
            // self.$el.trigger('transitionDone',{ type:'outro' });
        },


        
        /**
         * Wird aufgerufen wenn die Transition durch den Aufruf einer neuen Seite gestoppt wird
         */
        stopTransition: function(){
            
        },

        onWidthZoneResize: function(){

        }

        
    });
    
});