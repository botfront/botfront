

import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';

export default function restartRasa(webhook) {
    const { url, method } = webhook;
    if (url && method) {
        Meteor.call('axios.requestWithJsonBody', url, method, {}, (err, response) => {
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
}
