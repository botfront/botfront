import { Roles } from 'meteor/modweb:roles';
import { Instances } from '../imports/api/instances/instances.collection';

/* globals Migrations */

Migrations.add({
    version: 1,
    up: () => {
        Instances.find()
            .fetch()
            .forEach((i) => {
                if (!i.type) Instances.update({ _id: i._id }, { $set: { type: ['nlu'] } });
            });
        Meteor.users
            .find()
            .fetch()
            .forEach((u) => {
                const { roles } = u;
                const isAdmin = !!roles.find(r => r._id === 'admin');
                if (isAdmin) {
                    Roles.removeUsersFromRoles(u._id, 'admin');
                    Roles.addUsersToRoles(u._id, 'global-admin');
                }
            });
    },
});


Meteor.startup(() => {
    Migrations.migrateTo('latest');
});
