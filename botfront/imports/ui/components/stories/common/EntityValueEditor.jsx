import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Label } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';

function EntityValueEditor({
    entity,
    onChange,
    disallowAdvancedEditing,
}) {
    const exists = field => field in entity && entity[field] !== null;
    const capitalize = key => key.charAt(0).toUpperCase() + key.slice(1);

    const renderField = key => (
        <div className='side-by-side middle entity-value-input-container'>
            <Input
                data-cy={`entity-${key}-input`}
                value={entity[key]}
                onChange={(_, { value }) => onChange(
                    { ...entity, [key]: value },
                )}
                onMouseDown={e => e.stopPropagation()}
                size='small'
                labelPosition='left'
                className='entity-value-input'
            >
                <Label>{capitalize(key)}</Label>
                <input />
            </Input>
            {(key !== 'value' || exists('text')) && (
                <div>
                    <IconButton
                        color='grey'
                        icon='trash'
                        onClick={key === 'value'
                            ? () => onChange({ ...entity, value: entity.text })
                            : () => { const { [key]: _, ...rest } = entity; onChange(rest); }
                        }
                    />
                </div>
            )}
        </div>
    );

    const renderAddButton = key => (
        <Button
            onClick={() => onChange({ ...entity, [key]: '' })}
            content={capitalize(key)}
            icon='add'
        />
    );

    const showValue = (!exists('text') || entity.text !== entity.value);
    const showRole = exists('role');
    const showGroup = exists('group');

    const renderAddButtons = () => {
        if (showValue && showRole && showGroup) return null;
        return (
            <Button.Group size='tiny'>
                {!showValue && renderAddButton('value')}
                {!showRole && renderAddButton('role')}
                {!showGroup && renderAddButton('group')}
            </Button.Group>
        );
    };


    return (
        <div style={{ display: 'inline' }}>
            {showValue && renderField('value')}
            {!disallowAdvancedEditing && showRole && renderField('role')}
            {!disallowAdvancedEditing && showGroup && renderField('group')}
            {!disallowAdvancedEditing && renderAddButtons()}
        </div>
    );
}

EntityValueEditor.propTypes = {
    entity: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disallowAdvancedEditing: PropTypes.bool,
};

EntityValueEditor.defaultProps = {
    disallowAdvancedEditing: false,
};

export default EntityValueEditor;
