import React, {
    useState, useCallback, useEffect, useContext, useRef,
} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { browserHistory } from 'react-router';
import { useTracker } from 'meteor/react-meteor-data';
import {
    Label, Container, Icon, Menu, Message, Tab, Popup,
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { isTraining } from '../../../../api/nlu_model/nlu_model.utils';
import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import InsertNlu from '../../example_editor/InsertNLU';
import Evaluation from '../evaluation/Evaluation';
import ChitChat from './ChitChat';
import Synonyms from '../../synonyms/Synonyms';
import Gazette from '../../synonyms/Gazette';
import NLUPipeline from './settings/NLUPipeline';
import TrainButton from '../../utils/TrainButton';
import Statistics from './Statistics';
import DeleteModel from './DeleteModel';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import LanguageDropdown from '../../common/LanguageDropdown';
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

function NLUModel(props) {
    const { changeWorkingLanguage } = props;
    const {
        project, instance, intents, entities,
    } = useContext(ProjectContext);
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

    const { training: { status, endTime } = {} } = project;
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
    const [selection, setSelection] = useState([]);

    const [activityLinkRender, setActivityLinkRender] = useState(
        (incomingState && incomingState.isActivityLinkRender) || false,
    );
    const [activeItem, setActiveItem] = useState(
        incomingState && incomingState.isActivityLinkRender === true
            ? 'Evaluation'
            : 'Training Data',
    );

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
                text: [newFilters.query],
                order: newFilters.sortOrder,
                sortKey: newFilters.sortKey,
            };
            setVariables(newVariables);
        }, 500),
        [],
    );

    useEffect(() => {
        if (refetch) refetch();
    }, [variables]);
    // always refetch first
    const hasRefetched = useRef(false);
    useEffect(() => {
        if (!hasRefetched.current && typeof refetch === 'function') {
            refetch();
            hasRefetched.current = true;
        }
    }, [refetch]);

    const updateFilters = (newFilters) => {
        setFilters(newFilters);
        setVariablesDebounced(newFilters);
    };

    const handleLanguageChange = (value) => {
        changeWorkingLanguage(value);
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${value}` });
    };

    const handleMenuItemClick = (e, { name }) => setActiveItem(name);

    const renderWarningMessageIntents = () => {
        if (!loadingExamples && intents.length < 2) {
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

    const handleInsert = (examples) => {
        insertExamples({
            variables: {
                examples,
                language: workingLanguage,
                projectId,
            },
        });
    };

    const renderTopMenuItem = (name, icon, visible) => (!visible ? null : (
        <Menu.Item
            key={name}
            name={name}
            active={activeItem === name}
            onClick={handleMenuItemClick}
            data-cy={`nlu-menu-${name.replace(/ /g, '-').toLowerCase()}`}
        >
            <Icon size='small' name={icon} />
            {name}
        </Menu.Item>
    ));

    const topMenuItems = [
        ['Training Data', 'database', true],
        ['Evaluation', 'percent', true],
        ['Statistics', 'pie graph', true],
        ['Settings', 'setting', true],
    ];

    const renderTopMenu = () => (
        <Menu borderless className='top-menu'>
            <Menu.Item header>
                <LanguageDropdown handleLanguageChange={handleLanguageChange} />
            </Menu.Item>
            {topMenuItems.map(([...params]) => renderTopMenuItem(...params))}
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
                                            {`Trained ${moment(endTime).fromNow()}`}
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
    );

    if (!project) return null;
    if (!model) return null;

    return (
        <div id='nlu-model'>
            {renderTopMenu()}
            <Container>
                {['Training Data', 'Evaluation'].includes(activeItem) && (
                    <>
                        {renderWarningMessageIntents()}
                        <br />
                        <InsertNlu onSave={handleInsert} />
                    </>
                )}
                <br />
                {activeItem === 'Training Data' && (
                    <Tab
                        menu={{ pointing: true, secondary: true }}
                        panes={[
                            {
                                menuItem: 'Examples',
                                render: () => (
                                    <NluTable
                                        projectId={projectId}
                                        workingLanguage={workingLanguage}
                                        entitySynonyms={
                                            model.training_data.entity_synonyms
                                        }
                                        updateExamples={examples => updateExamples({
                                            variables: {
                                                examples,
                                                projectId,
                                                language: workingLanguage,
                                            },
                                        })}
                                        deleteExamples={ids => deleteExamples({ variables: { ids } })}
                                        switchCanonical={example => switchCanonical({
                                            variables: {
                                                projectId,
                                                language: workingLanguage,
                                                example: clearTypenameField(example),
                                            },
                                        })}
                                        data={data}
                                        loadingExamples={loadingExamples}
                                        hasNextPage={hasNextPage}
                                        loadMore={loadMore}
                                        updateFilters={updateFilters}
                                        filters={filters}
                                        setSelection={setSelection}
                                        selection={selection}
                                    />
                                ),
                            },
                            {
                                menuItem: 'Synonyms',
                                render: () => <Synonyms model={model} />,
                            },
                            {
                                menuItem: 'Gazette',
                                render: () => <Gazette model={model} />,
                            },
                            {
                                menuItem: 'API',
                                render: () => <API model={model} instance={instance} />,
                            },
                            {
                                menuItem: 'Chit Chat',
                                render: () => <ChitChat model={model} />,
                            },
                        ]}
                    />
                )}
                {activeItem === 'Evaluation' && (
                    <Evaluation validationRender={validationRender} />
                )}
                {activeItem === 'Statistics' && (
                    <Statistics
                        synonyms={model.training_data.entity_synonyms.length}
                        gazettes={model.training_data.fuzzy_gazette.length}
                        intents={intents}
                        entities={entities}
                    />
                )}
                {activeItem === 'Settings' && (
                    <Tab
                        menu={{ pointing: true, secondary: true }}
                        panes={[
                            {
                                menuItem: 'Pipeline',
                                render: () => (
                                    <NLUPipeline model={model} projectId={projectId} />
                                ),
                            },
                            {
                                menuItem: 'Delete',
                                render: () => <DeleteModel />,
                            },
                        ]}
                    />
                )}
            </Container>
        </div>
    );
}

NLUModel.propTypes = {
    params: PropTypes.object.isRequired,
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
