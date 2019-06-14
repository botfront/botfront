import { AutoForm, AutoField, ErrorsField } from 'uniforms-semantic';
import { Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { SlotsSchema } from '../../../api/slots/slots.schema';
import SaveButton from '../utils/SaveButton';

function SlotEditor(props) {
    let sucessTimeout = null;
    const { slot, onSave, projectId } = props;
    const [saved, setSaved] = useState(false);
    // useEffect(() => () => {
    //     console.log('cleaning up');
    //     clearTimeout(sucessTimeout);
    // }, []);

    return (
        <Segment>
            <AutoForm
                model={slot}
                schema={SlotsSchema}
                onSubmit={doc => onSave(doc, () => {
                    console.log('setting saved to true');
                    setSaved(true);
                    sucessTimeout = setTimeout(() => {
                        console.log('setting saved to false');
                        setSaved(false);
                    }, 2 * 1000);
                })
                }
            >
                <AutoField name='name' />
                <AutoField name='category' />
                <AutoField
                    type='hidden'
                    name='projectId'
                    value={projectId}
                    label={false}
                />
                <ErrorsField />
                <SaveButton saved={saved} />
            </AutoForm>
        </Segment>
    );
}

SlotEditor.propTypes = {
    slot: PropTypes.object.isRequired,
    onSave: PropTypes.func,
    projectId: PropTypes.string.isRequired,
};

SlotEditor.defaultProps = {
    onSave: () => {},
};

export default SlotEditor;
