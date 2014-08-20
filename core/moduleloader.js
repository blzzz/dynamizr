define([
    'require',
    'jquery',
    'website',
    'backbone',
    'core/vendor'
],

function(require, $, website, Backbone, vendor) {
    
    return Backbone.View.extend(
    /** @lends ModuleLoader.prototype */
    {
        
        /**
         * Instanz der Page worin der ModuleLoader geladen wird
         * @type {Page}
         */
        page: undef,
        
        /**
         * Warteschlange mit den Modulen die geladen werden müssen
         * @type {object[]}
         */
        que: {},
        
        modulesToRequireCount: 0,
        requiredModulesCount: 0,
        
        moduleInstances: [],
        modulesToInstantiateCount: 0,
        loadedModulesCount: 0,
        
        
        /**
         * @class Lädt und instanziert Module asynchron und bindet die entsprechenden .js Dateien ein 
         * @constructs
         */
        initialize: function( params ){
            var self = this;

            self.page = params.page;
            
            self.que = {};
            
            self.modulesToRequireCount = 0;
            self.requiredModulesCount = 0;
            
            self.moduleInstances = [];
            self.modulesToInstantiateCount = 0;
            self.loadedModulesCount = 0;
              
        },
        
        /**
         * Prüft welche Module in $html geladen werden müssen und fügt diese der Warteschlange an
         * @param {ModuleBlueprint} blueprint - Das Objekt mit den möglichen Modulen und deren Eigenschaften
         * @param {$} $html - der Teil der DOM Struktur worin die Module geladen werden
         */
        chargeQue: function(blueprint, $html){
            var self = this;
            
            _.each(blueprint, function(moduleConfig, selector){
                
                if ( $html.is(':has('+selector+')') ){
                
                    var theModuleAllreadyExists = false;
                    _.each(self.que, function(existingModuleConfig, existingSelector){ // das Modul könnte ja bereits in einem anderen Sektion existieren
                        if (selector == existingSelector){
                            theModuleAllreadyExists = true;
                        }   
                    });
                
                    if (!theModuleAllreadyExists){
                        
                        self.modulesToRequireCount++;
                        
                        self.que[selector] = moduleConfig;
                        self.que[selector].domElements = [];
                        
                    }
                        
                    $html.find(selector).each(function(i){
                        
                        self.modulesToInstantiateCount++;
                         
                        self.que[selector].domElements.push($(this));
                         
                    });
                    
                }
                
            });
            
        },
        
        /**
         * Startet das Laden der Module
         * @fires ModuleLoader#allModulesLoaded
         */
        loadQue: function(){
            var self = this;
            
            if (self.modulesToInstantiateCount == 0){
                
                vendor.log( '('+self.page.index+') NO MODULE IN CUE', 'website-event event' );
                
                self.trigger('allModulesLoaded', self.que);
                return;
            }
            
            self.requireQue();
                        
        },
        
        /**
         * Bindet alle Module aus der Warteschlange via require ein
         * @fires ModuleLoader#moduleRequired
         */
        requireQue: function(){
            var self = this;
            
            vendor.log( '('+self.page.index+') REQUIRING '+self.modulesToRequireCount+' MODULES IN TOTAL', 'moduleloader event' );
            
            self.bind('moduleRequired', function(selector){
                
                if (self.que[selector] != undef){
                    
                    self.requiredModulesCount++;
                    
                    vendor.log( '('+self.page.index+') REQUIRING MODULE ['+self.requiredModulesCount+'/'+self.modulesToRequireCount+']: "'+selector+'" → '+self.que[selector].module, 'moduleloader event' );
                    
                    if (self.requiredModulesCount >= self.modulesToRequireCount){
                        self.unbind('moduleRequired');
                        
                        vendor.log( '('+self.page.index+') ALL REQUIRED MODULES ARE REQUESTED – START CREATING MODULE INSTANCES','moduleloader event' );
                        
                        self.instantiateQue();
                    }
                    
                }else{
                    
                    vendor.log( '('+self.page.index+') REQUIRED MODULE NOT FOUND IN CUE: "'+selector+'" → '+self.que[selector].module, 'moduleloader event error' );
                    
                }
                
            });
            
            
            _.each(self.que, function(moduleConfig, selector){

                require([ moduleConfig.module ], function(View){
                    
                    self.que[selector].View = View;
                    
                    /**
                     * Das Module ist jetzt über require eingebunden
                     *
                     * @event ModuleLoader#moduleRequired
                     * @property {string} selector - der Selektor zum required Module
                     */
                    self.trigger('moduleRequired', selector);

                });
                
            });
            
        },
        
        /**
         * Instanziert alle Module in der Warteschlange
         */
        instantiateQue: function(){
            var self = this;
            
            _.each(self.que, function(moduleConfig, selector){
                
                self.que[selector].instances = [];
                
                _.each(moduleConfig.domElements, function($el, i){
                    
                   moduleConfig.options == undef ? moduleConfig.options = { el: $el } : moduleConfig.options.el = $el;
                   moduleConfig.options.selector = selector;

                   vendor.log( '('+self.page.index+') CREATE NEW MODULE INSTANCE ['+(i+1)+'/'+moduleConfig.domElements.length+']: "'+selector+'" → '+moduleConfig.module, 'moduleloader event' );
                   var newInstance = new moduleConfig.View(moduleConfig.options);
                   newInstance.moduleType = moduleConfig.module;
                   self.moduleInstances.push(newInstance);
                   self.que[selector].instances.push(newInstance);
                   
                   
                });

            });
            
            vendor.log( '('+self.page.index+') ALL MODULE INSTANCES ARE CREATED – START LOADING THEM COMPLETELY', 'moduleloader event' );
            
            self.loadInstancesInQue();
            
        },
        
        /**
         * Lädt alle Instanzen in der Warteschlange
         * @fires ModuleLoader#allModulesLoaded
         */
        loadInstancesInQue: function(){
            var self = this;
            
            _.each(self.que, function(moduleConfig, selector){
                
                _.each(moduleConfig.instances, function(newInstance){
                    
                    newInstance.once('moduleLoaded', function(moduleInstance){
                        
                        var inQue = false;
                        for (var i = 0; i < self.moduleInstances.length; i++){
                            if (self.moduleInstances[i] == moduleInstance){
                                inQue = true;
                            }
                        }
                        
                        if (inQue){
                            self.loadedModulesCount++;

                            vendor.log( '('+self.page.index+') MODULE LOADED ['+self.loadedModulesCount+'/'+self.moduleInstances.length+']: '+moduleInstance.moduleType, 'moduleloader event' );
                            
                            if (self.loadedModulesCount >= self.moduleInstances.length){
                                
                                vendor.log( '('+self.page.index+') ALL MODULES LOADED', 'moduleloader event' );
                                
                                /**
                                 * alle Module sind jetzt geladen
                                 *
                                 * @event ModuleLoader#allModulesLoaded
                                 * @property {object} - die geladene Warteschlange mit den neuen Instanzen
                                 */
                                self.trigger('allModulesLoaded', self.que);
                            }
                            
                        }else{
                            
                            vendor.log( '('+self.page.index+') LOADED MODULE IS NOT IN CUE!', 'moduleloader event error' );
                            
                            
                        }
                        
                    });
                    newInstance.load();
                    
                });
                
            });
            
        },
        
        /**
         * Stoppt den Ladeprozess der Warteschlange
         */
        stop: function(){
            var self = this;
            
            self.unbind('moduleRequired');
            
            for (var i = 0; i < self.moduleInstances.length; i++){
                self.moduleInstances[i].unbind('moduleLoaded');
            }
            
        },
        
        /**
         * Führt für jede Modulinstanz die übergebene Funktion aus
         */
        foreachInstance:function( fnc, instances ){
            var self = this;
            var instances = instances || self.moduleInstances;
            _.each( instances, fnc );
            return self;
        },

        /**
         * Gibt jede Modulinstanz eines bestimmten Typs zurück
         */
        getAllInstancesOf:function( selector ){
            var self = this;
            return _.filter( self.moduleInstances, function( instance ){ return instance.options.selector === selector; } );
        },

        /**
         * Gibt die erste Modulinstanz eines bestimmten Typs zurück
         */
        findInstanceOf:function( selector ){
            var self = this;
            return _.find( self.moduleInstances, function( instance ){ return instance.options.selector === selector; } );
        },
        
        $:function( selector ){
            var self = this;
            var $return = $([]);
            var instances = self.getAllInstancesOf( selector );
            if( instances.length > 0 ){                
                self.foreachInstance( function( instance ){
                    $return = $return.add( instance.$el );
                }, instances);
            }
            return $return;
        }
    });
});