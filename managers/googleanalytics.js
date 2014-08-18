define([
],function(){
	var undef;
	var TrackingManager = {

		account: undef,
		
		config: function( account ){
			this.account = account;
			return this;
		},

		trackPageView: function(){
			if( window._gaq != undef ){
	            window._gaq.push(['_setAccount', this.account ]);
	            window._gaq.push(['_trackPageview']);
	        }   
		}

	};
	return TrackingManager;
})