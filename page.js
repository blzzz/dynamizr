define([
    'jquery',
    'website',
    'backbone',
    
    'scaffold/moduleloader',
    'scaffold/vendor',
    
    'waitforimages'
],

function($, website, Backbone, ModuleLoader, vendor) {
    
    return Backbone.View.extend(
    /** @lends Page.prototype */
    {
        
        /**
         * Jede Seite erhält einen eindeutigen Index (entspricht dem Pfad der Seite)
         * @type {number}
         */
        index: undef,
        
        pageModulesLoader: undef,
        xhr: undef,
        moduleInstances: undef,
        
        sectionBlocks: {},

        state: 'new',
        /* 
         * exisiting states:
         * - @page new: default state when created
         * - @page loading: page appended, now loading pages images
         * - @frontend entering: transition for page has started (not yet active)
         * - @frontend leaving: page (active) will be replaced by requested one
         * - @frontend cached: ?   
         * - @frontend active: page is active     
        */
        
        bodyClasses: '',
        
        plainHtml: undef,
        
        usePasteAsCutPath: undef,

        dynamicSectionBlockHtml: '<div class="dynamic-section-block" />',

        /**
         * Sind alle Module geladen
         * @type {boolean}
         */
        modulesLoaded: false,
        
        /**
         * Sind alle Bilder geladen
         * @type {boolean}
         */
        imagesLoaded: false,
        
        /**
         * @class Wird bei jedem Aufruf einer Url auf der Webseite generiert und enthält die nötigen Module
         * @constructs
         */
        initialize: function(){
            var self = this;
            
            self.index = this.options.index;
            
            self.reset();
            
        },
        
        /**
         * Der Modulloader wird neu Instanziert
         */
        reset: function(){
            var self = this;
            
            self.pageModulesLoader = new ModuleLoader({
                page: self
            });
            
        },   
        
        
        /**
         * Holt alle neuen Inhalte via Ajax
         * @fires Website#pageFetched
         */
        fetch: function(){
            var self = this;
            
            if (self.plainHtml == undef){
            
                //setTimeout(function(){
                self.xhr = $.ajax({
                
                    type: 'GET',
                    url: website.root + self.index,
                    success: function(data){
                        
                        /**
                         * Alle Inhalte sind via Ajax geladen
                         *
                         * @event Page#pageFetched
                         * @property {string} data - HTML der neuen Seite
                         */
                        self.setHtml( data );
                        self.trigger('pageFetched', self, data);
                        
                    }
                    
                });
                //}, 1000);
            
            }else{
                
                self.trigger('pageFetched', self, self.plainHtml);
                
            }
            
        },

        setHtml: function( html ){
            var self = this;

            // evaluate body classes
            self.bodyClasses = [];            
            if (html != undef){
                var bodyClassAttrRegExp = /<body[^>]+class="\s*([^"]*)\s*"[^>]*>/;
                var matches = html.match( bodyClassAttrRegExp );
                if( matches != null ){
                    self.bodyClasses = matches[1] != undef ? _.compact(matches[1].split(' ')) : [];
                }
            }
            
            // save pages html
            self.plainHtml = html;
        },
        

        /**
         * Stoppt das Laden der Seite
         */
        stopLoading: function(){
            var self = this;

            self.unbind('pageFetched');
            self.unbind('pageReady');
            
            if(self.xhr && self.xhr.readystate != 4){
                self.xhr.abort();
            }
            
            self.pageModulesLoader.unbind('allModulesLoaded');
            self.pageModulesLoader.stop();           
              
        },
        
       
        /**
         * Fügt der Inhalt $data in den entsprechenden dynamicSections dem DOM an
         * @param {$} $data - das jQuery Objekt mit dem Inhalt der neuen Seite
         * @param {array} dynamicSections - in welchen bereich der neuen Inhalt angefügt werden soll
         * @fires Website#pageReady
         */
        addSectionBlocks: function( $data, isInitialAppend ){
            var self = this;

            // set pages properties
            if( isInitialAppend ){
                self.usePasteAsCutPath = true;
            }

            // collect section contents
            self.sectionBlocks = {};  
            var pasteSelector
              , cutSelector
              , cuttedHtml
              , $sectionBlock
              ;          
            _.each(website.dynamicSections, function(section, selector){
                
                // create new section block element
                pasteSelector = _.compact([selector, section.options.insertPath]).join(' ');
                cutSelector = self.usePasteAsCutPath ? pasteSelector : selector;
                cuttedHtml = $data.find( cutSelector ).html() || $data.filter( selector ).html();
                $sectionBlock = $( self.dynamicSectionBlockHtml ).addClass( self.bodyClasses ).attr('data-page',self.index).html( cuttedHtml );
                self.sectionBlocks[ selector ] = $sectionBlock;

            }); 
        },
        

        /**
         * Überprüft das HTML der neuen Seite nach neuen Modulen und startet den ModuleLoader
         * @fires Website#pageReady
         */
        loadAssets: function(pageModules){
            var self = this;
            
            // preload sections images
            self.preloadImages();

            self.pageModulesLoader.once('allModulesLoaded', function(que){
                self.moduleInstances = que;
                self.modulesLoaded = true;
                if (self.imagesLoaded){ // page is not ready until images and modules are loaded
                    
                    /**
                     * Die Seite ist geladen und bereit
                     *
                     * @event Website#pageReady
                     * @property {Page} self - die eigene Instanz der Seite
                     */
                    self.trigger('pageReady', self);
                }
            });

            self.foreachSectionBlock(function($block,selector){
                self.pageModulesLoader.chargeQue(pageModules, $block );
            });
            self.pageModulesLoader.loadQue();
            
        },
        

        removeSectionBlocks: function(){
            var self = this;
            if( _.size(self.sectionBlocks)==0 ){
                return;
            }

            self.foreachSectionBlock(function($block,selector){
                if( $block.is('.leaving') ){
                    $block.remove();
                }
            });
        },

        foreachSectionBlock: function( fnc, selectorFilter ){
            var self = this;
            var sectionBlocks = self.sectionBlocks;
            if( _.isEmpty(sectionBlocks) ){
                throw new Error( 'page hasn\'t been appended and parsed for sections yet' );
            }            
            if( _.isArray(selectorFilter) ){
                sectionBlocks = _.filter(sectionBlocks,function($block,selector){ return _.indexOf(selectorFilter,selector) >= 0; })
            }
            _.each( sectionBlocks, fnc, self );
            return sectionBlocks;
        },

        getSectionBlock: function( sectionSelector, cut ){
            var self = this;
            if( _.isEmpty(self.sectionBlocks) ){
                throw new Error( 'page hasn\'t been appended and parsed for sections yet' );
            }
            return self.sectionBlocks[ sectionSelector ];
            
            // cut requested block from page after returning it
            if( cut == true ){
                var sections = {};
                self.foreachSectionBlock(function($block,selector){
                    if( sectionSelector === selector ){
                        return;
                    }
                    sections[ selector ] = $block;
                });
                self.sectionBlocks = sections;
            }
            
            return $block;  


        },

        setSectionBlock: function( sectionSelector, $block, forceRemove ){
            var self = this;

            // remove current block
            var $currBlock = self.sectionBlocks[ sectionSelector ];
            if( forceRemove == true && $currBlock && $currBlock.size()>0 ){
                $currBlock.remove();
            }

            // apply new block
            var origPage = $block.attr('data-origpage') || $block.attr('data-page');
            $block.removeClass('leaving').attr('data-page',self.index).attr('data-origpage',origPage);
            self.sectionBlocks[ sectionSelector ] = $block;  
        },


        getSectionBlockElements: function(){
            var self = this;

            // get blocks as jquery selector
            var $blocks = $([]);
            self.foreachSectionBlock(function($block,selector){
                $blocks = $blocks.add( $block ); 
            });

            return $blocks;

        },


        /**
         * wartet auf die bilder der dynamic section und trigger page ready wenn die bilder geladen sind
         * @param {Object} section
         */
        preloadImages: function(){
            var self = this;

            if( self.imagesLoaded ){
                return;
            }

            self.changeState('loading');

            var $blocks = self.getSectionBlockElements();

            var imgSelector = website.imagePreloadSelector || 'img';
            var $images = $blocks.find(imgSelector);
            var numBlocks = $blocks.size();
            var onImagesLoaded = function(){
                
                vendor.log( '('+self.index+') ALL IMAGES LOADED (TOTAL:'+$images.size()+')', 'website-event event' );

                self.imagesLoaded = true;
                if (self.modulesLoaded){ // page is not ready until images and modules are loaded
                    self.trigger('pageReady', self);
                }
                
            };
            self.foreachSectionBlock(function($block,selector){
                if( $block.is(':has('+imgSelector+')') ){
                    $block.waitForImages({
                        finished: function(){
                            numBlocks--;
                            if( numBlocks <= 0 ){
                                onImagesLoaded();
                            }
                        },
                        // each: function(){
                        //     console.log('loaded')
                        // },
                        waitForAll: true
                    });
                }else{
                    numBlocks--;
                }
            });
            if( numBlocks == 0 ){
                onImagesLoaded();
            }
            
        },

        // getMigratedBlocks: function( index ){
        //     var self = this;
        //     var blocks = {};
        //     if( _.size( self.sectionBlock ) == 0 ){
        //         return blocks;
        //     }
        //     self.foreachSectionBlock(function($block,selector){
        //         if( $block.is('[data-origpage="'+index+'"]') ){
        //             blocks[ selector ] = $block;
        //         }
        //     });
        //     return blocks;
        // },

        // migrateOriginalBlocks: function( sectionBlocks ){
        //     var self = this;
        //         console.log( sectionBlocks )
        //     if( _.size( self.sectionBlock ) == 0 && _.size( sectionBlocks ) > 0 ){
        //         self.sectionBlocks = sectionBlocks;
        //     }
        // },

        /**
         * überprüft ob diese Seite ein entsprechendes Body-Class Attribut gesetzt hat
         * @param {string} class - the name of the body class to check for 
         */
        hasClass: function( className ){
            var self = this;

            if( self.bodyClasses == undef ){
                return false;
            }

            return _.indexOf( self.bodyClasses, className ) >= 0;
            
        },

        /**
         * changes the state of the page and also the class of the wrapper in every dynamic section
         * @param {string} newState - the new state
         */
        changeState: function( newState, selectorFilter ){
            var self = this;
            var sectionBlocks = self.sectionBlocks;
            
            if( _.size( sectionBlocks ) == 0 ){
                return;
            }

            self.foreachSectionBlock(function($block,selector){

                $block.removeClass(self.state).addClass(newState);
            
            },selectorFilter);
            
            self.state = newState;
            return self;
        }
        
        
    });
});