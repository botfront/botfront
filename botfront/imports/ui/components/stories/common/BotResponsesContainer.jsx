/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Placeholder, Loader, Header, List, Icon,
} from 'semantic-ui-react';

import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import IconButton from '../../common/IconButton';
import BotResponseEditor from '../../templates/templates-list/BotResponseEditor';
import BotResponseContainer from './BotResponseContainer';
import HoverablePopup from '../../common/HoverablePopup';
import { setStoriesCurrent } from '../../../store/actions/actions';

import { checkMetadataSet, toggleButtonPersistence } from '../../../../lib/botResponse.utils';

export const ResponseContext = React.createContext();

const BotResponsesContainer = (props) => {
    const {
        name,
        initialValue,
        onChange,
        onDeleteAllResponses,
        deletable,
        enableEditPopup,
        tag,
        setActiveStories,
        responseLocations,
        loadingResponseLocations,
        router,
    } = props;

    const [template, setTemplate] = useState();
    const [editorOpen, setEditorOpen] = useState(false);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(null);
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

    const handleToggleQuickReply = () => {
        const update = toggleButtonPersistence(template);
        onChange(update, update.__typename);
        setTemplate(update);
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

    const handleLinkToStory = (selectedId) => {
        const { location: { pathname } } = router;
        const storyIds = responseLocations.map(({ _id }) => _id);
        const openStories = [selectedId, ...storyIds.filter(storyId => storyId !== selectedId)];
        setResponseLocationsOpen(false);
        router.replace({ pathname, query: { 'ids[]': openStories } });
        setActiveStories(openStories);
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

    const renderDynamicResponseName = () => (
        <div className='response-name-container'>
            {responseLocations.length > 1 ? (
                <HoverablePopup
                    className='response-locations-popup'
                    trigger={(
                        <div className='response-name-link-container'>
                            <div
                                className='response-name response-name-link'
                                data-cy='response-name'
                            >
                                {loadingResponseLocations && <Loader active inline size='mini' className='response-name-loader' />} {name}
                            </div>
                            <div className='response-instance-count'>
                            ({responseLocations.length})
                            </div>
                        </div>
                    )}
                    content={(
                        <>
                            <Header>This response is used in {responseLocations.length} stories</Header>
                            <List data-cy='response-locations-list' className='response-locations-list'>
                                {responseLocations.map(({ title, _id, storyGroupId }) => (
                                    <List.Item
                                        className='story-name-link'
                                        key={_id}
                                        onClick={() => handleLinkToStory(_id, storyGroupId)}
                                        data-cy='story-name-link'
                                    >
                                        ##{title}
                                    </List.Item>
                                ))}
                            </List>
                        </>
                    )}
                    controlled
                    open={responseLocationsOpen}
                    setOpen={() => setResponseLocationsOpen(true)}
                    setClosed={() => setResponseLocationsOpen(false)}
                    on='click'
                    flowing
                />
            ) : (
                <div className='response-name' data-cy='response-name'>
                    {loadingResponseLocations && <Loader active inline size='mini' className='response-name-loader' />}
                    {name}
                </div>
            )}
        </div>
    );

    return (
        <ResponseContext.Provider value={{ name }}>
            <div className='utterances-container exception-wrapper-target'>
                {!template && (
                    <Placeholder>
                        <Placeholder.Line />
                        <Placeholder.Line />
                    </Placeholder>
                )}
                {getSequence().map(renderResponse)}
                <div className='side-by-side right narrow top-right'>
                    <IconButton
                        icon='pin'
                        color={null}
                        className={`${template && template.__typename === 'TextWithButtonsPayload' ? 'light-green' : 'grey'}`}
                        onClick={handleToggleQuickReply}
                    />
                    {enableEditPopup && (
                        <IconButton
                            icon='ellipsis vertical'
                            onClick={() => setEditorOpen(true)}
                            data-cy='edit-responses'
                            className={template && checkMetadataSet(template.metadata) ? 'light-green' : 'grey'}
                            color={null}
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
        </ResponseContext.Provider>
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
    setActiveStories: PropTypes.func.isRequired,
    responseLocations: PropTypes.array,
    loadingResponseLocations: PropTypes.bool,
    router: PropTypes.object.isRequired,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
    name: null,
    initialValue: null,
    onChange: () => {},
    onDeleteAllResponses: null,
    enableEditPopup: true,
    tag: null,
    responseLocations: [],
    loadingResponseLocations: false,
};

export default connect(() => ({}), { setActiveStories: setStoriesCurrent })(withRouter(BotResponsesContainer));
