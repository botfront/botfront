import {
    Dropdown,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

function EnvSelector(props) {
    const { availableEnvs, envChange } = props;

    return (
        <span>
            Data source:{'\u00A0'}
            <Dropdown
                inline
                onChange={() => envChange()}
                defaultValue='development'
                options={availableEnvs}
            />
        </span>
    );
}

export default EnvSelector;

// margin: 0.5rem 0rem 0.3rem 0rem;
// padding: 0.3rem 0rem 0.3rem 0rem;
