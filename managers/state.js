define([
	'jquery',
    'backbone',
    'underscore'
], function( $, Backbone, _ ){
	var undef;
	var StateManager = {
	    
        numChanges:0,
        numUpdates:0,
        current:undef,
	    previous:undef,
        states:[],
        $el: $('body'),

        // set managers states
        config: function( states ){
        	this.states = states;
        	return this;
        },

        // set managers reference element to eventually set the entry state
        sync: function( $syncEl ){

            // set element intially
            var isInitial = this.numChanges == 0;
            if( isInitial ){
                this.$el = $syncEl; 
            }

            // return if element seems to be synced
            if( this.inSync() ) return;            
            
            // find out entry state by inspecting element
            var state = this.findStateClass();
            this.to( state, {
                forceChange:!isInitial 
            }); 

        },


        // conditional methods
        is: function(state){
            if( this.has( state ) ){
                
                return state === this.current;  

            }else if( this.hasMethod(state) ){
                
                // trigger method
                return this[ state ].call( this, this.current, this.previous );
            
            }else{

                throw Error('no state or method called "'+state+'" is defined. Use any of these: '+(this.states.join(',')));
            }            
        },
        was: function(state){
            return state === this.previous;
        },
        has: function(state){
            return _.indexOf( this.states, state ) >= 0;
        },
        hasMethod:function(method){
            return method !== 'to' && typeof this[ method ] === 'function';
        },
        findStateClass: function(){
            return _.find( this.states, function(state){ return this.$el.is('.state-'+state ); }, this );
        },
        inSync: function(){
            if( !this.$el ) return true;
            return this.$el.is('.state-'+this.current);
        },
        hasChanged: function(){
            return this.numChanges > 0;
        },
        hasUpdated: function(){
            return this.numUpdates > 0;
        },

        // state change method
        /* params:
         * - silent: dont't trigger event
         * - forceChange: force state to change
         * - source: element for the event's source
         */
        to:function(state, params ){
            
            params = _.extend({
                silent: false,
                forceChange: false,
                source: this.$el[0]
            },params);

            if( !state ){ 

                return false; 

            } else if( this.has(state) || params.forceChange == true ){ 

                if( !this.is(state) || params.forceChange == true ){
                    
                    // update properties
                    this.previous = this.current;
                    this.current = state;
                    this.numUpdates = 0;

                    // update element's classes and data attribute
                	if( this.$el && this.$el.size()>0 ){
                		this.$el.removeClass( 'state-'+this.previous ).addClass('state-'+this.current);
                		this.$el.attr('data-current-state', this.current);
                	}

                    // trigger change event
                    if( params.silent != true ){
                        this.trigger('change',{ 
                            from: this.previous, 
                            to: this.current, 
                            isInitial: this.numChanges==0,
                            $el: this.$el, 
                            source: params.source
                        });
                        this.numChanges++;
                        return true;
                    }

                }else{

                    // trigger update event
                    if( params.silent != true ){
                        this.trigger('update',{ 
                            updated: this.current, 
                            isInitial: this.numUpdates==0,
                            $el: this.$el,
                            source: params.source                            
                        });
                        this.numUpdates++;
                        return true;
                    }

                }   
                return false;

            }else if( this.hasMethod(state) ){
                
                // trigger method
                this[ state ].call( this, this.current, this.previous );
                return false;

            }
                
            throw Error('no state or method called "'+state+'" is defined. Use any of these: '+(this.states.join(',')));
        }

        
    };    
    return $.extend( {}, Backbone.Events, StateManager );
});