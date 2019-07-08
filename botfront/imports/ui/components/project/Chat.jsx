import React from 'react';
import PropTypes from 'prop-types';
import { Widget } from 'rasa-webchat';

import {
    Menu, Icon, Dropdown, Popup, Message, Label, Input,
} from 'semantic-ui-react';

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
            <>
                {/* <Menu vertical fluid>
                    <Menu.Item>
                        <Label basic color='violet'>
                            intent
                        </Label>
                    </Menu.Item>
                </Menu> */}
                <Widget
                    interval={0}
                    initPayload={initialPayLoad}
                    socketUrl={socketUrl}
                    socketPath={path}
                    inputTextFieldHint='Try out your chatbot...'
                    hideWhenNotConnected={false}
                    customData={{ language }}
                    embedded
                />
            </>
            
        );
    }
}

Chat.propTypes = {
    socketUrl: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    language: PropTypes.string,
    initialPayLoad: PropTypes.array,
};

Chat.defaultProps = {
    language: '',
    initialPayLoad: [],
};

export default Chat;
