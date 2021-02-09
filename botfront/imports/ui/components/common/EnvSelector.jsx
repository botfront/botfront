import {
    Dropdown,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useContext } from 'react';
import { setWorkingDeploymentEnvironment } from '../../store/actions/actions';
import { ProjectContext } from '../../layouts/context';

function EnvSelector(props) {
    const {
        availableEnvs: envsFromProps,
        envChange: envChangeFromProps,
        defaultEnvChange,
        defaultValue,
        value,
    } = props;
    const {
        project: { deploymentEnvironments = [] },
    } = useContext(ProjectContext);
    const availableEnvs = ['development', ...(envsFromProps || deploymentEnvironments)];
    const envChange = envChangeFromProps || defaultEnvChange;
    const valueToDisplay = value || defaultValue
    if (availableEnvs.length < 2) return null;
    return (
        <span className='environment-selector'>
            Data source:{'\u00A0'}
            <Dropdown
                data-cy='env-selector'
                inline
                onChange={(event, data) => {envChange(data.value)}}
                value={valueToDisplay}
                options={availableEnvs.map(projectEnv => ({ text: projectEnv, value: projectEnv }))}
            />
        </span>
    );
}

EnvSelector.propTypes = {
    availableEnvs: PropTypes.array,
    envChange: PropTypes.func,
    value: PropTypes.string,
    defaultValue: PropTypes.string.isRequired,
    defaultEnvChange: PropTypes.func.isRequired,
};

EnvSelector.defaultProps = {
    availableEnvs: null,
    envChange: null,
    value: '',
};

const mapStateToProps = state => ({
    defaultValue: state.settings.get('workingDeploymentEnvironment'),
});

const mapDispatchToProps = {
    defaultEnvChange: setWorkingDeploymentEnvironment,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(EnvSelector);
