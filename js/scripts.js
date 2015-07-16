var keywordBlacklist = ["pronounc", "say", "vocabulary", "spelling", "mean", "definition", "slideshow", "full", "ebook", "auto-generated by youtube", "amazon.com", "amazon.es", "amazon.co.uk", "bit.ly", "tukunen.org", "bitiiy.com", "http://po.st"];
var viewCountThreshold = 500;
var currentAlgo = 1;

// v1. [25, 2, 5, 11, 12, 2, 2, 11]
var successMetrics = [0, 0, 0, 0, 0, 0, 0, 0];
var algoNames = ['nonsenseWord', 'nonsenseChinesePhrase', 'nonsenseJapanesePhrase', 'nonsenseCyrillic',
                'randomCharacters', 'nonsenseHangul', 'nonsenseArabic', 'nonsenseLatin'];

// when you hit next, if there's a video id in sessionstorage, immediately play that video, then find another suitable id and put it in sessionstorage
//                    if there isn't a video id in sessionstoage, find TWO suitable ids, play one, and stick the other in sessionstorage

function getRandomPhrase() {

  algo = Math.floor(Math.random() * 8) + 1;
  currentAlgo = algo;

  if(algo === 1) {
    return nonsenseWord(); // 1
  } else if(algo === 2) {
    return nonsenseChinesePhrase();
  } else if(algo === 3) {
    return nonsenseJapanesePhrase(); // 3
  } else if(algo === 4) { // 2
    return nonsenseCyrillic();
  } else if(algo === 5) {
    return randomCharacters();
  } else if(algo === 6) {
    return nonsenseHangul();
  } else if(algo === 7) {
    return nonsenseArabic();
  } else if(algo === 8) {
    return nonsenseLatin(); // 2
  }

}

function nextVideo() {
  var nextVideoId = sessionStorage.getItem('nextVideoId');
  if(nextVideoId === null) {
    console.log('nextVideoId not found in sessionStorage. Calling findAndPlayVideo() & findAndStoreVideo().');
    findAndPlayVideo();
  } else {
    console.log('nextVideoId found in sessionstorage. Calling playVideo(nextVideoId) & findAndStoreVideo()')
    playVideo(nextVideoId);
    sessionStorage.removeItem('nextVideoId')
    findAndStoreVideo();
  }
}

function playVideo(id) {
  player.loadVideoById(id);
}

function findAndPlayVideo() {
  console.log('findAndPlayVideo() was called.')
  var word = getRandomPhrase();
  console.log('[PLAY] word = ' + decodeURIComponent(word));
  var requestStr = 'https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=' + word + '&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      contentType: "application/json; charset=utf-8",
      jsonpCallback: 'findAndPlayVideoHelper'
  });
}

function findAndPlayVideoHelper(responseJSON) {
  if (responseJSON.items.length < 1) {
    console.log("[PLAY] No videos found for search term. Restarting search.");
    findAndPlayVideo();
  } else {
    var videoChoice = Math.floor(Math.random() * responseJSON.items.length);
    // console.log("choosing video #" + videoChoice + " of " + responseJSON.items.length);
    var videoId = responseJSON.items[videoChoice].id.videoId;
    var url2 = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics&id=" + videoId + "&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
    $.getJSON(url2).then(function(responseJSON2) {
      if(responseJSON2.items[0].statistics.viewCount > viewCountThreshold) {
        console.log("[PLAY] View count too high. Restarting search.");
        findAndPlayVideo();
      } else if(isBlacklisted(responseJSON2.items[0].snippet.title, responseJSON2.items[0].snippet.description)) {
        console.log("[PLAY] Title and/or description contains blacklisted word. Restarting search.")
        findAndPlayVideo();
      } else {
        console.log("[PLAY] Success with " + algoNames[currentAlgo-1] + "! Storing video ID.");
        successMetrics[currentAlgo-1] += 1;
        player.loadVideoById(responseJSON2.items[0].id);
        findAndStoreVideo();
      }
    });
  }
}

function findAndStoreVideo() {

  console.log('findAndStoreVideo() was called.')
  var word = getRandomPhrase();
  console.log('[STORE] word = ' + decodeURIComponent(word));
  var requestStr = 'https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=' + word + '&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      contentType: "application/json; charset=utf-8",
      jsonpCallback: 'findAndStoreVideoHelper'
  });

}

