'use strict';

var utils = require('./utils');
var Promise = utils.Promise;
var _ = utils._;
var elasticsearch = require('elasticsearch');
var ES_PAGES_INDEX = 'webdata';
var ES_PAGES_TYPE = 'webpage';

var client = new elasticsearch.Client({
	host: process.env.WEBDATA_ES_HOST
});

Promise.promisifyAll(client);
Promise.promisifyAll(client.indices);

function getWebPages(response) {
	var items = [];
	if (response[0].hits && response[0].hits.total > 0) {
		response[0].hits.hits.forEach(function(item) {
			var page = item._source;
			page._score = item._score;

			if (!page.storyId) {
				delete page.storyId;
			}
			if (!page.category) {
				delete page.category;
			}
			delete page['title_' + page.lang];
			delete page['summary_' + page.lang];

			items.push(page);
		});
	}

	return items;
}

/**
 * Create a webpage
 */
exports.createWebPage = function(webpage) {
	webpage = internal.normalizeWebpage(webpage);

	return client.indexAsync({
		index: ES_PAGES_INDEX,
		type: ES_PAGES_TYPE,
		id: webpage.id,
		refresh: true,
		body: webpage,
		ttl: '24h'
	});
};

/**
 * Refresh
 */
exports.refresh = function() {
	return client.indices.refreshAsync({
		index: ES_PAGES_INDEX
	});
};

/**
 * Update a webpage
 */
exports.updateWebPage = function(id, data) {
	return client.updateAsync({
		index: ES_PAGES_INDEX,
		type: ES_PAGES_TYPE,
		id: id,
		body: {
			doc: data
		}
	});
};

/**
 * Search webpages
 */
exports.searchWebPages = function(params) {
	var q = core.text.atonic(params.q);
	var body = {
		'query': {
			'filtered': {
				'filter': {
					'bool': {
						'must': [{
							'term': {
								'country': params.country
							}
						}, {
							'term': {
								'lang': params.lang
							}
						}]
					}
				},
				'query': {
					'multi_match': {
						'query': q,
						'fields': ['title', 'title_' + params.lang, 'summary', 'summary_' + params.lang]
					}
				}
			}
		}
	};
	if (params.min_score) {
		body.min_score = params.min_score;
	}
	// if (params.ignoreId) {
	//   body.query.filtered.filter.not = {
	//     _id: params.ignoreId
	//   };
	// }

	return client.searchAsync({
		index: ES_PAGES_INDEX,
		type: ES_PAGES_TYPE,
		body: body
	}).then(getWebPages);
};

exports.normalizeWebpage = function(webpage) {
	var id = webpage.id || webpage._id;
	webpage = _.pick(webpage, 'title', 'uniqueName', 'host', 'path', 'category', 'country', 'lang', 'publishedAt', 'topics', 'summary', 'websiteId', 'quotes', 'videoId');
	webpage.id = id;
	webpage['title_' + webpage.lang] = core.text.atonic(webpage.title);
	webpage['summary_' + webpage.lang] = core.text.atonic(webpage.summary.substr(0, 200));

	if (webpage.topics) {
		webpage.topics = webpage.topics.map(function(topic) {
			return _.pick(topic, 'id', 'name', 'uniqueName', 'key', 'type', 'category', 'abbr');
		});
		webpage.topics = _.uniq(webpage.topics, 'id');
	}

	return webpage;
};
