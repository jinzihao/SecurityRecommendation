const networkFilters = {
    urls: [
        "<all_urls>"
    ],
};

httpCSP = "";
httpCSPDict = [];
hsts = "";
hstsDict = [];
xfo = "";
xfoDict = [];

chrome.webRequest.onHeadersReceived.addListener(function(details) {
    chrome.tabs.query({"highlighted": true}, function(tabs) {
        if (tabs.length === 1) {
            if (tabs[0].url === details.url) {
                csp_found = false;
                hsts_found = false;
                xfo_found = false;
                for (var i = 0; i < details.responseHeaders.length; ++i) {
                    if (!csp_found && details.responseHeaders[i]["name"].toUpperCase() === 'CONTENT-SECURITY-POLICY') {
                        httpCSP = details.responseHeaders[i]["value"];
                        csp_found = true;
                    } else if (!hsts_found && details.responseHeaders[i]["name"].toUpperCase() === 'STRICT-TRANSPORT-SECURITY') {
                        hsts = details.responseHeaders[i]["value"];
                        hsts_found = true;
                    } else if (!xfo_found && details.responseHeaders[i]["name"].toUpperCase() === 'X-FRAME-OPTIONS') {
                        xfo = details.responseHeaders[i]["value"];
                        xfo_found = true;
                    }
                }
                httpCSPDict[details.url] = httpCSP;
                hstsDict[details.url] = hsts;
                xfoDict[details.url] = xfo;
            }
        }
    });
}, networkFilters, ["responseHeaders"]);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.command === "collectHTTPData") {
            sendResponse({"httpCSP": httpCSPDict[request.url], "HSTS": hstsDict[request.url], "XFO": xfoDict[request.url]});
        }
    }
);

