function readProperties() {
    chrome.storage.sync.get(['httpCSP'], function(result) {
        document.getElementById("result").innerHTML += "CSP(http): " + result.httpCSP;
        chrome.storage.sync.get(['metaCSP'], function(result) {
            document.getElementById("result").innerHTML += "\n" + "CSP(meta): " + result.metaCSP;
            chrome.storage.sync.get(['protocol'], function(result) {
                document.getElementById("result").innerHTML += "\n" + "protocol: " + result.protocol;
            });
        });
    });
}
// chrome.tabs.executeScript(null, {"code": "document.body.innerHTML += '<script>fetch(document.location.pathname).then(resp => {alert(resp.type);});</script>'"});
// readProperties();


chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {command: "collectHTMLData"}, function(HTMLresponse) {
        chrome.runtime.sendMessage({command: "collectHTTPData", url: tabs[0].url}, function(HTTPresponse) {
            csp = "";
            if (HTTPresponse.httpCSP.length > 0) {
                csp = HTTPresponse.httpCSP;
            } else if (HTMLresponse.metaCSP.length > 0) {
                csp = HTMLresponse.metaCSP;
            }
            csp_present = false;
            if (csp.length == 0) {
                document.getElementById("CSP").className += " list-group-item-danger";
                document.getElementById("CSP").innerHTML = "CSP: not present";
            } else if (csp.toLowerCase().indexOf("unsafe") !== -1) {
                document.getElementById("CSP").className += " list-group-item-warning";
                document.getElementById("CSP").innerHTML = "CSP: using unsafe";
                csp_present = true;
            } else {
                document.getElementById("CSP").className += " list-group-item-success";
                document.getElementById("CSP").innerHTML = "CSP: present";
                csp_present = true;
            }
            if (HTMLresponse.protocol === "https") {
                document.getElementById("protocol").className += " list-group-item-success";
                document.getElementById("protocol").innerHTML = "Protocol: HTTPS";
            } else if (HTMLresponse.protocol === "http") {
                document.getElementById("protocol").className += " list-group-item-danger";
                document.getElementById("protocol").innerHTML = "Protocol: HTTP";
            } else {
                document.getElementById("CSP").className += " list-group-item-warning";
                document.getElementById("protocol").innerHTML = "Protocol: " + HTMLresponse.protocol.toUpperCase();
            }
            if (HTTPresponse.HSTS.length > 0) {
                document.getElementById("HSTS").className += " list-group-item-success";
                document.getElementById("HSTS").innerHTML = "HSTS: enabled";
            } else {
                document.getElementById("HSTS").className += " list-group-item-warning";
                document.getElementById("HSTS").innerHTML = "HSTS: not enabled";
            }
            if (HTTPresponse.XFO.length > 0) {
                document.getElementById("XFO").className += " list-group-item-success";
                document.getElementById("XFO").innerHTML = "X-Frame-Options: present";
            } else if (csp_present && csp.toLowerCase().indexOf("frame-ancestors") !== -1) {
                document.getElementById("XFO").className += " list-group-item-success";
                document.getElementById("XFO").innerHTML = "X-Frame-Options: protected by CSP";
            } else {
                document.getElementById("XFO").className += " list-group-item-danger";
                document.getElementById("XFO").innerHTML = "X-Frame-Options: not present";
            }
            // document.getElementById("result").innerHTML += "\n" + "protocol: " + HTMLresponse.protocol;
        });
    });
});

