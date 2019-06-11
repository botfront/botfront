import { Segment, Header, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

const ConfirmPopup = ({
    title, onYes, onNo, description,
}) => (
    <Segment basic className='model-popup' data-cy='confirm-popup'>
        <Header as='h4'>{title}</Header>
        {description}
        <div>
            <Button negative onClick={onNo} size='tiny' data-cy='confirm-no'>
                No
            </Button>
            <Button primary onClick={onYes} size='tiny' data-cy='confirm-yes'>
                Yes
            </Button>
        </div>
    </Segment>
);

ConfirmPopup.propTypes = {
    title: PropTypes.string.isRequired,
    onYes: PropTypes.func,
    description: PropTypes.string,
    onNo: PropTypes.func,
};

ConfirmPopup.defaultProps = {
    description: '',
    onYes: () => {},
    onNo: () => {},
};

export default ConfirmPopup;
