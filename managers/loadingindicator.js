define([
    'jquery',
    'website',
    'backbone',
    'spin'
],

function($, website, Backbone, Spinner) {
    var undef;
    var IndicatorView = Backbone.View.extend(
    /** @lends LoadingOverlay.prototype */
    {
        
        $spinWheel: undef,
        
        /**
         * @class Lade Animation und Überlagerung über die ganze Seite
         * @constructs
         */
        initialize: function( params ){
            var self = this;
            
            self.$spinWheel = $('<div />').css({
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: 0,
                height: 0,
            })
            self.$el.append(self.$spinWheel);

            var spinWheel = new Spinner(params.spinOptions).spin(self.$spinWheel[0]);
            
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
    return {
        view: undef,
        spinOptionsDefault: {
            lines: 9, // The number of lines to draw
            length: 30, // The length of each line
            width: 5, // The line thickness
            radius: 30, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#4baeed', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: 'auto', // Top position relative to parent in px
            left: 'auto' // Left position relative to parent in px
        },
        config: function( selector, spinOptions ){
            spinOptions = _.extend( this.spinOptionsDefault, spinOptions );
            this.view = new IndicatorView( { el:selector, spinOptions: spinOptions } );
            return this;
        },
        start:function(){
            this.view.start();
            return this;
        },
        stop:function(){
            this.view.stop();
            return this;
        }
    };
});