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