import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Button, Popup,
} from 'semantic-ui-react';
import { Link } from 'react-router';
import { groupBy } from 'lodash';
import { ConversationOptionsContext } from '../../utils/Context';

const SlotPopupContent = (props) => {
    const {
        value: active, onSelect, trigger,
    } = props;
    // Context API should provide the categories
    const { slots, projectId, categories = ['category1', 'category2'] } = useContext(ConversationOptionsContext);
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
        return categories;
    }

    return (
        <Dropdown trigger={trigger} className='dropdown-button-trigger'>
            <Dropdown.Menu className='first-column'>
                <Dropdown.Header>Select a slot</Dropdown.Header>
                { cats.map(c => (
                    <>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            active={activeType === c}
                        >
                            <Dropdown
                                text={c}
                                key={`slotcat-${c}`}
                                fluid
                            >
                                <Dropdown.Menu
                                    className='second-column'
                                >
                                    { slotsByCat[c].map(s => (
                                        <>
                                            <Dropdown.Divider />
                                            <Dropdown.Item
                                                active={activeName === s.name}
                                                key={s.name}
                                            >
                                                <Dropdown
                                                    text={s.name}
                                                    key={`slotcat-${s}`}
                                                    fluid
                                                >
                                                    <Dropdown.Menu
                                                        className='third-column'
                                                    >
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
    value: PropTypes.string,
    onSelect: PropTypes.func,
    trigger: PropTypes.element.isRequired,
};

SlotPopupContent.defaultProps = {
    value: null,
    onSelect: () => {},
};

export default SlotPopupContent;
