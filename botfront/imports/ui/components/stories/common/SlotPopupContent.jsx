import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    Dropdown, Button, Popup,
} from 'semantic-ui-react';
import { Link } from 'react-router';
import { groupBy } from 'lodash';
import { ConversationOptionsContext } from '../../utils/Context';

const SlotPopupContent = (props) => {
    const {
        value: active, onSelect, trigger, projectId,
    } = props;
    const { slots } = useContext(ConversationOptionsContext);
    
    function extractCategories(slotsData) {
        const categories = slotsData.filter(slot => slot.type === 'categorical').flatMap((slot) => {
            return slot.categories;
        });
        return [...new Set(categories)];
    }

    if (!slots.length) {
        return (
            <Popup trigger={trigger} wide on='click'>
                <p>Go to the <strong>Slot</strong> tab to create your first slot!</p>
                <div>
                    <Link to={{ pathname: `/project/${projectId}/stories`, state: { activeItem: 'slots' } }}>
                        <Button fluid color='orange' content='Go to slots' />
                    </Link>
                </div>
            </Popup>
        );
    }

    const { name: activeName, type: activeType, slotValue } = active || { name: null, type: null, slotValue: null };
    const slotsByCat = groupBy(slots, s => s.type);
    const cats = Object.keys(slotsByCat);

    function getSlotValue(type) {
        if (type === 'bool') return [true, false];
        if (type === 'text') return ['set', 'null'];
        if (type === 'list') return ['empty', 'not-empty'];
        return extractCategories(slots);
    }

    return (
        <Dropdown trigger={trigger} className='dropdown-button-trigger'>
            <Dropdown.Menu>
                <Dropdown.Header>Select a slot</Dropdown.Header>
                { cats.map(c => (
                    <>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            active={activeType === c}
                            className='dropdown'
                        >
                            <Dropdown
                                text={c}
                                key={`slotcat-${c}`}
                                fluid
                            >
                                <Dropdown.Menu>
                                    { slotsByCat[c].map(s => (
                                        <>
                                            <Dropdown.Divider />
                                            <Dropdown.Item
                                                active={activeName === s.name}
                                                className='dropdown'
                                                key={s.name}
                                            >
                                                <Dropdown
                                                    text={s.name}
                                                    key={`slotcat-${s}`}
                                                    fluid
                                                >
                                                    <Dropdown.Menu>
                                                        { getSlotValue(c).map(content => (
                                                            <>
                                                                <Dropdown.Divider />
                                                                <Dropdown.Item
                                                                    onClick={() => onSelect({ ...s, slotValue: content })}
                                                                    active={slotValue === content}
                                                                    key={s.slotValue}
                                                                    className='color-column'
                                                                >
                                                                    {content.toString()}
                                                                </Dropdown.Item>
                                                            </>
                                                        )) }
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Dropdown.Item>
                                        </>
                                    )) }
                                </Dropdown.Menu>
                            </Dropdown>
                        </Dropdown.Item>
                    </>
                )) }
            </Dropdown.Menu>
        </Dropdown>
    );
};

SlotPopupContent.propTypes = {
    projectId: PropTypes.string.isRequired,
    value: PropTypes.string,
    onSelect: PropTypes.func,
    trigger: PropTypes.element.isRequired,
};

SlotPopupContent.defaultProps = {
    value: null,
    onSelect: () => {},
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(SlotPopupContent);
