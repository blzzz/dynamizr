define([
    'jquery',
    'website',
    'backbone',
],

function($, website, Backbone) {
    
    return Backbone.View.extend(
    /** @lends Module.prototype */
    {
        
        /** Modul Typ, wird durch den Dateinamen des Modul gegeben */
        moduleType: 'module',

        /**
         * @class Abstrakte Klasse für alle Frontend oder Page Module
         * @constructs
         */
        initialize: function( options ){
            var self = this;
            self.options = options;            
        },
        
        nodes: {},

        /**
         * Enthält alle weiteren Inhalte welche das Modul zusätzlich laden muss
         * @fires Module#moduleLoaded
         */
        load: function(){
            var self = this;
            
            /**
             * Modul ist geladen und bereit
             * @event Module#moduleLoaded
             * @property {object} - Die Instanz des geladenen Modules
             */
            self.trigger('moduleLoaded', self);
        },
        
        /**
         * Wird aufgerufen sobald das Modul geladen und alle Transitions vorbei sind
         */
        showUp: function(currentPage){
            var self = this;
        },
        
        /**
         * Für Frontend-Module mit initialem Inhalt
         */
        onContentReady: function($localDOM, $globalDOM){
            var self = this;
        },

        /**
         * Für Frontend-Module mit wechselndem Inhalt
         */
        onContentChange: function($localDOM, $globalDOM){
            var self = this;
        },
        
        /**
         * wird aufgerufen wenn die Transition zwischen current und qued Page gestartet wird
         */
        startTransition: function(fromPage, toPage){
            var self = this;
        },
        
        /**
         * Wenn die Zone aus dem WidthZone Manager wechselt 
         */
        onWidthZoneResize: function(zone, obj){
            var self = this;
        },
        
        /**
         * Window resize
         */
        onWidthZoneChange: function(zone, obj, isReadyEvent){
            var self = this;
        },
        
        /**
         * initializes flex box
         */
        applyFlexboxTo: function( selector, properties ){
            var self = this;
            var json = JSON.stringify( properties );
            var $el = selector === '' ? self.$el : self.$( selector );
            return $el.attr( 'data-flexbox', json );
        }
        
    });
});