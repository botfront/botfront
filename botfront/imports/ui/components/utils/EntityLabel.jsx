import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import EntityPopup from '../example_editor/EntityPopup';
import { ConversationOptionsContext } from './Context';

function Entity({
    value,
    onChange,
    onDelete,
    size,
    allowEditing,
    deletable,
}) {
    const { entities } = useContext(ConversationOptionsContext);
    return (
        <EntityPopup
            entity={value}
            onAddOrChange={(event, data) => onChange(data.value)}
            onDelete={() => onDelete()}
            options={entities.map(e => ({ text: e.entity, value: e.entity }))}
            deletable={deletable}
            length={value.end - value.start}
            trigger={(
                <div className='entity-container'>
                    <div className={`${size}-entity-text entity`}>
                        {value.entity}
                    </div>
                    <div className={`${size}-entity-value entity`}>
                        {value.value}
                    </div>
                </div>
            )}
            key={`${value.start}${value.end}`}
            disabled={!allowEditing}
        />
    );
}

Entity.propTypes = {
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    size: PropTypes.string,
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    allowEditing: PropTypes.bool,
};

Entity.defaultProps = {
    onDelete: () => {},
    size: 'mini',
    deletable: false,
    allowEditing: false,
};

export default Entity;
