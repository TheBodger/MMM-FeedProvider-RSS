# MMM-FeedProvider-RSS Module

This magic mirror module is a MMM-FeedProvider module that is part of the the MMM-Feedxxx interrelated modules.

For an overview of these modules see the README.md in https://github.com/TheBodger/MMM-FeedDisplay.

the -RSS module will monitor and format any RSS (1,2,Atom) compatible feeds it is configured to get. It will extract text and the first Image that is embbeded within a feed item.

### Example
![Example of MMM-FeedProvider-RSS output](images/screenshot.png?raw=true "Example screenshot")

### Dependencies

Before installing this module, use https://github.com/TheBodger/MMM-FeedUtilities to setup the MMM-Feed... dependencies and  install all modules 

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

### MagicMirrorČ Configuration

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js

		{
			module: "MMM-FeedProvider-RSS",
			config: {
				text: "MMM-FeedProvider-RSS",
				id: "mmfp-rss",
				consumerids: ["MMFD1"],
				feeds: [
					{ feedname: 'bbc_world', 
						feedtitle: 'BBC ', 
						feedurl: 'https://feeds.bbci.co.uk/news/world/rss.xml', 
						oldestage: 'today' },
					{ feedname: 'elle2', 
						feedtitle: 'elle', 
						feedurl: 'https://www.elle.com/rss/all.xml/', 
						oldestage: 24 * 1 * 60 },
					{ feedname: 'reddit', 
						feedtitle: 'mkup', 
						feedurl: 'https://www.reddit.com/r/makeupaddiction/.rss?format=xml', 
						oldestage: '2020-04-01 00:00:00' },
				],
				datarefreshinterval: 15000,
			}
		},

```

### Configuration Options

| Option                  | Details
|------------------------ |--------------
| `text`                | *Optional* - <br><br> **Possible values:** Any string.<br> **Default value:** The Module name
| `consumerids`            | *Required* - a list of 1 or more consumer modules this module will provide for.<br><br> **Possible values:** An array of strings exactly matching the ID of one or more MMM-FeedDisplay modules <br> **Default value:** none
| `id`         | *Required* - The unique ID of this provider module<br><br> **Possible values:** any unique string<br> **Default value:** none
| `datarefreshinterval`            | *Optional* - milliseconds to pause before checking for new data in the feeds.<br><br> **Possible values:** a number in milliseconds <br> **Default value:** `60000` 
| `feeds`        | *required* - See below for the feed format
| `datarefreshinterval`            | *Optional* - milliseconds to pause before checking for new data in the feeds.<br><br> **Possible values:** a number in milliseconds <br> **Default value:** `60000` 
| `useheader`            | *Optional* - Sends HTTP headers to the RSS server. Some servers require headers, other fail if they receive them.<br><br> **Possible values:** true or false <br> **Default value:** `false` 
| `waitforqueuetime`            |*Ignore* -  Queue delay between ending one queue item and starting the next <br><br> **Possible values:** a number in milliseconds. <br> **Default value:** `10`
| `Feed Format`            |
| `feedname`            |*Required* -  Name of the feed for reference purposes<br><br> **Possible values:** Any unique string. <br> **Default value:** none
| `feedtitle`            |*Required* -  Title of the feed that will be displayed as the source if enabled in the MMM-FeedDisplay output.<br><br> **Possible values:** Any unique string. <br> **Default value:** none
| `feedurl`            |*Required* -  URL of the RSS feed <br><br> **Possible values:** any valid URL referencing a RSS v1,v2 or Atom formatted feed <br> **Default value:** none
| `oldestage`            |*Required* -  Filter out any articles older than this "age" (As defined by the pubdate in the RSS feed). <br><br> **Possible values:** 'today' or a number of minutes or a valid date(See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/). <br> **Default value:** none


### Additional Notes

Reddit provides access to subreddits through a RSS formatted URL. See the reddit example in the example config above.

This is a WIP; changes are being made all the time to improve the compatability across the modules. Please refresh this and the MMM-feedUtilities modules with a `git pull` in the relevant modeules folders.