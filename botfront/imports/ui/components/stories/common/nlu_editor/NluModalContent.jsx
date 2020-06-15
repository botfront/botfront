/* eslint-disable camelcase */
import React, {
    useState, useEffect, useReducer, useMemo, useContext,
} from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { browserHistory } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';
import { uniq, sortBy, isEqual } from 'lodash';
import {
    Container, Button, Popup, Label,
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import { connect } from 'react-redux';
import { NLUModels } from '../../../../../api/nlu_model/nlu_model.collection';
import { getNluModelLanguages } from '../../../../../api/nlu_model/nlu_model.utils';
import { Instances } from '../../../../../api/instances/instances.collection';
import { GlobalSettings } from '../../../../../api/globalSettings/globalSettings.collection';
import NluDataTable from '../../../nlu/models/NluDataTable';
import NLUPlayground from '../../../example_editor/NLUPlayground';
import ConfirmPopup from '../../../common/ConfirmPopup';
import { Projects } from '../../../../../api/project/project.collection';
import { extractEntities } from '../../../nlu/models/nluModel.utils';
import { setWorkingLanguage } from '../../../../store/actions/actions';
import ExampleUtils from '../../../utils/ExampleUtils';
import { ConversationOptionsContext } from '../../Context';
import { can } from '../../../../../lib/scopes';


const NLUModalContent = (props) => {
    const {
        model,
        projectId,
        intents,
        payload,
        instance,
        entities,
        examples: existingExamples,
        closeModal,
        ready,
        displayedExample,
    } = props;
    const canEdit = can('nlu-data:w', projectId);
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
            return { ...newExample, canonical: true, canonicalEdited: true };
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

    const onEditExample = (example, callback) => {
        const updatedExamples = [...examples];
        const index = examples.findIndex(({ _id }) => (
            _id === example._id
        ));
        const oldExample = examples[index];
        if (isEqual(example, oldExample)) {
            return;
        }
        updatedExamples[index] = example;
        if (example.isNew) {
            updatedExamples[index] = canonicalizeExample(example, examples);
        } else {
            updatedExamples[index].edited = true;
        }
        setExamples(updatedExamples);
        callback();
    };

    const onDeleteExample = (itemId) => {
        const removeIndex = examples.findIndex(({ _id }) => _id === itemId);
        const updatedExamples = [...examples];
        const oldExample = { ...updatedExamples[removeIndex] };
        updatedExamples[removeIndex] = { ...oldExample, deleted: !oldExample.deleted };
        setExamples(updatedExamples);
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
                && oldExample.canonical
            ) {
                return true;
            }
            return false;
        });
        updatedExamples[newCanonicalIndex].canonical = !example.canonical;
        updatedExamples[newCanonicalIndex].canonicalEdited = true; // !updatedExamples[newCanonicalIndex].canonicalEdited;
        const clearOldCanonical = oldCanonicalIndex !== newCanonicalIndex && oldCanonicalIndex > -1;
        if (clearOldCanonical) {
            updatedExamples[oldCanonicalIndex] = {
                ...updatedExamples[oldCanonicalIndex],
                canonical: false,
            };
        }
        setExamples(updatedExamples);
        return { changed: clearOldCanonical };
    };

    const saveAndExit = () => {
        Meteor.call(
            'nlu.saveExampleChanges',
            model._id,
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

    const labelColumn = [{
        accessor: '_id',
        filterable: false,
        Cell: (cellProps) => {
            const {
                original: {
                    edited, isNew, deleted, entities: cellEntities, intent,
                } = {},
            } = cellProps;
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
        },
        Header: '',
        width: 70,
    }];
    return (
        !ready
            ? (
                <div>loading</div>
            )
            : (
                <Container>
                    <>
                        <br />
                        {instance && (
                            <div id='playground'>
                                <NLUPlayground
                                    testMode
                                    model={model}
                                    projectId={projectId}
                                    instance={instance}
                                    floated='right'
                                    entities={entities}
                                    intents={getIntentForDropdown(false)}
                                    onSave={example => onNewExamples([example])}
                                    postSaveAction='clear'
                                    defaultIntent={payload.intent}
                                    saveOnEnter={canEdit}
                                    silenceRasaErrors
                                />
                            </div>
                        )}
                    </>
                    <br />
                    <NluDataTable
                        onEditExample={onEditExample}
                        onDeleteExample={onDeleteExample}
                        onSwitchCanonical={onSwitchCanonical}
                        examples={examples}
                        entities={entities}
                        intents={intents}
                        projectId={projectId}
                        hideHeader
                        conditionalRowFormatter={getRowStyle}
                        className='example-data-table   '
                        extraColumns={labelColumn}
                    />
                    <div className='nlu-modal-buttons'>
                        {canEdit ? (
                            <>
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
                            </>
                        ) : (
                            <Button onClick={closeModal} data-cy='close-nlu-modal'>
                            Close
                            </Button>
                        )
                        }
                    </div>
                </Container>
            )
    );
};

NLUModalContent.propTypes = {
    model: PropTypes.object,
    projectId: PropTypes.string,
    intents: PropTypes.array,
    ready: PropTypes.bool,
    payload: PropTypes.object.isRequired,
    examples: PropTypes.array,
    entities: PropTypes.array,
    instance: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
    displayedExample: PropTypes.object,
};

NLUModalContent.defaultProps = {
    intents: [],
    ready: false,
    projectId: '',
    model: {},
    examples: [],
    entities: [],
    displayedExample: {},
};

const NLUDataLoaderContainer = withTracker((props) => {
    const { projectId, workingLanguage } = props;

    const { name, nlu_models, training } = Projects.findOne(
        { _id: projectId },
        {
            fields: {
                name: 1,
                nlu_models: 1,
                defaultLanguage: 1,
                training: 1,
            },
        },
    );
    let modelHandler = {
        ready() {
            return false;
        },
    };
    Meteor.subscribe('nlu_models.lite', projectId);
    const modelMatch = NLUModels.findOne({ _id: { $in: nlu_models }, language: workingLanguage }) || {};
    const modelId = modelMatch._id;
    modelHandler = Meteor.subscribe('nlu_models', modelId);
    // For handling '/project/:project_id/nlu/models'
    // for handling '/project/:project_id/nlu/model/:model_id'
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);

    const settingsHandler = Meteor.subscribe('settings');

    const projectsHandler = Meteor.subscribe('projects', projectId);
    const ready = instancesHandler.ready()
        && settingsHandler.ready()
        && modelHandler.ready()
        && projectsHandler.ready();
    const model = NLUModels.findOne({ _id: modelId });
    if (!model) {
        return {};
    }
    const { training_data: { common_examples = [] } = {} } = model;
    const instance = Instances.findOne({ projectId });
    const intents = sortBy(uniq(common_examples.map(e => e.intent)));
    const entities = extractEntities(common_examples);
    const settings = GlobalSettings.findOne(
        {},
        { fields: { 'settings.public.chitChatProjectId': 1 } },
    );

    if (!name) return browserHistory.replace({ pathname: '/404' });
    const nluModelLanguages = getNluModelLanguages(nlu_models, true);
    const project = {
        _id: projectId,
        training,
    };
    return {
        ready,
        model,
        intents,
        entities,
        projectId,
        settings,
        nluModelLanguages,
        instance,
        project,
        examples: common_examples,
    };
})(NLUModalContent);

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
    projectId: state.settings.get('projectId'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};
export default connect(mapStateToProps, mapDispatchToProps)(NLUDataLoaderContainer);
