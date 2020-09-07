/* eslint-disable camelcase */
import React, {
    useState, useEffect, useReducer, useMemo, useContext, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { isEqual } from 'lodash';
import {
    Container, Button, Popup, Label,
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import { connect } from 'react-redux';
import { NLUModels } from '../../../../../api/nlu_model/nlu_model.collection';
import NluTable from '../../../nlu/models/NluTable';
import InsertNlu from '../../../example_editor/InsertNLU';
import ConfirmPopup from '../../../common/ConfirmPopup';
import { setWorkingLanguage } from '../../../../store/actions/actions';
import ExampleUtils from '../../../utils/ExampleUtils';
import { ConversationOptionsContext } from '../../Context';
import { clearTypenameField } from '../../../../../lib/client.safe.utils';
import {
    useExamples,
} from '../../../nlu/models/hooks';
import { ProjectContext } from '../../../../layouts/context';
import {
    createRenderExample,
    createRenderDelete,
    createRenderCanonical,
    createRenderEditExample,
    createRenderIntent,
} from '../../../nlu/models/NluTableColumns';


const NLUModalContent = (props) => {
    const {
        projectId, workingLanguage, closeModal, payload, displayedExample,
    } = props;
    const {
        instance, intents, entities,
    } = useContext(
        ProjectContext,
    );
    const { model } = useTracker(() => {
        Meteor.subscribe('nlu_models', projectId);
        return { model: NLUModels.findOne({ projectId, language: workingLanguage }) };
    });

    const {
        data: existingExamples, loading: loadingExamples,
    } = useExamples({
        projectId, language: workingLanguage, pageSize: 0, intents: [payload.intent],
    });


    const checkPayloadsMatch = example => example.intent === payload.intent
        && (example.entities || []).length === payload.entities.length
        && (example.entities || []).every(entity => payload.entities.find(
            payloadEntity => payloadEntity.entity === entity.entity,
        ));

    const [shouldForceRefresh, setShouldForceRefresh] = useState(false);


    const canonicalizeExample = (newExample, currentExamples) => {
        const exists = currentExamples.some(currentExample => (
            ExampleUtils.sameCanonicalGroup(currentExample, newExample)
                && !currentExample.deleted
        ));
        if (!exists && checkPayloadsMatch(newExample)) {
            setShouldForceRefresh(true);
            return { ...newExample, metadata: { canonical: true }, canonicalEdited: true };
        }
        return newExample;
    };

    const canonicalizeExamples = (newExamples, currentExamples) => (
        newExamples.map(newExample => (
            canonicalizeExample(newExample, currentExamples)))
    );

    const exampleReducer = (state, updatedExamples) => updatedExamples
        .map((example) => {
            if (example.isDisplayed && (
                example.deleted
                || example.edited
            )) setShouldForceRefresh(true);
            return ({
                ...example,
                invalid: !checkPayloadsMatch(example),
                isDisplayed: example._id === displayedExample._id,
            });
        })
        .sort((exampleA, exampleB) => {
            if (exampleA.invalid) {
                if (exampleB.invalid) return 0;
                return -1;
            }
            if (exampleA.isNew) {
                if (exampleB.invalid) return 1;
                if (exampleB.isNew) return 0;
                return -1;
            }
            if (exampleA.edited) {
                if (exampleB.isNew || exampleB.invalid) return 1;
                if (exampleB.edited) return 0;
                return -1;
            }
            if (exampleB.invalid || exampleB.isNew || exampleB.edited) return 1;
            return 0;
        });
    /*
        while this is not the recomended use of a useReducer hook it is
        preferable to useState as it ensures the validity check and sort
        will always be called when the examples are updated
    */
    const [examples, setExamples] = useReducer(exampleReducer, []); // the example reducer applies a sort and validity check
    const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
    const [editExampleId, setEditExampleId] = useState(false);
    const [selection, setSelection] = useState([]);
    const singleSelectedIntentLabelRef = useRef(null);

    const hasInvalidExamples = useMemo(
        () => examples.some(example => example.invalid === true && !example.deleted),
        [examples],
    );
    const { reloadStories } = useContext(ConversationOptionsContext);

    useEffect(() => {
        const incomingExamples = existingExamples.filter(
            dbExample => !examples.find(({ _id }) => dbExample._id === _id)
                && checkPayloadsMatch(dbExample),
        );
        setExamples([...examples, ...incomingExamples]);
    }, [existingExamples]);

    const getIntentForDropdown = (all) => {
        const intentSelection = all ? [{ text: 'ALL', value: null }] : [];
        intents.forEach((i) => {
            intentSelection.push({
                text: i,
                value: i,
            });
        });
        return intentSelection;
    };

    const onNewExamples = (newExamples) => {
        const canonicalizedExamples = canonicalizeExamples(newExamples, examples);
        setExamples([
            ...canonicalizedExamples.map(v => ({
                ...ExampleUtils.prepareExample(v),
                isNew: true,
                ...(v.canonicalEdited ? { canonicalEdited: true } : {}),
            })),
            ...examples,
        ]);
    };

    const onDeleteExamples = (ids) => {
        const updatedExamples = [...examples];
        ids.forEach((id) => {
            const removeIndex = examples.findIndex(({ _id }) => _id === id);
            const oldExample = { ...updatedExamples[removeIndex] };
            updatedExamples[removeIndex] = { ...oldExample, deleted: !oldExample.deleted };
        });
        setExamples(updatedExamples);
    };

    const onDeleteExample = (itemId) => {
        onDeleteExamples([itemId]);
    };

    const onUpdateExamples = (examplesUpdate) => {
        const updatedExamples = [...examples];
        examplesUpdate.forEach((example) => {
            const index = examples.findIndex(({ _id }) => (
                _id === example._id
            ));
            const oldExample = examples[index];
            if (isEqual(example, oldExample)) {
                return;
            }
            updatedExamples[index] = { ...updatedExamples[index], ...example, metadata: { ...updatedExamples[index].metadata, ...example.metadata } };
            if (example.isNew) {
                updatedExamples[index] = canonicalizeExample(example, updatedExamples);
            } else {
                updatedExamples[index].edited = true;
            }
        });
        setExamples(updatedExamples);
    };

    const onEditExample = (example) => {
        onUpdateExamples([example]);
    };

    const onSwitchCanonical = async (example) => {
        setShouldForceRefresh(true);
        const updatedExamples = [...examples];
        const newCanonicalIndex = examples.findIndex((exampleMatch) => {
            if (example._id === exampleMatch._id) return true;
            return false;
        });
        const oldCanonicalIndex = examples.findIndex((oldExample) => {
            if (
                ExampleUtils.sameCanonicalGroup(example, oldExample)
                && oldExample?.metadata?.canonical
            ) {
                return true;
            }
            return false;
        });
        updatedExamples[newCanonicalIndex].metadata.canonical = !example.metadata.canonical;
        updatedExamples[newCanonicalIndex].canonicalEdited = true; // !updatedExamples[newCanonicalIndex].canonicalEdited;
        const clearOldCanonical = oldCanonicalIndex !== newCanonicalIndex && oldCanonicalIndex > -1;
        if (clearOldCanonical) {
            updatedExamples[oldCanonicalIndex] = {
                ...updatedExamples[oldCanonicalIndex],
                metadata: { ...example.metadata, canonical: false },
            };
        }
        setExamples(updatedExamples);
        return { changed: clearOldCanonical };
    };

    const saveAndExit = () => {
        Meteor.call(
            'nlu.saveExampleChanges',
            projectId,
            workingLanguage,
            examples,
            () => {
                if (shouldForceRefresh) {
                    if (shouldForceRefresh) reloadStories();
                }
                closeModal();
            },
        );
    };

    const handleCancel = (e) => {
        const madeChanges = examples.some(({
            edited, isNew, invalid, canonicalEdited, deleted,
        }) => (
            edited || isNew || invalid || canonicalEdited || deleted
        ));
        if (!madeChanges) {
            e.preventDefault();
            closeModal();
        }
    };

    const getRowStyle = (example) => {
        if (!example) return {};
        if (example.deleted) return { style: { backgroundColor: 'rgb(245, 245, 245)', pointerEvents: 'none', opacity: 0.5 } };
        if (!checkPayloadsMatch(example)) { return { style: { backgroundColor: 'rgb(255, 230, 230)' } }; }
        if (example.isNew) return { style: { backgroundColor: 'rgb(230, 255, 240)' } };
        if (example.edited) return { style: { backgroundColor: 'rgb(230, 252, 255)' } };
        return {};
    };

    const handleExampleTextareaBlur = (example) => {
        setEditExampleId(null);
        onEditExample(clearTypenameField(example));
    };

    const renderLabelColumn = (row) => {
        const {
            datum: {
                edited, isNew, deleted, entities: cellEntities, intent,
            } = {},
        } = row;
        let text;
        let color;
        let title;
        let message;
        if (deleted) {
            text = 'deleted';
            color = undefined;
            title = 'Deleted Example';
            message = 'You just deleted this user utterance and it will be removed from the training set when you save';
        } else if (!checkPayloadsMatch({ intent, entities: cellEntities })) {
            text = 'invalid';
            color = 'red';
            title = 'Invalid Example';
            message = 'The intent and entities associated with this utterance do not correspond to the currently selected payload. Either adjust intent and entities or delete this utterance';
        } else if (isNew) {
            text = 'new';
            color = 'green';
            title = 'New example';
            message = 'You just added this utterance and it is not yet added to the training set';
        } else if (edited) {
            text = 'edited';
            color = 'blue';
            title = 'Edited example';
            message = 'You edited this utterance and the changes are not yet saved in the training set';
        }
        return text ? (
            <Popup
                trigger={(
                    <Label
                        className='nlu-modified-label'
                        color={color}
                        size='mini'
                        data-cy='nlu-modification-label'
                    >
                        {text}
                    </Label>
                )}
                header={title}
                content={message}
            />
        ) : (
            <></>
        );
    };

    const columns = [
        { key: '_id', selectionKey: true, hidden: true },
        {
            key: 'intent',
            style: {
                paddingLeft: '1rem', width: '200px', minWidth: '200px', overflow: 'hidden',
            },
            render: createRenderIntent(selection, onEditExample, singleSelectedIntentLabelRef),
        },
        {
            key: 'text', style: { width: '100%' }, render: createRenderExample(editExampleId, handleExampleTextareaBlur, onEditExample),
        },
        { key: 'labelColumn', style: { width: '50px' }, render: renderLabelColumn },
        { key: 'edit', style: { width: '50px' }, render: createRenderEditExample(setEditExampleId) },
        { key: 'delete', style: { width: '50px' }, render: createRenderDelete(onDeleteExample) },
        { key: 'canonical', style: { width: '50px' }, render: createRenderCanonical(onSwitchCanonical) },
    ];
    
    
    return (
        loadingExamples
            ? (
                <div>loading</div>
            )
            : (
                <Container>
                    <>
                        <br />
                        {instance && (
                            <div id='playground'>
                                <InsertNlu
                                    testMode
                                    model={model}
                                    projectId={projectId}
                                    instance={instance}
                                    floated='right'
                                    entities={entities}
                                    intents={getIntentForDropdown(false)}
                                    onSave={async (ex) => {
                                        const promiseParsing = ex.map(example => new Promise((resolve) => {
                                            Meteor.call(
                                                'rasa.parse',
                                                instance,
                                                [{ text: example, lang: workingLanguage }],
                                                { failSilently: true },
                                                (err, exampleMatch) => {
                                                    if (err || !exampleMatch || !exampleMatch.intent) {
                                                        resolve({ text: example, intent: 'draft.intent' });
                                                    }
                                                    const { intent: { name }, entities: ents } = exampleMatch;
                                                    resolve({
                                                        text: example, intent: name, entities: ents,
                                                    });
                                                },
                                            );
                                        }));
                                
                                        const examplesParsed = await Promise.all(promiseParsing);
                                        onNewExamples(examplesParsed);
                                    }}
                                    postSaveAction='clear'
                                    defaultIntent={payload.intent}
                                    saveOnEnter
                                    silenceRasaErrors
                                />
                            </div>
                        )}
                    </>
                    <br />
                    <NluTable
                        deleteExamples={onDeleteExamples}
                        updateExamples={onUpdateExamples}
                        data={examples}
                        entities={entities}
                        intents={intents}
                        columns={columns}
                        selection={selection}
                        hideFilters
                        useShortCuts
                        setSelection={setSelection}
                        noDrafts
                        height={600}
                    />
                    <div className='nlu-modal-buttons'>
                        <Popup
                            disabled={!hasInvalidExamples}
                            trigger={(
                                <span>
                                    <Button
                                        color='blue'
                                        onClick={saveAndExit}
                                        disabled={hasInvalidExamples}
                                        data-cy='save-nlu'
                                    >
                                        Save and exit
                                    </Button>
                                </span>
                            )}
                            header='Cannot save changes'
                            content='You must fix invalid utterances prior to saving'
                        />
                        <Popup
                            trigger={(
                                <Button onClick={handleCancel} data-cy='cancel-nlu-changes'>
                                    Cancel
                                </Button>
                            )}
                            content={(
                                <ConfirmPopup
                                    description='Are you sure? All the data you entered above will be discarded!'
                                    onYes={closeModal}
                                    onNo={() => setCancelPopupOpen(false)}
                                />
                            )}
                            on='click'
                            open={cancelPopupOpen}
                            onClose={() => setCancelPopupOpen(false)}
                            onOpen={() => setCancelPopupOpen(true)}
                        />
                    </div>
                </Container>
            )
    );
};

NLUModalContent.propTypes = {
    projectId: PropTypes.string,
    payload: PropTypes.object.isRequired,
    entities: PropTypes.array,
    closeModal: PropTypes.func.isRequired,
    displayedExample: PropTypes.object,
    workingLanguage: PropTypes.string.isRequired,
};

NLUModalContent.defaultProps = {
    projectId: '',
    entities: [],
    displayedExample: {},
};

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
    projectId: state.settings.get('projectId'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};
export default connect(mapStateToProps, mapDispatchToProps)(NLUModalContent);
