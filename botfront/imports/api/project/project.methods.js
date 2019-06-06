import { check, Match } from 'meteor/check';
import { Projects } from './project.collection';
import { checkIfCan } from '../../lib/scopes';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { createInstance } from '../instances/instances.methods';
import { Instances } from '../instances/instances.collection';
import { ActivityCollection } from '../activity';
import { formatError } from '../../lib/utils';
import { Rules, createRules } from '../rules';
import { CorePolicies, createPolicies } from '../core_policies';
import { createEndpoints } from '../endpoints/endpoints.methods';
import { Endpoints } from '../endpoints/endpoints.collection';
import { Credentials, createCredentials } from '../credentials';
import { createDeployment } from '../deployment/deployment.methods';
import { Deployments } from '../deployment/deployment.collection';

if (Meteor.isServer) {
    Meteor.methods({
        async 'project.insert'(item) {
            check(item, Object);
            checkIfCan('global-admin');
            let _id;
            try {
                _id = Projects.insert(item);
                createEndpoints({ _id, ...item });
                createDeployment({ _id, ...item });
                createCredentials({ _id, ...item });
                createRules({ _id, ...item });
                createPolicies({ _id, ...item });
                const instance = await createInstance({ _id, ...item });
                Projects.update({ _id }, { $set: { instance } });
                return _id;
            } catch (e) {
                if (_id) Meteor.call('project.delete', _id);
                throw formatError(e);
            }
        },

        'project.update'(item) {
            check(item, Match.ObjectIncluding({ _id: String }));
            checkIfCan('global-admin');
            try {
                // eslint-disable-next-line no-param-reassign
                delete item.createdAt;
                return Projects.update({ _id: item._id }, { $set: item });
            } catch (e) {
                throw formatError(e);
            }
        },

        'project.delete'(projectId) {
            check(projectId, String);
            checkIfCan('global-admin');

            const project = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
            if (!project) throw new Meteor.Error('Project not found');
            try {
                NLUModels.remove({ _id: { $in: project.nlu_models } }); // Delete NLU models
                ActivityCollection.remove({ modelId: { $in: project.nlu_models } }); // Delete Logs
                Instances.remove({ projectId: project._id }); // Delete instances
                Rules.remove({ projectId: project._id }); // Delete rules
                CorePolicies.remove({ projectId: project._id }); // Delete Core Policies
                Credentials.remove({ projectId: project._id }); // Delete credentials
                Endpoints.remove({ projectId: project._id }); // Delete endpoints
                Projects.remove({ _id: projectId }); // Delete project
                Deployments.remove({ projectId }); // Delete deployment
            } catch (e) {
                throw e;
            }
        },
    });
}
