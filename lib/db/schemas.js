'use strict';

var mongoose = require('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;
var Schema = mongoose.Schema;
var util = require('util');

function BaseSchema() {
	Schema.apply(this, arguments);

	if (!this.paths.createdAt) {
		this.add({
			createdAt: {
				type: Date,
				default: Date.now
			}
		});
	}
	if (!this.paths.updatedAt) {
		this.add({
			updatedAt: {
				type: Date
			}
		});
	}

	this.pre('save', function(next) {
		//if (!this.updatedAt) {
		//console.log('pre save', this);
		this.updatedAt = Date.now();
		//}
		next();
	});
}

util.inherits(BaseSchema, Schema);

// Image

var Image = exports.Image = new BaseSchema({
	_id: String,
	dhash: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	urlHash: {
		type: String,
		required: true
	},
	width: {
		type: Number,
		required: true
	},
	height: {
		type: Number,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	websites: [Number],
	updatedAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 24 * 14 // 14 days
	}
});

// Topic

var Topic = new Schema({
	name: {
		type: String,
		required: true
	},
	_id: {
		type: Number,
		index: true
	},
	key: {
		type: String,
		required: true
	},
	uniqueName: {
		type: String,
		required: true
	},
	abbr: {
		type: String
	},
	category: {
		type: Number
	},
	type: {
		type: Number
	}
});

// Story

var Story = exports.Story = new BaseSchema({
	//int
	_id: Number,
	host: {
		type: String,
		required: true,
		maxlength: 64
	},
	path: {
		type: String,
		required: true,
		maxlength: 512
	},
	title: {
		type: String,
		required: true,
		maxlength: 200,
		minlength: 3,
		trim: true
	},
	uniqueName: {
		type: String,
		required: true,
		maxlength: 64,
		minlength: 3,
		trim: true
	},
	summary: {
		type: String,
		required: true,
		maxlength: 884,
		minlength: 3,
		trim: true
	},
	category: {
		type: Number
	},
	country: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 2,
		minlength: 2,
		index: true
	},
	lang: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 2,
		minlength: 2,
		index: true
	},
	webpageId: {
		type: String,
		required: true
	},
	countNews: {
		type: Number
	},
	countViews: {
		type: Number,
		default: 0
	},
	imageId: {
		type: String
	},
	imageHost: {
		type: String
	},
	countShares: {
		type: Number,
		default: 0,
		index: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		index: true,
		expires: 60 * 60 * 24 * 14 // 14 days
	},
	videos: [String]
});

// WebPage

var WebPage = exports.WebPage = new BaseSchema({
	//int
	_id: String,
	oldId: {
		type: Number
	},
	host: {
		type: String,
		required: true,
		maxlength: 64
	},
	path: {
		type: String,
		required: true,
		maxlength: 512
	},
	urlHash: {
		type: String,
		//unique: true,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 32
	},
	title: {
		type: String,
		required: true,
		maxlength: 200,
		minlength: 3,
		trim: true
	},
	uniqueName: {
		type: String,
		required: true,
		maxlength: 64,
		minlength: 3,
		trim: true
	},
	summary: {
		type: String,
		required: true,
		maxlength: 884,
		minlength: 3,
		trim: true
	},
	contentType: {
		type: Number,
		required: true
	},
	category: {
		type: Number,
		index: true
	},
	publishedAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	createdAt: {
		type: Date,
		index: true,
		required: true,
		default: Date.now,
		expires: 60 * 60 * 24 * 10 // 10 days
	},
	country: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 2,
		minlength: 2
	},
	lang: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 2,
		minlength: 2
	},
	websiteId: {
		type: Number,
		required: true
	},
	imageId: {
		type: String,
		index: true
	},
	videoId: {
		type: String
	},
	storyId: {
		type: Number
	},
	topics: [Topic],
	quotes: [String]
});

// TopTopic

var TopicTrend = exports.TopicTrend = new BaseSchema({
	country: {
		type: String,
		minlength: 2,
		maxlength: 2,
		index: true,
		required: true
	},
	lang: {
		type: String,
		minlength: 2,
		maxlength: 2,
		index: true,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	_id: Number,
	key: {
		type: String,
		required: true
	},
	uniqueName: {
		type: String,
		required: true
	},
	abbr: {
		type: String
	},
	category: {
		type: Number
	},
	type: {
		type: Number
	},
	counts: {
		type: Mixed,
		required: true
	},
	updatedAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 12
	}
});

// Quote

var Quote = exports.Quote = new BaseSchema({
	country: {
		type: String,
		minlength: 2,
		maxlength: 2,
		index: true,
		required: true
	},
	lang: {
		type: String,
		minlength: 2,
		maxlength: 2,
		index: true,
		required: true
	},
	_id: String,
	category: {
		type: Number
	},
	authorId: {
		type: Number,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 24 * 14,
		required: true
	}
});

// Website

var Website = exports.Website = new BaseSchema({
	//int
	_id: Number,
	url: {
		type: String,
		required: true,
		lowercase: true,
		trim: true
	},
	host: {
		type: String,
		unique: true,
		required: true,
		lowercase: true,
		trim: true
	},
	name: {
		type: String,
		// required: true,
		maxlength: 50,
		minlength: 2,
		trim: true
	},
	title: {
		type: String,
		maxlength: 100,
		minlength: 2,
		trim: true
	},
	status: {
		type: String,
		required: true,
		default: 'active',
		enum: ['active', 'inactive'],
		index: true
	},
	contentType: {
		type: Number,
		index: true
			// trim: true,
			// lowercase: true,
			//enum: ['anunturi', 'bloguri', 'comert-electronic', 'corporative', 'forum', 'portal', 'stiri']
	},
	ip: {
		type: String,
		maxlength: 24
	},
	country: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 2,
		minlength: 2
	},
	lang: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 2,
		minlength: 2
	}
});

// Feed

var Feed = exports.Feed = new BaseSchema({
	//int
	_id: Number,
	url: {
		type: String,
		required: true
	},
	urlHash: {
		type: String,
		unique: true,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 32
	},
	title: {
		type: String,
		required: true,
		maxlength: 100,
		minlength: 2,
		trim: true
	},
	status: {
		type: String,
		required: true,
		default: 'inactive',
		enum: ['active', 'inactive'],
		index: true
	},
	contentType: {
		type: Number,
		index: true
			// trim: true,
			// lowercase: true,
			//enum: ['anunturi', 'bloguri', 'comert-electronic', 'corporative', 'forum', 'portal', 'stiri']
	},
	country: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 2,
		minlength: 2
	},
	lang: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		maxlength: 2,
		minlength: 2
	},
	websiteId: {
		type: Number,
		required: true
	},
	itemReadedAt: {
		type: Date
	},
	itemReadedHash: {
		type: String
	},
	readError: {
		type: String
	},
	readErrorAt: {
		type: Date
	}
});

Quote.set('toObject', {
	getters: true
});
TopicTrend.set('toObject', {
	getters: true
});
WebPage.set('toObject', {
	getters: true
});
Topic.set('toObject', {
	getters: true
});
Image.set('toObject', {
	getters: true
});
Story.set('toObject', {
	getters: true
});
Website.set('toObject', {
	getters: true
});
Feed.set('toObject', {
	getters: true
});
