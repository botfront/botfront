
import Alert from 'react-s-alert';

export const runTestCaseStories = (projectId, options = {}) => {
    Meteor.call('stories.runTests', projectId, options, (error, response) => {
        if (error) {
            Alert.error(error.message);
        }
        const { passing, failing } = response;
        if (!failing) {
            Alert.success(`Test run complete. ${passing} test${passing !== 1 ? 's' : ''} passing`, {
                position: 'top-right',
                timeout: 10 * 1000,
            });
        } else {
            Alert.error(`
                    Test run complete. ${passing} test${passing !== 1 ? 's' : ''} passing, ${failing} test${failing !== 1 ? 's' : ''} failing`,
            {
                position: 'top-right',
                timeout: 10 * 1000,
            });
        }
    });
};
