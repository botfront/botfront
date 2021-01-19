import {
    Popup, Icon, Menu, Label, Message, Checkbox, Header, List, Confirm, Button,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import React, {
    useState, useContext, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import 'brace/theme/github';
import 'brace/mode/text';
import StoryPlayButton from './StoryPlayButton';
import ConfirmPopup from '../common/ConfirmPopup';
import StoryVisualEditor from './common/StoryVisualEditor';
import { ConversationOptionsContext } from './Context';
import { can } from '../../../lib/scopes';
import { storyTypeCustomizations } from '../../../lib/story.types';
import StoryPrefix from './common/StoryPrefix';

const StoryTopMenu = ({
    fragment,
    warnings,
    errors,
    storyMode,
    renderAceEditor,
    projectId,
}) => {
    const {
        type,
        _id,
        title,
        checkpoints,
        condition = [],
        conversation_start: convStart,
        status,
    } = fragment;
    const [newTitle, setNewTitle] = useState(title);
    const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
    const [confirmOverwriteOpen, setConfirmOverwriteOpen] = useState(false);

    const testCaseFailing = useMemo(() => type === 'test_case' && fragment.success === false, [type, fragment]);

    useEffect(() => setNewTitle(title), [title]);

    const {
        stories, updateStory, getResponseLocations, linkToStory, deleteStory,
    } = useContext(ConversationOptionsContext);
    const isDestinationStory = !!(checkpoints || []).length;

    const submitTitleInput = () => {
        if (title === newTitle) return null;
        if (!newTitle.replace(/\s/g, '').length) return setNewTitle(title);
        return updateStory({ _id, title: newTitle });
    };

    const handleInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            event.target.blur();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setNewTitle(title);
            event.target.blur();
            updateStory({ _id, title });
        }
    };

    const renderWarnings = () => {
        const pluralize = warnings > 1 ? 's' : '';
        if (warnings <= 0) {
            return <></>;
        }
        return (
            <Label
                className='exception-label'
                color='yellow'
                data-cy='top-menu-warning-alert'
            >
                <Icon name='exclamation circle' />
                {warnings} Warning{pluralize}
            </Label>
        );
    };

    const renderErrors = () => {
        const pluralize = errors > 1 ? 's' : '';
        if (errors <= 0) {
            return <></>;
        }
        return (
            <Label className='exception-label' color='red' data-cy='top-menu-error-alert'>
                <Icon name='times circle' />
                {errors}{!testCaseFailing && ` Error${pluralize}`}
            </Label>
        );
    };

    const renderConnectedStories = () => {
        const connectedStories = stories.filter(({ _id: cId }) => checkpoints.some(originId => cId === originId[0]));
        return (
            <List data-cy='response-locations-list' className='link-list'>
                {connectedStories.map(({ _id: cId, title: connectedTitle }) => (
                    <List.Item
                        key={cId}
                        onClick={() => linkToStory(cId)}
                        data-cy='story-name-link'
                    >
                        <span className='story-title-prefix'>##</span>
                        <span className='story-name-link'>{connectedTitle}</span>
                    </List.Item>
                ))}
            </List>
        );
    };

    const renderConvStartToggle = () => {
        if (type !== 'rule') return null;
        return (
            <Popup
                on='click'
                open={confirmPopupOpen}
                disabled={!can('stories:w', projectId) || !condition.length || !!convStart}
                onOpen={() => setConfirmPopupOpen(true)}
                onClose={() => setConfirmPopupOpen(false)}
                content={(
                    <ConfirmPopup
                        title='Conditions will be deleted!'
                        onYes={() => {
                            setConfirmPopupOpen(false);
                            updateStory({ _id, conversation_start: !convStart, condition: [] });
                        }}
                        onNo={() => setConfirmPopupOpen(false)}
                    />
                )}
                trigger={(
                    <Checkbox
                        toggle
                        disabled={!can('stories:w', projectId)}
                        label='conversation start'
                        className='story-box-toggle'
                        checked={convStart}
                        data-cy='toggle-conversation-start'
                        onClick={(e) => {
                            e.preventDefault();
                            if (!condition.length || !!convStart) updateStory({ _id, conversation_start: !convStart });
                        }}
                    />
                )}
            />
        );
    };

    const renderConditionSection = () => (
        <>
            <Header as='h5' dividing>&nbsp;&nbsp;Conditions</Header>
            {storyMode !== 'visual'
                ? renderAceEditor()
                : (
                    <StoryVisualEditor
                        onSave={c => updateStory({ _id, condition: c })}
                        story={condition}
                        getResponseLocations={getResponseLocations}
                        mode='rule_condition'
                    />
                )
            }
        </>
    );

    const renderTestCaseButtons = () => testCaseFailing && (
        <span className='test-case-buttons-container'>
            <Button
                onClick={() => setConfirmOverwriteOpen(true)}
                className='overwrite-expected-button'
                basic
                color='green'
                content='Set actual as expected'
                icon='check'
                labelPosition='right'
                size='mini'
                data-cy='overwrite-test-button'
            />
            <Button
                onClick={() => deleteStory(fragment)}
                className='remove-test-button'
                basic
                color='red'
                content='Remove test case'
                icon='trash'
                labelPosition='right'
                size='mini'
                data-cy='delete-test-button'
            />
        </span>
    );

    const renderConfirmOverwrite = () => (
        <Confirm
            header='Warning'
            className='warning'
            content='The current expected results will be overwritten. This action cannot be undone.'
            cancelButton='Cancel'
            confirmButton='Overwrite'
            open={confirmOverwriteOpen && testCaseFailing}
            onCancel={() => setConfirmOverwriteOpen(false)}
            onConfirm={() => {
                Meteor.call('test_case.overwrite', fragment.projectId, fragment._id);
                setConfirmOverwriteOpen(false);
            }}
        />
    );

    return (
        <>
            <Menu
                attached='top'
                data-cy='story-top-menu'
                className={`${testCaseFailing ? 'test-case-failing' : ''}`}
            >
                <Menu.Item header>
                    {isDestinationStory ? (
                        <Icon name='arrow alternate circle right' color='green' fitted />
                    ) : (
                        <StoryPrefix fragment={fragment} />
                    )}
                    {status === 'unpublished' && <Label content='Unpublished' /> }
                    <input
                        data-cy='story-title'
                        value={newTitle}
                        onChange={event => setNewTitle(event.target.value.replace('_', ''))}
                        onKeyDown={handleInputKeyDown}
                        onBlur={submitTitleInput}
                    />
                </Menu.Item>
                <Menu.Item position='right'>
                    {!testCaseFailing && renderWarnings()}
                    {!testCaseFailing && renderErrors()}
                    {renderConvStartToggle()}
                    {renderTestCaseButtons()}
                    <StoryPlayButton
                        fragment={fragment}
                        className='top-menu-clickable'
                        type={fragment.type}
                        storyId={fragment._id}
                        projectId={projectId}
                    />
                </Menu.Item>
            </Menu>
            {isDestinationStory && (
                <Popup
                    className='connected-stories-popup'
                    size='small'
                    on='click'
                    position='bottom left'
                    trigger={(
                        <Message
                            className='top-menu-banner with-popup'
                            attached
                            warning
                            size='tiny'
                            data-cy='connected-to'
                        >
                            <Icon name='info circle' />
                            There are one or more stories linked to this story. You can
                            only delete it after unlinking all stories.
                        </Message>
                    )}
                >
                    {renderConnectedStories()}
                </Popup>
            )}
            {type === 'rule' && !convStart && (
                <Message
                    className={`top-menu-banner condition-container ${!condition.length ? 'empty' : ''}`}
                    attached
                    warning
                    size='tiny'
                    data-cy='connected-to'
                >
                    {renderConditionSection()}
                </Message>
            )}
            {testCaseFailing && (
                <Message
                    className='top-menu-banner'
                    attached
                    error
                    data-cy='connected-to'
                >
                    <span className='test-failure-message'>
                        The most recent run of this test failed.
                    </span>
                </Message>
            )}
            {renderConfirmOverwrite()}
        </>
    );
};

StoryTopMenu.propTypes = {
    fragment: PropTypes.object.isRequired,
    warnings: PropTypes.number.isRequired,
    errors: PropTypes.number.isRequired,
    storyMode: PropTypes.string.isRequired,
    renderAceEditor: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};
StoryTopMenu.defaultProps = {};

const mapStateToProps = state => ({
    storyMode: state.stories.get('storyMode'),
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(StoryTopMenu);
