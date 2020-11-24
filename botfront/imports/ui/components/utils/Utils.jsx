import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Popup } from 'semantic-ui-react';


// eslint-disable-next-line react/prop-types
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
