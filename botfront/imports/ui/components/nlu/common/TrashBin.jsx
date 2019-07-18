import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

export default function TrashBin(props) {
    const { onClick, style: propStyle } = props;
    const style = {
        width: '16px',
        float: 'right',
        lineHeight: '24px',
        textAlign: 'left',
        ...propStyle,
    };

    return (
        <div
            style={style}
            data-cy='trashbin'
        >
            <Icon
                size='small'
                color='grey'
                name='trash'
                link
                className='viewOnHover'
                onClick={onClick}
            />
        </div>
    );
}

TrashBin.propTypes = {
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
};

TrashBin.defaultProps = {
    style: {},
};
