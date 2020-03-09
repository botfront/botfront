

import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';

export default function restartRasa(projectId) {
    Meteor.call('rasa.restart', projectId, (err, response) => {
        if (err || response !== 200) {
            Alert.error(`Error ${err || response} while trying to restart rasa`, {
                position: 'top-right',
                timeout: 2000,
            });
        }
        if (response === 200) {
            Alert.success('Rasa restarting', {
                position: 'top-right',
                timeout: 2000,
            });
        }
    });
}
