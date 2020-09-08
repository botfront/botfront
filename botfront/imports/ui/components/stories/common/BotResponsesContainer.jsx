/* eslint-disable no-underscore-dangle */
import React, {
    useState, useEffect, useMemo, useContext,
} from 'react';
import PropTypes from 'prop-types';
import {
    Placeholder, Dropdown,
} from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { safeLoad } from 'js-yaml';

import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import IconButton from '../../common/IconButton';
import BotResponseEditor from '../../templates/templates-list/BotResponseEditor';
import ButtonTypeToggle from '../../templates/common/ButtonTypeToggle';
import BotResponseContainer from './BotResponseContainer';
import { setStoriesCurrent } from '../../../store/actions/actions';
import { ProjectContext } from '../../../layouts/context';
import {
    checkMetadataSet, toggleButtonPersistence, parseContentType, checkContentEmpty,
} from '../../../../lib/botResponse.utils';
import BotResponseName from './BotResponseName';
import { RESP_FROM_LANG } from '../graphql/mutations';

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
        isNew,
    } = props;
    const {
        project: { _id: projectId },
        projectLanguages = [],
        language,
        setResponseInCache,
    } = useContext(ProjectContext);
    const otherLanguages = projectLanguages.filter(lang => lang.value !== language);
    const [importRespFromLang] = useMutation(RESP_FROM_LANG, {
        onCompleted: (data) => {
            const resp = data.importRespFromLang.values.find(value => value.lang === language);
            const content = safeLoad(resp.sequence[0].content);
            const type = parseContentType(content);
            setResponseInCache(name, { ...content, __typename: type });
        },
    });
    const [template, setTemplate] = useState();
    const [editorOpen, setEditorOpen] = useState(false);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(null);
    const typeName = useMemo(() => template && template.__typename, [template]);

    useEffect(() => {
        Promise.resolve(initialValue).then((res) => {
            if (!res) return;
            setTemplate(res);
            if (res.isNew && isNew !== false) setFocus(0);
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
            onChange({ payload: newTemplate });
            return setTemplate(newTemplate);
        }
        onChange({ payload: newSequence[0] });
        return setTemplate(newSequence[0]);
    };

    const handleToggleQuickReply = () => {
        const update = toggleButtonPersistence(template);
        onChange({ payload: update });
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

    const handleNameChange = newName => onChange({ key: newName, payload: template });

    const handleLinkToStory = (selectedId) => {
        const { location: { pathname } } = router;
        const storyIds = responseLocations.map(({ _id }) => _id);
        const openStories = [selectedId, ...storyIds.filter(storyId => storyId !== selectedId)];
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
        <BotResponseName
            name={name}
            responseLocations={responseLocations}
            loading={loadingResponseLocations}
            linkToStory={handleLinkToStory}
            onChange={handleNameChange}
        />
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
                    <ButtonTypeToggle
                        onToggleButtonType={handleToggleQuickReply}
                        responseType={typeName}
                    />
                    {otherLanguages.length > 0 && initialValue && !initialValue.isNew && getSequence().length === 1 && !checkContentEmpty(getSequence()[0])
                        && (
                            <Dropdown
                                button
                                icon={null}
                                compact
                                data-cy='import-from-lang'
                                className='import-from-lang'
                                options={otherLanguages}
                                text='Copy from'
                                onChange={(_, selection) => {
                                    importRespFromLang({
                                        variables: {
                                            projectId, key: name, originLang: selection.value, destLang: language,
                                        },
                                    });
                                }}
                            />
                        )
                    }
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
    isNew: PropTypes.bool,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
    name: null,
    isNew: false,
    initialValue: null,
    onChange: () => {},
    onDeleteAllResponses: null,
    enableEditPopup: true,
    tag: null,
    responseLocations: [],
    loadingResponseLocations: false,
};

export default connect(() => ({}), { setActiveStories: setStoriesCurrent })(withRouter(BotResponsesContainer));