function findAndStoreVideoHelper(responseJSON) {
  if (responseJSON.items.length < 1) {
    console.log("[STORE] No videos found for search term. Restarting search.");
    findAndStoreVideo();
  } else {
    var videoChoice = Math.floor(Math.random() * responseJSON.items.length);
    // console.log("choosing video #" + videoChoice + " of " + responseJSON.items.length);
    var videoId = responseJSON.items[videoChoice].id.videoId;
    var url2 = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics&id=" + videoId + "&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
    $.getJSON(url2).then(function(responseJSON2) {
      if(responseJSON2.items[0].statistics.viewCount > viewCountThreshold) {
        console.log("[STORE] View count too high. Restarting search.");
        findAndStoreVideo();
      } else if(isBlacklisted(responseJSON2.items[0].snippet.title, responseJSON2.items[0].snippet.description)) {
        console.log("[STORE] Title and/or description contains blacklisted word. Restarting search.")
        findAndStoreVideo();
      } else {
        console.log("[STORE] Success with " + algoNames[currentAlgo-1] + "! Storing video ID.");
        successMetrics[currentAlgo-1] += 1;
        sessionStorage.setItem('nextVideoId', responseJSON2.items[0].id);
        // findAndStoreVideo();
      }
    });
  }
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

// ---------------------------- YOUTUBE API BULLSHIT ----------------------------

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
    playerVars: {
      'showinfo': 0,
      'controls': 0,
      'rel': 0,
      'showinfo': 0
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
  nextVideo();
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {

    nextVideo();

    $("#next").click(function(event) {
      event.preventDefault();
      $('#nextImg').addClass('animated bounceOutDown');
      console.log("nextVideo clicked");
      nextVideo();
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
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    nextVideo();
  } else if(event.data == YT.PlayerState.PLAYING) {
    $('#nextImg').removeClass('animated bounceOutDown');
  }
}

$(document).on("keydown", function (e) {
  if(e.keyCode === 32 || e.keyCode === 40) {
    $('#nextImg').addClass('animated bounceOutDown');
    nextVideo();
  }
});

// ---------------------------- RANDOM WORD/PHRASE GENERATORS ----------------------------

// 4. A "truly random" nonsense phrase, i.e. "behuga"
function nonsenseWord() {
  var word = chance.word({syllables: 3});
  return word;
}

// 5. Two random chinese characters with a space between them
function nonsenseChinesePhrase() {
  // U0530 - U18B0 all unicode (lots of trains for some reason)
  // var word = getRandomKatakana() + " " + getRandomKatakana() + " " + getRandomKatakana();
  var word = getRandomChineseCharacter() + " " + getRandomChineseCharacter();
  word = encodeURIComponent(word);
  return word;
}

function getRandomChineseCharacter() {
  return String.fromCharCode(0x4E00 + Math.random() * (0x62FF-0x4E00+1));
}

// 6. Two random japanese characters with a space between them
function nonsenseJapanesePhrase() {
    var word = getRandomJapaneseCharacter() + getRandomJapaneseCharacter();
    word = encodeURIComponent(word);
    return word;
}

function getRandomJapaneseCharacter() {
  var a = Math.floor(Math.random() * 3) + 1;
  if(a === 1) {
    return String.fromCharCode(0x4E00 + Math.random() * (0x62FF-0x4E00+1));
  } else if(a === 2) {
    return String.fromCharCode(0x3040 + Math.random() * (0x309F-0x3040+1));
  } else {
    return String.fromCharCode(0x30A0 + Math.random() * (0x30FF-0x30A0+1));
  }
}

function getRandomHiragana() {
  return String.fromCharCode(0x3040 + Math.random() * (0x309F-0x3040+1));
}

function getRandomKatakana() {
  return String.fromCharCode(0x30A0 + Math.random() * (0x30FF-0x30A0+1));
}

function nonsenseCyrillic() {
  // U+0400..U+04FF
   var word = getCyrillicChar() + " " + chance.word({syllables: 1});
   word = encodeURIComponent(word);
   return word;
}

function randomCharacters() {
  var inputLength = Math.floor(Math.random() * 3) + 3;
  var word = chance.string({length: inputLength, pool: 'abcdefghijklmnopqrstuvwxyz'});
  // var word = chance.character({alpha: true}) + chance.character({alpha: true}) + chance.character({alpha: true}) + chance.character({alpha: true}) + chance.character({alpha: true});
  return word;
}

function nonsenseHangul() {
  var word = getRandomHangul() + " " + getRandomHangul();
  word = encodeURIComponent(word);
  return word;
}

function nonsenseArabic() {
  var word = getRandomArabic() + getRandomArabic() + getRandomArabic();
  word = encodeURIComponent(word);
  return word;
}

function nonsenseLatin() {
  var word = getLatinChar() + chance.string({length: 1, pool: 'abcdefghijklmnopqrstuvwxyz'}) + getLatinChar();
  word = encodeURIComponent(word);
  return word;
}

function getLatinChar() {
  return String.fromCharCode(0x00C0 + Math.random() * (0x00C0-0x00FF+1))
}

function getCyrillicChar() {
  return String.fromCharCode(0x0400 + Math.random() * (0x04FF-0x0400+1))
}

function getRandomUnicodeCharacter() {
  return String.fromCharCode(0x0000 + Math.random() * (0x0000-0xFFFD+1))
}

function getRandomHangul() {
  return String.fromCharCode(0xAC00 + Math.random() * (0xAC00-0xD7AF+1))
}

function getRandomEthiopic() {
  return String.fromCharCode(0x1200 + Math.random() * (0x1200-0x137F+1))
}

function getRandomArabic() {
  return String.fromCharCode(0x0600 + Math.random() * (0x0600-0x06FF+1))
}
