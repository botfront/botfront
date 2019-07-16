import React from 'react';
import PropTypes from 'prop-types';
import BotResponsePopupContent from './BotResponsePopupContent';
import ActionPopupContent from './ActionPopupContent';
import SlotPopupContent from './SlotPopupContent';
import DashedButton from './DashedButton';

const AddStoryLine = (props) => {
    const {
        onSelectResponse, onCreateResponse, onSelectAction, onSelectSlot,
    } = props;
    return (
        <div>
            <BotResponsePopupContent
                onSelect={r => onSelectResponse(r)}
                onCreate={r => onCreateResponse(r)}
                trigger={<DashedButton color='green'>Bot Response</DashedButton>}
            />
            <ActionPopupContent
                onSelect={action => onSelectAction(action)}
                trigger={<DashedButton color='pink'>Action</DashedButton>}
                style={{ paddingRight: '3px' }}
            />
            <SlotPopupContent
                onSelect={slot => onSelectSlot(slot)}
                trigger={<DashedButton color='orange'>Slot</DashedButton>}
            />
        </div>
    );
};

AddStoryLine.propTypes = {
    onSelectResponse: PropTypes.func.isRequired,
    onCreateResponse: PropTypes.func.isRequired,
    onSelectAction: PropTypes.func.isRequired,
    onSelectSlot: PropTypes.func.isRequired,
};

export default AddStoryLine;
