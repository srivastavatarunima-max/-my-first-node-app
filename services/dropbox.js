const { Dropbox } = require("dropbox");

function getDropboxClient() {
  return new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN
  });
}

module.exports = {
  getDropboxClient
};
