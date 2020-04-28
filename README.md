# MMM-FeedProvider-RSS Module

This magic mirror module is a MMM-FeedProvider module that is part of the the MMM-Feedxxx interrelated modules.

For an overview of these modules see the README.md in https://github.com/TheBodger/MMM-FeedDisplay.

the -RSS module will monitor and format any RSS (1,2,Atom) compatible feed items it is configured to get. It will extract text and the first Image that is embbeded within the Feed

### Example
![Example of MMM-FeedProvider-RSS output](images/screenshot.png?raw=true "Example screenshot")

### Dependencies
The following node modules are required: See https://github.com/TheBodger/MMM-FeedUtilities for a simple install process for all MMM-Feedxxx modules and dependencies

```
moment
feedparser
request
```

## Installation
To install the module, use your terminal to:
1. Navigate to your MagicMirror's modules folder. If you are using the default installation directory, use the command:<br />`cd ~/MagicMirror/modules`
2. Clone the module:<br />`git clone https://github.com/TheBodger/MMM-FeedProvider-RSS`

## Using the module

### MagicMirror² Configuration

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js

		{
			module: "MMM-FeedProvider-RSS",
			config: {
				text: "MMM-FeedProvider-RSS",
				id: "mmfp-rss",
				consumerids: ["MMFD1"],
				feeds: [
					{ feedname: 'bbc_world', feedtitle: 'BBC ', feedurl: 'https://feeds.bbci.co.uk/news/world/rss.xml', oldestage: 'today' },
					{ feedname: 'elle2', feedtitle: 'elle', feedurl: 'https://www.elle.com/rss/all.xml/', oldestage: 24 * 1 * 60 },
					{ feedname: 'reddit', feedtitle: 'mkup', feedurl: 'https://www.reddit.com/r/makeupaddiction/.rss?format=xml', oldestage: '2020-04-01 00:00:00' },
				],
				datarefreshinterval: 15000,
			}
		},

```

### Configuration Options

| Option                  | Details
|------------------------ |--------------
| `text`                | *Optional* - 
| `consumerids`            | *Required* - a list of 1 or more the id of the consumer(s) to listen out for and return the articles found. <br><br> **Possible values:** A string exaclty matching the consumerids set in MMM-FeedDisplay <br> **Default value:** none
| `id`         | *Required* - Show completed task items <br><br> **Possible values:** `true`  `false` <br> **Default value:** `false`
| `datarefreshinterval`            | *Optional* - milliseconds to pause before checking for new data  <br><br> **Possible values:** ) <br> **Default value:** `MMM Do` (e.g. Jan 18th)
| `feeds`        | *required* - See below for the feeds format
| `waitforqueuetime`            |*Ignore* -  Name of the classes issued from `main.css`. <br><br> **Possible values:** xsmall, small, medium, large, xlarge. <br> **Default value:** _small_
| `Feeds Format`            |
| `feedname`            |*Required* -  Name of the feed for reference purposes<br><br> **Possible values:** Any unique string. <br> **Default value:** none
| `feedtitle`            |*Required* -  Title of the feed that will be displayed as the source if enabled in the MMM-FeedDisplay output.<br><br> **Possible values:** Any unique string. <br> **Default value:** none
| `feedurl`            |*Required* -  URL of the RSS feed <br><br> **Possible values:** xsmall, small, medium, large, xlarge. <br> **Default value:** _small_
| `oldestage`            |*Required* -  A filter on the "age" of an article. <br><br> **Possible values:** 'today', a number of minutes, a valid date(See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/). <br> **Default value:** none


		text: "MMM-FeedProvider-RSS",
		consumerids: ["MMFD1"], // the unique id of the consumer(s) to listen out for
		id: "MMFP1", //the unique id of this provider
		datarefreshinterval: 5000,	//milliseconds to pause before checking for new data // common timer for all consumers
									//tune to keep queue from clogging up
		//feeds:
		//oldestage:	indicates how young a feed must be to be considered either ,
		//				a timestamp, must be in YYYY-MM-DD HH:MM:SS format to be accepted (use moments to validate)
		//				the word today for midnight today, 
		//				the number of minutes old as an integer
		
		feeds: [
			{ feedname: 'BBC', feedtitle: 'World news from the BBC', feedurl: 'https://www.bbc.co.uk', oldestage: '2020-04-01 00:00:01' },
			{ feedname: 'ITV', feedtitle: 'Local news from the ITV', feedurl: 'https://www.itv.co.uk', oldestage: 'today' },
			{ feedname: 'C4', feedtitle: 'Nice news from the Channel 4', feedurl: 'https://www.c4.co.uk', oldestage: 200 },
		],
		waitforqueuetime: 0010, //dont change this - it simply helps the queue processor to run with a controlled internal loop