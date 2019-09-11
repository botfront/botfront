import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';

const BadLineLabel = (props) => {
    const { lineMd, lineIndex } = props;
    return (
        <Popup
            on='click'
            trigger={(
                <div className='label-container bad-line'>
                    <div className='mini-label-text label-context bad-line'>bad line</div>
                    <div className='mini-label-value label-context bad-line'>
                        {lineMd}
                    </div>
                </div>
            )}
            header={`Bad line on line ${lineIndex}`}
            content={<p>please fix this line in markdown.</p>}
        />
    );
};

BadLineLabel.propTypes = {
    lineMd: PropTypes.string,
    lineIndex: PropTypes.number.isRequired,
};

BadLineLabel.defaultProps = {
    lineMd: '',
};

export default BadLineLabel;
