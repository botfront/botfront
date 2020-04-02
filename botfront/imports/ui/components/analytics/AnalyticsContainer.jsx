import React, {
    useEffect, useState, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { LIST_DASHBOARDS, UPDATE_DASHBOARD } from './graphql';
import { setWorkingDashboard } from '../../store/actions/actions';
import EnvSelector from '../common/EnvSelector';
import LanguageDropdown from '../common/LanguageDropdown';
import { PageMenu, Loading } from '../utils/Utils';
import { ProjectContext } from '../../layouts/context';

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
            changeWorkingDashboard(dashboards[0]._id);
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

    return (
        <>
            <PageMenu title='Analytics' icon='chart bar' className='analytics-top-menu'>
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
            </PageMenu>
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
