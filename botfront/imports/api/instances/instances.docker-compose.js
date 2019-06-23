
export const getDefaultInstance = ({ _id }) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    return {
        name: 'Default Instance',
        host: 'http://rasa:5005',
        projectId: _id,
    };
};
