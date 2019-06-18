import { AutoForm, AutoField, ErrorsField } from 'uniforms-semantic';
import { Segment, Popup, Icon } from 'semantic-ui-react';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { SlotsSchema } from '../../../api/slots/slots.schema';
import SelectField from '../form_fields/SelectField';
import ConfirmPopup from '../common/ConfirmPopup';
import SaveButton from '../utils/SaveButton';

function SlotEditor(props) {
    const {
        slot, onSave, projectId, onDelete, newSlot,
    } = props;
    const [saved, setSaved] = useState(false);
    const [deletePopupOpen, setDeletePopup] = useState(false);
    const [hover, setHover] = useState(false);
    const [successTimeout, setSuccessTimeout] = useState(0);

    // This effect cleans up the timeout in case the component dismounts
    useEffect(
        () => () => {
            clearTimeout(successTimeout);
        },
        [successTimeout],
    );

    return (
        <Segment
            className={`slot-editor ${newSlot ? 'new' : ''}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            data-cy={newSlot ? 'new-slot-editor' : 'slot-editor'}
        >
            <AutoForm
                model={slot}
                schema={SlotsSchema}
                onSubmit={doc => onSave(doc, () => {
                    setSaved(true);
                    if (!newSlot) {
                        setSuccessTimeout(
                            setTimeout(() => {
                                setSaved(false);
                            }, 2 * 1000),
                        );
                    }
                })
                }
            >
                <AutoField name='name' />
                <SelectField name='category' data-cy='category-field' />
                {slot.category === 'text' && (
                    <AutoField
                        name='initialValue'
                        placeholder='Leave empty for no initial value'
                    />
                )}
                {slot.category === 'float' && (
                    <>
                        <AutoField
                            name='minValue'
                            placeholder='Leave empty for no minimum value'
                        />
                        <AutoField
                            name='maxValue'
                            placeholder='Leave empty for no maximum value'
                        />
                    </>
                )}
                <AutoField
                    name='projectId'
                    value={projectId}
                    label={false}
                    hidden
                />
                <ErrorsField data-cy='errors-field' />
                <SaveButton
                    saved={saved}
                    saveText={newSlot ? 'Add Slot' : 'Save'}
                />
                {hover && !newSlot && (
                    <Popup
                        trigger={(
                            <Icon
                                name='trash'
                                color='grey'
                                link
                                data-cy='delete-slot'
                            />
                        )}
                        content={(
                            <ConfirmPopup
                                title='Delete Slot ?'
                                onYes={() => onDelete(slot)}
                                onNo={() => setDeletePopup(false)}
                            />
                        )}
                        on='click'
                        open={deletePopupOpen}
                        onOpen={() => setDeletePopup(true)}
                    />
                )}
            </AutoForm>
        </Segment>
    );
}

SlotEditor.propTypes = {
    slot: PropTypes.object.isRequired,
    onSave: PropTypes.func,
    projectId: PropTypes.string.isRequired,
    onDelete: PropTypes.func,
    newSlot: PropTypes.bool,
};

SlotEditor.defaultProps = {
    onSave: () => {},
    onDelete: () => {},
    newSlot: false,
};

export default SlotEditor;
