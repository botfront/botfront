import React from 'react';
import PropTypes from 'prop-types';
import { Widget } from 'rasa-webchat/module';

class Chat extends React.Component {
    // WARNING
    // Returns false, because for some uninvestigated reason, Widget creates
    // leaking connections on ComponentWillUpdate
    shouldComponentUpdate() {
        // WARNING
        // This component will never update itself
        return false;
    }

    render() {
        const {
            socketUrl,
            language,
            path,
            initialPayLoad,
        } = this.props;
        return (
            <Widget
                interval={0}
                initPayload={initialPayLoad}
                socketUrl={socketUrl}
                socketPath={path}
                inputTextFieldHint='Try out your chatbot...'
                hideWhenNotConnected={false}
                customData={{ language }}
                embedded
                customMessageDelay={() => 0}
            />
        );
    }
}

Chat.propTypes = {
    socketUrl: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    language: PropTypes.string,
    initialPayLoad: PropTypes.string,
};

Chat.defaultProps = {
    language: '',
    initialPayLoad: '',
};

export default Chat;
