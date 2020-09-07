/* eslint-disable camelcase */
import React, {
    useState, useCallback, useEffect, useRef, useContext,
} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { browserHistory } from 'react-router';
import { useTracker } from 'meteor/react-meteor-data';
import {
    Label,
    Container,
    Icon,
    Menu,
    Message,
    Tab,
    Popup,
    Placeholder,
} from 'semantic-ui-react';
import Alert from 'react-s-alert';
import 'react-select/dist/react-select.css';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { isTraining } from '../../../../api/nlu_model/nlu_model.utils';
import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import InsertNlu from '../../example_editor/InsertNLU';
import Evaluation from '../evaluation/Evaluation';
import ChitChat from './ChitChat';
import IntentBulkInsert from './IntentBulkInsert';
import Synonyms from '../../synonyms/Synonyms';
import Gazette from '../../synonyms/Gazette';
import NLUPipeline from './settings/NLUPipeline';
import TrainButton from '../../utils/TrainButton';
import Statistics from './Statistics';
import DeleteModel from './DeleteModel';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import LanguageDropdown from '../../common/LanguageDropdown';
import { wrapMeteorCallback } from '../../utils/Errors';
import API from './API';
import { setWorkingLanguage } from '../../../store/actions/actions';
import NluTable from './NluTable';
import { ProjectContext } from '../../../layouts/context';
import {
    useExamples,
    useDeleteExamples,
    useUpdateExamples,
    useSwitchCanonical,
    useInsertExamples,
} from './hooks';
import {
    createRenderExample,
    createRenderDelete,
    createRenderCanonical,
    createRenderEditExample,
    createRenderDraft,
    createRenderIntent,
} from './NluTableColumns';

