import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { setWorkingDeploymentEnvironment } from '../../store/actions/actions';
import EnvSelector from '../common/EnvSelector';
import { PageMenu } from '../utils/Utils';

const Dashboard = React.lazy(() => import('./AnalyticsDashboard'));

function AnalyticsContainer(props) {
    const {
        environment,
        changeEnv,
        projectId,
    } = props;

    const [availableEnvs, setAvailableEnvs] = useState(['development']);
    useEffect(() => {
        Meteor.call('project.getDeploymentEnvironments', projectId, (err, res) => {
            if (!err) setAvailableEnvs(res);
        });
    }, []);

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
            </PageMenu>
            <React.Suspense fallback={<div className='analytics-dashboard' />}>
                <DndProvider backend={HTML5Backend}>
                    <Dashboard />
                </DndProvider>
            </React.Suspense>
        </>
    );
}

AnalyticsContainer.propTypes = {
    environment: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    changeEnv: PropTypes.func.isRequired,
};

AnalyticsContainer.defaultProps = {
};

const mapStateToProps = state => ({
    environment: state.settings.get('workingDeploymentEnvironment'),
    projectId: state.settings.get('projectId'),
});

const mapDispatchToProps = {
    changeEnv: setWorkingDeploymentEnvironment,
};

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsContainer);
