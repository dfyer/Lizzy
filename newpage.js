// Time
function getDayOfWeek(idx) {
  if (idx == 0) { return "Sunday"; }
  else if (idx == 1) { return "Monday"; }
  else if (idx == 2) { return "Tuesday"; }
  else if (idx == 3) { return "Wednesday"; }
  else if (idx == 4) { return "Thursday"; }
  else if (idx == 5) { return "Friday"; }
  else if (idx == 6) { return "Saturday"; }
  else { return ''; }
}
function getMonthName(idx) {
  const monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  return monthNames[idx];
}
function formatInt(num, length) {
  var r = "" + num;
  while (r.length < length) {
    r = "0" + r;
  }
  return r;
}
function getTime() {
  let date_text = document.getElementById("date-text");
  let tth = document.getElementById("tth");
  let ttm = document.getElementById("ttm");

  let now = new Date();
  let dow = getDayOfWeek(now.getDay());
  date_text.innerHTML = dow + ", " + getMonthName(now.getMonth()) + " " + now.getDate();

  tth.innerHTML = formatInt(now.getHours(), 2);
  ttm.innerHTML = formatInt(now.getMinutes(), 2);
}

// Result Builders
function buildTopsitesList(mostVisitedURLs) {
  // Hide other results
  hideResults();

  let favicons = document.getElementById('topsites-favicons');
  for (var i = 0; i < mostVisitedURLs.length; i++) {
    let div = favicons.appendChild(document.createElement('div'));
    if (i == 0) {
      div.setAttribute('class', 'favicon-wrapper favicon-wrapper-first');
    } else {
      div.setAttribute('class', 'favicon-wrapper');
    }
    let a = div.appendChild(document.createElement('a'));
    a.href = mostVisitedURLs[i].url;
    a.setAttribute('title', mostVisitedURLs[i].title);
    let favicon = document.createElement('img');
    favicon.setAttribute('src', 'http://www.google.com/s2/favicons?domain=' + mostVisitedURLs[i].url);
    a.appendChild(favicon);
  }
}

function buildYoutubesList(result, detail) {
  // Hide other results
  hideResults();

  console.log(result);
  console.log(detail);

  // Build search result
  let youtubeDiv = document.getElementById("youtubes");
  // Remove exsiting search result
  let child = youtubeDiv.lastChild;
  while (child) {
    youtubeDiv.removeChild(child);
    child = youtubeDiv.lastChild;
  }
  // Add new search result
  let ul = youtubeDiv.appendChild(document.createElement('ul'));
  ul.setAttribute("id", "youtubes-ul");

  for (let i = 0; i < result.items.length; i++) {
    let li = ul.appendChild(document.createElement('li'));
    let a = li.appendChild(document.createElement('a'));
    a.href = "https://www.youtube.com/watch?v=" + result.items[i].id.videoId;
    let thumbnail = document.createElement('img');
    thumbnail.setAttribute('src', result.items[i].snippet.thumbnails.medium.url);
    a.appendChild(thumbnail);
    a.appendChild(document.createTextNode(result.items[i].snippet.title));
  }

  // Set display
  document.getElementById('youtubes').setAttribute("style", "display:block;");
}

function buildTwitchList(result) {
  // Hide other results
  hideResults();

  console.log(result);

  // Build search result
  let tstreamDiv = document.getElementById("tstreams");
  // Remove exsiting search result
  let child = tstreamDiv.lastChild;
  while (child) {
    tstreamDiv.removeChild(child);
    child = tstreamDiv.lastChild;
  }
  // Add new search result
  let ul = tstreamDiv.appendChild(document.createElement('ul'));
  ul.setAttribute("id", "tstreams-ul");

  for (let i = 0; i < result.streams.length; i++) {
    let li = ul.appendChild(document.createElement('li'));
    let a = li.appendChild(document.createElement('a'));
    a.href = result.streams[i].channel.url;
    let thumbnail = document.createElement('img');
    thumbnail.setAttribute('src', result.streams[i].preview.medium);
    a.appendChild(thumbnail);
    a.appendChild(document.createTextNode(result.streams[i].channel.status));
  }

  // Set display
  document.getElementById('tstreams').setAttribute("style", "display:block;");
}

// Helper for result builders
function hideResults() {
  //document.getElementById('topsites').setAttribute("style", "display:none;");
  document.getElementById('youtubes').setAttribute("style", "display:none;");
  document.getElementById('tstreams').setAttribute("style", "display:none;");
}
function cookUrl(baseUrl, params) {
  let retUrl = baseUrl + "?";
  for (let param in params) {
    retUrl += param + "=" + params[param] + "&";
  }
  return retUrl.substr(0, retUrl.length-1);
}

// Loaders
function loadYoutube() {
  let qstr = document.getElementById("q-string").value;

  // Prepare for Youtube API
  let APIKey = 'AIzaSyAu6xRCFgAwawzoPk3HIENfsuggoOkNrvU';
  let youtubeUrl = ''
  let recommended = true;
  if (qstr == '') {
    youtubeUrl = cookUrl("https://www.googleapis.com/youtube/v3/videos", {
      part: "snippet",
      chart: "mostPopular",
      key: APIKey,
      regionCode: "KR",
      videoCategoryId: "20",  // Gaming
      maxResults: 10
    });
  }
  else {
    youtubeUrl = cookUrl("https://www.googleapis.com/youtube/v3/search", {
      q: encodeURI(qstr),
      part: "snippet",
      safeSearch: "none",
      type: "video",
      key: APIKey,
      regionCode: "KR",
      maxResults: 10
    });
    recommended = false;
  }

  console.log(youtubeUrl);

  // Create and send request with XHR
  // Snippets
  let snippets = [];
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === xhr.DONE) {
      snippets = JSON.parse(xhr.responseText);

      // Video details
      let ids = [];
      for (let i in snippets.items) {
        if (recommended) {
          ids.push(snippets.items[i].id);
        } else {
          ids.push(snippets.items[i].id.videoId);
        }
      }

      console.log(ids);

      let detailUrl = cookUrl("https://www.googleapis.com/youtube/v3/videos", {
        q: encodeURI(qstr),
        part: "statistics",
        id: ids.join(),
        type: "video",
        key: APIKey,
        maxResults: 10
      });

      console.log(detailUrl);

      xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === xhr.DONE) {
          let details = JSON.parse(xhr.responseText);
          buildYoutubesList(snippets, details);
        }
      };
      xhr.open("GET", detailUrl);
      xhr.send();
    }
  };
  xhr.open("GET", youtubeUrl);
  xhr.send();
}

function loadTwitch() {
  let twitchUrl = "https://api.twitch.tv/kraken/streams/followed";

  console.log(twitchUrl);

  // Create and send request with XHR
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === xhr.DONE) {
      let result = JSON.parse(xhr.responseText);
      buildTwitchList(result);
    }
  };
  xhr.open("GET", twitchUrl);
  xhr.setRequestHeader('client-id', '8l9vm9cnwt8poml5ioqogcnljkmgxl');
  xhr.send();
}

// Initializers
window.onload = function() {
  // Top sites and twitch streams are initialized
  chrome.topSites.get(buildTopsitesList);
  loadTwitch();
  // Time
  getTime();
  setInterval(function() {
    getTime();
  }, 60000);
}

document.addEventListener('DOMContentLoaded', function() {
  // Bind Event Handlers
  document.getElementById("btn-youtubes").addEventListener("click", loadYoutube);
  document.getElementById("btn-tstreams").addEventListener("click", loadTwitch);

  // Bind key
  document.getElementById("q-string").addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementById("btn-youtubes").click();
    }
  });
});
