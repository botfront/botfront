import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';

const BadLineLabel = (props) => {
    const { lineMd } = props;
    return (
        <Popup trigger={(
            <div className='label-container bad-line'>
                <div className='mini-label-text label-context bad-line'>
                    bad line
                </div>
                <div className='mini-label-value label-context bad-line'>
                    {lineMd}
                </div>
            </div>
        )}
        />
        
    );
};

BadLineLabel.propTypes = {
    lineMd: PropTypes.string,
};

BadLineLabel.defaultProps = {
    lineMd: '',
};

export default BadLineLabel;
