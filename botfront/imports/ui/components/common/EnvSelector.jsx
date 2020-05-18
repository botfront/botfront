import {
    Dropdown,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

function EnvSelector(props) {
    const { availableEnvs, envChange, value } = props;
    if (availableEnvs.length < 2) return null;
    return (
        <span className='environment-selector '>
            Data source:{'\u00A0'}
            <Dropdown
                data-cy='env-selector'
                inline
                onChange={(event, data) => envChange(data.value)}
                value={value}
                options={availableEnvs.map(projectEnv => ({ text: projectEnv, value: projectEnv }))}
            />
        </span>
    );
}

export default EnvSelector;


EnvSelector.propTypes = {
    availableEnvs: PropTypes.array.isRequired,
    envChange: PropTypes.func.isRequired,
    value: PropTypes.string,
};

EnvSelector.defaultProps = {
    value: 'development',
};
