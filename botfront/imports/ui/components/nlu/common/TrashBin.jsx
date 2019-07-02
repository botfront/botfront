import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

export default function TrashBin(props) {
    const { onClick } = props;

    return (
        <div
            style={{
                width: '16px',
                float: 'right',
                lineHeight: '24px',
                textAlign: 'left',
            }}
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
};
