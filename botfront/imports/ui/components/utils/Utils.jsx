import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Popup } from 'semantic-ui-react';


export function Loading({ loading, children }) {
    return !loading ? children : <Loader active inline='centered' />;
}


export function tooltipWrapper(trigger, tooltip) {
    return (
        <Popup size='mini' inverted content={tooltip} trigger={trigger} />
    );
}

Loading.propTypes = {
    loading: PropTypes.bool.isRequired,
};
