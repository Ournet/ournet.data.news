'use strict';

var utils = require('ournet.utils');
var atonic = require('atonic');
var slug = require('slug');
var _ = require('lodash');
var Promise = require('bluebird');
var crypto = require('crypto');

exports.NEWS_MAX_LENGTH = 1400;

exports.md5 = function md5(value) {
	return crypto.createHash('md5').update(value).digest('hex');
};

exports.buildServiceOptions = function buildServiceOptions(options, defaults) {
	defaults = defaults || {
		format: 'json'
	};

	return _.defaults(options || {}, defaults);
};

exports.wrapAt = function wrapAt(text, position) {
	if (text && text.length > position) {
		return text.substr(0, position - 3) + '...';
	}

	return text;
};

exports.formatWebPagesTableName = function formatWebPagesTableName(options) {
	return ['webpages', options.country || options[0], options.lang || options[1]].join('_');
};

exports.formatStoriesTableName = function formatStoriesTableName(options) {
	return ['stories', options.country || options[0], options.lang || options[1]].join('_');
};

module.exports = exports = _.assign({
	_: _,
	Promise: Promise,
	atonic: atonic,
	slug: slug
}, exports, utils);
