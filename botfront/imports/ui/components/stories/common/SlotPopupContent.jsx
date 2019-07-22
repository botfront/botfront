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
    const { slots, projectId } = useContext(ConversationOptionsContext);

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

    const { name: activeName, type: activeType } = active || { name: null, type: null };
    const slotsByCat = groupBy(slots, s => s.type);
    const cats = Object.keys(slotsByCat);

    return (
        <Dropdown trigger={trigger} className='dropdown-button-trigger'>
            <Dropdown.Menu style={{ top: 'calc(100% + 5px)' }}>
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
                                    style={{ left: 'calc(100% + 23px)' }}
                                >
                                    { slotsByCat[c].map(s => (
                                        <>
                                            <Dropdown.Divider />
                                            <Dropdown.Item
                                                onClick={() => onSelect(s)}
                                                active={activeName === s.name}
                                                key={s.name}
                                            >
                                                {s.name}
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
