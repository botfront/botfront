import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import EntityPopup from '../example_editor/EntityPopup';
import { ConversationOptionsContext } from './Context';

function Entity({
    value, onChange, onDelete, allowEditing, deletable, color,
}) {
    const { entities, addEntity } = useContext(ConversationOptionsContext);
    return (
        <EntityPopup
            entity={value}
            onAddOrChange={(_event, data) => {
                addEntity(data.value);
                onChange(data.value);
            }}
            onDelete={() => onDelete()}
            options={[...new Set([...entities, value.entity])].map(e => ({
                text: e,
                value: e,
            }))}
            deletable={deletable}
            length={value.start ? value.end - value.start : 0}
            trigger={(
                <div className={`entity-container ${color}`}>
                    <span className='float'>{value.entity}</span>
                    <div>{value.value}</div>
                </div>
            )}
            key={`${value.start || value.entity}${value.end || ''}`}
            disabled={!allowEditing}
        />
    );
}

Entity.propTypes = {
    onChange: PropTypes.func.isRequired,
    color: PropTypes.string,
    onDelete: PropTypes.func,
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    allowEditing: PropTypes.bool,
};

Entity.defaultProps = {
    onDelete: () => {},
    deletable: false,
    allowEditing: false,
    color: 'teal',
};

export default Entity;
