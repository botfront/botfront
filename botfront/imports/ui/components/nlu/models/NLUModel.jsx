import React, {
    useState, useCallback, useEffect, useContext, useRef, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { browserHistory } from 'react-router';
import { useTracker } from 'meteor/react-meteor-data';
import {
    Container, Icon, Menu, Message, Tab,
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { PageMenu } from '../../utils/Utils';
import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import InsertNlu from '../../example_editor/InsertNLU';
import Evaluation from '../evaluation/Evaluation';
import ChitChat from './ChitChat';
import Synonyms from '../../synonyms/Synonyms';
import Gazette from '../../synonyms/Gazette';
import RegexFeatures from '../../synonyms/RegexFeatures';
import NLUPipeline from './settings/NLUPipeline';
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
import { can } from '../../../../lib/scopes';

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

    const { model } = useTracker(() => {
        Meteor.subscribe('nlu_models', projectId);
        return { model: NLUModels.findOne({ projectId, language: workingLanguage }) };
    });

    const [filters, setFilters] = useState({ sortKey: 'intent', order: 'ASC' });
    const variables = useMemo(() => ({
        ...filters,
        pageSize: 20,
        projectId,
        language: workingLanguage,
    }), [filters, projectId, workingLanguage]);
    const tableRef = useRef();

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
    const setFiltersDebounced = useCallback(
        debounce((newFilters) => {
            setFilters({
                ...filters,
                intents: newFilters.intents,
                entities: newFilters.entities,
                onlyCanonicals: newFilters.onlyCanonicals,
                text: [newFilters.query],
                order: newFilters.order,
                sortKey: newFilters.sortKey,
            });
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

    const handleLanguageChange = (value) => {
        changeWorkingLanguage(value);
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${value}` });
    };

    const handleMenuItemClick = (e, { name }) => setActiveItem(name);

    const renderWarningMessageIntents = () => {
        if (!loadingExamples && intents.length < 2) {
            return (
                <></>
                // <Message
                //     size='tiny'
                //     content={(
                //         <div>
                //             <Icon name='warning' />
                //             You need at least two distinct intents to train NLU
                //         </div>
                //     )}
                //     info
                // />
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
        }).then(() => tableRef?.current?.scrollToItem(0));
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
        <PageMenu withTraining>
            <Menu.Item header>
                <LanguageDropdown handleLanguageChange={handleLanguageChange} />
            </Menu.Item>
            {topMenuItems.map(([...params]) => renderTopMenuItem(...params))}
        </PageMenu>
    );

    if (!project) return null;
    if (!model) return null;

    return (
        <>
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
                                        ref={tableRef}
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
                                        updateFilters={setFiltersDebounced}
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
                                menuItem: 'Regex',
                                render: () => <RegexFeatures model={model} />,
                            },
                            {
                                menuItem: 'API',
                                render: () => <API model={model} instance={instance} />,
                            },
                            ...(can('nlu-data:w', projectId)
                                ? [{
                                    menuItem: 'Chit Chat',
                                    render: () => <ChitChat model={model} />,
                                }] : []),
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
        </>
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
