import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Popup, Grid, Button, Header,
} from 'semantic-ui-react';
import EntityDropdown from './EntityDropdown';
import EntityValueEditor from '../../stories/common/EntityValueEditor';
import getColor from '../../../../lib/getColors';
import { useEventListener } from '../../utils/hooks';

function Entity({
    value,
    onChange,
    onDelete,
    allowEditing,
    deletable,
    color,
    customTrigger,
    onClose,
    openInitially,
    disallowAdvancedEditing,
}) {
    const colorToRender = color || getColor(value.entity, true);
    const labelRef = useRef();
    const [popupOpen, setPopupOpen] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [newValue, setNewValue] = useState(value);
    const [toBeDeleted, setToBeDeleted] = useState(false);
    const [createdAt] = useState(new Event('click').timeStamp);
    useEffect(() => {
        if (openInitially) setPopupOpen(true);
    }, []);

    const handleChange = (entity) => {
        setShowDeleteConfirmation(false);
        setNewValue(entity);
    };

    const commitChanges = () => {
        const entityNoEmpties = Object.keys(newValue).reduce((acc, curr) => {
            if (!newValue[curr] && newValue[curr] !== 0) return acc;
            return { ...acc, [curr]: newValue[curr] };
        }, {});
        if (!entityNoEmpties.value) entityNoEmpties.value = entityNoEmpties.text;
        onChange(entityNoEmpties);
    };

    const handleClose = () => {
        if (!toBeDeleted && allowEditing) commitChanges();
        setShowDeleteConfirmation(false);
        if (onClose) onClose();
    };

    useEffect(() => { if (toBeDeleted) onDelete(); }, [toBeDeleted]);

    useEventListener('keydown', ({ key }) => {
        if (popupOpen && key === 'Enter') setPopupOpen(false);
    });

    const renderAdvancedEditing = () => (
        <>
            {!disallowAdvancedEditing && newValue.entity && (
                <EntityValueEditor entity={newValue} onChange={handleChange} disabled={!allowEditing} />
            )}
        </>
    );

    const renderContent = () => (
        <Grid columns='1'>
            <Grid.Row centered style={{ padding: '0.9em 0 0.4em 0' }}>
                <Header as='h4' style={{ fontWeight: '300' }}>
                    {!openInitially ? 'Change' : 'Add'} entity
                </Header>
            </Grid.Row>
            <Grid.Row style={{ padding: '0 0.7em' }}>
                <EntityDropdown
                    entity={newValue}
                    onAddItem={v => handleChange({ ...newValue, entity: v })}
                    onChange={v => handleChange({ ...newValue, entity: v })}
                    onClear={
                        deletable && !showDeleteConfirmation && !openInitially
                            ? () => setShowDeleteConfirmation(true)
                            : null
                    }
                    disabled={!allowEditing}
                />
            </Grid.Row>
            <Grid.Row centered>
                {showDeleteConfirmation
                    ? (
                        <Button negative size='mini' onClick={() => setToBeDeleted(true)}>
                        Confirm deletion
                        </Button>
                    )
                    : renderAdvancedEditing()
                }
            </Grid.Row>
        </Grid>
    );

    const renderText = () => {
        if (value.text !== value.value) {
            return (
                <span>
                    {value.text} <span className='value-synonym'>&#8810;{value.value}&#8811;</span>
                </span>
            );
        }
        return value.text;
    };

    const onClickProp = {
        onClick: () => {
            if (popupOpen) handleClose();
            else setPopupOpen(true);
        },
        ...(allowEditing ? { style: { cursor: 'pointer' } } : {}),
    };
    return (
        <>
            {popupOpen && (
                <Popup
                    open
                    basic
                    wide
                    content={renderContent()}
                    position='bottom right'
                    on='click'
                    context={labelRef.current}
                    onUnmount={handleClose}
                    onClose={(e) => {
                        if (Math.abs(createdAt - e.timeStamp) < 200) return; // likely same event
                        setPopupOpen(false);
                    }}
                    className='entity-popup'
                />
            )}
            {customTrigger ? (
                <span ref={labelRef} {...onClickProp}>
                    {customTrigger}
                </span>
            ) : (
                <div
                    data-cy='entity-label'
                    className={`entity-container ${colorToRender}`}
                >
                    <span className='float'>
                        {(value.group || value.role || value.text !== value.value) && <>&#9733;</>}
                        {value.entity}
                    </span>
                    <div ref={labelRef} {...onClickProp}>
                        {renderText()}
                    </div>
                </div>
            )}
        </>
    );
}

Entity.propTypes = {
    customTrigger: PropTypes.node,
    onClose: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    color: PropTypes.string,
    onDelete: PropTypes.func,
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    allowEditing: PropTypes.bool,
    openInitially: PropTypes.bool,
    disallowAdvancedEditing: PropTypes.bool,
};

Entity.defaultProps = {
    customTrigger: null,
    onClose: null,
    onDelete: () => {},
    deletable: false,
    allowEditing: false,
    color: null,
    openInitially: false,
    disallowAdvancedEditing: false,
};


export default Entity;
