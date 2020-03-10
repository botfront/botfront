/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Placeholder } from 'semantic-ui-react';

import { connect } from 'react-redux';
import IconButton from '../../common/IconButton';
import BotResponseEditor from '../../templates/templates-list/BotResponseEditor';
import BotResponseContainer from './BotResponseContainer';
import ExceptionWrapper from './ExceptionWrapper';
import { useUpload } from '../hooks/image.hooks';

import { checkMetadataSet } from '../../../../lib/botResponse.utils';
import { can } from '../../../../lib/scopes';

const BotResponsesContainer = (props) => {
    const {
        name,
        initialValue,
        onChange,
        onDeleteAllResponses,
        deletable,
        exceptions,
        enableEditPopup,
        tag,
        projectId,
    } = props;
    const [template, setTemplate] = useState();
    const [editorOpen, setEditorOpen] = useState(false);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(null);
    const [uploadImage] = useUpload(name);

    const editable = can('responses:w', projectId);

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
            <div className='flex-right'>
                <BotResponseContainer
                    tag={tag}
                    deletable={deletable && sequenceArray.length > 1}
                    value={response}
                    onDelete={() => handleDeleteResponse(index)}
                    onAbort={() => {}}
                    onChange={(newContent, enter) => handleChangeResponse(newContent, index, enter)}
                    focus={focus === index}
                    onFocus={() => setFocus(index)}
                    editCustom={() => setEditorOpen(true)}
                    uploadImage={uploadImage}
                    hasMetadata={template && checkMetadataSet(template.metadata)}
                    metadata={(template || {}).metadata}
                    editable={editable}
                />
                {index === sequenceArray.length - 1 && name && (
                    <div className='response-name'>{name}</div>
                )}
            </div>
        </React.Fragment>
    );
    
    return (
        <ExceptionWrapper exceptions={exceptions}>
            <div className='responses-container exception-wrapper'>
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
                    { deletable && can('stories:w', projectId) && onDeleteAllResponses && (
                        <IconButton onClick={onDeleteAllResponses} icon='trash' />
                    )}
                </div>
            </div>
        </ExceptionWrapper>
    );
};

BotResponsesContainer.propTypes = {
    deletable: PropTypes.bool,
    name: PropTypes.string,
    initialValue: PropTypes.object,
    onChange: PropTypes.func,
    onDeleteAllResponses: PropTypes.func,
    exceptions: PropTypes.array,
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
    exceptions: [{ type: null }],
    enableEditPopup: true,
    tag: null,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(BotResponsesContainer);
