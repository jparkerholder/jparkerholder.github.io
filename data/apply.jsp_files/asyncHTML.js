
function setElementContent(id, content) {
    document.getElementById(id).innerHTML = content;
}

function evalElementScripts(id) {
    var element = document.getElementById(id);
    var x = element.getElementsByTagName("script");
    for (var i = 0; i < x.length; i++) {
        eval(x[i].text);
    }
}