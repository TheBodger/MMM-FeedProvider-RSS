//this loads feeds depending on its config when called to from the main module
//to minimise activity, it will track what data has been already sent back to the module
//and only send the delta each time

//this is done by making a note of the last published data of feeds sent to the module tracked at the feed level
//and ignoring anything older than that

//as some feeds wont have a published date, they will be allocated a pseudo published date of the latest published date in the current processed feeds

//if the module calls a RESET, then the date tracking is reset and all data will be sent 

//nodehelper stuff:
//this.name String The name of the module

var NodeHelper = require("node_helper");
var moment = require("moment");

var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

//pseudo structures for commonality across all modules
//obtained from a helper file of modules

var LOG = require('./LOG');
var RSS = require('./RSS');
var QUEUE = require('./queueidea');
var rsssource = new RSS.RSSsource();

// local variables, held at provider level as this is a common module

var providerstorage = {};

var trackingfeeddates = []; //an array of last date of feed recevied, one for each feed in the feeds index, build from the config
var aFeed = { lastFeedDate: '', feedURL: '' };

var payloadformodule = []; //we send back an array of identified stuff
var payloadstuffitem = { stuffID: '', stuff: '' }

var latestfeedpublisheddate = new Date(0) // set the date so no feeds are filtered, it is stored in providerstorage

