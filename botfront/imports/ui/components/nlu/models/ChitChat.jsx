import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-s-alert';
import { Meteor } from 'meteor/meteor';
import {
    Dropdown, Confirm,
    Container, Button,
    Loader, Message, Icon,
} from 'semantic-ui-react';
import 'react-s-alert/dist/s-alert-default.css';

import { wrapMeteorCallback } from '../../utils/Errors';

export default class ChitChat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chitChatIntents: null,
            notConfiguredError: null,
            confirmOpen: false,
            selectedIntents: [],
        };
    }

    componentDidMount() {
        this.loadChitChatIntents();
    }

    handleIntentSelectorChange = (e, { value }) => {
        this.setState({ selectedIntents: value });
    };

    loadChitChatIntents = () => {
        const { model: { language } } = this.props;

        Meteor.call('nlu.getChitChatIntents', language, (e, intents) => {
            if (e) {
                if (e instanceof ReferenceError) {
                    this.setState({ notConfiguredError: e.message });
                } else {
                    Alert.error(`Couldn't fetch chit chat intents: ${JSON.stringify(e.reason)}`, {
                        position: 'top',
                        timeout: 'none',
                    });
                }
            } else {
                this.setState({ chitChatIntents: intents });
            }
        });
    };

    addToTrainingData = () => {
        const { model: { _id: modelId, language } } = this.props;
        const { selectedIntents } = this.state;
        this.close();

        Meteor.call('nlu.addChitChatToTrainingData', modelId, language, selectedIntents, wrapMeteorCallback(() => {
            this.setState({ selectedIntents: [] });
        }, 'imported chitchat examples to training data.'));
    };

    open = () => this.setState({ confirmOpen: true });

    close = () => this.setState({ confirmOpen: false });

    render() {
        const {
            notConfiguredError, chitChatIntents, confirmOpen, selectedIntents,
        } = this.state;
        
        return (
            <Container>
                {notConfiguredError && <Message error content={notConfiguredError} />}
                {chitChatIntents && chitChatIntents.length === 0 && <Message info content="Chitchat intents are not available in your model's language." />}
                {chitChatIntents && chitChatIntents.length > 0 && (
                    <div className='chitchat' style={{ minHeight: 600 }}>
                        {/* minHeight to make sure there is enough space for the dropdown */}
                        <Message info data-cy='chit-chat-message'>
                            <Icon name='lightbulb' size='small' />
                            Chit chat intents are general conversation pre-trained intents. Select those you want to integrate in your model, add and re-train.
                        </Message>
                        <br />

                        <Dropdown
                            placeholder='Select chit chat intents'
                            multiple
                            selection
                            value={selectedIntents}
                            search
                            onChange={this.handleIntentSelectorChange}
                            options={chitChatIntents.map(i => ({ text: i, value: i }))}
                        />
                        <br />
                        <br />
                        <Button
                            primary
                            disabled={selectedIntents.length === 0}
                            content='Add to training data'
                            onClick={this.open}
                            data-cy='add-chit-chat'
                        />
                        <Confirm
                            header='Add to training data?'
                            content={`This will add chitchat examples to your training data matching the following intents: ${selectedIntents.join(' ')}`}
                            open={confirmOpen}
                            onCancel={this.close}
                            onConfirm={this.addToTrainingData}
                        />
                    </div>
                )}

                {!chitChatIntents && <Loader active inline='centered' />}
            </Container>
        );
    }
}

ChitChat.propTypes = {
    model: PropTypes.object.isRequired,
};
