import { Input } from 'semantic-ui-react';
import React from 'react';

import PropTypes from 'prop-types';


function EntityValueEditor({
    entity,
    onChange,
}) {
    return (
        <div style={{ display: 'inline' }}>
            <Input
                data-cy='entity-value-input'
                value={entity.value}
                onChange={(_, { value }) => onChange(
                    { ...entity, value },
                )}
                // label='value'
                // size='small'
            />
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
