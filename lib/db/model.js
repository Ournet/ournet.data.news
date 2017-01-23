'use strict';

var url = require('url');
var utils = require('../utils');
var _ = utils._;
var assert = require('assert');

exports.createWebPageId = function(u) {
	u = url.parse(u.toLowerCase());
	if (u.path.indexOf('//') === 0) {
		u.path = u.path.substr(1);
	}
	return utils.md5(u.host + u.path);
};

var createImageId = exports.createImageId = function(image) {
	return utils.md5([image.width, image.height, image.dhash.toLowerCase()].join('-'));
};

exports.normalizeImage = function(data) {
	var image = _.pick(data, 'id', '_id', 'length', 'src', 'url', 'width', 'height', 'dhash', 'type', 'websites', 'createdAt', 'updatedAt');
	image._id = image._id || image.id || createImageId(image);
	delete image.id;
	image.dhash = image.dhash.toLowerCase();
	image.url = image.url || image.src;
	delete image.src;
	image.urlHash = utils.md5(image.url);

	return image;
};

exports.normalizeStory = function(data) {
	data = _.cloneDeep(data);
	data._id = data.id;
	delete data.id;
	return data;
};

exports.normalizeQuote = function(data) {
	data = _.pick(data, 'id', 'authorId', 'category', 'country', 'lang', 'createdAt');
	data._id = data.id;
	delete data.id;
	return data;
};

var formatWebPageUniqueName = exports.formatWebPageUniqueName = function(title) {
	assert.ok(title);
	title = utils.atonic(title.toLowerCase());

	return utils.slug(title).substr(0, 64).trim().replace(/^-/, '').replace(/-$/, '');
};

exports.normalizeWebPage = function(data) {
	var page = _.cloneDeep(data);
	if (page.url) {
		page.url = url.parse(page.url.toLowerCase());
		page.host = page.url.host;
		page.path = page.url.path;
		if (page.path.indexOf('//') === 0) {
			page.path = page.path.substr(1);
		}
	}
	delete page.url;
	page.uniqueName = page.uniqueName || formatWebPageUniqueName(page.title);
	page.urlHash = utils.md5((page.host + page.path).toLowerCase());
	page._id = page._id || page.id || page.urlHash;
	if (page.topics) {
		page.topics.forEach(function(topic) {
			topic._id = topic._id || topic.id;
		});
		page.topics = _.uniq(page.topics, '_id');
	}
	delete page.id;
	if (page.summary) {
		page.summary = utils.wrapAt(page.summary, utils.NEWS_MAX_LENGTH);
	}

	page.quotes = page.quotes || [];

	// page.quotes = page.quotes.map(function(q) {
	//   return q.id || q;
	// });

	page.quotes = _.uniq(page.quotes);

	return page;
};

exports.normalizeWebsite = function(data) {
	data = _.cloneDeep(data);

	if (data.url) {
		data.url = data.url.trim().toLowerCase();
		if (data.url.indexOf('/') > -1) {
			data.url = url.parse(data.url).hostname;
		}
		if (!data.host) {
			data.host = data.url.replace(/^www\./, '');
		}
	}

	data.host = data.host.trim().toLowerCase();

	if (data.feeds) {
		data.feeds.forEach(function(feed) {
			feed.lang = feed.lang || data.lang;
			feed.country = feed.country || data.country;
			feed.contentType = feed.contentType || data.contentType;
		});
	}

	if (data.name && data.name.length > 50) {
		data.name = data.name.substr(0, 50);
	}
	if (data.title && data.title.length > 100) {
		data.title = data.title.substr(0, 100);
	}

	return data;
};

exports.normalizeWebsiteUpdate = function(data) {
	data = _.cloneDeep(data);

	if (data.name && data.name.length > 50) {
		data.name = data.name.substr(0, 50);
	}
	if (data.title && data.title.length > 100) {
		data.title = data.title.substr(0, 100);
	}

	return data;
};

exports.normalizeFeed = function(data) {
	data = _.cloneDeep(data);

	data.url = data.url || data.href;

	if (data.title && data.title.length > 100) {
		data.title = data.title.substr(0, 100);
	}

	var href = url.parse(data.url);
	href = href.hostname.replace(/^www\./, '') + href.path;

	data.urlHash = utils.md5(href);

	return data;
};
