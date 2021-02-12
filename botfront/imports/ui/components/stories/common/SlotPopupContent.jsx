import React, { useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dropdown, Button, Popup } from 'semantic-ui-react';
import { groupBy } from 'lodash';

import { ProjectContext } from '../../../layouts/context';
import { ConversationOptionsContext } from '../Context';
import { slotValueToLabel } from '../SlotLabel';

const SlotPopupContent = (props) => {
    const {
        value: active,
        onSelect,
        trigger,
        trackOpenMenu,
        chooseSlotWithoutValue,
        slotsToRemove,
        defaultOpen,
        className,
        disabled,
        excludeSlotsOfType,
    } = props;
    const { browseToSlots } = useContext(ConversationOptionsContext);
    const { slots, requestedSlot } = useContext(ProjectContext);
    let slotsToUse = requestedSlot ? [...(slots.filter(x => x.name !== 'requested_slot')), requestedSlot] : slots;
    slotsToUse = slotsToUse.filter(x => !slotsToRemove.some(slot => slot === x.name));
    const [popupOpen, setPopupOpen] = useState();
    const [menuOpen, setMenuOpen] = useState();
    const allowedTypes = [
        'bool',
        'float',
        'list',
        'text',
        'categorical',
        ...(chooseSlotWithoutValue ? ['unfeaturized'] : []),
    ].filter(type => !excludeSlotsOfType.includes(type));

    const hasFeaturizedSlots = useMemo(() => slotsToUse.filter(s => allowedTypes.includes(s.type)).length > 0, [slotsToUse, allowedTypes]);

    const { name: activeName, type: activeType, slotValue } = active || {
        name: null,
        type: null,
        slotValue: null,
    };
    const slotsByCat = groupBy(slotsToUse, s => s.type);
    const cats = Object.keys(slotsByCat).filter(cat => allowedTypes.includes(cat));

    function getSlotValue(slot) {
        const { type } = slot;
        if (type === 'bool') return [true, false, null];
        if (type === 'text') return ['set', null];
        if (type === 'float') return [1.0, null];
        if (type === 'list') return [['not-empty'], []];
        if (type === 'categorical') return [...slot.categories, null];
        return [null];
    }
    const renderDropdown = () => (
        <Dropdown
            trigger={trigger}
            className={`slots-dropdown dropdown-button-trigger ${className}`}
            open={disabled ? false : defaultOpen ? hasFeaturizedSlots > 0 : menuOpen}
            onOpen={() => {
                if (!hasFeaturizedSlots) {
                    setMenuOpen(false);
                    return;
                }
                setMenuOpen(true);
                trackOpenMenu(() => setMenuOpen(false));
            }}
            onClose={() => setMenuOpen(false)}
        >
            <Dropdown.Menu>
                <Dropdown.Header>Select a slot</Dropdown.Header>
                {cats.map(c => (
                    <Dropdown.Item
                        data-cy={`slot-category-${c}`}
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
                                        data-cy={`choose-${s.name}`}
                                        active={activeName === s.name}
                                        className='dropdown'
                                        key={`slotname-${s.name}`}
                                        // This onclick prevents closing the dropdown
                                        // when you click above or below the text
                                        onClick={(e) => {
                                            if (chooseSlotWithoutValue) onSelect({ ...s });
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        <Dropdown
                                            text={s.name}
                                            fluid
                                            // The upward here prevents a visual bug
                                            upward={false}
                                            onClick={() => {
                                                if (chooseSlotWithoutValue) onSelect({ ...s });
                                            }}
                                        >
                                            <Dropdown.Menu>
                                                {chooseSlotWithoutValue ? (
                                                    <Dropdown.Item
                                                        data-cy={`confirm-select-${s.name}`}
                                                        text='Choose this slot'
                                                        onClick={() => onSelect({ ...s })}
                                                    />
                                                ) : getSlotValue(s).map(content => (
                                                    <Dropdown.Item
                                                        data-cy={`value-${s.name}-${content}`}
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

    return (
        <Popup
            trigger={renderDropdown()}
            wide
            on='click'
            open={defaultOpen || popupOpen}
            onOpen={() => {
                setPopupOpen(true);
                trackOpenMenu(() => setPopupOpen(false));
            }}
            onClose={() => setPopupOpen(false)}
            disabled={hasFeaturizedSlots}
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
};

SlotPopupContent.propTypes = {
    value: PropTypes.object,
    onSelect: PropTypes.func,
    trigger: PropTypes.element,
    trackOpenMenu: PropTypes.func,
    chooseSlotWithoutValue: PropTypes.bool,
    slotsToRemove: PropTypes.array,
    defaultOpen: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    excludeSlotsOfType: PropTypes.arrayOf(PropTypes.string),
};

SlotPopupContent.defaultProps = {
    value: null,
    onSelect: () => {},
    trackOpenMenu: () => {},
    chooseSlotWithoutValue: false,
    slotsToRemove: [],
    defaultOpen: false,
    className: '',
    trigger: <></>,
    disabled: false,
    excludeSlotsOfType: [],
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(SlotPopupContent);
