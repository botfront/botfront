import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    Dropdown, Button, Popup,
} from 'semantic-ui-react';
import { groupBy } from 'lodash';
import { ConversationOptionsContext } from '../../utils/Context';

const SlotPopupContent = (props) => {
    const {
        value: active, onSelect, trigger, trackOpenMenu,
    } = props;
    const { slots, browseToSlots } = useContext(ConversationOptionsContext);
    const [popupOpen, setPopupOpen] = useState();
    const [menuOpen, setMenuOpen] = useState();

    if (!slots.length) {
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
                    Go to the <strong>Slot</strong> tab to create your first
                    slot!
                </p>
                <div>
                    <Button fluid color='orange' content='Go to slots' onClick={browseToSlots} />
                </div>
            </Popup>
        );
    }

    const { name: activeName, type: activeType, slotValue } = active || {
        name: null,
        type: null,
        slotValue: null,
    };
    const slotsByCat = groupBy(slots, s => s.type);
    const cats = Object.keys(slotsByCat);

    function getSlotValue(slot) {
        const { type } = slot;
        if (type === 'bool') return [true, false];
        if (type === 'text') return ['set', 'null'];
        if (type === 'list') return ['empty', 'not-empty'];
        return slot.categories;
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
                    >
                        <Dropdown
                            text={c}
                            fluid
                        >
                            <Dropdown.Menu>
                                {slotsByCat[c].map(s => (
                                    <Dropdown.Item
                                        active={
                                            activeName
                                            === s.name
                                        }
                                        className='dropdown'
                                        key={`slotname-${s.name}`}
                                    >
                                        <Dropdown
                                            text={s.name}
                                            fluid
                                        >
                                            <Dropdown.Menu>
                                                {getSlotValue(
                                                    s,
                                                ).map(
                                                    content => (
                                                        <Dropdown.Item
                                                            onClick={() => onSelect(
                                                                {
                                                                    ...s,
                                                                    slotValue: content,
                                                                },
                                                            )
                                                            }
                                                            active={
                                                                slotValue
                                                                === content
                                                            }
                                                            key={`slotname-${s.name}-value-${content}`}
                                                            className='color-column'
                                                        >
                                                            {content.toString()}
                                                        </Dropdown.Item>
                                                    ),
                                                )}
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
};

SlotPopupContent.defaultProps = {
    value: null,
    onSelect: () => {},
    trackOpenMenu: () => {},
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(SlotPopupContent);
