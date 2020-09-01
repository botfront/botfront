import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Popup, Grid, Button, Header, Accordion,
} from 'semantic-ui-react';
import EntityDropdown from './EntityDropdown';
import EntityValueEditor from '../../stories/common/EntityValueEditor';
import getColor from '../../../../lib/getColors';

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

    useEffect(() => {
        if (openInitially) setPopupOpen(true);
    }, [openInitially]);

    useEffect(() => setNewValue(value), [value]);

    const handleChange = (entity) => {
        setShowDeleteConfirmation(false);
        setNewValue(entity);
    };

    const commitChanges = () => {
        const entityNoEmpties = Object.keys(newValue).reduce((acc, curr) => {
            if (!newValue[curr]) return acc;
            return { ...acc, [curr]: newValue[curr] };
        }, {});
        onChange(entityNoEmpties);
    };

    const handleClose = () => {
        setPopupOpen(false);
        commitChanges();
        setShowDeleteConfirmation(false);
        if (onClose) onClose();
    };

    const renderAdvancedEditing = () => {
        if (disallowAdvancedEditing) return <div style={{ height: '10px' }} />;
        const content = <EntityValueEditor entity={newValue} onChange={handleChange} />;
        return (
            <>
                <Accordion
                    defaultActiveIndex={
                        newValue.role || newValue.group || newValue.text !== newValue.value ? 0 : -1
                    }
                    panels={[
                        {
                            key: 'advanced',
                            title: 'Avanced settings',
                            content: { content },
                        },
                    ]}
                />
                <div style={{ height: '10px' }} />
            </>
        );
    };

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
                />
            </Grid.Row>
            {showDeleteConfirmation ? (
                <Grid.Row centered>
                    <Button negative size='mini' onClick={onDelete}>
                        Confirm deletion
                    </Button>
                </Grid.Row>
            ) : (
                renderAdvancedEditing()
            )}
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
            {customTrigger ? (
                <span ref={labelRef} {...onClickProp}>
                    {customTrigger}
                </span>
            ) : (
                <div
                    data-cy='entity-label'
                    className={`entity-container ${colorToRender}`}
                >
                    <span className='float'>{value.entity}</span>
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
