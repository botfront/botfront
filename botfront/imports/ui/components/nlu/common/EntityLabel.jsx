import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Popup, Grid, Button, Header,
} from 'semantic-ui-react';
import EntityDropdown from './EntityDropdown';
import getColor from '../../../../lib/getColors';

function Entity({
    value, onChange, onDelete, allowEditing, deletable, color, customTrigger, onClose, openInitially,
}) {
    const colorToRender = color || getColor(value.entity, true);
    const labelRef = useRef();
    const [popupOpen, setPopupOpen] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => { if (openInitially) setPopupOpen(true); }, [openInitially]);

    const handleClose = () => {
        setPopupOpen(false);
        setShowDeleteConfirmation(false);
        if (onClose) onClose();
    };

    const handleChange = (...args) => {
        setShowDeleteConfirmation(false);
        onChange(...args);
    };

    const renderContent = () => (
        <Grid columns='1'>
            <Grid.Row centered style={{ padding: '0.9em 0 0.4em 0' }}>
                <Header as='h4' style={{ fontWeight: '300' }}>
                    {deletable ? 'Change' : 'Add'} entity
                </Header>
            </Grid.Row>
            <Grid.Row style={{ padding: '0 0.7em' }}>
                <EntityDropdown
                    entity={value}
                    onAddItem={handleChange}
                    onChange={handleChange}
                    onClear={
                        deletable && !showDeleteConfirmation && !openInitially
                            ? () => setShowDeleteConfirmation(true)
                            : null
                    }
                />
            </Grid.Row>
            {showDeleteConfirmation ? (
                <Grid.Row centered>
                    <Button negative size='mini' onClick={onDelete}>
                    Confirm deletion
                    </Button>
                </Grid.Row>
            ) : (
                <div style={{ height: '10px' }} />
            )}
        </Grid>
    );

    const onClickProp = {
        onClick: () => { if (popupOpen) handleClose(); else setPopupOpen(true); },
        ...(allowEditing ? { style: { cursor: 'pointer' } } : {}),
    };
    return (
        <>
            {popupOpen && allowEditing && (
                <Popup
                    open
                    basic
                    content={renderContent()}
                    on='click'
                    context={labelRef.current}
                    onClose={handleClose}
                    className='entity-popup'
                />
            )}
            {customTrigger
                ? <span ref={labelRef} {...onClickProp}>{customTrigger}</span>
                : (
                    <div data-cy='entity-label' className={`entity-container ${colorToRender}`}>
                        <span className='float'>{value.entity}</span>
                        <div ref={labelRef} {...onClickProp}>
                            {value.value}
                        </div>
                    </div>
                )
            }
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
};

Entity.defaultProps = {
    customTrigger: null,
    onClose: null,
    onDelete: () => {},
    deletable: false,
    allowEditing: false,
    color: null,
    openInitially: false,
};

export default Entity;
