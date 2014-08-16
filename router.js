define([
  // Application.
  'website'
],

function(website) {

    var Router = Backbone.Router.extend(
    /** @lends Router.prototype */
    {
        
        /** aktuelles Seitenalias */     
        currentAlias: undef,
        
        /** zusätzliche Parameter zur aktuellen Seite als Pfad */
        currentPath: undef,
        
        /** Mögliche Routen und deren zugewiesenen Funktionen */
        routes: {
            
            '': 'loadRoute',
            
            ':alias': 'loadRoute',
          
            ':alias/*parameters': 'loadRoute' // for deep links
          
        },
    
        /**
         * @class Defining the application router, you can attach sub routers here.
         * @constructs
         */
        initialize: function(){
      
        },
        
        /**
         * Standard Route
         * @fires Website#initialPageRequested
         * @fires Website#pageRequested
         */
        loadRoute: function(alias, parameters) {
            var self = this;
            
            alias = alias || '';
            var path = alias + ( parameters == undef ? '' : '/' + parameters );
            
                
            /**
             * Aufruf einer Seite
             *
             * @event Website#pageRequested
             * @property {string} alias - Seitenalias der angeforderten Seite
             * @property {string} path - Zusätzliche Parameter der Seite als Pfad
             */
            var page = website.frontend ? website.frontend.getPage(path) : undef;
            website.trigger('pageRequested', {
                isInitial: self.currentAlias == undef,
                alias: alias,
                path: path,
                parameters: parameters,
                page: page
            });
                       
            self.currentAlias = alias;
            self.currentPath = path;
            
        }
        
      });
    
      return Router;

});
