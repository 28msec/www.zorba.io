"use strict";

var fs = require("fs");

// The temporary file used for communications.
var tmpfile = phantom.args[0];
// The page .html file to load.
var url = phantom.args[1];
// Extra, optionally overridable stuff.
var options = JSON.parse(phantom.args[2] || {});

// Messages are sent to the parent by appending them to the tempfile.
// NOTE, the tempfile appears to be shared between asynchronously running grunt tasks
var sendMessage = function (arg) {
    var args = Array.isArray(arg) ? arg : [].slice.call(arguments);
    var channel = options.taskChannelPrefix + '.' + args[0];
    args[0] = channel;
    fs.write(tmpfile, JSON.stringify(args) + "\n", "a");
};

var sanitizeHtml = function(html){
    //html += fs.readFileSync(__dirname + "/../olark.html", "UTF-8");
    html += "<script type=\"text/javascript\">location.href = '/#' + location.pathname;</script>";
    return html;
};

var setCookies = function(page, cookies) {
    var added, i;
    for (i=0; i<cookies.length; i++){
        added = page.addCookie(cookies[i]);
    }
};

// This allows grunt to abort if the PhantomJS version isn"t adequate.
sendMessage("private", "version", phantom.version);

// Create a new page.
var page = require("webpage").create();

// Relay console logging messages.
page.onConsoleMessage = function (message) {
    sendMessage("console", message);
};

page.onError = function (msg, trace) {
    sendMessage("error.onError", msg, trace);
};

page.onInitialized = function() {
    if (options.cookies) {
        setCookies(page, options.cookies);
    }
}

page.open(url, function (status) {
    
    if (status == 'success') {

        //that's far from bullet proof. We need to wait a little bit to
        //give the page time to be assembled.
        //We should let the user provider a function to check the html against.
        //If the function returns false we continue waiting and check again until the
        //function returns true or a timeout is hit
        setTimeout(function(){
            var html = page.evaluate(function () {
                return document.all[0].outerHTML;
            });
            sendMessage("htmlSnapshot.pageReady", sanitizeHtml("<!DOCTYPE html>" +  html), url);

            phantom.exit();
        }, options.msWaitForPages);
    }
});

