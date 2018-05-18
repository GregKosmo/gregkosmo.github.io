var navBar = document.getElementById("navBar");
var modal = document.getElementById("modal");
var menuItems = navBar.getElementsByClassName("menuItem");
var firstToggle = true;
var toggled = false;
var settings = {};

init = function() {
  if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {

        }, function(err) {
          console.log(err);
      });
    });
  }

  if(window.innerWidth > 768) {
    for(var i = 0; i < menuItems.length; i++) {
      var menuItem = menuItems[i];
      menuItem.removeAttribute("style");
    }
    
  } else {
    for(var i = 0; i < menuItems.length; i++) {
      var menuItem = menuItems[i];
      menuItem.setAttribute("style", "display: none");
    }
  }
}

init();

var toggleMenu = function() {
  for(var i = 0; i < menuItems.length; i++) {
    var menuItem = menuItems[i];

    if(menuItem.hasAttribute("style")) {
      menuItem.removeAttribute("style");
      modal.removeAttribute("style");
      toggled = true;
    } else {
      menuItem.setAttribute("style", "display: none");
      modal.setAttribute("style", "display: none");
      toggled = false;
    }
  }
}

var getSettings = function() {
  if(!settings) {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", "https://www.gregorykosmacek.com/settings.json")
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xobj.status == "200") {
        settings = xhr.responseText;
      }
    }
    xhr.send();
  }
  return settings
}

var getCss = function(rootDir) {
  return rootDir + "styles.min.css?ver=" + getSettings().cssVersion;
}

var getJs = function(rootDir) {
  return rootDir + "main.js?ver=" + getSettings().jsVersion;
}

var twitter = function() {
  window.open("https://twitter.com/Greg_Kosmo");
}

var linkedin = function() {
  window.open("https://www.linkedin.com/in/gregory-kosmacek/");
}

var facebook = function() {
  window.open("https://www.facebook.com/gkosmacek");
}

var github = function() {
  window.open("https://github.com/gregkosmo");
}

var youtube = function() {
  window.open("https://www.youtube.com/channel/UC4gwkSiyOf8HR4hq3T9wkvA?view_as=subscriber");
}

var instagram = function() {
  window.open("https://www.instagram.com/greg.kosmo/");
}

var stackoverflow = function() {
  window.open("https://stackoverflow.com/users/8414215/greg-kosmo?tab=profile");
}

window.onresize = function() {
  if(window.innerWidth > 768) {
    for(var i = 0; i < menuItems.length; i++) {
      var menuItem = menuItems[i];
      menuItem.removeAttribute("style");
    }

    modal.setAttribute("style", "display: none");
    firstToggle = true;

  } else {
    if(firstToggle && !toggled) {
      for(var i = 0; i < menuItems.length; i++) {
        var menuItem = menuItems[i];
        menuItem.setAttribute("style", "display: none");
      }

      firstToggle = false;
    }
    if(toggled) {
      modal.removeAttribute("style");
    }
  }
}
toUpperCase = function(fromId, toId) {
    document.getElementById(toId).innerText = document.getElementById(fromId).value.toUpperCase();
}

toLowerCase = function(fromId, toId) {
    document.getElementById(toId).innerText = document.getElementById(fromId).value.toLowerCase();
}

characterCount = function(fromId, toId) {
    var length = document.getElementById(fromId).value.length;
    document.getElementById(toId).innerText = length > 0 ? length : '';
}