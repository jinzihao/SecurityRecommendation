chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.command === "collectHTMLData") {
            metaCSP = "";
            document.querySelectorAll('meta').forEach(function(node) {
                if (node.getAttribute('http-equiv') !== null &&
                    node.getAttribute('http-equiv').toUpperCase() === 'CONTENT-SECURITY-POLICY') {
                    metaCSP = node.getAttribute('content');
                    flag = true;
                    return; // Only the first CSP definition is effective
                }
            });
            sendResponse({"protocol": document.URL.split("://")[0],
                "metaCSP": metaCSP});
        }
    }
);

