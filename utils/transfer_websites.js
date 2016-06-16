'use strict';

require('dotenv').load();

var News = require('../lib');
var utils = require('../lib/utils');
var Promise = utils.Promise;
var newsControl = News.getControlService();

var websitesAccess = require('ournet.data.websites').getAccessService();

var feedsPage = 0;

function getNextFeeds() {
	return websitesAccess.feeds({
		where: {
			status: 'active',
			country: {
				$in: ['ro', 'md', 'ru', 'in', 'bg', 'it', 'hu', 'cz', 'pl']
			},
			contentType: 1
		},
		limit: 50,
		order: '-createdAt',
		offset: 50 * (feedsPage++)
	});
}

function transferWebsite(id, lang) {
	return websitesAccess.website({ id: id })
		.then(function(item) {
			if (item) {
				console.log('transfering website', item.host);
				item.lang = item.lang || lang;
				return newsControl.insertWebsite(item);
			} else {
				console.log('no website with id', id);
			}
		});
}

function transfer() {
	return getNextFeeds()
		.then(function(items) {
			if (items && items.length > 0) {

				return Promise.each(items, function(item) {
					console.log('transfering feed', item.url);
					return newsControl.insertFeed(item)
						.then(function() {
							return transferWebsite(item.websiteId, item.lang);
						});
				}).then(transfer);
			}
		});
}

transfer();
