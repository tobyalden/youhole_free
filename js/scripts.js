var queue = [];
var title = "";

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'p89luc-8I_s',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  // event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED && queue.length > 0) {
    nextVideo = queue.shift();
    console.log("video finished! nextVideo = " + nextVideo.title);
    player.loadVideoById(nextVideo.id);
    drawPage();
  }
}

// jQuery

$(document).ready(function() {

  $("#changeVideo").click(function(event) {
    event.preventDefault()
    console.log("changeVideo clicked");
    var url = $("input#videoUrl").val();
    var id = getIdFromUrl(url);
    player.loadVideoById(id);
    $("input#videoUrl").val("");
  });

  $("#queueVideo").click(function(event) {
    event.preventDefault()
    console.log("queueVideo clicked");
    var url = $("input#videoUrl").val();
    var id = getIdFromUrl(url);

    $.getJSON("https://www.googleapis.com/youtube/v3/videos", {
      key: "AIzaSyDEeNLNCbn1bVKlSr36mhssp37QO8n-Cfw",
      part: "snippet, contentDetails",
      id: id
    }, function(data) {
      var video = {
        title: data.items[0].snippet.title,
        duration: data.items[0].contentDetails.duration,
        id: id
      };
      queue.push(video);
      drawPage();
    }).fail(function(jqXHR, textStatus, errorThrown) {
      $("<p style='color: #F00;'></p>").text(jqXHR.responseText || errorThrown).appendTo("#errors");
    });

    $("input#videoUrl").val("");
  });

  drawPage = function drawPage() {
    $("#queue").empty();
    for(var i = 0; i < queue.length; i++) {
      $("#queue").append('<li> <img src="http://img.youtube.com/vi/' + queue[i].id + '/default.jpg"/> ' + parseDuration(queue[i].duration) + '<p>' + queue[i].title + '</p>' + '</li> <hr>');
    }
  }

  function getIdFromUrl(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      console.log("Error: Invalid URL");
    }
  }

  // i.e. PT10M PT1M47S PT1H1S
  function parseDuration(duration) {
    var returnStr = "";

    var numberRegex = /(\d+)/g;
    var numericArray = duration.match(numberRegex);

    var letterRegex = /[a-zA-Z]+/g;
    var letterArray = duration.match(letterRegex);
    letterArray.shift();

    var durationUnits = {
      "S": " sec ",
      "M": " min ",
      "H": " hour "
    };

    for(var i = 0; i < numericArray.length; i++) {
      returnStr += numericArray[i] + durationUnits[letterArray[i]];
    }
    return returnStr;
  }

});
