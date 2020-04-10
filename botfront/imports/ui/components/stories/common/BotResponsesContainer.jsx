/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Placeholder, Loader, Popup, Header, List,
} from 'semantic-ui-react';

import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import IconButton from '../../common/IconButton';
import BotResponseEditor from '../../templates/templates-list/BotResponseEditor';
import BotResponseContainer from './BotResponseContainer';
import { setStoriesCurrent } from '../../../store/actions/actions';

import { checkMetadataSet } from '../../../../lib/botResponse.utils';

const BotResponsesContainer = (props) => {
    const {
        name,
        initialValue,
        onChange,
        onDeleteAllResponses,
        deletable,
        enableEditPopup,
        tag,
        projectId,
        setActiveStories,
    } = props;

    const [template, setTemplate] = useState();
    const [editorOpen, setEditorOpen] = useState(false);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(null);
    const [responseLocations, setResponseLocations] = useState([]);
    const [loadingResponseLocations, setLoadingResponseLocations] = useState(false);
    const [responseLocationsOpen, setResponseLocationsOpen] = useState(false);

    useEffect(() => {
        Promise.resolve(initialValue).then((res) => {
            if (!res) return;
            setTemplate(res);
            if (res.isNew) setFocus(0);
        });
    }, [initialValue]);

    const newText = { __typename: 'TextPayload', text: '' };

    const getSequence = () => {
        if (!template) return [];
        if (template.__typename !== 'TextPayload') return [template];
        return template.text
            .split('\n\n')
            .map(text => ({ __typename: 'TextPayload', text }));
    };

    const setSequence = (newSequence) => {
        if (template.__typename === 'TextPayload') {
            const newTemplate = {
                __typename: 'TextPayload',
                text: newSequence.map(seq => seq.text).join('\n\n'),
                metadata: template.metadata,
            };
            onChange(newTemplate);
            return setTemplate(newTemplate);
        }
        onChange(newSequence[0]);
        return setTemplate(newSequence[0]);
    };

    const handleCreateReponse = (index) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index + 1, 0, newText);
        setFocus(index + 1);
        setSequence(newSequence);
    };

    const handleDeleteResponse = (index) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index, 1);
        const oneUp = Math.min(index, newSequence.length - 1);
        const oneDown = Math.max(0, index - 1);
        setSequence(newSequence);
        setFocus(Math.min(oneDown, oneUp));
    };

    const handleChangeResponse = (newContent, index, enter) => {
        setFocus(null);
        const sequence = [...getSequence()];
        const oldContent = sequence[index];
        sequence[index] = { ...oldContent, ...newContent };
        setSequence(sequence);
        if (enter) setToBeCreated(index);
        return true;
    };

    const handleMouseOver = () => {
        setLoadingResponseLocations(true);
        Meteor.call('stories.includesResponse', projectId, name, (error, result) => {
            setLoadingResponseLocations(false);
            if (error) {
                console.log(error);
                return;
            }
            setResponseLocations(result);
        });
    };

    useEffect(() => {
        if (toBeCreated || toBeCreated === 0) {
            handleCreateReponse(toBeCreated);
            setToBeCreated(null);
        }
    }, [toBeCreated]);
    
    const renderResponse = (response, index, sequenceArray) => (
        <React.Fragment
            key={`${response.text}-${(sequenceArray[index + 1] || {}).text}-${index}`}
        >
            <div className='story-line'>
                <BotResponseContainer
                    tag={tag}
                    value={response}
                    onDelete={() => { if (sequenceArray.length > 1) handleDeleteResponse(index); }}
                    onAbort={() => {}}
                    onChange={(newContent, enter) => handleChangeResponse(newContent, index, enter)}
                    focus={focus === index}
                    onFocus={() => setFocus(index)}
                    editCustom={() => setEditorOpen(true)}
                    hasMetadata={template && checkMetadataSet(template.metadata)}
                />
                {deletable && sequenceArray.length > 1 && <IconButton onClick={() => handleDeleteResponse(index)} icon='trash' />}
            </div>
        </React.Fragment>
    );

    const handleLinkToStory = (storyId) => {
        setActiveStories([storyId]);
        setResponseLocationsOpen(false);
        browserHistory.replace({ pathname: '/project/bf/stories', query: { 'ids[]': storyId } });
    };
    const renderDynamicResponseName = () => {
        console.log();
        return (
            <div className='response-name-container'>
                {loadingResponseLocations && <Loader active inline size='mini' className='response-name-loader' />}
                {responseLocations.length > 1 ? (
                    <Popup
                        open={responseLocationsOpen}
                        onClose={() => {
                            setResponseLocationsOpen(false);
                        }}
                        onOpen={() => setResponseLocationsOpen(true)}
                        on='click'
                        trigger={(
                            <div className='response-name response-name-link'>
                                {name}({responseLocations.length})
                            </div>
                        )}
                        content={(
                            <>
                                <Header>This response is used in {responseLocations.length} stories</Header>
                                <List>
                                    {responseLocations.map(({ title, _id, storyGroupId }) => (
                                        <List.Item
                                            key={_id}
                                            onClick={() => handleLinkToStory(_id, storyGroupId)}
                                        >
                                            ##{title}
                                        </List.Item>
                                    ))}
                                </List>
                            </>
                        )}
                    />
                ) : (
                    <div className='response-name'>{name}</div>
                )}
            </div>
        );
    };

    return (
        <div
            className='utterances-container exception-wrapper-target'
            onMouseEnter={handleMouseOver}
            onFocus={handleMouseOver}
        >
            {!template && (
                <Placeholder>
                    <Placeholder.Line />
                    <Placeholder.Line />
                </Placeholder>
            )}
            {getSequence().map(renderResponse)}
            <div className='side-by-side right narrow top-right'>
                {enableEditPopup && (
                    <IconButton
                        icon='ellipsis vertical'
                        onClick={() => setEditorOpen(true)}
                        data-cy='edit-responses'
                        className={template && checkMetadataSet(template.metadata) ? 'light-green' : 'grey'}
                        color={null} // prevent default color overiding the color set by the class
                    />
                )}
                {editorOpen && (
                    <BotResponseEditor
                        open={editorOpen}
                        name={name}
                        closeModal={() => setEditorOpen(false)}
                        renameable={false}
                    />
                )}
                { deletable && onDeleteAllResponses && (
                    <IconButton onClick={onDeleteAllResponses} icon='trash' />
                )}
            </div>
            {renderDynamicResponseName()}
        </div>
    );
};

BotResponsesContainer.propTypes = {
    deletable: PropTypes.bool,
    name: PropTypes.string,
    initialValue: PropTypes.object,
    onChange: PropTypes.func,
    onDeleteAllResponses: PropTypes.func,
    enableEditPopup: PropTypes.bool,
    tag: PropTypes.string,
    projectId: PropTypes.string.isRequired,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
    name: null,
    initialValue: null,
    onChange: () => {},
    onDeleteAllResponses: null,
    enableEditPopup: true,
    tag: null,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});
export default connect(mapStateToProps, { setActiveStories: setStoriesCurrent })(BotResponsesContainer);
