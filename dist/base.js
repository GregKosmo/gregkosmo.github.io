var navBar = document.getElementById("navBar");
var modal = document.getElementById("modal");
var menuItems = navBar.getElementsByClassName("menuItem");
var firstToggle = true;
var toggled = false;

init = function() {
  if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js');
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

var navExt = function(location, newWindow) {
  if(newWindow) {
    window.open(location);
  } else {
    window.location.href = location;
  }
}

var navInt = function(page, newWindow) {
  if(newWindow) {
    window.open(config.host + 'dist/' +page + '.html');
  } else {
    window.location.href = config.host + 'dist/' + page + '.html';
  }
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