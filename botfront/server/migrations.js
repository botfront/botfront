import { Instances } from '../imports/api/instances/instances.collection';
/* globals Migrations */

Migrations.add({
    version: 1,
    up: () => {
        Instances.find()
            .fetch()
            .forEach((i) => {
                console.log(i);
                if (!i.type) Instances.update({ _id: i._id }, { $set: { type: ['nlu'] } });
            });
    },
});

Meteor.startup(() => {
    Migrations.migrateTo('latest');
});
