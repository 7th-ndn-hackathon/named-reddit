# named-reddit
This project aims to create a decentralized media aggregation system similiar to Reddit built on top of the Named Data Networking platform.  NDN conveniently supports both the naming and decentralization of such a system.

Please note the current system is a skeleton of the front end.  It uses NDNjs to express interests which are then intercepted with json responses from the `data` folder.  There is a very minimal server skeleton currently.

Overall Goals:
* Support for nested subreddits.  Multi-level nested subreddits allow for subscription to specialized topics.
  * The basic example is a /cars subreddit and /cars/used and /cars/new subreddits.  Higher level subreddits will aggregate media from lower more specialized subreddits.
* Decentralized hosting.  Anyone can start and host their own subreddit.  Subreddit providers sync their content using NDN mechanisms.  No one company controls the entire system thus alleviating system wide censorship.

## Getting Started
1. Install [Node.js](http://nodejs.org)
 - on OSX use [homebrew](http://brew.sh) `brew install node`
 - on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

2. Install these NPM packages globally

    ```bash
    npm install -g bower gulp nodemon
    ```

    >Refer to these [instructions on how to not require sudo](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md)

3. Run `npm install`

### Running in dev mode
 - Run the project with `gulp dev`
 - opens it in a browser and updates the browser with any files changes.

### Building the project
 - Build the optimized project using `gulp build`
 - This create the optimized code for the project and puts it in the build folder
 
 
