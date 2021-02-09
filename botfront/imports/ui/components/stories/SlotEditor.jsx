import { AutoForm, AutoField, ErrorsField } from 'uniforms-semantic';
import { Segment, Popup, Icon } from 'semantic-ui-react';
import React, { useEffect, useState } from 'react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import PropTypes from 'prop-types';
import { slotSchemas } from '../../../api/slots/slots.schema';
import ConfirmPopup from '../common/ConfirmPopup';
import SaveButton from '../utils/SaveButton';

function SlotEditor(props) {
    const {
        slot, onSave, projectId, onDelete, newSlot, deletable, canEditSlots,
    } = props;
    const { type } = slot;
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
            onMouseMove={() => setHover(true)}
            data-cy={newSlot ? 'new-slot-editor' : 'slot-editor'}
        >
            <AutoForm
                model={slot}
                schema={new SimpleSchema2Bridge(slotSchemas[type])}
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
                disabled={!canEditSlots}
            >
                <AutoField name='name' data-cy='slot-name' />
                {type !== 'unfeaturized' && (
                    <AutoField
                        name='initialValue'
                        placeholder='Leave empty for no initial value'
                    />
                )}
                {type === 'float' && (
                    <>
                        <AutoField name='minValue' placeholder='0.0' />
                        <AutoField name='maxValue' placeholder='1.0' />
                    </>
                )}
                {type === 'categorical' && <AutoField name='categories' />}
                <AutoField
                    name='projectId'
                    value={projectId}
                    label={false}
                    hidden
                />
                <b>{`Type:  ${type}`}</b>
                <br />
                <ErrorsField data-cy='errors-field' />
                { canEditSlots && (
                    <SaveButton
                        saved={saved}
                        saveText={newSlot ? 'Add Slot' : 'Save'}
                    />
                )}
                {hover && canEditSlots && (
                    <>
                        <Popup
                            trigger={(
                                <Icon
                                    name='trash'
                                    color='grey'
                                    link={deletable}
                                    data-cy='delete-slot'
                                    disabled={!deletable}
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
                            disabled={!deletable}
                        />
                        {!deletable && <span className='grey'>This slot cannot be deleted as it is used in forms.</span>}
                    </>
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
    canEditSlots: PropTypes.bool,
    deletable: PropTypes.bool,
};

SlotEditor.defaultProps = {
    onSave: () => {},
    onDelete: () => {},
    newSlot: false,
    canEditSlots: false,
    deletable: true,
};

export default SlotEditor;
