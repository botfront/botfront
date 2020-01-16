import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Meteor } from 'meteor/meteor';
import { Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setWorkingDeploymentEnvironment, setAnalyticsLanguages } from '../../store/actions/actions';
import EnvSelector from '../common/EnvSelector';
import LanguageDropdown from '../common/LanguageDropdown';
import { PageMenu } from '../utils/Utils';
import { ProjectContext } from '../../layouts/context';

const Dashboard = React.lazy(() => import('./AnalyticsDashboard'));

function AnalyticsContainer(props) {
    const {
        environment,
        changeEnv,
        projectId,
        queryLanguages,
        setQueryLanguages,
    } = props;

    const [availableEnvs, setAvailableEnvs] = useState(['development']);
    const { projectLanguages } = useContext(ProjectContext);
    useEffect(() => {
        Meteor.call('project.getDeploymentEnvironments', projectId, (err, res) => {
            if (!err) setAvailableEnvs(res);
        });
    }, []);

    const handleLanguageChange = (value) => {
        if (!value.length) return setQueryLanguages(projectLanguages.map(l => l.value));
        return setQueryLanguages(value);
    };

    return (
        <>
            <PageMenu title='Analytics' icon='chart bar' className='analytics-top-menu'>
                <Menu.Item className='env-select'>
                    <EnvSelector
                        availableEnvs={availableEnvs}
                        value={environment}
                        envChange={newEnv => changeEnv(newEnv)}
                    />
                </Menu.Item>
                <Menu.Item>
                    <LanguageDropdown
                        handleLanguageChange={handleLanguageChange}
                        selectedLanguage={queryLanguages.toJS()}
                        multiple
                    />
                </Menu.Item>
            </PageMenu>
            <React.Suspense fallback={<div className='analytics-dashboard' />}>
                <Dashboard queryLanguages={queryLanguages.toJS()} />
            </React.Suspense>
        </>
    );
}

AnalyticsContainer.propTypes = {
    environment: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    changeEnv: PropTypes.func.isRequired,
    queryLanguages: PropTypes.instanceOf(Immutable.List).isRequired,
    setQueryLanguages: PropTypes.func.isRequired,
};

AnalyticsContainer.defaultProps = {
};

const mapStateToProps = state => ({
    environment: state.settings.get('workingDeploymentEnvironment'),
    projectId: state.settings.get('projectId'),
    queryLanguages: state.analytics.get('analyticsLanguages'),
});

const mapDispatchToProps = {
    changeEnv: setWorkingDeploymentEnvironment,
    setQueryLanguages: setAnalyticsLanguages,
};

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsContainer);
