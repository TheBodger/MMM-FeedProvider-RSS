const htmlparser2 = require("htmlparser2");

exports.RSSitem = function (id, title, description, pubdate, age, imageURL, categories) {
	this.id = id;				// use title as probably uniue and then we hashcode it
	this.title = title;
	this.description = description;
	this.pubdate = pubdate;
	this.age = age; //in microseconds
	this.imageURL = imageURL;
	this.getage = function (now, then) {
		return (now.getTime() - then.getTime());
	};
	this.getimagefromhtml = function (content) {

		//give precedence to images in address links

		var imageURL = "";
		var imageLinkURL = "";

		const parser = new htmlparser2.Parser(
			{
				onopentag(name, attribs) {
					if (name === "img") {
						imageURL = (attribs.src);
					}
					else if (name == "a") {
						if (checkURL(attribs.href)) { imageLinkURL = (attribs.href); };
					}
				},

				ontext(text) {
					//console.log("-->", text);
				},
				onclosetag(tagname) {
					if (tagname === "script") {
						//console.log("That's it?!");
					}
				}
			},
			{ decodeEntities: true }
		)

		parser.write(content);

		parser.end();

		if (imageLinkURL == "") {
			return imageURL;
		}
		else {
			return imageLinkURL;
		};

	};
	this.gethashCode = function (s) {
		for (var i = 0, h = 0; i < s.length; i++)
			h = Math.imul(31, h) + s.charCodeAt(i) | 0;
		return h;
	};

	this.categories = categories;

};

var getid = function (idasadate) {// we use the published or current date to create a numeric key; will need better processing due to duplicates

	if (idasadate == null) {
		return new Date().getTime();
	}

	return idasadate.getTime();

};

var checkURL = function (imgurl) {
	const regex = /\.(jpeg|jpg|gif|png|bmp|tiff)$/;
	//console.log(imgurl);
	//console.log(imgurl.match(regex));
	return (imgurl.match(regex) != null);
};

exports.RSSitems = function () {
	this.items = [];
	//this.getage = function () { return age; }
};

exports.RSSsource = function () {
	this.title = '';
	this.sourcetitle = '';
	this.url = '';
};


