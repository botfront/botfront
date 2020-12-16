import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';

const BadLineLabel = (props) => {
    const { lineMd, lineIndex } = props;
    return (
        <Popup
            on='click'
            trigger={(
                <div className='label-container black'>
                    <div>bad line</div>
                    <div>
                        {lineMd}
                    </div>
                </div>
            )}
            header={`Bad line on line ${lineIndex}`}
            content={<p>Please fix this line in YAML mode</p>}
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
