import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dropdown, Button, Popup } from 'semantic-ui-react';
import { groupBy } from 'lodash';

import { ProjectContext } from '../../../layouts/context';
import { ConversationOptionsContext } from '../Context';
import { slotValueToLabel } from '../SlotLabel';

const SlotPopupContent = (props) => {
    const {
        value: active, onSelect, trigger, trackOpenMenu, chooseSlotWithoutValue, allowUnfeaturized, slotsToRemove,
    } = props;
    const { browseToSlots } = useContext(ConversationOptionsContext);
    const { slots, requestedSlot } = useContext(ProjectContext);
    let slotsToUse = requestedSlot ? [...(slots.filter(x => x.name !== 'requested_slot')), requestedSlot] : slots;
    slotsToUse = slotsToUse.filter(x => !slotsToRemove.some(slot => slot === x.name));
    const [popupOpen, setPopupOpen] = useState();
    const [menuOpen, setMenuOpen] = useState();
    const allowedTypes = ['bool', 'float', 'list', 'text', 'categorical'];
    if (allowUnfeaturized) allowedTypes.push('unfeaturized');

    if (!slotsToUse.filter(s => allowedTypes.includes(s.type)).length) {
        return (
            <Popup
                trigger={trigger}
                wide
                on='click'
                open={popupOpen}
                onOpen={() => {
                    setPopupOpen(true);
                    trackOpenMenu(() => setPopupOpen(false));
                }}
                onClose={() => setPopupOpen(false)}
            >
                <p>
                    No featurized slot found to insert.
                </p>
                <div>
                    <Button
                        fluid
                        color='orange'
                        content='Edit slots'
                        onClick={() => {
                            setPopupOpen(false);
                            browseToSlots();
                        }}
                    />
                </div>
            </Popup>
        );
    }

    const { name: activeName, type: activeType, slotValue } = active || {
        name: null,
        type: null,
        slotValue: null,
    };
    const slotsByCat = groupBy(slotsToUse, s => s.type);
    const cats = Object.keys(slotsByCat).filter(cat => allowedTypes.includes(cat));

    function getSlotValue(slot) {
        const { type } = slot;
        if (type === 'bool') return [true, false];
        if (type === 'text') return ['set', null];
        if (type === 'float') return [1.0, null];
        if (type === 'list') return [['not-empty'], []];
        return [...slot.categories, null];
    }

    return (
        <Dropdown
            trigger={trigger}
            className='dropdown-button-trigger'
            open={menuOpen}
            onOpen={() => {
                setMenuOpen(true);
                trackOpenMenu(() => setMenuOpen(false));
            }}
            onClose={() => setMenuOpen(false)}
        >
            <Dropdown.Menu>
                <Dropdown.Header>Select a slot</Dropdown.Header>
                {cats.map(c => (
                    <Dropdown.Item
                        active={activeType === c}
                        className='dropdown'
                        key={`slotcat-${c}`}
                        // This onclick prevents closing the dropdown
                        // when you click above or below the text
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <Dropdown
                            text={c}
                            fluid
                            // The upward here prevents a visual bug
                            upward={false}
                        >
                            <Dropdown.Menu>
                                {slotsByCat[c].map(s => (
                                    <Dropdown.Item
                                        active={activeName === s.name}
                                        className='dropdown'
                                        key={`slotname-${s.name}`}
                                        // This onclick prevents closing the dropdown
                                        // when you click above or below the text
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        <Dropdown
                                            text={s.name}
                                            fluid
                                            // The upward here prevents a visual bug
                                            upward={false}
                                        >
                                            <Dropdown.Menu>
                                                {chooseSlotWithoutValue ? (
                                                    <Dropdown.Item
                                                        text='Choose this slot'
                                                        onClick={() => onSelect({ ...s })}
                                                    />
                                                ) : getSlotValue(s).map(content => (
                                                    <Dropdown.Item
                                                        onClick={() => onSelect({
                                                            ...s,
                                                            slotValue: content,
                                                        })
                                                        }
                                                        active={slotValue === content}
                                                        key={`slotname-${s.name}-value-${content}`}
                                                        className='color-column'
                                                    >
                                                        {slotValueToLabel(content)}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

SlotPopupContent.propTypes = {
    value: PropTypes.object,
    onSelect: PropTypes.func,
    trigger: PropTypes.element.isRequired,
    trackOpenMenu: PropTypes.func,
    chooseSlotWithoutValue: PropTypes.bool,
    allowUnfeaturized: PropTypes.bool,
    slotsToRemove: PropTypes.array,
};

SlotPopupContent.defaultProps = {
    value: null,
    onSelect: () => {},
    trackOpenMenu: () => {},
    chooseSlotWithoutValue: false,
    allowUnfeaturized: false,
    slotsToRemove: [],
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(SlotPopupContent);
