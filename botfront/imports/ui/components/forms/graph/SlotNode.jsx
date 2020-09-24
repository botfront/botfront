import React, {
    useContext, useEffect, useMemo,
} from 'react';
import { Handle } from 'react-flow-renderer';
import PropTypes from 'prop-types';

import BotResponsesContainer from '../../stories/common/BotResponsesContainer';
import { ProjectContext } from '../../../layouts/context';
import ChangeResponseType from '../ChangeResponseType';
import SlotChoiceModal from './SlotChoiceModal';
import { GraphContext } from './graph.utils';

const SlotNode = (props) => {
    const {
        id,
        data: { onAddSlot, slotName },
        selected,
    } = props;

    const {
        upsertResponse, language, addResponses, responses,
    } = useContext(ProjectContext);

    const responseName = useMemo(() => (`utter_ask_${slotName}`), [slotName]);
    const response = useMemo(() => responses[responseName] || null);

    const { shiftKey, settingEdge, slotChoiceModalOpen } = useContext(GraphContext);

    useEffect(() => {
        addResponses([responseName]);
    }, [language]);

    const handleResponseChange = (content) => {
        upsertResponse(responseName, content, 0);
    };
    return (
        <div className={`slot-node-content ${selected && slotChoiceModalOpen !== id ? 'slot-node-selected' : ''}`} data-cy={`slot-node-wrapper-${slotName}`}>
            <span className='slot-node-header' data-cy={`slot-node-${slotName}`}>{slotName}</span>
            <BotResponsesContainer
                deletable={false}
                name={responseName}
                initialValue={responses[responseName]}
                onChange={handleResponseChange}
                enableEditPopup
                enableChangeType
                renameable={false}
                disableEnterKey
            />
            {selected && slotChoiceModalOpen !== id && (
                <ChangeResponseType
                    name={responseName}
                    // eslint-disable-next-line no-underscore-dangle
                    currentResponseType={response ? response.__typename : null}
                    stopEventPropagation
                />
            )}
            <Handle
                type='source'
                position='bottom'
                style={{
                    background: '#2285d0',
                    opacity: shiftKey ? '1' : '0',
                    pointerEvents: shiftKey ? 'auto' : 'none',
                }}
                id='out'

            />
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
            {(!shiftKey || selected) && (
                <SlotChoiceModal
                    onSlotChoice={slot => onAddSlot(slot, props)}
                    node={props}
                />
            )}
        </div>
    );
};

SlotNode.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.shape({
        onAddSlot: PropTypes.func.isRequired,
        slotName: PropTypes.string.isRequired,
    }).isRequired,
    selected: PropTypes.bool,
};

SlotNode.defaultProps = {
    selected: false,
};

export default SlotNode;
