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

### MagicMirror� Configuration

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        ...
        {
            module: 'MMM-GoogleTasks',
            header: "Google Tasks",
            position: "top_left",
            config: {
                listID: "",
                ...
                // See below for Configuration Options
            }
        },
        ...
    ]
}
```

### Configuration Options

| Option                  | Details
|------------------------ |--------------
| `listID`                | *Required* - List ID printed from authenticate.js (see installation)
| `maxResults`            | *Optional* - Max number of list items to retrieve. <br><br> **Possible values:** `0` - `100` <br> **Default value:** `10`
| `showCompleted`         | *Optional* - Show completed task items <br><br> **Possible values:** `true`  `false` <br> **Default value:** `false`
| `dateFormat`            | *Optional* - Format to use for due date <br><br> **Possible values:** See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/) <br> **Default value:** `MMM Do` (e.g. Jan 18th)
| `updateInterval`        | *Optional* - Interval at which content updates (Milliseconds) <br><br> **Possible values:** `2000` - `86400000` (Tasks API has default maximum of 50,000 calls per day.) <br> **Default value:** `10000` (10 seconds)
| `animationSpeed`        | Speed of the update animation. (Milliseconds) <br><br> **Possible values:** `0` - `5000` <br> **Default value:** `2000` (2 seconds)
| `tableClass`            | Name of the classes issued from `main.css`. <br><br> **Possible values:** xsmall, small, medium, large, xlarge. <br> **Default value:** _small_
