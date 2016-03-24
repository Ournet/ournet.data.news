'use strict';

var Data = require('./common/data');
if (!Data) {
	return;
}

var assert = require('assert');
// var itemId = '471b1a060d9d97f144e54418d5b723f0';

describe('Access', function() {
	// it('should get webpage by id', function() {
	// 	return Data.access.webpage({
	// 			culture: {
	// 				lang: 'ro',
	// 				country: 'ro'
	// 			},
	// 			where: {
	// 				_id: itemId
	// 			}
	// 		})
	// 		.then(function(item) {
	// 			assert.ok(item);
	// 			assert.equal(itemId, item.id);
	// 		});
	// });
	it('should get trendTopics', function() {
		return Data.access.trendTopics({
				where: {
					lang: 'ro',
					country: 'md'
				},
				limit: 10
			})
			.then(function(items) {
				assert.ok(items);
				assert.equal(10, items.length);
			});
	});
});
