import React, {
    useState, useRef, useEffect, useCallback,
    useContext,
    useMemo,
} from 'react';
import { Input, Icon, Popup } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { useStoreState } from 'react-flow-renderer';

import SlotPopupContent from '../../stories/common/SlotPopupContent';

import { GraphContext } from './graph.utils';
import { ProjectContext } from '../../../layouts/context';


const defaultSlot = { type: 'unfeaturized', name: '' };

const SlotChoiceModal = (props) => {
    const { onSlotChoice, node } = props;
    const [newSlot, setNewSlot] = useState(defaultSlot);
    const popupRef = useRef(null);

    const edges = useStoreState(state => state.edges);
    const edgesFrom = edges.filter(edge => edge.source === node.id);
    const letUserAddEdge = edgesFrom.every(edge => edge.data.condition);

    const { slots } = useContext(ProjectContext);
    const {
        elements, slotsUsed, setSlotChoiceModalOpen: setOpen, slotChoiceModalOpen: open,
    } = useContext(GraphContext);

    const nameIsValid = useMemo(() => {
        const formSlots = elements.reduce((acc, val) => {
            if (val.type === 'slot' || val.type === 'start') return [...acc, val.id];
            return acc;
        }, []);
        const projectSlots = slots.map(({ name }) => name);
        return ![...projectSlots, ...formSlots].includes(newSlot.name);
    }, [slots, elements, newSlot]);

    // this is a possible optimization though it doesn't seem to work properly.
    // leaving it here in case performance becomes an issue.
    // const letUserAddEdge = useMemo(() => {
    //     const edgesFrom = edges.filter(edge => edge.source === node.id);
    //     return edgesFrom.every(edge => edge.data.condition);
    // }, [edges.length]);

    const handleWindowClick = (e) => {
        if (open && !(popupRef && popupRef.current && popupRef.current.contains(e.target))) {
            setOpen(null);
            window.removeEventListener('click', handleWindowClick);
        }
    };

    const handleOpen = () => {
        if (letUserAddEdge) {
            setOpen(node.id);
        }
    };

    useEffect(() => {
        window.addEventListener('click', handleWindowClick);
        return () => {
            window.removeEventListener('click', handleWindowClick);
        };
    }, [open]);

    const focusOnRef = useCallback((element) => {
        if (element !== null) {
            element.focus();
        }
    }, []);

    const chooseSlot = (slot) => {
        onSlotChoice(slot);
        setOpen(null);
        window.removeEventListener('click', handleWindowClick);
    };

    const handleKeyDownInput = (e) => {
        if ((e.nativeEvent.keyCode) === 13 && newSlot.name && nameIsValid) {
            chooseSlot(newSlot);
            setNewSlot(defaultSlot);
        }
    };

    return (
        <>
            <Popup
                trigger={(
                    <Icon
                        name='plus circle'
                        onClick={handleOpen}
                        className={letUserAddEdge ? null : 'disabled'}
                        data-cy={`add-node-${node.id}`}
                        id='add-slot'
                    />
                )}
                disabled={letUserAddEdge}
                className='add-condition-warning'
            >
                All the children of this question must have conditions before creating a new branch.
                <br /> <br />
                Hover the green circle on the edge and click &quot;IF&quot; to add a condition.
            </Popup>
            {open === node.id && (
                <div
                    style={{ display: open ? 'initial' : 'hidden' }}
                    className='slot-choice-modal'
                    ref={popupRef}
                    onClose={() => onSlotChoice(null)}
                >
                    <Input
                        placeholder='Choose a slot name'
                        data-cy='slot-name'
                        size='small'
                        ref={focusOnRef}
                        value={newSlot.name}
                        onKeyDown={handleKeyDownInput}
                        // eslint-disable-next-line no-useless-escape
                        onChange={(_, { value }) => setNewSlot(ns => ({ ...ns, name: value.replace(/[-\/\\^$*+?.()|[\]{}\s]/g, '') }))}
                    />
                    <Icon name='check' color='green' size='large' className={(newSlot.name && nameIsValid) ? 'here' : 'not-here'} />
                    <Icon name='ban' color='red' size='large' className={nameIsValid ? 'not-here' : 'here'} />
                    <SlotPopupContent
                        trigger={(
                            <span className='existing-slot'>Or use an existing one</span>
                        )}
                        onSelect={slot => chooseSlot(slot)}
                        chooseSlotWithoutValue
                        allowUnfeaturized
                        slotsToRemove={slotsUsed}
                    />
                </div>
            )}
        </>
    );
};

SlotChoiceModal.propTypes = {
    onSlotChoice: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
};

export default SlotChoiceModal;
