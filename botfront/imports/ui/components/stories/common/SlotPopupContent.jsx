import React, { useContext } from 'react';
import PropTypes from 'prop-types';
// import { Context } from 'context';
import {
    Dropdown, Button, Popup,
} from 'semantic-ui-react';
import { Link } from 'react-router';
import { groupBy } from 'lodash';

const SlotPopupContent = (props) => {
    const {
        value: active, onChange, available, trigger,
    } = props;
    const { slots: slotsFromContext, projectId } = { slots: [], projectId: 'bf' }; // useContext(Context);
    const slots = [...available, ...slotsFromContext];

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
            <Dropdown.Menu>
                <Dropdown.Header style={{ margin: '0.6em' }}>Select a slot</Dropdown.Header>
                { cats.map(c => (
                    <>
                        <Dropdown.Divider style={{ margin: '0' }} />
                        <Dropdown.Item
                            active={activeType === c}
                        >
                            <Dropdown
                                text={c}
                                key={`slotcat-${c}`}
                                fluid
                            >
                                <Dropdown.Menu>
                                    { slotsByCat[c].map(s => (
                                        <>
                                            <Dropdown.Divider style={{ margin: '0' }} />
                                            <Dropdown.Item
                                                onClick={() => onChange(s)}
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
    onChange: PropTypes.func,
    available: PropTypes.arrayOf(PropTypes.object),
    trigger: PropTypes.element.isRequired,
};

SlotPopupContent.defaultProps = {
    value: null,
    onChange: () => {},
    available: [],
};

export default SlotPopupContent;
