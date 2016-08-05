function iframeRef( frameRef ) {
    return frameRef.contentWindow
        ? frameRef.contentWindow.document
        : frameRef.contentDocument
}

//var ifr = document.getElementById('meh');
//ifr.src = "http://atx-coder.rsi.global/ui";
//var inside = iframeRef(ifr);

var inp = document.getElementById('rootURI');
inp.value = "hello";
