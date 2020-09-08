import React, {
    useState,
    useEffect,
    useReducer,
    useMemo,
    useContext,
} from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { isEqual } from 'lodash';
import {
    Container, Button, Popup, Label,
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import NluTable from '../../../nlu/models/NluTable';
import InsertNlu from '../../../example_editor/InsertNLU';
import ConfirmPopup from '../../../common/ConfirmPopup';
import ExampleUtils from '../../../utils/ExampleUtils';
import { ConversationOptionsContext } from '../../Context';
import { useExamples } from '../../../nlu/models/hooks';
import { ProjectContext } from '../../../../layouts/context';

const NLUModalContent = (props) => {
    const { closeModal, payload, displayedExample } = props;
    const {
        project: { _id: projectId }, language,
    } = useContext(ProjectContext);

    const { data: existingExamples, loading: loadingExamples } = useExamples({
        projectId,
        language,
        pageSize: -1,
        intents: [payload.intent],
        entities: payload.entities,
        exactMatch: true,
    });

    const checkPayloadsMatch = example => example.intent === payload.intent
        && (example.entities || []).length === payload.entities.length
        && (example.entities || []).every(entity => payload.entities.find(
            payloadEntity => payloadEntity.entity === entity.entity,
        ));

    const [shouldForceRefresh, setShouldForceRefresh] = useState(false);

    const canonicalizeExample = (newExample, currentExamples) => {
        const exists = currentExamples.some(
            currentExample => ExampleUtils.sameCanonicalGroup(currentExample, newExample)
                && !currentExample.deleted,
        );
        if (!exists && checkPayloadsMatch(newExample)) {
            setShouldForceRefresh(true);
            return {
                ...newExample,
                metadata: { canonical: true },
                canonicalEdited: true,
            };
        }
        return newExample;
    };

    const canonicalizeExamples = (newExamples, currentExamples) => newExamples.map(newExample => canonicalizeExample(newExample, currentExamples));

    const exampleReducer = (state, updatedExamples) => updatedExamples
        .map((example) => {
            if (example.isDisplayed && (example.deleted || example.edited)) {
                setShouldForceRefresh(true);
            }
            return {
                ...example,
                invalid: !checkPayloadsMatch(example),
                isDisplayed: example._id === displayedExample._id,
            };
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

    const [examples, setExamples] = useReducer(exampleReducer, []);
    const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
    const [selection, setSelection] = useState([]);

    const hasInvalidExamples = useMemo(
        () => examples.some(example => example.invalid === true && !example.deleted),
        [examples],
    );
    const { reloadStories } = useContext(ConversationOptionsContext);

    useEffect(
        () => setExamples(
            existingExamples.reduce(
                (acc, curr) => [
                    ...acc,
                    ...(acc.some(ex => ex._id === curr._id || ex.text === curr.text) ? [] : [curr]),
                ],
                examples || [],
            ),
        ),
        [existingExamples],
    );

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
            updatedExamples[removeIndex] = {
                ...oldExample,
                deleted: !oldExample.deleted,
            };
        });
        setExamples(updatedExamples);
    };

    const onUpdateExamples = (examplesUpdate) => {
        const updatedExamples = [...examples];
        examplesUpdate.forEach((example) => {
            const index = examples.findIndex(({ _id }) => _id === example._id);
            const oldExample = examples[index];
            if (isEqual(example, oldExample)) {
                return;
            }
            updatedExamples[index] = {
                ...updatedExamples[index],
                ...example,
                metadata: { ...updatedExamples[index].metadata, ...example.metadata },
            };
            if (example.isNew) {
                updatedExamples[index] = canonicalizeExample(example, updatedExamples);
            } else {
                updatedExamples[index].edited = true;
            }
        });
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
                && oldExample?.metadata?.canonical
            ) {
                return true;
            }
            return false;
        });
        updatedExamples[newCanonicalIndex].metadata.canonical = !example.metadata
            .canonical;
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
            language,
            examples,
            () => {
                if (shouldForceRefresh) reloadStories();
                closeModal();
            },
        );
    };

    const handleCancel = (e) => {
        const madeChanges = examples.some(
            ({
                edited, isNew, invalid, canonicalEdited, deleted,
            }) => edited || isNew || invalid || canonicalEdited || deleted,
        );
        if (!madeChanges) {
            e.preventDefault();
            closeModal();
        }
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


    if (loadingExamples) return <div>Loading</div>;
    return (
        <Container>
            <br />
            <InsertNlu onSave={onNewExamples} defaultIntent={payload.intent} skipDraft />
            <br />
            <NluTable
                deleteExamples={onDeleteExamples}
                updateExamples={onUpdateExamples}
                switchCanonical={onSwitchCanonical}
                data={examples}
                selection={selection}
                useShortcuts={false}
                setSelection={setSelection}
                noDrafts
                renderLabelColumn={renderLabelColumn}
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
    );
};

NLUModalContent.propTypes = {
    payload: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
    displayedExample: PropTypes.object,
};

NLUModalContent.defaultProps = {
    displayedExample: {},
};

export default NLUModalContent;
