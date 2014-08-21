define([
    'jquery',
    'website',
    'backbone',
    'core/router',
    'core/moduleloader',
    'core/page',
    'core/vendor'
],
function($, website, Backbone, Router, ModuleLoader, Page, vendor) {


    var Frontend = Backbone.View.extend(
    /** @lends Frontend.prototype */
    {
        
        el: 'body',
        
        router: undef,
        /**
         * Alle aufgerufenen Seiten werden chronologisch in ein Array gespeichert
         * @type {object[]}
         */
        pages: undef,
        
        /**
         * Die Instanz der aktuellen Seite
         * @type {Page}
         */
        currentPage: undef,
        
        /**
         * Die zu ladende Seite
         * @type {Page}
         */
        quedPage: undef,
        
        // private vars
        frontendModulesLoader: undef,
        protectedBodyClasses: [],
        areFrontendModulesLoaded: false, // indicates if frontend modules' html has been parsed yet
        hasPageBeenAppended: false, // indicates if page has been appended yes

        defaultOptions: {
            touchMoveAcceptanceSelector: '.scrollable-area',
            disableTouchMoveEvents: true,
            pushState: true,
            imagePreloadSelector: 'img'
        },

        /**
         * Instanziert den ModuleLoader und die Page mit id 0
         * @class Orchestriert das Laden aller asynchronen Inhalte und Module
         * @constructs
         */
        initialize: function( opts ){
            var self = this;


            // set options
            self.options = _.extend( self.defaultOptions, opts );


            // add some jquery handlers
            $.fn.frontendModule = function(){
                var $el = (this).size()>1 ? $(this).first() : $(this);
                var selector = '#' + $el.attr('id');
                return self.frontendModulesLoader.getAllInstancesOf( selector )[0];        
            }

            // init the router and push states
            self.router = new Router();


        },

        run: function(){
            var self = this;
            

            // reset properties
            self.areFrontendModulesLoaded = false;
            // self.isPageHtmlReady = false;
            self.hasPageBeenAppended = false;
            self.pages = {};            
            self.currentPage = undef;
            self.quedPage = undef;

            
            // start frontend module loader
            self.frontendModulesLoader = new ModuleLoader({
                page: { index: 'frontend' }
            });

            // start backbone history
            Backbone.history.start({ pushState: self.options.pushState, root: website.root });
            
        },

        
        /**
         * Generelle Events werden hier definiert
         */

        events: {
            'click a[href]:not(.bypass, .sublink)': 'navigateToLinksHref',
            'click a[href].bypass.inactive': 'doNothing',
            'touchmove *':'touchMove'
        },

        /**
         * Für alle Links der Webseite wird diese Funktion ausgeführt.
         * Die Funktion entnimmt das href Attribut und navigiert mittels Router weiter.
         * Externe Links die nicht den Root-Pfade enthalten sind ausgenommen.
         * Auch sind alle Links mit der Klasse bypass ausgenommen.
         */

        navigateToLinksHref: function(e){
            var self = this;
            
            var $a = $(e.currentTarget);
            
            // Get the absolute anchor href.
            var href = { prop: $a.prop('href'), attr: $a.attr('href') };
            // Get the absolute root.
            var root = location.protocol + '//' + location.host + website.root;
        
            // Ensure the root is part of the anchor href, meaning it's relative.
            if (href.prop.slice(0, root.length) === root) {
                
                if(e.preventDefault){
                    e.preventDefault();
                }else{
                    e.returnValue = false;
                }
                
                self.requestPage(href.attr, true);
                
            }
            
        },  

        doNothing: function(e){

            if(e.preventDefault){
                e.preventDefault();
            }else{
                e.returnValue = false;
            }

        },

        touchMove: function(e){
            var self = this;

            // check if target is not in a scrollable area
            if( self.options.disableTouchMoveEvents == true ){

                var $allowedTargets = $( self.options.touchMoveAcceptanceSelector ).has( $(e.target) );
                if( $allowedTargets.size() == 0 ){
                    
                    // prevents global scrolling
                    e.preventDefault();
                    
                }
            }
            
        },


        /**
         * Lädt alle Frontend Module und Instanziert diese
         * @fires Website#frontendReady
         */
        loadFrontendModules: function(){
            var self = this;
            
            self.frontendModulesLoader.once('allModulesLoaded', function(que){
                
                /**
                 * Alle Frontend Module sind geladen und bereit
                 * @event Website#frontendReady
                 */
                self.areFrontendModulesLoaded = true;
                website.trigger('frontendReady',que);
            });
            
            self.frontendModulesLoader.chargeQue(website.frontendModules, $('html'));
            self.frontendModulesLoader.loadQue();
            
        },
        

        foreachPage: function( fnc, pageFilter ){
            var self = this;
            var pages = self.pages;
            if( _.isArray(pageFilter) ){
                pages = _.filter(pages,function(page){ return _.indexOf(pageFilter,page.index) >= 0; })
            }
            return _.each( pages, fnc, self );
        },
        

        requestPage: function( href, trigger, sectionsToMigrate ){
            var self = this;

            // assure that the current page (if there is any) is active right now
            if (self.currentPage == undef || self.currentPage.state !== 'active' ){
                return;
            }

            // navigate to href
            trigger = trigger ? true : false;
            self.router.navigate( href,{ trigger: trigger } );
            
            // if the request is silent, set the new and valid page to active
            var page = self.pages[ href ];
            if( !trigger && page != undef ){
                self.setActivePage( page, sectionsToMigrate || _.keys(website.dynamicSections) );                
            }
        },


        /**
         * Aufruf der Seite für path
         */
        fetchPage: function(path){
            var self = this;
            

            // stop all loading old pages before create a new one
            self.foreachPage(function( page ){ page.stopLoading(); });


            // get existing page instance of create a new one
            var page = self.getPage(path);
            if( page == undef ){
                page = self.addPage(path);
                self.pages[path] = page;
            }
            self.quedPage = page;


            // bind page ready event
            self.quedPage.once('pageReady', function(page){

                // extend all page modules by node selectors
                page.pageModulesLoader.foreachInstance(function(instance){
                    self.extendModuleInstanceByNodes(instance, instance.$el);
                });
                
                // trigger global pageReady event
                website.trigger('pageReady', page, self.currentPage);
            
            });


            // if it's the first page, set its Html other wise request it 
            if ( !self.areFrontendModulesLoaded ){
                

                // use laoded html for initial page if push state is supported
                if( vendor.browser.hasPushState ){
                    page.setHtml( $('html').html() );
                }
                

                // load frontend modules if frontend modules are not ready yet
                self.loadFrontendModules();

            }else{

                // transmit page events to website
                self.quedPage.once('pageFetched', function(page, data){
                    website.trigger('pageFetched', page, data);
                });

                // fetch page                            
                self.quedPage.fetch();

            }
            
        },
        

        /**
         * Lädt eine Seite vor ohne das diese angezeigt wird
         */
        preloadPage: function( index, forcePreload ){
            var self = this;
            
            // check if page isn't already known
            if( self.pages[ index ] != undef && forcePreload != true ){
                return;
            }

            var page = self.getPage(index);
            if( page != undef ){
                return;
            }
            page = self.addPage(index);

            page.once('pageFetched', function(page, data){
                
                page.setHtml(data);
                self.pages[index] = page;
                website.trigger('pagePreloaded', page);
                
            });
            
            page.fetch();
            
        },
     
        migrateSection: function( section, sourcePage, targetPage ){
            var self = this;
            sourcePage = sourcePage || self.currentPage;
            var $content = sourcePage.getSectionBlock( section, true );
            if( sourcePage == undef ){
                return $content;
            }
            targetPage = targetPage || self.quedPage;
            if( targetPage != undef ){
                targetPage.setSectionBlock( section, $content );
                return $content;
            }
        },

        getPage: function(index){
            var self = this;
            var page = _.find(self.pages, function(page, pageIndex){ return pageIndex === index; });
            if( page != undef ){
                page.reset();
                vendor.log( '('+page.index+') PAGE REACTIVATED', 'website-event event' );
            }
            return page;
        },

        /**
         * Erstellt oder reaktiviert eine neue Intanz von {@link Page} und speichert diese in das Cache-Array pages
         */
        addPage: function(index){
            var self = this;
            
            // create new if no page could be found
            var page = new Page({ index: index, imagePreloadSelector: self.options.imagePreloadSelector });
            vendor.log( '('+page.index+') NEW PAGE CREATED', 'website-event event' );
            return page;
        },
     
     
        /**
         * Fügt das neu erstellt Page Objekt der DOM Struktur an
         * @param {$} $data - Der neue Inhalt als jQuery Objekt
         * @param {string} data - Der neue Inhalt als HTML Text 
         */
        appendPage: function( page ){
            var self = this;

            var isInitialAppend = page == undef // it true, page is appended initially (after frontend module loading)
              , hasPush = vendor.browser.hasPushState 
              , page = page || self.quedPage
              , isHtmlReady = hasPush || (!hasPush && !isInitialAppend)
              ; 
            
            // check if html is ready for append and update
            if( !isHtmlReady ){
                vendor.log( 'NO PUSH STATE SUPPORTED, NEEDS ADDITIONAL PAGE REQUEST', 'support' );
                website.trigger('pageRequested', {
                    alias: self.router.currentAlias,
                    path: self.router.currentPath,
                    page: page
                });
                return;
            }

            // define page selector
            var $page = hasPush && isInitialAppend ? self.$el : $(page.plainHtml);
            
            // update head
            self.updateHead( $page );
            
            // set the body classes for the new page
            self.updateBodyClasses( page.bodyClasses );

            // fire update or ready functions for frontend modules
            self.updateFrontendModules( $page );

            // append dynamic section blocks and load its page modules
            self.updateDynamicSections( $page );

            // indicate appending of page
            self.hasPageBeenAppended = true;

        },
        
        updateBodyClasses: function( bodyClasses ){
            var self = this;
            var classes = bodyClasses.join(' ');

            // add protected Classes if they are set already
            _.each(self.protectedBodyClasses, function( className ){
                 classes += self.$el.hasClass( className ) ? ' '+className : '';
            });

            self.$el.attr('class', classes);            

        },

        updateHead: function( $data ){
            var self = this;

             // set the document title
            var docTitle = $data.filter('title').text();
            if( docTitle != '' ){
                $('head title').text( docTitle );
            }
        },

        updateDynamicSections: function( $data ){
            var self = this;
            var page = self.quedPage;

            // get pages blocks
            page.addSectionBlocks( $data, !self.hasPageBeenAppended );
            
            // append the section blocks
            page.foreachSectionBlock(function($block,selector){
                var $dynamicSection = self.$( selector );

                // empty dynamic section before appending new blocks
                if( !self.hasPageBeenAppended ){
                    $dynamicSection.empty();
                }

                // append according block
                $dynamicSection.append( $block );
            })

            // load images and page modules in section blocks
            page.loadAssets( website.pageModules);

        },

        /**
         * Feuert für jedes Frontend Modul entweder eine Ready- oder eine Update-Funktion
         */
        updateFrontendModules: function( $data ){
            var self = this;

            // prepare frontend modules content
            var loader = self.frontendModulesLoader.foreachInstance(function(instance){
                
                var opts = instance.options;
                var $el = $data.find( opts.selector );
                

                // extend all frontend modules by making its nodes available as jquery selectors
                // for example: <Module.nodes = { myNode: '#node' }> becomes <Module.$myNode = Module.$('#node')> 
                if( !self.hasPageBeenAppended ){
                    var success = self.extendModuleInstanceByNodes( instance, instance.$el );
                    if( success ){
                        instance.updateNodes = function(){
                            self.extendModuleInstanceByNodes( this );
                        }
                    }
                }

            });

            // call evaluated update function
            var triggerFnc = self.hasPageBeenAppended ? 'onContentChange' : 'onContentReady';
            self.frontendModulesLoader.foreachInstance(function(instance){
                var opts = instance.options;
                var $el = $data.find( opts.selector );
                instance[ triggerFnc ]($el, $data, loader);
            });

        },


        extendModuleInstanceByNodes: function( instance, $module ){
            if( _.isEmpty(instance.nodes) ){
                return false;
            }
            var isUpdate = $module == undef;
            var $el = isUpdate ? instance.$el : $module;
            _.each( instance.nodes, function( selector, label ){
                if( $el.is(':has('+selector+')') ){
                    if( instance[ '$'+label ] == undef || isUpdate ){
                        instance[ '$'+label ] = $el.find( selector );
                        return;
                    }
                    throw new Error('child node "$'+label+'" already exists as property in module '+instance.moduleType);                            
                }
                throw new Error('required child node "'+selector+'" not found in provided markup for module '+instance.moduleType);                        
            });
            return true;
        },
   

        
        setActivePage: function( page, sectionsToMigrate ){
            var self = this;
            

            // migrate all sections
            if( _.isArray(sectionsToMigrate) ){
                _.each(sectionsToMigrate,function(section){
                    self.migrateSection( section, self.currentPage, page );
                });
            }

            // remove all sections of inactive pages
            var pagesToPreserve = [ page.index ];
            self.removeInactivePages(pagesToPreserve);

            
            // set current page as active
            self.currentPage = page.changeState('active');
            self.quedPage = undef;
            
        },
        

        removeInactivePages: function( pagesToPreserve ){
            var self = this;            
            if( self.currentPage == undef ){
                return;
            }
            var pageFilter = _.difference(_.keys(self.pages), pagesToPreserve );
            self.currentPage.removeSectionBlocks();
            // self.foreachPage(function(page, index){
            //     page.removeSectionBlocks();
            // },pageFilter);
        
        },

        /**
         * Ruft für alle Modul-Instanzen eine Methode auf
         */
        callEachInstances: function( method, arg, pageModulesOnly ){
            var self = this;

            // call method for page module instances
            if (self.currentPage != undef){
                self.currentPage.pageModulesLoader.foreachInstance(function( instance ){
                    if( instance[ method ] ){
                        instance[ method ].call(instance,arg);
                    }
                });
            }

            if( !pageModulesOnly ){
                
                // call method for frontend module instances
                self.frontendModulesLoader.foreachInstance(function( instance ){
                    if( instance[ method ] ){
                        instance[ method ].call(instance,arg);
                    }
                });

            }
            
        },

        findActiveLink: function( $parent, forceUseOfQuedPage ){
            return this.findActiveLinks( $parent, forceUseOfQuedPage ).first();
        },

        findActiveLinks: function( $parent, forceUseOfQuedPage ){
            return ($parent || this.$el).find('a[href="'+ this.getCurrentIndex(forceUseOfQuedPage) +'"]');
        },

        getCurrentIndex: function(forceUseOfQuedPage){
            return (forceUseOfQuedPage || this.currentPage==undef ? this.quedPage : this.currentPage).index;
        },

        toggleActiveLink: function( $parent, forceUseOfQuedPage ){
            var self = this;
            var $active = self.findActiveLinks( $parent, forceUseOfQuedPage );
            if( $active.size()>0 ){
                $parent.find('a.active').removeClass('active');
                $active.addClass('active');
                return $active;
            }
            return null;            
        },

        activateLink: function( href, $parent ){
            var self = this;
            var $el = ($parent || self.$el).find('a[href="'+href+'"]');
            if( $el.size()>0 ){
                $el.addClass('active');
                return $el;
            }
            return null;
        },  
        
        addBodyClass: function(className, classesToRemove){
            var self = this;
            if( classesToRemove ){
                classesToRemove = _.isArray(classesToRemove) ? classesToRemove.join(' ') : classesToRemove;
                self.$el.removeClass(classesToRemove);
                self.protectedBodyClasses = classesToRemove.split(' ');
            }
            self.$el.filter(':not(.'+className+')').addClass(className);
        },


        
    });
    return Frontend;

});
