import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import {
    Menu, Icon, Dropdown, Popup, Message, Label,
} from 'semantic-ui-react';
import { StoryValidator } from '../../../lib/story_validation';
import { wrapMeteorCallback } from '../utils/Errors';
import Chat from './Chat';
import { Stories } from '../../../api/story/stories.collection';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';

class ProjectChat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 0,
            languageOptions: null,
            selectedLanguage: null,
            selectedPayload: null,
        };
    }

    componentDidMount() {
        this.loadInstance();
        this.loadAvailableLanguages();
    }

    componentWillReceiveProps(props) {
        this.props = props;
        const { initPayloads } = this.props;
        const { selectedPayload } = this.state;
        if (initPayloads && initPayloads.length > 0 && !selectedPayload) {
            this.setState({ selectedPayload: initPayloads[0].stringPayload });
        }
    }

    loadInstance = () => {
        const { channel } = this.props;
        if (!channel) return this.setState({ noChannel: true });
        return this.setState({
            socketUrl: channel.base_url,
            path: channel.socket_path,
        });
    };

    loadAvailableLanguages = () => {
        const { projectId } = this.props;
        Meteor.call(
            'nlu.getPublishedModelsLanguages',
            projectId,
            wrapMeteorCallback((err, res) => {
                this.setState({
                    languageOptions: res.map(model => ({
                        text: model.language,
                        value: model.language,
                    })),
                    selectedLanguage: res[0] ? res[0].language : '',
                });
                // When it renders for the first time,  language is not passed to the widget and thus not associated
                // to the message. Hence Rasa fails adding the language param to the NLG request. So we (shouldn't) need to...
                this.rerenderChatComponent();
            }),
        );
    };

    handleReloadChat = () => {
        window.localStorage.removeItem('chat_session');
        this.rerenderChatComponent();
    };

    handleLangChange = (e, { value }) => {
        this.setState(
            {
                selectedLanguage: value,
            },
            () => this.handleReloadChat(),
        );
    };

    rerenderChatComponent = () => {
        // This key state update is a trick
        // to force React to unmount and remount the widget
        // rather than just updating it
        this.setState(state => ({
            key: state.key ? 0 : 1,
        }));
    };

    handleChangePayload = (e, { value }) => {
        this.setState({ selectedPayload: value }, () => this.handleReloadChat());
    };

    getEntityDisplayValues = (stringPayLoad) => {
        let entities = /([^{]*) *({.*}|)/.exec(stringPayLoad)[2];
        const entitiesDisplay = [];
        if (!!entities) {
            entities = JSON.parse(entities);
            const entitiesParsed = Object.keys(entities);
            entitiesParsed.forEach((key) => {
                entitiesDisplay.push(
                    <Label key={key}>
                        {key}
                        <Label.Detail>{entities[key]}</Label.Detail>
                    </Label>,
                );
            });
        }
        return entitiesDisplay;
    };

    getIntentDisplayValue = (stringPayLoad) => {
        const intent = /([^{]*) *({.*}|)/.exec(stringPayLoad)[1];
        return (
            <Label color='purple'>
                {intent.substring(1, intent.length)}
            </Label>
        );
    }

    renderPayloadOptions = () => {
        const { initPayloads } = this.props;
        const { selectedPayload } = this.state;
        const items = initPayloads.map(p => (
            <Dropdown.Item key={p.stringPayload} onClick={this.handleChangePayload} value={p.stringPayload} selected={p.stringPayload === selectedPayload}>
                <>
                    {this.getIntentDisplayValue(p.stringPayload)}
                    {this.getEntityDisplayValues(p.stringPayload)}
                </>
            </Dropdown.Item>
        ));
        return items;
    };

    render() {
        const {
            key, socketUrl, languageOptions, selectedLanguage, noChannel, path, selectedPayload,
        } = this.state;
        const { triggerChatPane, projectId, loading } = this.props;
        return (
            <div className='chat-pane-container' data-cy='chat-pane'>
                <Menu pointing secondary>
                    <Dropdown item icon='bolt' data-cy='initial-payload-select'>
                        <Dropdown.Menu>
                            {' '}
                            <Dropdown.Header content='Select initial payload' icon='bolt' />
                            {!loading && this.renderPayloadOptions()}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Menu.Item>
                        {selectedLanguage && <Dropdown options={languageOptions} selection onChange={this.handleLangChange} value={selectedLanguage} data-cy='chat-language-option' />}
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Popup
                                trigger={<Icon name='redo' color='grey' link={!noChannel} onClick={this.handleReloadChat} disabled={noChannel} data-cy='restart-chat' />}
                                content='Restart the conversation'
                                position='bottom right'
                                className='redo-chat-popup'
                                disabled={noChannel}
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <Popup
                                trigger={<Icon name='close' color='grey' link onClick={triggerChatPane} data-cy='close-chat' />}
                                content='Close the conversation'
                                position='bottom right'
                                className='redo-chat-popup'
                            />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                {socketUrl && path && selectedPayload && <Chat socketUrl={socketUrl} key={key} language={selectedLanguage} path={path} initialPayLoad={selectedPayload} />}
                {noChannel && (
                    <Message
                        content={(
                            <div>
                                Go to <Icon name='setting' />
                                Settings &gt; <Icon name='server' />
                                Instances to{' '}
                                <Link to={`/project/${projectId}/settings`} onClick={triggerChatPane} data-cy='settings-link'>
                                    create{' '}
                                </Link>
                                a valid instance of Rasa to enable the chat window.
                            </div>
                        )}
                        className='no-core-message'
                        warning
                        data-cy='no-core-instance-message'
                    />
                )}
            </div>
        );
    }
}

ProjectChat.propTypes = {
    projectId: PropTypes.string.isRequired,
    triggerChatPane: PropTypes.func.isRequired,
    channel: PropTypes.object.isRequired,
    initPayloads: PropTypes.array,
    loading: PropTypes.bool,
};

ProjectChat.defaultProps = {
    initPayloads: [],
    loading: true,
};

const ProjectChatContainer = withTracker(({ projectId }) => {
    const storiesHandler = Meteor.subscribe('stories.intro', projectId);
    let initPayloads = [];
    const { _id: IntroGroupId } = StoryGroups.findOne({ introStory: true, projectId }, { fields: { _id: 1 } });
    if (storiesHandler.ready()) {
        const initStories = Stories.find({ storyGroupId: IntroGroupId }).fetch();
        initStories.forEach((s) => {
            initPayloads = [...initPayloads, ...new StoryValidator(s.story).extractDialogAct()];
        });
    }
    return {
        loading: !storiesHandler.ready(),
        initPayloads,
    };
})(ProjectChat);

export default ProjectChatContainer;
