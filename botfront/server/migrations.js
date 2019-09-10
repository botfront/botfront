import { Roles } from 'meteor/modweb:roles';
import { Instances } from '../imports/api/instances/instances.collection';
import { Credentials } from '../imports/api/credentials';
import { Endpoints } from '../imports/api/endpoints/endpoints.collection';

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

Migrations.add({
    version: 2,
    up: () => {
        Credentials.find({ environment: { $exists: false } })
            .fetch()
            .forEach((i) => {
                Credentials.update(
                    { _id: i._id },
                    { $set: { environment: 'development' } },
                );
            });
        Endpoints.find({ environment: { $exists: false } })
            .fetch()
            .forEach((i) => {
                Endpoints.update(
                    { _id: i._id },
                    { $set: { environment: 'development' } },
                );
            });
    },
});

Meteor.startup(() => {
    Migrations.migrateTo('latest');
});
