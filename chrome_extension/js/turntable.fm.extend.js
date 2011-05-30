TFMEX = {};

/*!
 * Based on:
 * Modernizr v1.7
 * http://www.modernizr.com
 *
 * Developed by: 
 * - Faruk Ates  http://farukat.es/
 * - Paul Irish  http://paulirish.com/
 *
 * Copyright (c) 2009-2011
 * Dual-licensed under the BSD or MIT licenses.
 * http://www.modernizr.com/license/
 */
TFMEX.localStorageSupport = function() {
    try {
        return !!localStorage.getItem;
    } catch(e) {
        return false;
    }
}();

/*
  turntable.fm extend
  
  Developed by:
    Mark Reeder http://twitter.com/Mark_Reeder
*/

TFMEX.votelog = [];
$(document).ready(function() {

  var lastSongMetadata = {},
      songVotes = [],
      voteMap = {
        "up": "Awesome",
        "down": "Lame"
      },
      listenerChangeMap = {
        "deregistered": "left",
        "registered": "entered"
	    },
      djChangeMap = {
        "add_dj": "just stepped up to",
        "rem_dj": "just stepped down from"
      },
      
    	attachListeners = function() {
            var intervalID = window.setInterval(function() {
                if(window.turntable.eventListeners.message.length) {
                    window.turntable.addEventListener("message", extensionEventListener);
                    window.turntable.addEventListener("soundstart", extensionEventListener);
                    window.clearInterval(intervalID);
                }
            }, 250);
    	},
	
    	cleanUp = function() {
            window.turntable.eventListeners.message = [];
            window.turntable.eventListeners.soundstart = [];
    	},

      desktopAlert = function(notificationObj) {
        var notification = webkitNotifications.createNotification(
            notificationObj.image?notificationObj.image:"",  // icon url - can be relative
            notificationObj.title?notificationObj.title:"",  // notification title
            notificationObj.body?notificationObj.body:""  // notification body text
        );
        notification.show();
        setTimeout(function(){
          notification.cancel();
        }, localStorage['messageTimeout']);
        
      },
      
      extensionEventListener = function(m){    
        var songMetadata = null,
            currentDJ = "",
            currentDJName = "";
        
        if(m.hasOwnProperty("msgid")){
            try {
                songMetadata = window.turntable.topViewController.currentSong.metadata;
                if (songMetadata.song !== lastSongMetadata.song && songMetadata.artist !== lastSongMetadata.artist) {
                  lastSongMetadata = songMetadata;
                } else {
                  return;
                }
            } catch(e) {}
        }
        if(typeof(m.command) !== "undefined") {
            switch(m.command) {
                case "newsong":
                    TFMEX.votelog = [];
                    try {
                        if (localStorage['autoAwesom'])
                            ROOMMANAGER.callback("upvote");
                            
                        songMetadata = m.room.metadata.current_song.metadata;
                        lastSongMetadata = songMetadata;
                        // console.log(songMetadata);
                        // currentDJ = m.room.metadata.current_dj;
                        // currentDJName = Room.users[currentDJ].name;
                        // console.log(currentDJName, songMetadata.coverart, songMetadata.song + " by " + songMetadata.artist + " on " + songMetadata.album);

                    } catch(e) {
                        // console.error(e.message);
                        return;
                    }
                    break;
                case "speak":
                    if(localStorage['showChat']) {
                        desktopAlert({
                            title: "",
                            image: "",
                            body: m.name + ": " + m.text
                        });
                    }
                    break;
                case "registered":
                case "deregistered":
                    if(localStorage['showListenerChanges']) {
                        // console.log("showListenerChanges", m);
                        desktopAlert({
                            title: m.user[0].name + " just " + listenerChangeMap[m.command] + " the room.",
                            image: "",
                            body: ""
                        });
		            }
                    break;
                case "add_dj":
                case "rem_dj":
                    if(localStorage['showDJChanges']) {
                        // console.log("showDJChanges", m);
                        desktopAlert({
                            title: m.user[0].name + " " + djChangeMap[m.command] + " the decks.",
                            image: "",
                            body: ""
                        });
                    }
                    break;
                case "update_votes":
                    TFMEX.votelog = m.room.metadata.votelog;
                    var currentVote = TFMEX.votelog[TFMEX.votelog.length - 1];
                    try {
                        if(localStorage['showVote']) {
                            desktopAlert({
                                title: window.turntable.topViewController.users[currentVote[0]].name + " voted: ",
                                image: "",
                                body: voteMap[currentVote[1]]
                            });
                        }
                    } catch(e) { console.log(e.message); }
                case "update_user":
                case "new_moderator":
                default:
            }
        } else {
            // console.log("Command Undefined");
        }
        
        if (songMetadata) {
            if (localStorage['showSong']) {
                var title = window.turntable.topViewController.users[window.turntable.topViewController.roomManager.current_dj[0]].name + " is spinning:",
                    coverArt = songMetadata.coverart?songMetadata.coverart:"",
                    body = songMetadata.artist + " - " + songMetadata.song;
                desktopAlert({
                    title: title,
                    image: coverArt,
                    body: body
                });
            }
        }
    }
    $(window).bind("popstate", function (b) {
        cleanUp();
        attachListeners();
    });
    $(window).bind("pushstate", function (b) {
        cleanUp();
        attachListeners();
    });
});
