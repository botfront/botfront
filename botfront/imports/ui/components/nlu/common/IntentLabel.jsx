import React, { useContext, useState, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Popup, Input, Button,
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
    } = props;
    const { addIntent, intents: contextIntents } = useContext(ProjectContext);
    const [popupOpen, setPopupOpen] = useState(false);
    const [typeInput, setTypeInput] = useState('');

    const intents = contextIntents
        .sort((i1, i2) => (i2 === value) - (i1 === value))
        .map(i => ({ intent: i }));

    useImperativeHandle(ref, () => ({
        isPopupOpen: () => popupOpen,
    }));

    const textMatch = (s1, s2) => (s1 || '')
        .replace(/ /g, '')
        .toLowerCase()
        .includes((s2 || '').replace(/ /g, '').toLowerCase());
    const dataToDisplay = intents.filter(i => textMatch(i.intent, typeInput));

    const hasInvalidChars = intentName => intentName.match(/[ +/{}/]/);

    const handleTypeInput = (_e, { value: newInput }) => {
        if (!hasInvalidChars(newInput)) setTypeInput(newInput);
    };

    const handleChange = (intentName) => {
        if (intentName) addIntent(intentName);
        onChange(intentName);
        setTypeInput('');
        setPopupOpen(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            setTypeInput('');
            setPopupOpen(false);
        }
        if (event.key === 'Enter') handleChange(typeInput);
    };

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

    const columns = [{ key: 'intent', style: { width: '200px' }, render: renderIntent }];

    const renderContent = () => (
        <div
            style={{
                height: dataToDisplay.length
                    ? allowAdditions
                        ? '250px'
                        : '200px'
                    : '50px',
                width: '300px',
            }}
            className='intent-dropdown'
            data-cy='intent-dropdown'
        >
            {allowAdditions && renderInsertNewIntent()}
            {dataToDisplay.length ? (
                <DataTable
                    height={200}
                    width={300}
                    columns={columns}
                    data={dataToDisplay}
                    onClickRow={({ datum: { intent } }) => handleChange(intent)}
                    rowClassName='clickable'
                />
            ) : (
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
    if (popupOpen) extraClass = `${extraClass} selected`;
    if (disabled) extraClass = `${extraClass} disabled`;
    if (value === OOS_LABEL || !value) extraClass = `${extraClass} null`;
    if (!allowEditing) extraClass = `${extraClass} uneditable`;

    return (
        <div className={`intent-label ${extraClass}`} data-cy='intent-label'>
            <Popup
                trigger={(
                    <div className='content-on-label'>
                        <Icon name='tag' size='small' />
                        <span>{value || 'no intent'}</span>
                    </div>
                )}
                basic
                content={renderContent()}
                on='click'
                open={popupOpen}
                onOpen={() => setPopupOpen(true)}
                onClose={() => {
                    setTypeInput('');
                    setPopupOpen(false);
                }}
                disabled={!allowEditing}
                className='intent-popup'
            />
            {enableReset && value && value !== OOS_LABEL && (
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
};

Intent.defaultProps = {
    value: null,
    allowEditing: false,
    allowAdditions: false,
    onChange: () => {},
    disabled: false,
    enableReset: false,
};

export default Intent;
