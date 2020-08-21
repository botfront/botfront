import React, {
    useContext, useState, useImperativeHandle, useRef,
} from 'react';
import PropTypes, { array } from 'prop-types';
import {
    Icon, Popup, Input, Button, Modal, Item, Label, Dropdown,
} from 'semantic-ui-react';
import UserUtteranceViewer from './UserUtteranceViewer';
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
        multiple,
        width,
        onlyDataTable,
    } = props;
    const {
        addIntent, getCanonicalExamples,
    } = useContext(ProjectContext);
    const [popupOpen, setPopupOpen] = useState(false);
    const [typeInput, setTypeInput] = useState('');
    const labelRef = useRef();
    const tableRef = useRef();
    const showReset = allowEditing && enableReset && ((value && value !== OOS_LABEL) || detachedModal);

    const getIntentsFromValue = () => {
        if (Array.isArray(value)) {
            return value.map(intentName => ({ intent: intentName }));
        }
        return (value ? [{ intent: value }] : []);
    };

    const intents = [
        ...getIntentsFromValue(),
        ...getCanonicalExamples({})
            .filter((i) => {
                if (Array.isArray(value)) {
                    return !value.includes(i.intent);
                }
                return i.intent !== value;
            }),
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
    const dataToDisplay = intents.filter(i => textMatch(i.intent, typeInput) || textMatch(i.text, typeInput));

    const [selection, setSelection] = useState(dataToDisplay.slice(0, 1).map(i => i.intent));

    const hasInvalidChars = intentName => intentName.match(/[ +/{}/]/);

    const handleTypeInput = (_e, { value: newInput }) => {
        if (!hasInvalidChars(newInput)) setTypeInput(newInput);
    };

    const handleChange = (intentName) => {
        if (intentName) addIntent(intentName);
        handleClose();
        if (multiple === true) {
            if (Array.isArray(value) && value.includes(intentName)) return;
            onChange([...(value || []), intentName]);
            return;
        }
        onChange(intentName);
    };

    const handleDelete = (intentName) => {
        if (Array.isArray(value)) {
            const index = value.indexOf(intentName);
            onChange([...value.slice(0, index), ...value.slice(index + 1, value.length)]);
        }
    };

    const selectSibling = (key) => {
        let index = dataToDisplay.findIndex(({ intent }) => intent === selection[0]);
        if (!Number.isInteger(index)) return;
        if (key === 'ArrowUp') index -= 1;
        else if (key === 'ArrowDown') index += 1;
        else return;
        index = Math.min(Math.max(0, index), dataToDisplay.length - 1);
        let { windowInfoRef = () => ({}), outerListRef = () => ({}) } = tableRef.current || {};
        windowInfoRef = windowInfoRef(); outerListRef = outerListRef();
        if (windowInfoRef.current && outerListRef.current) {
            if (index >= windowInfoRef.current.visibleStopIndex) outerListRef.current.scrollTop += 100;
            if (index <= windowInfoRef.current.visibleStartIndex) outerListRef.current.scrollTop -= 100;
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
        } else setSelection([dataToDisplay[0].intent]);
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

    const renderExample = (row) => {
        const { datum } = row;
        return (
            <div className='side-by-side middle'>
                <UserUtteranceViewer
                    value={datum}
                    projectId=''
                    disableEditing
                    showIntent={false}
                />
                <Icon
                    name={datum.canonical ? 'gem' : 'tag'}
                />
            </div>
        );
    };

    const columns = [
        {
            key: 'intent',
            selectionKey: true,
            style: { width: '170px', maxWidth: '170px', minWidth: '170px' },
            render: renderIntent,
            class: 'intent',
        },
        { key: 'text', style: { width: '100%' }, render: renderExample },
    ];

    const renderContent = () => (
        <div
            style={{
                width: `${width}px`,
            }}
            className='intent-dropdown'
            data-cy='intent-dropdown'
        >
            {allowAdditions && renderInsertNewIntent()}
            {showReset && renderResetIntent()}

            {!!dataToDisplay.length && (
                <DataTable
                    ref={tableRef}
                    height={dataToDisplay.length * 50 >= 200 ? 200 : dataToDisplay.length * 50}
                    width={width}
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
                    className='create-intent-button'
                />
            )}
        </div>
    );

    let extraClass = '';
    if (popupOpen) extraClass = `${extraClass} selected`;
    if (disabled) extraClass = `${extraClass} disabled`;
    if (value === OOS_LABEL || !value) extraClass = `${extraClass} null`;
    if (!allowEditing) extraClass = `${extraClass} uneditable`;

    if (detachedModal && !!allowEditing) {
        if (!popupOpen) return null;
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
    const renderSingleSelect = () => (
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
    const renderMultiSelect = () => (
        <Dropdown
            className='intent-multiselect'
            scrolling
            trigger={(
                <Item onClick={() => setPopupOpen(true)} className='intent-dropdown-trigger'>
                    {Array.isArray(value) && value.length ? value.map(intentName => (
                        <Label onClick={e => e.stopPropagation()} color='purple' className='intent-multiselect-label'>
                            <Icon name='tag' size='small' />
                            {intentName}
                            <Icon
                                name='delete'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(intentName);
                                }}
                            />
                        </Label>
                    )) : <span className='placeholder-text'>Select an intent</span>}
                </Item>
            )}
            open={popupOpen}
            onClose={handleClose}
            selection
        >
            <Dropdown.Menu><Dropdown.Item>{renderContent()}</Dropdown.Item></Dropdown.Menu>
        </Dropdown>
    );
    if (onlyDataTable) {
        return renderContent();
    }
    return (
        multiple ? renderMultiSelect() : renderSingleSelect()
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
    multiple: PropTypes.bool,
    width: PropTypes.number,
    onlyDataTable: PropTypes.bool,
};

Intent.defaultProps = {
    value: null,
    allowEditing: false,
    allowAdditions: false,
    onChange: () => { },
    disabled: false,
    enableReset: false,
    detachedModal: false,
    onClose: null,
    multiple: false,
    width: 500,
    onlyDataTable: false,
};

export default Intent;
