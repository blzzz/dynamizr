define([
	'jquery',
	'backbone',
	'underscore',
	'scaffold/vendor',
	'scaffold/orchestra'
], function( $, Backbone, _, vendor, Orchestra ){
	var undef;
	var TransitionManager = {
	    
        dynamicSections: {},
		transitions: {},
        playFilter:[],
        playSoloTransition: false,

        config: function( dynamicSections ){

        	this.dynamicSections = dynamicSections;
        	return this;
        },

        load: function( completeCallback ){
        	var self = this;
        	var transitionsToLoad = {};
            _.each(this.dynamicSections, function( config, selector ){
                if( config.orchestra ){
                    transitionsToLoad[ selector ] = config.orchestra;
                }
            },this);
            var selectors = _.keys(transitionsToLoad);
            require( _.values(transitionsToLoad),function(){
                _.each(arguments,function(Transition,i){
                    self.dynamicSections[ selectors[i] ].orchestra = Transition;
                });
                self.instantiate();
                completeCallback.call(self);                
            });

        },
        
        instantiate: function(){

        	// create transition instances
            var opts
              , orchestraObj
              , transition
              ;
            _.each(this.dynamicSections, function(section, sectionSelector){
                
                opts = section.options || {};
                opts.selector = sectionSelector;
                opts.el = $(sectionSelector);
                
                orchestraObj = section.orchestra || Orchestra;
                transition = new orchestraObj(opts);
                transition.triggerDone = function( skip ){
                	if( skip == true ){
                		this.$el.trigger( 'transitionSkip' );
                	} 
                	this.trigger('done'); 
                };
                transition.cleanUp = function(){
                	if( this.$fromContent != undef ){
                		this.$fromContent.remove();
                	}
                };
                this.transitions[sectionSelector] = transition;

            },this);

            
        },
        
        callEachInstances: function( method, arg ){

        	if( _.size(this.transitions) == 0 ){
        		return;
        	}

        	// call method for transitions
            this.foreachTransition(function(inst,selector){
                if( inst[ method ] ){
                    inst[ method ]( inst, arg );      
                }          
            });

        },

        foreachTransition: function( fnc, selectorFilter ){
            var transitions = this.transitions;            
            if( _.isArray( selectorFilter ) ){
                transitions = _.filter( transitions, function( inst, selector ){ 
                    return _.indexOf(selectorFilter,selector) >= 0; 
                });
            }
            _.each( transitions, fnc, this );
            return transitions;
        },


        stop: function(){
        	this.foreachTransition(function(inst,selector){
                inst.unbind('transitionDone');
                inst.stopTransition();
            });
        },

        start: function( currentPage, quedPage ){

        	quedPage.changeState('entering');
            if( currentPage != undef ){ 
                currentPage.changeState('leaving'); 
            }

            this.stop();
            this.playFilter = [];
            
            var isInitial = currentPage == undef;
            var beenInSoloModeBefore = this.playSoloTransition;
            var transitionSelectors = _.keys( this.transitions );
			
			// when all transitions have played, trigger done event
			var transitionsLeft = transitionSelectors.length;    
			var onceTransitionsDone = function(){                    
                transitionsLeft--;
                if (transitionsLeft<=0){

                    // trigger done event for all transition's elements
                    var playables = this.foreachTransition( function( inst ){  
                    	
                    }, this.playFilter);   

                    // trigger done event for manager
                    this.trigger('transitionDone', quedPage, currentPage, playables);

                    var playables = this.foreachTransition( function( inst ){  
                    	inst.$el.trigger('transitionDone'); 
                    }, this.playFilter);   


                }
			};


            // check play mode of all transitions 
            this.foreachTransition( function( inst, selector){
                
                // when this transition has been played, trigger done event
                inst.once('done', onceTransitionsDone, this);
                
                // define main variables by assuming it's an initial call
                var forceTransition = inst.forceTransition || (inst.muted ? true : false)
                  , condition = typeof inst.condition === 'function' ? inst.condition : false
                  , hadContent = !isInitial
                  , $fromContent              
                  , $toContent = quedPage.getSectionBlock(selector)
                  , upcomingHtml = $toContent.html()
                  , hasUpcomingContent = $toContent.is( website.dynamicContentIndicator )
                  , isValid = !condition ? true : condition.call( inst, isInitial )
                  ;

                // prevent transition if upcoming content is empty or identical
                if( !isInitial ){
                    $fromContent = currentPage.getSectionBlock(selector);
                    hadContent = $fromContent.is(website.dynamicContentIndicator);
                }
                
                // evaluate if transition is playable and what transition action has to be performed
                var doTransition = (hasUpcomingContent && isValid) || forceTransition;
                if( !doTransition ){
                	quedPage.setSectionBlock( selector, $fromContent, true );
                	inst.triggerDone( true );
                	return;
                }   


                // evaluate type of transition
                var upcomingAction;
                if ( !hadContent && !inst.introPlayed ){                        
                    upcomingAction = 'playIntro';
                    if( inst.soloTransition && !this.playSoloTransition ){
                        inst.soloMode = true;
                        this.playSoloTransition = true;
                    }
                }else if( hasUpcomingContent || inst.forceTransition || inst.avoidOutro ){                        
                    upcomingAction = 'playTransition';
                }else{
                    upcomingAction = 'playOutro';
                    if( inst.soloTransition && this.playSoloTransition ){
                        inst.soloMode = false;
                        this.playSoloTransition = false;
                    }
                }
                

                // update transition instance properties
                if( !inst.muted ){
                    inst.$fromContent = $fromContent;
                }
                inst.$toContent = $toContent;
                inst.upcomingAction = upcomingAction;
                inst.upcomingIndicator = inst.prepare( currentPage, quedPage, $fromContent, $toContent, upcomingAction );
               

               	// add transition to filter to be playable
                this.playFilter.push( selector );         

            });
            

            // play evaluated transition action or add another solo iteration
            if( !this.playSoloTransition && !beenInSoloModeBefore ){
                
                this.playTransitionActions();

            }else{

            	// TODO: check if this works as expected, not tested yet
                this.playTransitionSoloMode( beenInSoloModeBefore );

            }
            
            return this.playFilter;
            
        },

        playTransitionActions: function(){
           
            this.foreachTransition(function( inst, selector ){ 

                // play action
                vendor.log('TRANSITION FOR <' + inst.sectionSelector + ' > => ' + inst.upcomingAction,'transition');
                inst[ inst.upcomingAction ]( inst.upcomingIndicator, function(){ inst.triggerDone(false); } );

                // trigger start event for transition's element 
                inst.$el.trigger('transitionStart', inst.upcomingAction);

                // indicate intro as played
                if( inst.upcomingAction === 'playIntro' ){
                    inst.introPlayed = true;
                }

            }, this.playFilter);

        },


        playTransitionSoloMode: function( beenInSoloModeBefore ){

            var newTransitionFilter = [];
            this.foreachTransition(function( inst, selector ){ 

                // call muted (unplayable) transitions
                if( this.playSoloTransition && !inst.soloMode ){
                    
                    // if just entered into solo mode, flag every not-solo transition as muted
                    if( !beenInSoloModeBefore ){
                        inst.muted = true;
                    }
                    inst.upcomingCallback.call(inst);
                    return;

                }else if( !this.playSoloTransition && inst.muted ){

                    // after solo mode is over, unmute transitions
                    inst.muted = false;

                }

                // collect playable transitions
                newTransitionFilter.push( selector );  
                

            }, this.playFilter);

            this.playFilter = newTransitionFilter;
            this.playTransitionActions();

        }


    };    
    return $.extend( {}, Backbone.Events, TransitionManager );
});