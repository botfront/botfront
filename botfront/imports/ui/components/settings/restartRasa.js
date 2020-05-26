

import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';

export default async function restartRasa(projectId, webhook, environment = 'development') {
    Meteor.call('axios.requestWithJsonBody', webhook.url, webhook.method, { projectId, environment }, (err, response) => {
        if (err || response.status !== 200) {
            Alert.error(`Error ${err || response.status} while trying to restart rasa`, {
                position: 'top-right',
                timeout: 2000,
            });
        }
        if (response.status === 200) {
            Alert.success('Rasa restarting', {
                position: 'top-right',
                timeout: 2000,
            });
        }
    });
}
