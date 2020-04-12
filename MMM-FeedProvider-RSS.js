//\MMM-FeedProvider-RSS.js

var startTime = new Date();

var feedDisplayPayload = { consumerid: '', providerid: '', payload: '' };

var providerstorage = {};
var providerconfigs = [];

var trackingStuffEntry = { stuffID:'', consumerids:[], actualstuff: '' }; //format of the items that we need to track to see if we need to send them back again
//var trackingStuff = {};

//var trackingconsumerids = [];

var consumerpayload = { consumerid: '', stuffitems: [] };
var consumerpayloads = {};

// all stored data has to be at the providerid level otherwise it will get overwritten as other modules are run (this is async, multi use code)

// as this needs to track what has been sent then 

// need to store some kind of shortened representaion of each individual stuff (or group of stuff?) as a key or ID
// then as each stuff is sent back to each consumer, the consumer key (as an index into the trackingconsumerids) is added to the
// stuff so it isn't sent again

// when we get the start message we need to clear all tracking information as the consumer may resend a start message

Module.register("MMM-FeedProvider-RSS", {

	// Default module config.
	defaults: {
		text: "MMM-FeedProvider-RSS",
		consumerids: ["MMFD1"], // the unique id of the consumer(s) to listen out for
		id: "MMFP1", //the unique id of this provider
		datarefreshinterval: 5000, //milliseconds to pause before checking for new data // common timer for all consumers
		//feeds:
		//oldestAge:	indicates how young a feed must be to be considered either ,
		//				a timestamp, must be in YYYY-MM-DD HH:MM:SS format to be accepted (use moments to validate)
		//				the word today for midnight today, 
		//				the number of minutes old as an integer
		
		feeds: [
			{ feedname: 'BBC', feedtitle: 'World news from the BBC', feedurl: 'https://www.bbc.co.uk', oldestAge: '2020-04-01 00:00:01' },
			{ feedname: 'ITV', feedtitle: 'Local news from the ITV', feedurl: 'https://www.itv.co.uk', oldestAge: 'today' },
			{ feedname: 'C4', feedtitle: 'Nice news from the Channel 4', feedurl: 'https://www.c4.co.uk', oldestAge: 200 },
		]
	},

	//this.name String The name of the module.
	//this.identifier String This is a unique identifier for the module instance.
	//this.hidden Boolean This represents if the module is currently hidden(faded away).
	//this.config Boolean The configuration of the module instance as set in the user's config.js file. This config will also contain the module's defaults if these properties are not over- written by the user config.
	//this.data Object The data object contain additional metadata about the module instance. (See below)

	//The this.data data object contain the following metadata:
	//	data.classes - The classes which are added to the module dom wrapper.
	//	data.file - The filename of the core module file.
	//	data.path - The path of the module folder.
	//	data.header - The header added to the module.
	//	data.position - The position in which the instance will be shown.

	start: function () {

		Log.log(this.name + ' is started!');

		//this.updateDom(speed)
		//speed Number - Optional.Animation speed in milliseconds.
		//Whenever your module need to be updated, call the updateDom(speed) method.

		//var trackingconsumerids = [];
		//var trackingStuffEntry = { stuffID: '', consumerids: [], actualstuff: '' };
		//providerstorage[this.config.id] = {'trackingconsumerids': trackingconsumerids, 'trackingStuff':trackingStuff}

		//providerconfigs[this.config.id] = this.config;

		providerstorage[this.config.id] = {'trackingconsumerids': [], 'trackingStuff': {} }

		this.sendNotificationToNodeHelper("CONFIG", { moduleinstance: this.identifier, config: this.config });
		this.sendNotificationToNodeHelper("STATUS", { moduleinstance: this.identifier });

	},

	showElapsed: function () {
		endTime = new Date();
		var timeDiff = endTime - startTime; //in ms
		// strip the ms
		timeDiff /= 1000;

		// get seconds 
		var seconds = Math.round(timeDiff);
		return(" " + seconds + " seconds");
	},

	myconsumer: function (consumerid) {

		//check if this is one of  my consumers

		if (this.config.consumerids.indexOf(consumerid) >= 0) {
			return true;
		}

		return false;

	},

	notificationReceived: function (notification, payload, sender) {

		if (sender) {
			Log.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name);
		} else {
			Log.log(this.name + " received a system notification: " + notification);
		}

		//this.sendNotification(notification, payload)
		//notification String - The notification identifier.
		//payload AnyType - Optional.A notification payload.
		//If you want to send a notification to all other modules, use the sendNotification(notification, payload).All other modules will receive the message via the notificationReceived method.In that case, the sender is automatically set to the instance calling the sendNotification method.


		//if we get a notification that there is a consumer out there, if it one of our consumers, start processing
		//and mimic a response - we also want to start our cycles here - may have to handle some case of multipel restarts to a cycle
		//when we get multiple consumers to look after

		if ((notification == 'MMM-FeedDisplay_READY_FOR_ACTION' || notification == 'MMM-FeedDisplay_SEND_MORE_DATA') && this.myconsumer(payload.consumerid)){

			var self = this

			//clear all the tracking data for this consumer
			//var trackingStuffEntry = { stuffID: '', consumerids: [], actualstuff: '' };

			for (var key in providerstorage[self.config.id]['trackingStuff']) {

				stuffitem = providerstorage[self.config.id]['trackingStuff'][key];

				if (stuffitem['consumerids'].indexOf(payload.consumerid) > -1) {
					providerstorage[self.config.id]['trackingStuff'][key]['consumerids'].splice(stuffitem['consumerids'].indexOf(payload.consumerid),1);
				}

			}

			//store the consumer id so we know who to send data to in future
			//if we havnt already stored it

			if (providerstorage[this.config.id]['trackingconsumerids'].indexOf(payload.consumerid)==-1) {
				providerstorage[this.config.id]['trackingconsumerids'].push(payload.consumerid);
			}

			//now we need to use our nice little nodehelper to get us the stuff - be aware this is async and we migh hit twisty nickers

			// tell the nodehlper to reset all data and give the node helper a config

			//so here we are and we want to use the timer to go do stuff, but this is tied to a common area: the config
			//which is only unique depending on who gets it
			//so do we need to have different timers ?
			//will this muck up the feeds list we are using for each "instance"

			//providerconfigs[this.config.id] = this.config;

			//initial request
			self.sendNotificationToNodeHelper("UPDATE", { moduleinstance: self.identifier, providerid: self.config.id });

			setInterval(function () {

				//within this loop, we request an update from the node helper

				self.sendNotificationToNodeHelper("UPDATE", { moduleinstance: self.identifier, providerid: self.config.id } );

			}, this.config.datarefreshinterval); //perform every ? milliseconds.

		}

	},

	//ALL_MODULES_STARTED - All modules are started.You can now send notifications to other modules.
	//DOM_OBJECTS_CREATED - All dom objects are created.The system is now ready to perform visual changes.
	//MODULE_DOM_CREATED - This module 's dom has been fully loaded. You can now access your module's dom objects.

	//When using a node_helper, the node helper can send your module notifications.When this module is called, it has 2 arguments:
	//notification - String - The notification identifier.
	//payload - AnyType - The payload of a notification.

	sleep: function (milliseconds) {
		const date = Date.now();
		let currentDate = null;
		do {
			currentDate = Date.now();
		} while (currentDate - date < milliseconds);
	},

	socketNotificationReceived: function (notification, nhpayload) {

		// as there is only one node helper for all instances of this module
		// we have to filter any responses that are not for us by checking this.identifier

		//console.log(this.name + " received a socket notification: " + notification + " - Payload: " + nhpayload);

		var self = this;

		//here we are getting an update from the node helper which has sent us 0 to many new data
		//we will have to store this data as a key so we can determine who got a copy and send everything as required

		if (notification == "UPDATED_STUFF_" + this.identifier) {

			//clear the consumer payloads that have been built previously

			consumerpayloads = {};

			// payload is an array of RSS 2.0 items, with the outer {} removed so we can process it using 
			// simple javascript not needing json at this stage
			// each item has a unique id created by the node helper
			// each payload returned is flagged with the provider id who requested it
			// the node helper uses a date on an item to determine which ones to send
			// so we have to assume that we wont get duplicates - maybe can add checking laters

			nhpayload.payloadformodule.forEach(function (stuffitem) {

				//create a new stuff entry and add to the tracking data

				var tse = { stuffID: stuffitem.id, consumerids: [], actualstuff: stuffitem };

				providerstorage[nhpayload.providerid]['trackingStuff'][stuffitem.id] = tse;

			});

			// now we send any new data to the consumer 
			// once a stuff item data has been sent to all consumers, we are asked to supply to, we remove 
			// it from the list, reducing the amount of processing required

			// but first lets send the data and track it with the consumerid we are sending it to

			//trackingStuff.forEach(function (stuffitem) {

			for (var key in providerstorage[nhpayload.providerid]['trackingStuff']) {

				stuffitem = providerstorage[nhpayload.providerid]['trackingStuff'][key];

				// assume we are processing stuff that might not have been sent to everyone yet
				// we will be creating a payload for each consumer as a single blob of mulitple stuff items
				// send this data to anyone who hasnt received it yet

				//look at each consumer we are tracking

				providerstorage[nhpayload.providerid]['trackingconsumerids'].forEach(function (trackingconsumerid) {

					//can we find this consumer in the list of consumers we have already sent this stuff to ?

					if (stuffitem['consumerids'].indexOf(trackingconsumerid) == -1) {

						self.addtopayload(trackingconsumerid, stuffitem.actualstuff) //we assume when we add it to the payload and send it it goes!!

						providerstorage[nhpayload.providerid]['trackingStuff'][stuffitem.stuffID]['consumerids'].push(trackingconsumerid); //and track we have sent this item to this consumer

					}
					
				});

			};

			//now send the payloads based on the payload contents

			//consumerpayloads.forEach(function (payload) {

			for (var key in consumerpayloads) {

				//for some reason we get a length key here, so we need to ignore it

				if (!(key == 'length')) {

					payload = consumerpayloads[key];

					//var feedDisplayPayload = { consumerid: '', providerid: '', payload: '' };

					var fdp = { consumerid: '', providerid: '', title: '', sourcetitle: '', payload: '' };

					fdp.consumerid = payload.consumerid;
					fdp.providerid = nhpayload.providerid;
					fdp.title = nhpayload.source.title;
					fdp.sourcetitle = nhpayload.source.sourcetitle;
					fdp.payload = payload.stuffitems;

					//console.log(this.identifier + "  >>>>>> Sending data: " + fdp.title + " " + fdp.consumerid + " " + fdp.providerid + " " + payload.stuffitems.length);

					this.sendNotification('FEED_PROVIDER_DATA', fdp);
				}

			};

			//and finally clear out anything that has already been sent to everyone
			//we base this on the count of consumerids making it a bit quicker

			//trackingStuff.forEach(function (stuffitem) {

			for (var key in providerstorage[nhpayload.providerid]['trackingStuff']) {

				stuffitem = providerstorage[nhpayload.providerid]['trackingStuff'][key];

				if (stuffitem.consumerids.length == this.config.consumerids.length) {

					delete providerstorage[nhpayload.providerid]['trackingStuff'][key];

				}

			};

		}

	},

	addtopayload: function (consumerid, stuff) {
		//build a new payload for each consumer that contains everything that needs to be sent
		//in the next update

		//check that the consumer has been added or not
		//if not add them and their data to their payload

		//due to weird javascript stuff, we have to hardcode a clear of the variable to ensure it works correctly

		//cpl = consumerpayload

		cpl = { consumerid: '', stuffitems: [] };

		if (!consumerpayloads[consumerid]) {

			cpl['consumerid'] = consumerid;
			cpl['stuffitems'].push(stuff);

			consumerpayloads[consumerid] = cpl;

		}
		else {

			//we have a payload being built for this consumer so just add the stuff to send to the  existing list

			consumerpayloads[consumerid]['stuffitems'].push(stuff);

		}

	},

	//// Override dom generator.
	//getDom: function () {
	//	Log.log("Hello from getdom @" + this.showElapsed());
	//	var wrapper = document.createElement("div");
	//	wrapper.innerHTML = this.config.text;
	//	return wrapper;
	//},

	//this.sendSocketNotification(notification, payload)
	//notification String - The notification identifier.
	//payload AnyType - Optional.A notification payload.
	//If you want to send a notification to the node_helper, use the sendSocketNotification(notification, payload).
	//Only the node_helper of this module will receive the socket notification.

	sendNotificationToNodeHelper: function (notification,payload) {
		this.sendSocketNotification(notification,payload);
	},

	doSomeTranslation: function () {
		var timeUntilEnd = moment(event.endDate, "x").fromNow(true);
		this.translate("RUNNING", { "timeUntilEnd": timeUntilEnd });

		// Will return a translated string for the identifier RUNNING, replacing `{timeUntilEnd}` with the contents of the variable `timeUntilEnd` in the order that translator intended.
	},

});

