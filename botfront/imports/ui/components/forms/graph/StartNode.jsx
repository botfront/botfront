import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import React, { useContext } from 'react';
import { Handle } from 'react-flow-renderer';

import { GraphContext } from './graph.utils';
import SlotChoiceModal from './SlotChoiceModal';

const StartNode = (props) => {
    const { data: { onAddSlot, onAddSlotSet }, selected } = props;
    const { shiftKey } = useContext(GraphContext);
    return (
        <>
            <span className='start-node-text' data-cy='start-node'>Start of your form</span>
            <Icon name='setting' />
            <Handle
                type='source'
                position='bottom'
                style={{
                    background: '#f9f9f9',
                    opacity: shiftKey ? '1' : '0',
                    pointerEvents: shiftKey ? 'auto' : 'none',
                }}
                id='out'

            />
            {(!shiftKey || selected) && (
                <SlotChoiceModal
                    onSlotChoice={slot => onAddSlot(slot, props)}
                    onSlotSetChoice={slot => onAddSlotSet(slot, props)}
                    node={props}
                />
            )}
        </>
    );
};

StartNode.propTypes = {
    data: PropTypes.shape({
        onAddSlot: PropTypes.func.isRequired,
        onAddSlotSet: PropTypes.func.isRequired,
    }).isRequired,
    selected: PropTypes.bool,
};

StartNode.defaultProps = {
    selected: false,
};

export default StartNode;
