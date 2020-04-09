import React, {
    useEffect, useState, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import {
    Menu, Dropdown, Icon, Header,
} from 'semantic-ui-react';
import { useDrop } from 'react-dnd-cjs';
import { connect } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { LIST_DASHBOARDS, UPDATE_DASHBOARD } from './graphql';
import { setWorkingDashboard } from '../../store/actions/actions';
import EnvSelector from '../common/EnvSelector';
import LanguageDropdown from '../common/LanguageDropdown';
import { PageMenu, Loading } from '../utils/Utils';
import { ProjectContext } from '../../layouts/context';
import { findName } from '../../../lib/utils';

const Dashboard = React.lazy(() => import('./AnalyticsDashboard'));

function AnalyticsContainer(props) {
    const {
        workingDashboard,
        workingEnvironment,
        workingLanguage,
        changeWorkingDashboard,
    } = props;

    const [availableEnvs, setAvailableEnvs] = useState(['development']);
    const {
        project: { _id: projectId },
        projectLanguages,
    } = useContext(ProjectContext);

    useEffect(() => {
        Meteor.call('project.getDeploymentEnvironments', projectId, (err, res) => {
            if (!err) setAvailableEnvs(res);
        });
    }, []);

    const {
        loading,
        error,
        data: { listDashboards: dashboards = [] } = {},
    } = useQuery(LIST_DASHBOARDS, { variables: { projectId } });
    const dashboard = useMemo(
        () => dashboards.find(d => d._id === workingDashboard) || {
            envs: [workingEnvironment],
            languages: [workingLanguage],
        },
        [workingDashboard, dashboards],
    );

    useEffect(() => {
        if (!workingDashboard && !loading && !error) {
            changeWorkingDashboard(dashboards[0]._id); // for now we only support a single dashboard, hence [0]
        }
    }, [dashboards]);

    const [updateDashboard] = useMutation(
        UPDATE_DASHBOARD,
        {
            update: (cache, { data: { updateDashboard: update } }) => cache.writeQuery({
                query: LIST_DASHBOARDS, variables: { projectId }, data: { listDashboards: [update] },
            }),
        },
    );

    const handleUpdateDashboard = update => updateDashboard({
        variables: { ...dashboard, ...update },
        optimisticResponse: {
            updateDashboard: { ...dashboard, ...update },
        },
    });

    const handleNewCardInDashboard = (type, name) => handleUpdateDashboard({
        cards: [
            {
                name: findName(name, dashboard.cards.map(c => c.name)),
                type,
                description: '',
                visible: true,
                startDate: moment().subtract(6, 'days').startOf('day').toISOString(),
                endDate: moment().endOf('day').toISOString(),
                chartType: ['conversationLengths', 'intentFrequencies', 'conversationDurations'].includes(type) ? 'bar' : 'line',
                valueType: 'absolute',
                includeActions: undefined,
                excludeActions: undefined,
                includeIntents: undefined,
                excludeIntents: ['intentFrequencies'].includes(type) ? ['get_started'] : undefined,
            },
            ...dashboard.cards,
        ],
    });

    const handleDeleteCardInDashboard = name => handleUpdateDashboard({
        cards: dashboard.cards.filter(c => c.name !== name),
    });

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: 'card',
        drop: ({ cardName }) => handleDeleteCardInDashboard(cardName),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const cardTypes = [
        ['conversationLengths', 'Conversation Length'],
        ['conversationDurations', 'Conversation Duration'],
        ['intentFrequencies', 'Top 10 Intents'],
        ['conversationCounts', 'Conversations over time'],
        ['actionCounts', 'Action occurrences over time'],
    ];

    const renderAddCard = () => (
        <Dropdown
            className='icon'
            text='Add card'
            icon='plus'
            floating
            labeled
            button
            data-cy='create-card'
        >
            <Dropdown.Menu>
                {cardTypes.map(([type, name]) => (
                    <Dropdown.Item
                        key={type}
                        text={name}
                        onClick={() => handleNewCardInDashboard(type, name)}
                    />
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );

    return (
        <>
            {canDrop && (
                <div data-cy='delete-card-dropzone' className={`top-menu-red-dropzone ${isOver ? 'hover' : ''}`} ref={drop}>
                    <Header as='h3' color='red' textAlign='center'><Icon name='trash' />Drop here to delete</Header>
                </div>
            )}
            <div>
                <PageMenu title='Analytics' icon='chart bar'>
                    <Menu.Item className='env-select'>
                        <EnvSelector
                            availableEnvs={availableEnvs}
                            value={dashboard.envs[0]} // multi env not supported
                            envChange={env => handleUpdateDashboard({ envs: [env] })}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <LanguageDropdown
                            handleLanguageChange={languages => handleUpdateDashboard(
                                languages.length
                                    ? { languages }
                                    : { languages: projectLanguages.map(l => l.value) },
                            )
                            }
                            selectedLanguage={dashboard.languages}
                            multiple
                        />
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            {renderAddCard()}
                        </Menu.Item>
                    </Menu.Menu>
                </PageMenu>
            </div>
            <React.Suspense fallback={<div className='analytics-dashboard' />}>
                <Loading loading={loading}>
                    <Dashboard
                        dashboard={dashboard}
                        onUpdateDashboard={handleUpdateDashboard}
                    />
                </Loading>
            </React.Suspense>
        </>
    );
}

AnalyticsContainer.propTypes = {
    workingDashboard: PropTypes.string,
    workingEnvironment: PropTypes.string.isRequired,
    workingLanguage: PropTypes.string.isRequired,
    changeWorkingDashboard: PropTypes.func.isRequired,
};

AnalyticsContainer.defaultProps = {
    workingDashboard: null,
};

const mapStateToProps = state => ({
    workingDashboard: state.settings.get('workingDashboard'),
    workingEnvironment: state.settings.get('workingDeploymentEnvironment'),
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingDashboard: setWorkingDashboard,
};

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsContainer);
