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

The build uses [almond](https://github.com/jrburke/almond) in place of [RequireJS](http://www.requirejs.org/). The mechanism for putting it in place is a bit bumpy at the moment though.

Known Issues
------------
I plan to make this a Windows 8 app as well. However, it's not currently working. I'll get to that 

http://dev.bennage.com
