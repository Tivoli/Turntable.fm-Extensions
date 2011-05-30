var defaults = {
    "showChat": true,
    "showSong": true,
    "showVote": true,
    "showDJChanges": false,
    "showListenerChanges": false,
    "autoAwesome": false,
    "messageTimeout": 10000
};

function initOptions() {
  $.each(defaults, function(key, val){
		if (!localStorage[key])
			localStorage[key] = val
			
		$('#' + key).prop('checked', JSON.parse(localStorage[key]))
	});
}