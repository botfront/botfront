import React, {
    useContext, useState, useImperativeHandle, useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Popup, Input, Button, Modal,
} from 'semantic-ui-react';
import { ProjectContext } from '../../../layouts/context';
import { OOS_LABEL } from '../../constants.json';
import DataTable from '../../common/DataTable';

const Intent = React.forwardRef((props, ref) => {
    const {
        value,
        allowEditing,
        allowAdditions,
        onChange,
        disabled,
        enableReset,
        detachedModal,
        onClose,
        additionalIntentOption,
    } = props;
    const { intents: contextIntents } = useContext(ProjectContext);
    const [popupOpen, setPopupOpen] = useState(false);
    const [typeInput, setTypeInput] = useState('');
    const labelRef = useRef();
    const tableRef = useRef();
    const showReset = allowEditing && enableReset && ((value && value !== OOS_LABEL) || detachedModal);

    const intents = [
        ...(value ? [{ intent: value }] : []),
        ...contextIntents
            .filter(i => i !== value)
            .map(i => ({ intent: i })),
    ];

    useImperativeHandle(ref, () => ({
        isPopupOpen: () => popupOpen,
        openPopup: () => setPopupOpen(true),
    }));

    const handleClose = (e = {}) => {
        if (labelRef.current && labelRef.current.contains(e.target)) return; // prevent duplicate handling
        setTypeInput('');
        setPopupOpen(false);
        if (onClose) onClose();
    };

    const textMatch = (s1, s2) => (s1 || '')
        .replace(/ /g, '')
        .toLowerCase()
        .includes((s2 || '').replace(/ /g, '').toLowerCase());
    let dataToDisplay;
    if (intents.includes(additionalIntentOption)) {
        dataToDisplay = intents.filter(i => textMatch(i.intent, typeInput));
    } else {
        dataToDisplay = [...intents, { intent: additionalIntentOption }].filter(i => textMatch(i.intent, typeInput));
    }
    

    const [selection, setSelection] = useState(dataToDisplay.slice(0, 1).map(i => i.intent));

    const hasInvalidChars = intentName => intentName.match(/[ +/{}/]/);

    const handleTypeInput = (_e, { value: newInput }) => {
        if (!hasInvalidChars(newInput)) setTypeInput(newInput);
    };

    const handleChange = (intentName) => {
        if (!enableReset && !intentName) return;
        handleClose();
        onChange(intentName);
    };

    const selectSibling = (key) => {
        let index = dataToDisplay.findIndex(({ intent }) => intent === selection[0]);
        if (!Number.isInteger(index)) return;
        if (key === 'ArrowUp') index -= 1;
        else if (key === 'ArrowDown') index += 1;
        else return;
        index = Math.min(Math.max(0, index), dataToDisplay.length - 1);
        if (Number.isInteger(tableRef.current?.visibleStartIndex())) {
            if (index >= tableRef.current.visibleStopIndex()) tableRef.current.scrollY(100);
            if (index <= tableRef.current.visibleStartIndex()) tableRef.current.scrollY(-100);
        }
        setSelection([dataToDisplay[index].intent]);
    };

    const handleKeyDown = (event) => {
        event.stopPropagation();
        if (event.key === 'Backspace' && event.shiftKey && showReset) handleChange('');
        if (event.key === 'Escape') handleClose();
        else if (['ArrowUp', 'ArrowDown'].includes(event.key)) selectSibling(event.key);
        else if (event.key === 'Enter') {
            handleChange(
                (dataToDisplay || []).length ? selection[0] : typeInput,
            );
        } else setSelection((dataToDisplay || []).length ? [dataToDisplay[0].intent] : []);
    };

    const renderResetIntent = () => (
        <div className='reset-intent'>
            <Popup
                size='mini'
                inverted
                content='Reset intent (Shift + Backspace)'
                trigger={(
                    <Button
                        icon='x'
                        onClick={() => handleChange('')}
                    />
                )}
            />
        </div>
    );

    const renderIntent = (row) => {
        const { datum } = row;
        if (React.isValidElement(datum.intent)) return datum.intent;
        let classes = 'intent-label uneditable selectable';
        if (datum.intent === value) classes = `${classes} selected`;
        return <div className={classes}>{datum.intent}</div>;
    };

    const renderInsertNewIntent = () => (
        <Input
            placeholder='Filter or create'
            fluid
            onChange={handleTypeInput}
            onKeyDown={handleKeyDown}
            autoFocus
            value={typeInput}
        />
    );
    const columns = [{
        key: 'intent', selectionKey: true, style: { width: '200px' }, render: renderIntent,
    }];

    const renderContent = () => (
        <div
            style={{
                width: '300px',
            }}
            className='intent-dropdown'
            data-cy='intent-dropdown'
        >
            {allowAdditions && renderInsertNewIntent()}
            {showReset && renderResetIntent()}
            {!!dataToDisplay.length && (
                <DataTable
                    ref={tableRef}
                    height={dataToDisplay.length * 40 >= 200 ? 200 : dataToDisplay.length * 40}
                    width={300}
                    columns={columns}
                    data={dataToDisplay}
                    onClickRow={({ datum: { intent } = {} } = { datum: {} }) => handleChange(intent)}
                    selection={selection}
                    onChangeSelection={setSelection}
                    externallyControlledSelection
                />
            )}
            {allowAdditions && (
                <Button
                    fluid
                    color='purple'
                    content='Create new intent'
                    onClick={() => handleChange(typeInput)}
                />
            )}
        </div>
    );

    let extraClass = '';
    if (popupOpen && !disabled && allowEditing) extraClass = `${extraClass} selected`;
    if (disabled) extraClass = `${extraClass} disabled`;
    if (value === OOS_LABEL || !value) extraClass = `${extraClass} null`;
    if (!allowEditing) extraClass = `${extraClass} uneditable`;

    if (detachedModal) {
        if (!popupOpen || !allowEditing) return null;
        return (
            <Modal
                open
                centered
                content={renderContent()}
                onClose={handleClose}
                className='intent-popup'
            />
        );
    }

    const onClickProp = { onClick: () => { if (popupOpen) handleClose(); else setPopupOpen(true); } };
    return (
        <div
            className={`intent-label ${extraClass}`}
            data-cy='intent-label'
            {...{
                onMouseDown: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                },
            }}
        >
            {popupOpen && allowEditing && (
                <Popup
                    open
                    basic
                    content={renderContent()}
                    position='bottom right'
                    on='click'
                    context={labelRef.current}
                    onClose={handleClose}
                    className='intent-popup'
                />
            )}
            <div
                className='content-on-label'
                ref={labelRef}
                {...onClickProp}
            >
                <Icon name='tag' size='small' />
                <span>{value || 'no intent'}</span>
            </div>
            {showReset && (
                <Icon
                    name='x'
                    className='action-on-label'
                    onClick={() => handleChange('')}
                />
            )}
        </div>
    );
});

Intent.propTypes = {
    value: PropTypes.string,
    allowEditing: PropTypes.bool,
    allowAdditions: PropTypes.bool,
    enableReset: PropTypes.bool,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    detachedModal: PropTypes.bool,
    onClose: PropTypes.func,
    additionalIntentOption: PropTypes.string,
};

Intent.defaultProps = {
    value: null,
    allowEditing: false,
    allowAdditions: false,
    onChange: () => {},
    disabled: false,
    enableReset: false,
    detachedModal: false,
    onClose: null,
    additionalIntentOption: '',
};

export default Intent;
