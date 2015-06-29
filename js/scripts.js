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
      'onStateChange': onPlayerStateChange,
      'onError': onError
    }
  });
}

function onError(event) {
  console.log("Error encountered. Retrying.");
  randomWord();
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
  var a = Math.floor(Math.random() * 10) + 1;
  if(a === 1) {
    randomObscureWord();
  } else if(a === 2) {
    randomEnglishWord();
  } else if(a === 3) {
    englishWikipedia();
  } else if(a === 4) {
    spanishWikipedia();
  } else if(a === 5) {
    dutchWikipedia();
  } else if(a === 6) {
    vietnameseWikipedia();
  } else if(a === 7) {
    randomEnglishPhrase();
  } else {
    nonsenseWord();
  }
}

// Random english phrase of two words. Uses api.wordnik.com
function randomEnglishPhrase() {
  var requestStr = 'http://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=0&minLength=2&maxLength=4&limit=2&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomEnglishPhraseHelper'
  });
}

function randomEnglishPhraseHelper(data) {
  console.log("using api.wordnik.com (two words)");
  var word = data[0].word + " " + data[1].word;
  randomVideo(word);
}

// Random english word. Often a obscure medical or scientific term.
function randomObscureWord() {
  var requestStr = "http://randomword.setgetgo.com/get.php";
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomObscureWordHelper'
  });
}

function randomObscureWordHelper(data) {
  console.log("using randomword.setgetgo.com");
  var word = data.Word;
  randomVideo(word);
}

// Random english word. Less obscure than randomObscureWord().
function randomEnglishWord() {
  var requestStr = 'http://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=0&minLength=5&maxLength=15&limit=1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomEnglishWordHelper'
  });
}

function randomEnglishWordHelper(data) {
  console.log("using api.wordnik.com");
  var word = data[0].word;
  randomVideo(word);
}

// Random English Wikipedia page title.
function englishWikipedia() {

  var requestStr = 'https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'englishWikipediaHelper'
  });
}

function englishWikipediaHelper(data) {
  console.log("using en.wikipedia.org");
  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;
  randomVideo(word);
}

// Random Spanish Wikipedia page title.

function spanishWikipedia() {

  var requestStr = 'https://es.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'spanishWikipediaHelper'
  });
}

function spanishWikipediaHelper(data) {
  console.log("using es.wikipedia.org");
  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;
  randomVideo(word);
}

// Random Dutch Wikipedia page title.
function dutchWikipedia() {

  var requestStr = 'https://de.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'dutchWikipediaHelper'
  });
}

function dutchWikipediaHelper(data) {
  console.log("using de.wikipedia.org");
  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;
  randomVideo(word);
}

// Vietnamese Wikipedia.
function vietnameseWikipedia() {

  var requestStr = 'https://vi.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'vietnameseWikipediaHelper'
  });
}

function vietnameseWikipediaHelper(data) {
  console.log("using vi.wikipedia.org");

  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;

  var regExp = /(?:^|(?:\.\s))(\w+)/;
  word = word.match(regExp);

  if(word === null) {
    randomWord();
  } else {
    word = word[0];
    randomVideo(word);
  }

}

// A "truly random" nonsense phrase, i.e. "behuga"
function nonsenseWord() {
  var word = chance.word({syllables: 3});
  randomVideo(word);
}


function randomVideo(word) {
  // debugger;
  console.log(word);
  var url = "https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=" + word + "&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
  $.getJSON(url).then(function(responseJSON) {
    if (responseJSON.items.length < 1) {
      console.log("No videos found for " + word + ". Restarting search.");
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


$(document).ready(function() {
  $(document).on("keyup", function(e) {
    var code = e.which;
    if (code == 40) {
      randomWord();
    }
  });
});
