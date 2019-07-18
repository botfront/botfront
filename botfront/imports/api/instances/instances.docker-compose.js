
import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export const getDefaultInstance = ({ _id }) => {

    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const settings = GlobalSettings.findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.rasaUrl': 1 } });
    const { settings: { private: { rasaUrl } } } = settings;
    return {
        name: 'Default Instance',
        host: rasaUrl || 'http://rasa:5005',
        projectId: _id,
    };
};
