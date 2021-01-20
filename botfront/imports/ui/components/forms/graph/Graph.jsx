/* eslint-disable jsx-a11y/label-has-associated-control */
import ReactFlow, { MiniMap, useStoreActions, useStoreState } from 'react-flow-renderer';
import {
    Button, Popup, Icon, Checkbox,
} from 'semantic-ui-react';
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { v4 as uuidv4 } from 'uuid';
import { useEventListener } from '../../utils/hooks';
import { GraphContext } from './graph.utils';
import ConditionEdge from './ConditionEdge';
import FormSettings from '../FormSettings';
import StartNode from './StartNode';
import SlotNode from './SlotNode';
import SlotSetNode from './SlotSetNode';
import FormEditorContainer from '../FormEditorContainer';

const nodeTypes = {
    start: StartNode,
    slot: SlotNode,
    slotSet: SlotSetNode,
};

const edgeTypes = {
    condition: ConditionEdge,
};

const SlotsGraph = (props) => {
    const {
        DbElements,
        formSettings: incomingFormSettings,
        formId,
        slots,
    } = props;

    const getClassName = (type) => {
        if (type === 'slot') return 'expanding-node slot-node';
        if (type === 'slotSet') return 'expanding-node slot-set-node';
        if (type === 'start') return 'start-node';
        return '';
    };

    const elementsReducer = elm => ({
        ...elm,
        className: getClassName(elm.type),
    });
    
    const [elements, setElements] = useState([]);
    const formattedElements = useMemo(() => elements.map(elementsReducer), [elements]);
    const [shiftKey, setShiftKey] = useState(false);
    const [settingEdge, setSettingEdge] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [formSettings, setFormSettings] = useState(incomingFormSettings);
    const [slotChoiceModalOpen, setSlotChoiceModalOpen] = useState(null);
    
    // This lets us update the position of the grid canvas ourself.
    const setTransform = useStoreActions(actions => actions.setInitTransform);
    const setSelectedElements = useStoreActions(actions => actions.unsetNodesSelection);
    // This gives us the current zoom level of the grid canvas.
    const position = useStoreState(state => state.transform);

    useEventListener('keydown', e => setShiftKey(e.shiftKey));
    useEventListener('keyup', e => setShiftKey(e.shiftKey));

    const handleConditionChange = (newCondition, edge) => {
        setElements(els => els.map((elem) => {
            if (elem.id === edge.id) {
                return {
                    ...elem,
                    data: {
                        ...elem.data,
                        condition: newCondition,
                    },
                };
            }
            return elem;
        }));
    };

    const handleDisconnect = (id) => {
        setElements(els => els.filter(elm => id !== elm.id));
    };

    const getPosition = (node, els) => {
        const refNode = els.find(elm => elm.id === node.id);
        const siblings = els.filter((element) => {
            if (!element) return false;
            return element.type === 'condition' && element.source === node.id;
        });
        if (siblings.length < 1) {
            return {
                x: refNode.position.x - (refNode.type === 'start' ? 80 : 0),
                y: refNode.position.y + 150,
            };
        }
        const lastSiblingId = siblings[siblings.length - 1].target;
        const lastSibling = els.find(({ id }) => id === lastSiblingId);
        return {
            x: lastSibling.position.x + 300,
            y: lastSibling.position.y,
        };
    };

    const handleSave = (newElements, newFormSettings) => {
        const { onSave } = props;
        onSave(newElements, newFormSettings);
    };

    const handleRemoveSlot = (id) => {
        // eslint-disable-next-line no-alert
        if (!window.confirm('Are you sure you want to delete this slot ?')) return;
        setElements((els) => {
            const newElements = els.filter((elm) => {
                if (
                    elm.id === id
                    || elm.source === id
                    || elm.target === id
                ) return false;
                return true;
            });
            handleSave(newElements);
            return newElements;
        });
        setSelectedNode(null);
    };

    const handleChangeSlot = id => ({ name: slotName, slotValue }) => {
        setElements(els => els.map((elem) => {
            if (elem.id === id) {
                return {
                    ...elem,
                    data: {
                        ...elem.data,
                        slotName,
                        slotValue,
                    },
                };
            }
            return elem;
        }));
    };

    const handleAddSlotSet = (slot, node) => {
        if (!slot) {
            return;
        }
        setElements((els) => {
            setSelectedElements();
            const id = uuidv4();
            return [
                ...els,
                {
                    id,
                    data: {
                        type: 'slotSet',
                        onRemoveSlot: handleRemoveSlot,
                        onChangeSlot: handleChangeSlot(id),
                        slotType: slot.type,
                        slotName: slot.name,
                        slotValue: slot.slotValue,
                    },
                    position: getPosition(node, els),
                    type: 'slotSet',
                    className: 'slot-set-node',
                },
                {
                    id: `e${node.id}-${id}`,
                    source: node.id,
                    target: id,
                    animated: true,
                    type: 'condition',
                    arrowHeadType: 'arrowclosed',
                    data: {
                        condition: null,
                        handleConditionChange,
                        handleDisconnect,
                    },
                },
            ];
        });
    };

    const handleAddSlot = (slot, node) => {
        if (!slot) {
            return;
        }
        setElements((els) => {
            setSelectedElements();
            const slotName = slot.name;
            return [
                ...els,
                {
                    id: slotName,
                    data: {
                        type: 'slot',
                        onAddSlot: handleAddSlot,
                        onAddSlotSet: handleAddSlotSet,
                        slotName,
                        filling: [{ type: 'from_text' }],
                        validation: null,
                    },
                    position: getPosition(node, els),
                    type: 'slot',
                    className: 'slot-node',
                },
                {
                    id: `e${node.id}-${slotName}`,
                    source: node.id,
                    target: slotName,
                    animated: true,
                    type: 'condition',
                    arrowHeadType: 'arrowclosed',
                    data: {
                        condition: null,
                        handleConditionChange,
                        handleDisconnect,
                    },
                },
            ];
        });
    };

    const getSlotSettingsForNode = (node) => {
        if (node.type === 'slot') {
            const slot = slots.find(formSlot => formSlot.name === node.id);
            return {
                validation: slot.validation,
                utter_on_new_valid_slot: slot.utter_on_new_valid_slot,
                filling: slot.filling,
            };
        }
        return {};
    };

    useEffect(() => {
        setElements(
            DbElements
                ? DbElements.map((elm) => {
                    if (elm.type === 'start' || elm.type === 'slot' || elm.type === 'slotSet') {
                        return {
                            ...elm,
                            data: {
                                ...elm.data,
                                ...getSlotSettingsForNode(elm),
                                onAddSlot: handleAddSlot,
                                onAddSlotSet: handleAddSlotSet,
                                onRemoveSlot: handleRemoveSlot,
                                onChangeSlot: handleChangeSlot(elm.id),
                            },
                        };
                    }
                    return {
                        ...elm,
                        data: {
                            ...elm.data,
                            handleConditionChange,
                            handleDisconnect,
                        },
                    };
                })
                : [
                    {
                        id: '1',
                        data: { type: 'start', onAddSlot: handleAddSlot, onAddSlotSet: handleAddSlotSet },
                        position: { x: 200, y: 200 },
                        type: 'start',
                        className: 'start-node',
                    },
                ],
        );
    }, []);

    useEffect(() => {
        handleSave(elements, formSettings);
    }, [elements, formSettings]);

    const handleNodeMove = (_e, movedNode) => {
        setElements(els => els.map((node) => {
            if (node.id === movedNode.id) {
                return {
                    ...node,
                    position: { ...movedNode.position },
                };
            }
            return node;
        }));
    };

    const handleConnect = (connectEvent) => {
        const fromNode = connectEvent.source.split('__')[0];
        const toNode = connectEvent.target.split('__')[0];
        // prevent self linking
        if (fromNode === toNode) return;
        // prevent duplicating links.
        if (elements.some(elm => (
            (elm.source === fromNode && elm.target === toNode)
            || (elm.source === toNode && elm.target === fromNode)))) return;
        // prevent creating two elses.
        const otherEdgesWithSameSource = elements.filter(elm => elm.source === fromNode);
        if (otherEdgesWithSameSource.some(edge => !edge.data.condition)) return;
        setElements(els => ([
            ...els,
            {
                id: `e${fromNode}-${toNode}`,
                source: fromNode,
                target: toNode,
                animated: true,
                type: 'condition',
                arrowHeadType: 'arrowclosed',
                data: { condition: null, handleConditionChange, handleDisconnect },
            },
        ]));
    };

    const handleSelectionChange = (selections) => {
        if (selections && selections.length === 1 && (selections[0].type === 'slot' || selections[0].type === 'start' || selections[0].type === 'slotSet')) {
            const refNode = elements.find(elm => elm.id === selections[0].id);
            setSelectedNode(refNode);

            const zoomLevel = position[2];

            setTransform({
                // this centers the selected node
                x: ((refNode.type === 'slot' ? 200 : 280) * (1 / zoomLevel)) - (refNode.position.x * (1 * zoomLevel)),
                y: (300 * (1 / zoomLevel)) - (refNode.position.y * (1 * zoomLevel)),
                k: position[2],
            });
        } else {
            setSelectedNode(null);
        }
    };

    const handleChangeSlotSettings = (_formId, data) => {
        const {
            // eslint-disable-next-line camelcase
            validation, filling, utter_on_new_valid_slot, name,
        } = data;
        const newNodeData = {
            validation,
            filling,
            utter_on_new_valid_slot,
        };
        setElements(els => els.map((node) => {
            if (node.id === name) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...newNodeData,
                    },
                };
            }
            return node;
        }));
        setSelectedNode(node => ({
            ...node,
            data: {
                ...node.data,
                ...newNodeData,
            },
        }));
    };

    return (
        <GraphContext.Provider
            value={{
                shiftKey,
                settingEdge,
                elements,
                slotsUsed: elements.filter(elm => (elm.type === 'slot' || elm.type === 'start' || elm.type === 'slotSet')).map(elm => elm.id),
                selectedNode,
                slotChoiceModalOpen,
                setSlotChoiceModalOpen,
            }}
        >
            <ReactFlow
                elements={formattedElements}
                snapGrid={[20, 20]}
                snapToGrid
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeDragStop={handleNodeMove}
                onConnect={handleConnect}
                onConnectStart={() => setSettingEdge(true)}
                onConnectStop={() => setSettingEdge(false)}
                onSelectionChange={handleSelectionChange}
                selectNodesOnDrag={false}
                selectionKeyCode={18}
                arrowHeadColor='#747474'
            >
                <MiniMap
                    style={{ right: '30px' }}
                    nodeColor={(node) => {
                        switch (node.type) {
                        case 'start':
                            return '#2285d0';
                        case 'slot':
                            return '#e0e1e2';
                        default:
                            return '#eee';
                        }
                    }}
                />
            </ReactFlow>
            <Popup
                trigger={
                    <Button icon='question' className='form-graph-help' size='small' />
                }
            >
                <Popup.Content>
                    Some tips to help you.
                    <br /> <br />
                    <b>Add a question:</b> Click on the <code>+</code> icon below the nodes.
                    <br /> <br />
                    <b>Link to an existing question:</b> Enable <code>edge edition mode</code> and drag
                    from the blue square that appears to the question node you want to link. <br />{' '}
                    A backlink made this way will be displayed in orange.
                    <br />
                    <br />
                    Note: You can&#39;t link to a question that was already answered in
                    your flow.
                    <br />
                    <br />
                    <b>Delete a link:</b> Enable <code>edge edition mode</code> and delete the red buttons that will appear on links.
                </Popup.Content>
            </Popup>
            <Checkbox
                toggle
                // eslint-disable-next-line jsx-a11y/label-has-for
                label={(<label data-cy='shift-mode'>Edge edition mode <span className='shortcut'>(Shift key)</span></label>)}
                checked={shiftKey}
                onChange={() => setShiftKey(sk => !sk)}
                className='shift-mode-toggle'
            />
            {selectedNode && selectedNode.type !== 'slotSet' && (
                <div className={!slotChoiceModalOpen && !!selectedNode ? 'form-graph-side-panel' : 'form-graph-side-panel not-here'}>
                    {!slotChoiceModalOpen && !!selectedNode && selectedNode.type === 'slot' && (
                        <>
                            <FormEditorContainer
                                formId={formId}
                                slotName={selectedNode.data.slotName}
                                slotFillingProp={{
                                    name: selectedNode.id,
                                    validation: selectedNode.data && selectedNode.data.validation,
                                    filling: selectedNode.data && selectedNode.data.filling,
                                    utter_on_new_valid_slot: selectedNode.data && selectedNode.data.utter_on_new_valid_slot,
                                }}
                                onChange={handleChangeSlotSettings}
                            />
                            <Button
                                basic
                                size='large'
                                negative
                                className='remove-this-slot'
                                onClick={() => handleRemoveSlot(selectedNode.id)}
                            >
                                <Icon name='trash' />
                            Remove this slot
                            </Button>
                        </>
                    )}
                    {!slotChoiceModalOpen && !!selectedNode && selectedNode.type === 'start' && (
                        <FormSettings initialModel={formSettings} onSubmit={setFormSettings} />
                    )}
                </div>
            )}
        </GraphContext.Provider>
    );
};

export const GraphPropTypes = {
    formId: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    DbElements: PropTypes.any,
    formSettings: PropTypes.object,
    slots: PropTypes.array.isRequired,
};

SlotsGraph.propTypes = GraphPropTypes;

SlotsGraph.defaultProps = {
    DbElements: [],
    formSettings: {},
};

export default SlotsGraph;
