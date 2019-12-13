
import React from 'react';
import PropTypes from 'prop-types';
import { Popup, Icon } from 'semantic-ui-react';

export function Info({ info }) {
    return <Popup inverted trigger={<Icon name='question circle' color='grey' />} content={info} />;
}

Info.propTypes = {
    info: PropTypes.string.isRequired,
};
