// Utils
function parseText(encodedStr) {
  var parser = new DOMParser;
  var dom = parser.parseFromString('<!doctype html><body>' + encodedStr, 'text/html');
  var decodedStr = dom.body.textContent;
  return decodedStr
}
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
function buildBookmarks(idStr) {
  // Remove exsiting search result
  let bms = document.getElementById('bookmarks');
  let child = bms.lastChild;
  while (child) {
    bms.removeChild(child);
    child = bms.lastChild;
  }
  chrome.bookmarks.get(idStr, buildBookmarksControl);
  chrome.bookmarks.getChildren(idStr, buildBookmarksList);
}
function buildBookmarksControl(bookmark) {
  console.log(bookmark);
  if (bookmark[0] && bookmark[0].parentId) {
    let bms = document.getElementById('bookmarks');
    let control = bms.appendChild(document.createElement('div'));
    control.setAttribute('class', 'ts-wrapper-control');
    control.setAttribute('id', 'load-parent-bookmarks');

    let favicon = document.createElement('i');
    favicon.setAttribute('class', 'material-icons-outlined');
    favicon.appendChild(document.createTextNode('arrow_back'));
    control.appendChild(favicon);

    control.addEventListener("click", function() {
      buildBookmarks(bookmark[0].parentId);
    });
  }
}
function buildBookmarksList(bookmarkURLs) {
  console.log(bookmarkURLs);

  let bms = document.getElementById('bookmarks');
  for (var i = 0; i < bookmarkURLs.length; i++) {
    let bookmarkItem = bookmarkURLs[i];
    let a = bms.appendChild(document.createElement('a'));
    a.setAttribute('class', 'ts-wrapper');

    if (bookmarkItem.dateGroupModified) {
      // Group: <i class="material-icons">folder</i>
      let favicon = document.createElement('img');
      favicon.setAttribute('src', 'folder_icon_16x16.png');
      favicon.appendChild(document.createTextNode('folder'));
      a.setAttribute('title', bookmarkItem.title);
      a.appendChild(favicon);

      let span = a.appendChild(document.createElement('span'));
      span.appendChild(document.createTextNode(parseText(bookmarkItem.title)));
      a.appendChild(span);

      a.addEventListener("click", function() {
        buildBookmarks(bookmarkItem.id);
      });
    } else {
      // URL
      let favicon = document.createElement('img');
      favicon.setAttribute('src', 'http://www.google.com/s2/favicons?domain=' + bookmarkURLs[i].url);
      a.href = bookmarkURLs[i].url;
      a.setAttribute('title', bookmarkURLs[i].title);
      a.appendChild(favicon);

      let span = a.appendChild(document.createElement('span'));
      span.appendChild(document.createTextNode(parseText(bookmarkURLs[i].title)));
      a.appendChild(span);
    }
  }
}

function buildYoutubesList(result, detail) {
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
    //let thumbnail = document.createElement('img');
    //thumbnail.setAttribute('src', result.items[i].snippet.thumbnails.medium.url);
    //a.appendChild(thumbnail);
    a.appendChild(document.createTextNode(parseText(result.items[i].snippet.title)));
  }

  // Set display
  document.getElementById('youtubes').setAttribute("style", "display:block;");
}

