var sys       = require('sys');
var http      = require('http');
var Chain     = require('./vendor/chain/lib/chain');
var TweetHose = require('./tweet_hose').TweetHose;
var config    = require('./config').configuration;

var tweetHose = new TweetHose(config);

var TweetStreamer = new Chain.Link("Twitter Consumer", {
  onRequest : function(env){
    env.response.sendHeader(200, {"Content-Type" : "text/plain"});

    var twitterListener = function(tweet){
      if (env.request.connection.readyState == "open"){
        sys.puts("Sending tweet " + tweet.id);
        if (tweet.user && tweet.text){
          env.response.sendBody(tweet.user.screen_name + ": " + tweet.text + "\r\n", "utf8");
        } else {
          env.repsonse.sendBody("NO TEXT FOR TWEET" + "\r\n");
        }
      } else {
        // the eof event on the connection is not robust in catching
        // all disconnections.  Insatead check the readyState of the conneciton
        sys.puts("Connection Closed");
        tweetHose.removeListener("newTweet", twitterListener);
        env.response.finish();
      }
    }

    tweetHose.addListener("newTweet", twitterListener);
  }
});

Chain.run(TweetStreamer);
