import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export const getDefaultInstance = ({ _id, namespace }) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');

    const fields = { 'settings.private.rasaServerDefaultUrl': 1 };
    const {
        settings: {
            private: {
                rasaServerDefaultUrl = '',
            } = {},
        } = {},
    } = GlobalSettings.findOne({}, { fields });
    const defaultInstance = {
        name: 'Default',
        host: rasaServerDefaultUrl.replace(/{PROJECT_NAMESPACE}/g, namespace),
        adminOnly: true,
        projectId: _id,
        type: 'server',
    };

    return defaultInstance;
};
