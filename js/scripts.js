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
    // videoId: 'dD4XLVyRdD4',
    playerVars: {
      'showinfo': 0,
      'controls': 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {

    randomWord();

    $("#next").click(function(event) {
      event.preventDefault();
      console.log("randomVideo clicked");
      randomWord();
    });

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
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    randomWord();
  }
}

var viewCountThreshold = 500;
var keywordBlacklist = ["pronounc", "say", "vocabulary", "spelling", "mean", "definition", "slideshow", "full", "ebook"];

function randomWord() {
  var a = Math.floor(Math.random() * 5) + 1;
  if(a === 1) {
    randomWord1();
  } else if(a === 2) {
    randomWord2();
  } else if(a === 3) {
    randomWord3();
  } else if(a === 4) {
    randomWord4();
  } else if(a === 5) {
    randomWord5();  
  }
}

function randomWord1() {
  var requestStr = "http://randomword.setgetgo.com/get.php";
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomWord1Helper'
  });
}

function randomWord1Helper(data) {
  console.log("using randomword.setgetgo.com");
  var word = data.Word;
  randomVideo(word);
}

function randomWord2() {
  var requestStr = 'http://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=0&minLength=5&maxLength=15&limit=1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomWord2Helper'
  });
}

function randomWord2Helper(data) {
  console.log("using api.wordnik.com");
  var word = data[0].word;
  randomVideo(word);
}

function randomWord3() {

  var requestStr = 'https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomWord3Helper'
  });
}

function randomWord3Helper(data) {
  console.log("using en.wikipedia.org");
  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;
  randomVideo(word);
}

function randomWord4() {

  var requestStr = 'https://es.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomWord4Helper'
  });
}

function randomWord4Helper(data) {
  console.log("using es.wikipedia.org");
  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;
  randomVideo(word);
}

function randomWord5() {

  var requestStr = 'https://de.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomWord5Helper'
  });
}

function randomWord5Helper(data) {
  console.log("using de.wikipedia.org");
  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;
  randomVideo(word);
}

function randomVideo(word) {
  // debugger;
  console.log(word);
  var url = "https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=" + word + "&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
  $.getJSON(url).then(function(responseJSON) {
    if (responseJSON.items.length < 1) {
      console.log("No videos found for " + word + "Restarting search.");
      randomWord();
    } else {
        var videoId = responseJSON.items[0].id.videoId;
        var url2 = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics&id=" + videoId + "&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
        $.getJSON(url2).then(function(responseJSON2) {
          if(responseJSON2.items[0].statistics.viewCount > viewCountThreshold) {
            console.log("View count too high. Restarting search.");
            randomWord();
          } else if(isBlacklisted(responseJSON2.items[0].snippet.title, responseJSON2.items[0].snippet.description)) {
            console.log("Title: " + responseJSON2.items[0].snippet.title + " - Description: " + responseJSON2.items[0].snippet.description + " contains blacklisted word. Restarting search.")
            randomWord();
          } else {
            console.log("Success! Video ID = " + responseJSON2.items[0].id);
            player.loadVideoById(responseJSON2.items[0].id);
          }
        });
      }
  });
}

// function randomVideo(data) {
//   console.log(data.Word);
//   var url = "https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=" + data.Word + "&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
//   $.getJSON(url).then(function(responseJSON) {
//     if (responseJSON.items.length < 1) {
//       console.log("No videos found for " + data.Word + "Restarting search.");
//       randomWord();
//     } else {
//         var videoId = responseJSON.items[0].id.videoId;
//         var url2 = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics&id=" + videoId + "&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
//         $.getJSON(url2).then(function(responseJSON2) {
//           if(responseJSON2.items[0].statistics.viewCount > viewCountThreshold) {
//             console.log("View count too high. Restarting search.");
//             randomWord();
//           } else if(isBlacklisted(responseJSON2.items[0].snippet.title, responseJSON2.items[0].snippet.description)) {
//             console.log("Title: " + responseJSON2.items[0].snippet.title + " - Description: " + responseJSON2.items[0].snippet.description + " contains blacklisted word. Restarting search.")
//             randomWord();
//           } else {
//             console.log("Success! Video ID = " + responseJSON2.items[0].id);
//             player.loadVideoById(responseJSON2.items[0].id);
//           }
//         });
//       }
//   });
// }

function isBlacklisted(title, description) {
  title = title.toLowerCase();
  description = description.toLowerCase();
  for(var i = 0; i < keywordBlacklist.length; i++) {
    if(title.includes(keywordBlacklist[i]) || description.includes(keywordBlacklist[i])) {
      return true;
    }
  }
  return false;
}

// jQuery
