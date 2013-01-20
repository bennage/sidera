a tower defense style game
==========================

Build
-----

You'll need Node installed. Then you npm to install the build dependencies:
	
	npm install

Next you'll want to setup Grunt (see [Grunt's site](http://gruntjs.com/) for details on that). Then run Grunt:

	grunt

This will use RequireJS to pull all of the modules into a single file. The output will be in a directory called `build`.
To run in a browser, locate `web.html` in the `build` directory and open it.

Stuff
-----
You will need to provide a copy of `require.js` in the source]scripts directory. I did not include it in the repository.

Known Issues
------------
The game runs as a Windows Store app, but it still depends a great deal upon the keyboard.

http://dev.bennage.com
