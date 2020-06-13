function fetchWebmentions(url) {
  if (!document.getElementById('webmentions')) {
    return;
  }
  if (!url) {
    url = document.location.origin + document.location.pathname;
  }
  const targets = getUrlPermutations(url);

  var script = document.createElement('script');
  var src =
    'https://webmention.io/api/mentions?perPage=50&jsonp=parseWebmentions';
  targets.forEach(function(targetUrl) {
    src += `&target[]=${encodeURIComponent(targetUrl)}`;
  });
  src += `&_=${Math.random()}`;
  script.src = src;
  script.async = true;
  document.getElementsByTagName('head')[0].appendChild(script);
}

function getUrlPermutations(url) {
  const urls = [];
  url = url.replace('http://localhost:4000', 'https://butteraddict.fun');
  urls.push(url);
  urls.push(url.replace('https://', 'http://'));
  if (url.substr(-1) === '/') {
    var noslash = url.substr(0, url.length - 1);
    urls.push(noslash);
    urls.push(noslash.replace('https://', 'http://'));
  }
  return urls;
}

function parseWebmentions(data) {
  var links = data.links.sort(wmSort);
  var wms = [];
  links.map(function(l) {
    if (!l.activity || !l.activity.type) {
      console.warning('unknown link type', l);
      return;
    }
    if (!l.verified) {
      return;
    }
    wms.push(l);
  });
  renderWMs(wms);
}
window.parseWebmentions = parseWebmentions;

function wmSort(a, b) {
  const dateA = getWmDate(a);
  const dateB = getWmDate(b);
  if (dateA < dateB) {
    return -1;
  } else if (dateB < dateA) {
    return 1;
  }
  return 0;
}

function getWmDate(webmention) {
  if (webmention.data.published) {
    return new Date(webmention.data.published);
  }
  return new Date(webmention.verified_date);
}

function getHostName(url) {
  var a = document.createElement('a');
  a.href = url;
  return (a.hostname || '').replace('www.', '');
}


function renderWMs(wms) {

  var t = document.getElementById('wm-template').content;
  var list = document.getElementById('webmentions');
  if (wms.length !== 0) {
    var nowm = document.getElementById('default-noWM');
    nowm.parentNode.removeChild(nowm);
  }
  wms.map(function(l) {
    let data;
    switch (l.activity.type){
      case 'like':
        if (l.data.author) {
          data = {
            name: l.data.author.name,
            url: l.data.url,
            content: 'Liked this post.',
          };
        } else {
          data = {
            name: getHostName(l.data.url) || 'inbound link',
            url: l.data.url,
            content: 'Liked this post.',
          };
        }
        break;
      case 'repost':
        if (l.data.author) {
          data = {
            name: l.data.author.name,
            url: l.data.url,
            content: 'Made a repost.',
          };
        } else {
          data = {
            name: getHostName(l.data.url) || 'inbound link',
            url: l.data.url,
            content: 'Made a repost.',
          };
        }
        break;
      case 'link':
        if (l.data.author) {
          data = {
            name: l.data.author.name,
            url: l.data.url,
            content: 'Linked to this post.',
          };
        } else {
          data = {
            name: getHostName(l.data.url) || 'inbound link',
            url: l.data.url,
            content: 'Linked to this post.',
          };
        }
        break;
      default:
        if (l.data.author) {
          data = {
            name: l.data.author.name,
            url: l.data.url,
            content: l.data.content,
          };
        } else {
          data = {
            name: getHostName(l.data.url) || 'inbound link',
            url: l.data.url,
            content: l.data.content,
          };
        }
        break;
    }

    fillTemplate(t, data);
    var clone = document.importNode(t, true);
    list.appendChild(clone);
  });
}

function fillTemplate(template, vals) {
  template.querySelector('.js-author-name').href = vals.url;
  template.querySelector('.js-author-name').innerHTML = vals.name;
  template.querySelector('.js-content').innerHTML = vals.content;
}

fetchWebmentions();
