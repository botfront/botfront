
export const getDefaultInstance = ({ _id }) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    return [{
        name: 'NLU Default',
        host: 'http://host.docker.internal:5000',
        projectId: _id,
        type: ['nlu'],
    }, {
        name: 'Core Default',
        host: 'http://localhost:5005',
        projectId: _id,
        type: ['core'],
    }];
};
