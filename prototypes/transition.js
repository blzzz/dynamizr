define([
    'jquery',
    'website',
    'backbone'
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

        initialize: function( options ){

            var self = this;

            self.sectionSelector = options.selector;
            
            if (options.speed != undef){
                self.speed = options.speed;
            }
            
            if (options.forceTransition != undef){
                self.forceTransition = options.forceTransition;
            }

            if (options.prepare != undef){
                self.prepare = options.prepare;
            }

            if (options.soloTransition != undef){
                self.soloTransition = options.soloTransition;
            }

            if (options.avoidOutro != undef){
                self.avoidOutro = options.avoidOutro;
            }
            
            if (options.insertPath != undef){
                self.insertPath = options.insertPath;
            }

            if (options.condition != undef){
                self.condition = options.condition;
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
                
                self.$toContent.show();
                self.$el.css({
                    height: self.$fromContent.height()
                }).animate({
                    height: self.$toContent.height()
                },self.speed);
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
            self.crossfade( callback ); 
        },

        playTransition: function( o, callback ){
            var self = this;
            self.crossfade( callback ); 
        },

        playOutro: function( o, callback ){
            var self = this;
            self.crossfade( callback );
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