module.exports = NodeHelper.create({

	start: function () {
		console.log(this.name + ' node_helper is started!');
		this.logger = {};
		this.logger[null] = LOG.createLogger("logs/logfile_Startup" + ".log", this.name);
		this.queue = new QUEUE.queue("single",false);
	},

	showElapsed: function () {
		endTime = new Date();
		var timeDiff = endTime - startTime; //in ms
		// strip the ms
		timeDiff /= 1000;

		// get seconds 
		var seconds = Math.round(timeDiff);
		return (" " + seconds + " seconds");
	},

	stop: function () {
		console.log("Shutting down node_helper");
		//this.connection.close();
	},

	setconfig: function (moduleinstance, config) {

		this.logger[moduleinstance].info("In setconfig: " + moduleinstance + " " + config);

		//store a local copy so we dont have keep moving it about

		providerstorage[moduleinstance] = { config: config, trackingfeeddates: [] };

		var self = this;

		//process the feed details into the local feed tracker

		providerstorage[moduleinstance].config.feeds.forEach(function (configfeed) {

			//console.log(configfeed); 

			var feed = { sourcetitle: '', lastFeedDate: '', feedURL: '', latestfeedpublisheddate: new Date(0) };

			//store the actual timestamp to start filtering, this will change as new feeds are pulled to the latest date of those feeds
			//if no date is available on a feed, then the current latest date of a feed published is allocated to it

			feed.lastFeedDate = self.calcTimestamp(configfeed.oldestAge);
			feed.feedURL = configfeed.feedurl;
			feed.sourcetitle = configfeed.feedtitle;

			providerstorage[moduleinstance].trackingfeeddates.push(feed);

		});

		//console.log("loaded config for provider: " + id);
		//console.log(providerstorage[id].config);
		//console.log("loaded feeds ");
		//console.log(providerstorage[id].trackingfeeddates);

	},

	calcTimestamp: function (age) {

		//calculate the actual timestamp to use for filtering feeds, 
		//options are timestamp format, today for midnight + 0.0001 seconds today, or age in minutes
		//determine the format of the data in age

		var filterDate = new Date();

		if (typeof (age) == 'number') {

			filterDate = new Date(filterDate.getTime() - (age * 60 * 1000));

		}
		else { //age is hopefully a string ha ha

			if (age.toLowerCase() == 'today') {
				filterDate = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 0, 0, 0, 0)
			}

			else { //we assume the user entered a correct date - we can try some basic validation

				if (moment(age, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
					filterDate = new Date(age);
				}
				else {

					console.log(this.name + " Invalid date provided for filter age of feeds:" + age.toString());
				}

			}
		}

		return filterDate;

	},

	getconfig: function () { return config; },

	reset: function (moduleinstance) {

		//clear the date we have been using to determine the latest data pulled for each feed

		//console.log(providerstorage[id].trackingfeeddates);

		providerstorage[moduleinstance].trackingfeeddates.forEach(function (feed) {

			//console.log(feed);

			feed['latestfeedpublisheddate'] = new Date(0);

			//console.log(feed);

		});

		//console.log(providerstorage[moduleinstance].trackingfeeddates);

	},

	socketNotificationReceived: function (notification, payload) {

		var self = this;

		if (this.logger[payload.moduleinstance] == null) {

			this.logger[payload.moduleinstance] = LOG.createLogger("logs/logfile_" + payload.moduleinstance + ".log", payload.moduleinstance);

		};

		this.logger[payload.moduleinstance].info(this.name + " NODE HELPER notification: " + notification + " - Payload: ");
		this.logger[payload.moduleinstance].info(JSON.stringify(payload));

		//we can receive these messages:
		//
		//RESET: clear any date processing or other so that all available stuff is returned to the module
		//CONFIG: we get our copy of the config to look after
		//UPDATE: request for any MORE stuff that we have not already sent
		//

		switch (notification) {
			case "CONFIG":
				this.setconfig(payload.moduleinstance, payload.config);
				break;
			case "RESET":
				this.reset(payload);
				break;
			case "UPDATE":
				//because we can get some of these in a browser refresh scenario, we check for the
				//local storage before accepting the request

				if (providerstorage[payload.moduleinstance] == null) { break; } //need to sort this out later !!
				self.processfeeds(payload.moduleinstance, payload.providerid)
				break;
			case "STATUS":
				this.showstatus(payload.moduleinstance);
				break;
		}

	},

	showstatus: function (moduleinstance) {

		console.log('============================ start of status ========================================');

		console.log('config for provider: ' + moduleinstance);

		console.log(providerstorage[moduleinstance].config);

		console.log('feeds for provider: ' + moduleinstance);

		console.log(providerstorage[moduleinstance].trackingfeeddates);

		console.log('============================= end of status =========================================');

	},

	processfeeds: function (moduleinstance,providerid) {

		var self = this;
		var feedidx = -1;

		this.logger[moduleinstance].info("In processfeeds: " + moduleinstance + " " + providerid);

		providerstorage[moduleinstance].trackingfeeddates.forEach(function (feed) {

			self.logger[moduleinstance].info("In process feed: " + JSON.stringify(feed));
			self.logger[moduleinstance].info("In process feed: " + moduleinstance);
			self.logger[moduleinstance].info("In process feed: " + providerid);
			self.logger[moduleinstance].info("In process feed: " + feedidx);

			self.logger[moduleinstance].info("building queue " + self.queue.queue.length);

			//we have to pass the providerid as we are going async now

			self.queue.addtoqueue(function () {self.fetchfeed(feed, moduleinstance, providerid, ++feedidx); });

		});

		this.queue.startqueue(providerstorage[moduleinstance].config.waitforqueuetime);

	},

	sendNotificationToMasterModule: function (stuff, stuff2) {
		this.sendSocketNotification(stuff, stuff2);
	},

	getParams: function (str) {

		var params = str.split(';').reduce(function (params, param) {

			var parts = param.split('=').map(function (part) { return part.trim(); });

			if (parts.length === 2) {

				params[parts[0]] = parts[1];

			}

			return params;

		}, {});

		return params;

	},

	done: function (err) {

		if (err) {

			console.log(err, err.stack);

		}

	},

	send: function (moduleinstance, providerid, source, feeds) {

		var payloadforprovider = { providerid: providerid, source: source, payloadformodule: feeds.items }

		//console.log(payloadforprovider.title);
		this.logger[moduleinstance].info("In send, source, feeds // sending items this time: " + (feeds.items.length > 0));
		this.logger[moduleinstance].info(JSON.stringify(source));
		this.logger[moduleinstance].info(JSON.stringify(feeds));

		if (feeds.items.length > 0) {

			this.sendNotificationToMasterModule("UPDATED_STUFF_" + moduleinstance, payloadforprovider);

		}

		this.queue.processended();

	},

	fetchfeed: function (feed, moduleinstance, providerid, feedidx) {

		this.logger[moduleinstance].info("In fetch feed: " + JSON.stringify(feed));
		this.logger[moduleinstance].info("In fetch feed: " + moduleinstance);
		this.logger[moduleinstance].info("In fetch feed: " + providerid);
		this.logger[moduleinstance].info("In fetch feed: " + feedidx);

		var rssitems = new RSS.RSSitems();

		//use these in the feedparser area
		var sourcetitle = feed.sourcetitle;
		var feedurl = feed.feedURL;

		var self = this;

		//Define our streams
		//each one is unique to hopefully stop dodgy async stuff hitting us

		var req = 'req_';
		var req = request(feed.feedURL, { timeout: 10000, pool: false });

		//console.log("about to process req: ");

		req.setMaxListeners(50);

		// Some feeds do not respond without user-agent and accept headers.

		req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
		req.setHeader('accept', 'text/html,application/xhtml+xml');

		var feedparser = 'feedparser_';

		var feedparser = new FeedParser();

		// Define our handlers

		req.on('error', self.done);

		//console.log("about to action the request");

		req.on('response', function (res) {

			if (res.statusCode != 200) return self.emit('error', new Error('Bad status code'));

			var charset = self.getParams(res.headers['content-type'] || '').charset;

			//res = maybeTranslate(res, charset);

			self.logger[moduleinstance].info("res: " + res);

			res.pipe(feedparser);

		});

		var maxfeeddate = new Date(0);

		feedparser.on('error', self.done);

		feedparser.on('end', function () {
			
			self.logger[moduleinstance].info("feedparser end: " + feedparser.title);

			if (new Date(0) < maxfeeddate) {
				providerstorage[moduleinstance].trackingfeeddates[feedidx]['latestfeedpublisheddate'] = maxfeeddate;
			}

			self.send(moduleinstance, providerid, rsssource, rssitems);
			self.done();
		});

		feedparser.on('meta', function (meta) {
			
			self.logger[moduleinstance].info("feedparser meta: " + feedparser.meta.title);

			rsssource.title = meta.title;
			rsssource.sourcetitle = sourcetitle;
			rsssource.url = feedurl;

		});

		feedparser.on('readable', function () {

			self.logger[moduleinstance].info("feedparser readable: " + feedparser.meta.title);

			var post;

			var rssarticle = new RSS.RSSitem();

			while (post = this.read()) {

				self.logger[moduleinstance].info("feedparser post read: " + JSON.stringify(post));

				//ignore any feed older than feed.lastFeedDate or older than the last feed sent back to the modules
				//feed without a feed will be given the current latest feed data

				//because the feeds can come in in reverse date order, we only update the latest feed date at the end in send

				if (post.pubdate >= feed.lastFeedDate && post.pubdate > feed.latestfeedpublisheddate) {

					rssarticle.id = rssarticle.gethashCode(post.title);
					rssarticle.title = post.title;

					if (post.pubdate == null) {
						rssarticle.pubdate = feed['latestfeedpublisheddate'];
						console.log("Article missing a date - so used: " + feed['latestfeedpublisheddate']);
					}
					else {
						rssarticle.pubdate = post.pubdate;
						maxfeeddate = new Date(Math.max(maxfeeddate, post.pubdate));
					}

					rssarticle.description = post.description;
					rssarticle.age = rssarticle.getage(new Date(), rssarticle.pubdate); //in microseconds
					rssarticle.categories = post.categories;

					//go find an image
					//1. they actually provided an image
					//2. no image but there is an enclosure that may have multiple images, we just use the first one if present
					//3. look in the description for some html img looking stuff

					rssarticle.imageURL = post.image.url;

					if (rssarticle.imageURL == null) {

						if (post.enclosures.length > 0) {

							rssarticle.imageURL = post.enclosures[0].url;

						}
						else {

							rssarticle.imageURL = rssarticle.getimagefromhtml(post.description);

						}

					}

					rssitems.items.push(rssarticle);

				}

			}

			//console.log("finished reading");

		});

	},

});