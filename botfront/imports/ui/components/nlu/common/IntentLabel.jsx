import React, {
    useContext, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Popup, Input, Button,
} from 'semantic-ui-react';
import { ProjectContext } from '../../../layouts/context';
import { OOS_LABEL } from '../../constants.json';
import DataTable from '../../common/DataTable';

function Intent(props) {
    const {
        value, allowEditing, allowAdditions, onChange, disabled, enableReset,
    } = props;
    const {
        addIntent, intents: contextIntents,
    } = useContext(ProjectContext);
    const [popupOpen, setPopupOpen] = useState(false);
    const [typeInput, setTypeInput] = useState('');

    const intents = contextIntents.map(i => ({ intent: i }));

    const textMatch = (s1, s2) => s1.replace(' ', '').toLowerCase().includes(s2.replace(' ', '').toLowerCase());
    const dataToDisplay = intents.filter(i => textMatch(i.intent, typeInput));

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
            style={{ marginBottom: '10px' }}
            onChange={(e, { value: newInput }) => setTypeInput(newInput)}
            onKeyDown={handleKeyDown}
            autoFocus
        />
    );

    const columns = [
        { key: 'intent', style: { width: '200px' }, render: renderIntent },
    ];


    const renderContent = () => (
        <div
            style={{
                height: dataToDisplay.length ? (allowAdditions ? '250px' : '200px') : '100px',
                width: '300px',
            }}
            className='intent-dropdown'
        >
            {allowAdditions && renderInsertNewIntent()}
            {dataToDisplay.length
                ? (
                    <DataTable
                        height={200}
                        width={300}
                        columns={columns}
                        data={dataToDisplay}
                        gutterSize={0}
                        onClickRow={({ datum: { intent } }) => handleChange(intent)}
                    />
                )
                : (
                    <Button fluid color='purple' content='Create new intent' onClick={() => handleChange(typeInput)} />
                )
            }
        </div>
    );

    let extraClass = '';
    if (popupOpen) extraClass = `${extraClass} selected`;
    if (disabled) extraClass = `${extraClass} disabled`;
    if (value === OOS_LABEL || !value) extraClass = `${extraClass} null`;
    if (!allowEditing) extraClass = `${extraClass} uneditable`;

    return (
        <div
            className={`intent-label ${extraClass}`}
            data-cy='intent-label'
        >
            <Popup
                trigger={<div className='content-on-label'><Icon name='tag' size='small' /><span>{value || 'no intent'}</span></div>}
                basic
                content={renderContent()}
                on='click'
                open={popupOpen}
                onOpen={() => setPopupOpen(true)}
                onClose={() => { setTypeInput(''); setPopupOpen(false); }}
                disabled={!allowEditing}
                className='intent-popup'
            />
            { enableReset && value && value !== OOS_LABEL && <Icon name='x' className='action-on-label' onClick={() => handleChange('')} />}
        </div>
    );
}

Intent.propTypes = {
    value: PropTypes.string.isRequired,
    allowEditing: PropTypes.bool,
    allowAdditions: PropTypes.bool,
    enableReset: PropTypes.bool,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
};

Intent.defaultProps = {
    allowEditing: false,
    allowAdditions: false,
    onChange: () => {},
    disabled: false,
    enableReset: false,
};

export default Intent;