function NLUModel(props) {
    const { changeWorkingLanguage } = props;
    const {
        project, instance, projectLanguages, intents, entities,
    } = useContext(
        ProjectContext,
    );
    const { defaultLanguage: projectDefaultLanguage } = project;
    const {
        location: { state: incomingState },
        params: { language: langFromParams, project_id: projectId } = {},
        workingLanguage,
    } = props;
    if (workingLanguage !== langFromParams) {
        browserHistory.push({
            pathname: `/project/${projectId}/nlu/model/${workingLanguage}`,
        });
    }
    const { model } = useTracker(() => {
        Meteor.subscribe('nlu_models', projectId);
        return { model: NLUModels.findOne({ projectId, language: workingLanguage }) };
    });

    const [variables, setVariables] = useState({
        projectId,
        language: workingLanguage,
        pageSize: 20,
        sortKey: 'intent',
        order: 'ASC',
    });
    const [filters, setFilters] = useState({ sortKey: 'intent', sortOrder: 'ASC' });

    const {
        data,
        loading: loadingExamples,
        hasNextPage,
        loadMore,
        refetch,
    } = useExamples(variables);

    const [deleteExamples] = useDeleteExamples(variables);
    const [switchCanonical] = useSwitchCanonical(variables);
    const [updateExamples] = useUpdateExamples(variables);
    const [insertExamples] = useInsertExamples(variables);
    const singleSelectedIntentLabelRef = useRef(null);
    const [editExampleId, setEditExampleId] = useState([]);
    const [selection, setSelection] = useState([]);

    const [activityLinkRender, setActivityLinkRender] = useState(
        (incomingState && incomingState.isActivityLinkRender) || false,
    );
    const [activeItem, setActiveItem] = useState(
        incomingState && incomingState.isActivityLinkRender === true
            ? 'evaluation'
            : 'data',
    );

    // wrap grap graphql call that are using  variables, so they appear as an usual update function
    const deleteExample = (id) => {
        deleteExamples({ variables: { ids: [id] } });
    };

    const deleteMultipleExamples = (ids) => {
        deleteExamples({ variables: { ids } });
    };

    const updateMultipleExamples = (examples) => {
        updateExamples({ variables: { examples, projectId, language: workingLanguage } });
    };

    const validationRender = () => {
        if (activityLinkRender === true) {
            setActivityLinkRender(false);
            return true;
        }
        return false;
    };
    // if we do not useCallback the debounce is re-created on every render
    const setVariablesDebounced = useCallback(
        debounce((newFilters) => {
            const newVariables = {
                ...variables,
                intents: newFilters.intents,
                entities: newFilters.entities,
                onlyCanonicals: newFilters.onlyCanonicals,
                text: newFilters.query,
                order: newFilters.sortOrder,
                sortKey: newFilters.sortKey,
            };
            setVariables(newVariables);
        }, 500),
        [],
    );

    useEffect(() => {
        if (!loadingExamples) refetch();
    }, [variables]);

    const updateFilters = (newFilters) => {
        setFilters(newFilters);
        setVariablesDebounced(newFilters);
    };

    const onDeleteModel = () => {
        browserHistory.push({ pathname: `/project/${projectId}/nlu/models` });
        Meteor.call(
            'nlu.remove',
            projectId,
            workingLanguage,
            wrapMeteorCallback(null, 'Model deleted!'),
        );
    };

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

    const handleLanguageChange = (value) => {
        changeWorkingLanguage(value);
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${value}` });
    };

    const getHeader = () => (
        <LanguageDropdown handleLanguageChange={handleLanguageChange} />
    );

    const handleMenuItemClick = (e, { name }) => setActiveItem(name);

    const renderWarningMessageIntents = () => {
        if (intents.length < 2) {
            return (
                <Message
                    size='tiny'
                    content={(
                        <div>
                            <Icon name='warning' />
                            You need at least two distinct intents to train NLU
                        </div>
                    )}
                    info
                />
            );
        }
        return <></>;
    };
    const onEditExample = (example, callback) => {
        updateExamples({
            variables: { examples: [example], projectId, language: workingLanguage },
        }).then(
            res => wrapMeteorCallback(callback)(null, res),
            wrapMeteorCallback(callback),
        );
    };
    const handleExampleTextareaBlur = (example) => {
        setEditExampleId(null);
        onEditExample(clearTypenameField(example));
    };

    const onSwitchCanonical = async (example) => {
        const result = await switchCanonical({
            variables: {
                projectId,
                language: workingLanguage,
                example: clearTypenameField(example),
            },
        });
        /* length === 2 mean that there is 2 examples that have changed,
            so one took the place of another as a canonical */
        if (result?.data?.switchCanonical?.length === 2) {
            Alert.warning(
                `The previous canonical example with the same intent 
            and entity - entity value combination 
            (if applicable) with this example has been unmarked canonical`,
                {
                    position: 'top-right',
                    timeout: 5000,
                },
            );
        }
    };

    const getNLUSecondaryPanes = () => {
        const columns = [
            { key: '_id', selectionKey: true, hidden: true },
            {
                key: 'intent',
                style: {
                    paddingLeft: '1rem',
                    width: '200px',
                    minWidth: '200px',
                    overflow: 'hidden',
                },
                render: createRenderIntent(
                    selection,
                    onEditExample,
                    singleSelectedIntentLabelRef,
                ),
            },
            {
                key: 'text',
                style: { width: '100%' },
                render: createRenderExample(
                    editExampleId,
                    handleExampleTextareaBlur,
                    onEditExample,
                ),
            },
            {
                key: 'draft',
                style: { width: '70px' },
                render: createRenderDraft(onEditExample),
            },
            {
                key: 'edit',
                style: { width: '50px' },
                render: createRenderEditExample(setEditExampleId),
            },
            {
                key: 'delete',
                style: { width: '50px' },
                render: createRenderDelete(deleteExample),
            },
            {
                key: 'canonical',
                style: { width: '50px' },
                render: createRenderCanonical(onSwitchCanonical),
            },
        ];
        const tabs = [
            {
                menuItem: 'Examples',
                render: () => (
                    <NluTable
                        projectId={projectId}
                        workingLanguage={workingLanguage}
                        entitySynonyms={model.training_data.entity_synonyms}
                        updateExamples={updateMultipleExamples}
                        deleteExamples={deleteMultipleExamples}
                        switchCanonical={switchCanonical}
                        data={data}
                        loadingExamples={loadingExamples}
                        hasNextPage={hasNextPage}
                        loadMore={loadMore}
                        updateFilters={updateFilters}
                        filters={filters}
                        columns={columns}
                        setSelection={setSelection}
                        selection={selection}
                        singleSelectedIntentLabelRef={singleSelectedIntentLabelRef}
                        useShortCuts
                    />
                ),
            },
            { menuItem: 'Synonyms', render: () => <Synonyms model={model} /> },
            { menuItem: 'Gazette', render: () => <Gazette model={model} /> },
            { menuItem: 'API', render: () => <API model={model} instance={instance} /> },
            {
                menuItem: 'Insert many',
                render: () => <IntentBulkInsert data-cy='insert-many' />,
            },
        ];
        tabs.splice(4, 0, {
            menuItem: 'Chit Chat',
            render: () => <ChitChat model={model} />,
        });
        return tabs;
    };

    const getSettingsSecondaryPanes = () => {
        const languageName = projectLanguages.find(
            language => language.value === model.language,
        );
        const cannotDelete = model.language !== projectDefaultLanguage;
        return [
            {
                menuItem: 'Pipeline',
                render: () => <NLUPipeline model={model} projectId={projectId} />,
            },
            {
                menuItem: 'Delete',
                render: () => (
                    <DeleteModel
                        model={model}
                        onDeleteModel={onDeleteModel}
                        cannotDelete={cannotDelete}
                        language={languageName.text}
                    />
                ),
            },
        ];
    };

    const renderNluScreens = () => {
        if (!project) return null;
        if (!model) return null;
        const { training: { status, endTime } = {} } = project;
        if (!model.training_data) {
            return (
                <Container text style={{ paddingTop: '6em' }}>
                    <Placeholder fluid>
                        <Placeholder.Header>
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Header>
                        <Placeholder.Paragraph>
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Paragraph>
                        <Placeholder.Paragraph>
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Paragraph>
                    </Placeholder>
                </Container>
            );
        }
        return (
            <div id='nlu-model'>
                <Menu borderless className='top-menu'>
                    <Menu.Item header>{getHeader()}</Menu.Item>
                    <Menu.Item
                        name='data'
                        active={activeItem === 'data'}
                        onClick={handleMenuItemClick}
                        data-cy='nlu-menu-training-data'
                    >
                        <Icon size='small' name='database' />
                        Training Data
                    </Menu.Item>
                    <Menu.Item
                        name='evaluation'
                        active={activeItem === 'evaluation'}
                        onClick={handleMenuItemClick}
                        data-cy='nlu-menu-evaluation'
                    >
                        <Icon size='small' name='percent' />
                        Evaluation
                    </Menu.Item>
                    <Menu.Item
                        name='statistics'
                        active={activeItem === 'statistics'}
                        onClick={handleMenuItemClick}
                        data-cy='nlu-menu-statistics'
                    >
                        <Icon size='small' name='pie graph' />
                        Statistics
                    </Menu.Item>
                    <Menu.Item
                        name='settings'
                        active={activeItem === 'settings'}
                        onClick={handleMenuItemClick}
                        data-cy='nlu-menu-settings'
                    >
                        <Icon size='small' name='setting' />
                        Settings
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            {!isTraining(project) && status === 'success' && (
                                <Popup
                                    trigger={(
                                        <Icon
                                            size='small'
                                            name='check'
                                            fitted
                                            circular
                                            style={{ color: '#2c662d' }}
                                        />
                                    )}
                                    content={(
                                        <Label
                                            basic
                                            content={(
                                                <div>
                                                    {`Trained ${moment(
                                                        endTime,
                                                    ).fromNow()}`}
                                                </div>
                                            )}
                                            style={{
                                                borderColor: '#2c662d',
                                                color: '#2c662d',
                                            }}
                                        />
                                    )}
                                />
                            )}
                            {!isTraining(project) && status === 'failure' && (
                                <Popup
                                    trigger={(
                                        <Icon
                                            size='small'
                                            name='warning'
                                            color='red'
                                            fitted
                                            circular
                                        />
                                    )}
                                    content={(
                                        <Label
                                            basic
                                            color='red'
                                            content={(
                                                <div>
                                                    {`Training failed ${moment(
                                                        endTime,
                                                    ).fromNow()}`}
                                                </div>
                                            )}
                                        />
                                    )}
                                />
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            <TrainButton
                                project={project}
                                instance={instance}
                                projectId={projectId}
                            />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Container>
                    {['data', 'evaluation'].includes(activeItem) && (
                        <>
                            {renderWarningMessageIntents()}
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
                                        onSave={async (examples) => {
                                            const promiseParsing = examples.map(
                                                example => new Promise((resolve) => {
                                                    Meteor.call(
                                                        'rasa.parse',
                                                        instance,
                                                        [
                                                            {
                                                                text: example,
                                                                lang: workingLanguage,
                                                            },
                                                        ],
                                                        { failSilently: true },
                                                        (err, exampleMatch) => {
                                                            if (
                                                                err
                                                                    || !exampleMatch
                                                                    || !exampleMatch.intent
                                                            ) {
                                                                resolve({
                                                                    text: example,
                                                                    metadata: {
                                                                        draft: true,
                                                                    },
                                                                    intent:
                                                                            'draft.intent',
                                                                });
                                                            }
                                                            const {
                                                                intent: { name },
                                                                entities: ents,
                                                            } = exampleMatch;
                                                            resolve({
                                                                text: example,
                                                                metadata: {
                                                                    draft: true,
                                                                },
                                                                intent: name,
                                                                entities: ents,
                                                            });
                                                        },
                                                    );
                                                }),
                                            );
                                            const examplesParsed = await Promise.all(
                                                promiseParsing,
                                            );
                                            updateFilters({
                                                ...filters,
                                                sortKey: 'metadata.draft',
                                                sortOrder: 'DESC',
                                            });
                                            insertExamples({
                                                variables: {
                                                    examples: examplesParsed,
                                                    language: workingLanguage,
                                                    projectId,
                                                },
                                            });
                                        }}
                                        postSaveAction='clear'
                                    />
                                </div>
                            )}
                        </>
                    )}
                    <br />
                    {activeItem === 'data' && (
                        <Tab
                            menu={{ pointing: true, secondary: true }}
                            panes={getNLUSecondaryPanes()}
                        />
                    )}
                    {activeItem === 'evaluation' && (
                        <Evaluation validationRender={validationRender} />
                    )}
                    {activeItem === 'statistics' && (
                        <Statistics
                            synonyms={model.training_data.entity_synonyms.length}
                            gazettes={model.training_data.fuzzy_gazette.length}
                            intents={intents}
                            entities={entities}
                        />
                    )}
                    {activeItem === 'settings' && (
                        <Tab
                            menu={{ pointing: true, secondary: true }}
                            panes={getSettingsSecondaryPanes()}
                        />
                    )}
                </Container>
            </div>
        );
    };

    return renderNluScreens();
}

NLUModel.propTypes = {
    location: PropTypes.object.isRequired,
    workingLanguage: PropTypes.string,
    changeWorkingLanguage: PropTypes.func.isRequired,
};

NLUModel.defaultProps = {
    workingLanguage: null,
};

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};

export default connect(mapStateToProps, mapDispatchToProps)(NLUModel);
