import React, { useContext } from 'react';
import PropTypes from 'prop-types';
// import { Context } from 'context';
import {
    Dropdown, Menu, Card, Button,
} from 'semantic-ui-react';
import { groupBy } from 'lodash';

const SlotPopupContent = (props) => {
    const { value: active, onChange, available } = props;
    const slots = [
        ...available, // ...useContext(Context),
    ];

    if (!slots.length) {
        return (
            <Card style={{ width: '300px', height: '120px', padding: '15px' }}>
                <p>Go to the Slot tab to create your first slot!</p>
                <div><Button fluid color='orange' content='Go to slots' /></div>
            </Card>
        );
    }

    const { name: activeName, type: activeType } = active || { name: null, type: null };
    const slotsByCat = groupBy(slots, s => s.type);
    const cats = Object.keys(slotsByCat);

    return (
        <Menu vertical>
            <Menu.Item header style={{ textTransform: 'uppercase', fontSize: '0.8em' }}>
                Select a slot type
            </Menu.Item>
            { cats.map(c => (
                <Dropdown
                    item
                    text={c}
                    style={activeType === c ? { fontWeight: 'bold' } : {}}
                    className={activeType === c && 'active'}
                    key={`slotcat-${c}`}
                >
                    <Dropdown.Menu>
                        { slotsByCat[c].map(s => (
                            <Dropdown.Item
                                onClick={() => onChange(s)}
                                active={activeName === s.name}
                                key={s.name}
                            >
                                {s.name}
                            </Dropdown.Item>
                        )) }
                    </Dropdown.Menu>
                </Dropdown>
            )) }
        </Menu>
    );
};

SlotPopupContent.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    available: PropTypes.arrayOf(PropTypes.object),
};

SlotPopupContent.defaultProps = {
    value: null,
    onChange: () => {},
    available: [],
};

export default SlotPopupContent;
