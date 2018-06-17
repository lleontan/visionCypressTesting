# visionCypressTesting
Contains a Google Vision http server running on webrick and misc cypress testing scripts.

Cypress tests are located in cypress/integration/
1. basic_reddit_spec.js does some basic should() testing on old.reddit.com
1. gVision_spec.js does testing for the googleVisionServer.

To run the server on http://localhost:4536/
1. "ruby webBrickServer.rb" in your console.
