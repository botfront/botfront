import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Label } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';

function EntityValueEditor({
    entity,
    onChange,
}) {
    const renderField = key => (
        <div className='side-by-side middle' style={{ marginBottom: '5px' }}>
            <Input
                data-cy={`entity-${key}-input`}
                value={entity[key]}
                onChange={(_, { value }) => onChange(
                    { ...entity, [key]: value },
                )}
                size='small'
                labelPosition='left'
            >
                <Label>{key}</Label>
                <input />
            </Input>
            {key !== 'value' && (
                <div>
                    <IconButton
                        color='grey'
                        icon='trash'
                        onClick={() => { const { [key]: _, ...rest } = entity; onChange(rest); }}
                    />
                </div>
            )}
        </div>
    );

    const renderAddButton = key => (
        <Button
            onClick={() => onChange({ ...entity, [key]: '' })}
            content={`Add ${key}`}
            icon='add'
            size='tiny'
        />
    );

    const renderAddButtons = () => {
        if ('role' in entity && 'group' in entity) return null;
        return (
            <div>
                {!('role' in entity) && renderAddButton('role')}
                {!('group' in entity) && renderAddButton('group')}
            </div>
        );
    };
    return (
        <div style={{ display: 'inline' }}>
            {renderField('value')}
            {'role' in entity && renderField('role')}
            {'group' in entity && renderField('group')}
            {renderAddButtons()}
        </div>
    );
}

EntityValueEditor.propTypes = {
    entity: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

EntityValueEditor.defaultProps = {
};

export default EntityValueEditor;
