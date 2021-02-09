import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Handle } from 'react-flow-renderer';
import { GraphContext } from './graph.utils';
import SlotLabel from '../../stories/SlotLabel';
import IconButton from '../../common/IconButton';

const SlotSetNode = (props) => {
    const {
        id,
        data: {
            slotName, slotValue, onRemoveSlot, onChangeSlot,
        },
    } = props;

    const { shiftKey, settingEdge } = useContext(GraphContext);

    return (
        <div
            data-cy='slot-set-node'
            className='expanding-node-content slot-set-node-content'
        >
            <div className='side-by-side narrow middle'>
                <SlotLabel
                    value={{ [slotName]: slotValue }}
                    onChange={onChangeSlot}
                />
                <IconButton
                    icon='trash'
                    color='grey'
                    onClick={() => onRemoveSlot(id)}
                    className='delete-slot-set'
                />
            </div>
            <Handle
                type='target'
                position='top'
                style={{
                    height: '80px',
                    width: '240px',
                    opacity: shiftKey && settingEdge ? '1' : '0',
                    pointerEvents: shiftKey && settingEdge ? 'auto' : 'none',
                }}
                id='in'
            />
        </div>
    );
};

SlotSetNode.propTypes = {
    data: PropTypes.shape({
        slotName: PropTypes.string.isRequired,
        slotValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
        onRemoveSlot: PropTypes.func.isRequired,
        onChangeSlot: PropTypes.func.isRequired,
    }).isRequired,
    id: PropTypes.string.isRequired,
};

SlotSetNode.defaultProps = {};

export default SlotSetNode;
