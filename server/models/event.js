var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Mongoose Schema
var EventSchema = new Schema({
    host: {type: String, required: true},
    title: {type: String, required: true},
    date: {type: Object, required: true},
    time: {type: String, required: true},
    games: {type: Array, required: true},
    address: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zipCode: {type: String, required: true},
    description: {type: String, required: true},
    closed: {type: Boolean, default: false},
    type: {type: String, required: true},
    img: {type: Array},
    position:{type: Array},
    location:{type: String},
    status: {type: String},
    admin: {type: Array},
    saved: {type: Array},
    pending: {type: Array},
    attending: {type: Array},
    denied: {type: Array},
    blocked: {type: Array},
});

module.exports = mongoose.model('Event', EventSchema);
