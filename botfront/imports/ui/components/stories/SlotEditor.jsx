import { AutoForm, AutoField, ErrorsField } from 'uniforms-semantic';
import { Segment, Popup, Icon } from 'semantic-ui-react';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { SlotsSchema, SlotSchema, TextSlotSchema, slotSchemas } from '../../../api/slots/slots.schema';
import SelectField from '../form_fields/SelectField';
import ConfirmPopup from '../common/ConfirmPopup';
import SaveButton from '../utils/SaveButton';
import BooleanSlotForm from './BooleanSlotForm';
import TextSlotForm from './TextSlotForm';

function SlotEditor(props) {
    const {
        slot, onSave, projectId, onDelete, newSlot, slotType,
    } = props;
    const [saved, setSaved] = useState(false);
    const [deletePopupOpen, setDeletePopup] = useState(false);
    const [hover, setHover] = useState(false);
    const [successTimeout, setSuccessTimeout] = useState(0);
    const forms = {
        Boolean: () => <BooleanSlotForm newSlot slotSchema={slotSchemas.Boolean} slot={null} />,
        Text: () => <TextSlotForm newSlot slotSchema={slotSchemas.Text} slot={null} />,
    };

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
            { forms[slotType]() }
        </Segment>
    );
}

SlotEditor.propTypes = {
    slot: PropTypes.object.isRequired,
    onSave: PropTypes.func,
    projectId: PropTypes.string.isRequired,
    onDelete: PropTypes.func,
    newSlot: PropTypes.bool,
    slotType: PropTypes.string.isRequired,
};

SlotEditor.defaultProps = {
    onSave: () => {},
    onDelete: () => {},
    newSlot: false,
};

export default SlotEditor;
