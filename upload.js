const yt = require("youtube-api"), 
      fs = require("fs"), 
      rj = require("r-json"), 
      li = require("lien"), 
      logger = require("bug-killer"), 
      opn = require("opn"), 
      pb = require("pretty-bytes");
const creds = rj(`creds.json`);
let server = new li({
    host: "localhost", 
    port: 5000
});
let oauth = yt.authenticate({
    type: "oauth",
    client_id: creds.web.client_id,
    client_secret: creds.web.client_secret,
    redirect_url: creds.web.redirect_uris[0]
});
opn(oauth.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.upload"]
}));
server.addPage("/oauth2callback", lien => {
    logger.log("Trying to get the token");
    oauth.getToken(lien.query.code, (err, tokens) => {
        if (err) {
            lien.end(err, 400);
            return logger.log(err);
        }
        logger.log("Token scquired.");
        oauth.setCredentials(tokens);
        lien.end("The video is being uploaded.");
        var req = yt.videos.insert({
            resource: {
                snippet: {
                    title: "BreakInterview Test",
                    description: "Internship Test for BreakInterview"
                },
                status: {
                    privacyStatus: "private"
                }
            },
            part: "Status",
            media: {
                body: fs.createReadStream("video.mp4")
            }
        }, (err, data) => {
            console.log("Upload complete");
            process.exit();
        });
        setInterval(function () {
            logger.log(`${pb(req.req.connection._bytesDispatched)} Uploaded.`);
        }, 250);
    });
});