function buildTwitchList(result) {
  console.log(result);

  // Build search result
  let tstreamDiv = document.getElementById("tstreams");
  // Add new search result
  for (let i = 0; i < result.streams.length; i++) {
    let div = tstreamDiv.appendChild(document.createElement('div'));
    div.setAttribute('class', 'stream-wrapper');
    let stream = div.appendChild(document.createElement('a'));
    stream.href = result.streams[i].channel.url;
    stream.title = parseText(result.streams[i].channel.status);

    // Stream thumbnail
    let thumbnail_wrapper = document.createElement('div');
    thumbnail_wrapper.setAttribute('class', 'thumbnail');
    let thumbnail = document.createElement('img');
    thumbnail.setAttribute('src', result.streams[i].preview.medium);
    thumbnail_wrapper.appendChild(thumbnail);
    stream.appendChild(thumbnail_wrapper)

    // Channel Info
    let info_wrapper = document.createElement('div');
    info_wrapper.setAttribute('class', 'info');
    let logo = document.createElement('img');
    logo.setAttribute('class', 'logo');
    logo.setAttribute('src', result.streams[i].channel.logo);
    info_wrapper.appendChild(logo);
    let titles = document.createElement('div');
    titles.setAttribute('class', 'titles');
    let title = document.createElement('div');
    title.setAttribute('class', 'title');
    title.appendChild(document.createTextNode(parseText(result.streams[i].channel.status)));
    titles.appendChild(title);
    let name = document.createElement('div');
    name.setAttribute('class', 'name');
    name.appendChild(document.createTextNode(parseText(result.streams[i].channel.display_name)));
    titles.appendChild(name);
    let game = document.createElement('div');
    game.setAttribute('class', 'game');
    game.appendChild(document.createTextNode(parseText(result.streams[i].channel.game)));
    titles.appendChild(game);
    info_wrapper.appendChild(titles);
    let viewers = document.createElement('div');
    viewers.setAttribute('class', 'viewers');
    viewers.innerHTML = '<i class="material-icons">lens</i> ';
    viewers.innerHTML += parseText(result.streams[i].viewers);
    info_wrapper.appendChild(viewers);
    stream.appendChild(info_wrapper);
  }

  // Set display
  document.getElementById('tstreams').setAttribute("style", "display:block;");
}

// Helper for result builders
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
    youtubeUrl = cookUrl("https://www.googleapis.com/youtube/v3/guideCategories", {
      q: encodeURI(qstr),
      part: "snippet",
      key: APIKey,
      regionCode: "KR",
      maxResults: 10
    });
    recommended = false;
    /*
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
    */
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

function createState() {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let array = new Uint8Array(40);
  window.crypto.getRandomValues(array);
  array = array.map(x => validChars.charCodeAt(x % validChars.length));
  const randomState = String.fromCharCode.apply(null, array);
  return randomState
}

function authTwitch() {
  let twitchAuthUrl = "https://id.twitch.tv/oauth2/authorize"
  twitchAuthUrl += "?client_id=8l9vm9cnwt8poml5ioqogcnljkmgxl"
  twitchAuthUrl += "&redirect_uri=http://localhost"
  twitchAuthUrl += "&response_type=token"
  twitchAuthUrl += "&scope=viewing_activity_read"
  twitchAuthUrl += "&state=" + createState()
  // Create and send request with XHR
  let xhr = new XMLHttpRequest()
  xhr.open("GET", twitchAuthUrl)
  xhr.setRequestHeader('client_id', '8l9vm9cnwt8poml5ioqogcnljkmgxl');
  xhr.setRequestHeader('client_id', '8l9vm9cnwt8poml5ioqogcnljkmgxl');
  xhr.setRequestHeader('client_id', '8l9vm9cnwt8poml5ioqogcnljkmgxl');
  xhr.setRequestHeader('redirect_uri', 'http://localhost');
  xhr.send()
}

function loadTwitch() {
  authTwitch()
  let twitchUserUrl = "https://api.twitch.tv/kraken/streams/followed"

  // Create and send request with XHR
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === xhr.DONE) {
      let result = JSON.parse(xhr.responseText);
      buildTwitchList(result)
    }
  };
  xhr.open("GET", twitchUserUrl);
  xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
  xhr.setRequestHeader('Client-ID', '8l9vm9cnwt8poml5ioqogcnljkmgxl');
  xhr.send();
}



// Initializers
window.onload = function() {
  // Top sites and twitch streams are initialized
  buildBookmarks('1');
  loadTwitch();
  // Time
  getTime();
  setInterval(function() {
    getTime();
  }, 60000);
}

document.addEventListener('DOMContentLoaded', function() {
  // Bind Event Handlers
});
