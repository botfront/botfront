Mongo.Collection.prototype.aggregate = function(pipelines, options) {
    const coll = this.rawCollection();
    return Meteor.wrapAsync(coll.aggregate.bind(coll))(pipelines, options);
}