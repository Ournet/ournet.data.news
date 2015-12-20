'use strict';

var core = require('ournet.core');
var _ = core._;
var isNotNull = core.util.isNotNull;
var url = require('url');
var slug = require('slug');
var assert = require('assert');

function mongoGetItem(data, nofields) {

	function mapItem(item) {
		return mongoGetItem(item, nofields);
	}

	var _id = data._id;

	data = isNotNull(data.toObject) ? data.toObject() : data;
	for (var prop in data) {
		if (prop === 'id' && _.isNumber(_id)) {
			data[prop] = parseInt(data[prop]);
		} else if (data[prop] === null || nofields.indexOf(prop) > -1) {
			delete data[prop];
		} else if (Array.isArray(data[prop])) {
			data[prop] = data[prop].map(mapItem);
		}
	}
	return data;
}

function mongoGet(data, nofields) {
	nofields = nofields || ['_id', '__v'];
	if (!Array.isArray(nofields)) {
		nofields = [nofields];
	}

	if (data && data.toObject) {
		return mongoGetItem(data, nofields);
	}
	if (data && Array.isArray(data)) {
		return data.map(function(item) {
			return mongoGetItem(item, nofields);
		});
	}
	return data;
}

function createWebPageId(u) {
	u = url.parse(u.toLowerCase());
	if (u.path.indexOf('//') === 0) {
		u.path = u.path.substr(1);
	}
	return core.util.md5(u.host + u.path);
}

function createImageId(image) {
	return core.util.md5([image.width, image.height, image.dhash.toLowerCase()].join('-'));
}

function normalizeImage(data) {
	var image = _.pick(data, 'id', '_id', 'length', 'src', 'url', 'width', 'height', 'dhash', 'type', 'websites', 'createdAt', 'updatedAt');
	image._id = image._id || image.id || createImageId(image);
	delete image.id;
	image.dhash = image.dhash.toLowerCase();
	image.url = image.url || image.src;
	delete image.src;
	image.urlHash = core.util.md5(image.url);

	return image;
}

function normalizeStory(data) {
	data = _.cloneDeep(data);
	data._id = data.id;
	delete data.id;
	return data;
}

function normalizeQuote(data) {
	data = _.pick(data, 'id', 'authorId', 'category', 'country', 'lang', 'createdAt');
	data._id = data.id;
	delete data.id;
	return data;
}

function formatWebPageUniqueName(title) {
	assert.ok(title);
	title = core.util.atonic(title.toLowerCase());

	return slug(title).substr(0, 64).trim().replace(/^-/, '').replace(/-$/, '');
}

function normalizeWebPage(data) {
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
	page.urlHash = core.util.md5((page.host + page.path).toLowerCase());
	page._id = page._id || page.id || page.urlHash;
	if (page.topics) {
		page.topics.forEach(function(topic) {
			topic._id = topic._id || topic.id;
		});
		page.topics = _.uniq(page.topics, '_id');
	}
	delete page.id;
	if (page.summary) {
		page.summary = core.text.wrapAt(page.summary, 884);
	}

	page.quotes = page.quotes || [];

	// page.quotes = page.quotes.map(function(q) {
	//   return q.id || q;
	// });

	page.quotes = _.uniq(page.quotes);

	return page;
}

function formatWebPagesTableName(options) {
	return ['webpages', options.country || options[0], options.lang || options[1]].join('_');
}

function formatStoriesTableName(options) {
	return ['stories', options.country || options[0], options.lang || options[1]].join('_');
}

exports.mongoGet = mongoGet;
exports.createWebPageId = createWebPageId;
exports.createImageId = createImageId;
exports.normalizeImage = normalizeImage;
exports.normalizeWebPage = normalizeWebPage;
exports.normalizeStory = normalizeStory;
exports.normalizeQuote = normalizeQuote;
exports.formatWebPagesTableName = formatWebPagesTableName;
exports.formatStoriesTableName = formatStoriesTableName;
exports.formatWebPageUniqueName = formatWebPageUniqueName;
