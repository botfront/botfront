import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';

export const displayError = (error) => {
    if (error.error === 'warning') {
        Alert.warning(`Warning: ${error.reason || error.error || error.message}`, {
            position: 'top-right',
            timeout: 5 * 1000,
        });
    } else {
        Alert.error(`Error: ${error.reason || error.error || error.message}`, {
            position: 'top-right',
            timeout: 'none',
        });
    }
};

export function wrapMeteorCallback(callback, successMessage = '') {
    return (error, result) => {
        if (error) {
            displayError(error);
        } else if (successMessage) {
            Alert.success(successMessage, {
                position: 'top-right',
                timeout: 1 * 1000,
            });
        }

        if (callback) {
            callback(error, result);
        }
    };
}
