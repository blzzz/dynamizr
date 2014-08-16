define([
    'jquery',
    'website',
    'backbone',
    'spin-js'
],

function($, website, Backbone, SpinJS) {
    
    return Backbone.View.extend(
    /** @lends LoadingOverlay.prototype */
    {
        
        $spinWheel: undef,
        
        /**
         * @class Lade Animation und Überlagerung über die ganze Seite
         * @constructs
         */
        initialize: function(){
            var self = this;
            
            self.$spinWheel = $('<div />').css({
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: 0,
                height: 0,
            })
            self.$el.append(self.$spinWheel);
            
            var spinWheel = new SpinJS.Spinner(website.spinOptions).spin(self.$spinWheel[0]);
            
            self.$el.css({
                opacity:0,
                visibility:'visible'
            });

        },
        
        /**
         * Startet die Ladenanimation
         */
        start: function(){
            var self = this;
            
            self.$el.css({
                display: 'block'
            });
            self.$el.stop().animate({
                opacity: 0.6
            }, 500);
        },
        
        /**
         * Stoppt die Ladeanimation
         */
        stop: function(){
            var self = this;
            self.$el.stop().animate({
                opacity: 0
            }, 500, function(){
                self.$el.hide();
            });
        }
        
    });
});