import 'react-dates/initialize';
import React, { useState, useEffect, useRef } from 'react';
import {
    Dropdown, Label, Icon, Input, Grid, Segment,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import IntentLabel from '../nlu/common/IntentLabel';


function SequenceSelector({
    sequence, onChange, actionOptions, slotOptions, allowedEventTypes, bordered, enableExclusions, width, direction,
}) {
    const [search, setSearch] = useState('');
    const [mainDropdownOpen, setMainDropdownOpen] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const rootRef = useRef(null);
    useEffect(() => {
        const close = (e) => {
            if (rootRef.current.contains(e.target)) return;
            setMainDropdownOpen(false);
            setDropdownOpen(false);
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    function switchLabel(index, exclude) {
        const newSequence = sequence;
        newSequence[index] = { ...newSequence[index], excluded: exclude };
        
        onChange([...newSequence]);
    }

    function onAddStep(value) {
        const newSequence = [...sequence, value];
        onChange([...newSequence]);
    }

    function onRemoveStep(index) {
        let newSequence;
        if (index === 0) {
            newSequence = sequence.slice(1);
        } else if (index === sequence.length - 1) {
            newSequence = sequence.slice(0, -1);
        } else {
            newSequence = [...sequence.slice(0, index), ...sequence.slice(index + 1)];
        }
        onChange([...newSequence]);
    }


    function handleKeyDown (e) {
        if (e.key === 'Enter' && search && search.length) {
            if (enableExclusions) {
                onAddStep({ name: search, type: dropdownOpen, excluded: false });
            } else {
                onAddStep(search);
            }
            setMainDropdownOpen(false);
            setDropdownOpen(false);
            setSearch('');
        }
    }

    const renderContent = (type) => {
        let optionsToRender = [];
        switch (type) {
        case 'slot':
            optionsToRender = slotOptions;
            break;
        case 'action':
            optionsToRender = actionOptions;
            break;
        default:
            break;
        }
        return (
            <Dropdown.Menu className='actions-container  sub-dropdown' onClick={e => e.stopPropagation()}>
                <Dropdown.Item className='search-menu-item' key='search'>
                    <Input
                        value={search}
                        icon='search'
                        iconPosition='left'
                        className='search'
                        onKeyDown={handleKeyDown}
                        onClick={e => e.stopPropagation()} // otherwise a click close the dropdown
                        onChange={(e, data) => setSearch(data.value)}
                    />
                </Dropdown.Item>
                <Dropdown.Divider />
                {optionsToRender
                    .filter(option => option.text.includes(search))
                    .map((option, idx) => (
                        <Dropdown.Item
                            data-cy={`sequence-option-${idx}`}
                            className='search-result-item'
                            text={option.text}
                            onClick={(e) => {
                                onAddStep({ ...option.value, type });
                                setDropdownOpen(null);
                                setMainDropdownOpen(null);
                                e.stopPropagation();
                            }}
                            key={option.text}
                        />
                    ))}
                {search !== ''
            && (
                <Dropdown.Item
                    className='search-result-item'
                    data-cy='add-option'
                    text={`add: ${search}`}
                    onClick={(e) => {
                        if (enableExclusions) onAddStep({ name: search, type, excluded: false });
                        setSearch('');
                        setDropdownOpen(null);
                        setMainDropdownOpen(null);
                        e.stopPropagation();
                    }}
                />
            )}
        
            </Dropdown.Menu>
        );
    };

    const renderMultiTypeDropdown = () => (
        <Dropdown.Menu>
            {allowedEventTypes.includes('action') && (
                <Dropdown.Item className='dropdown-step' key='actions-dropdown-item'>
                    <Dropdown scrolling open={dropdownOpen === 'action'} text='Actions' fluid className='sequence-addition' onClick={() => setDropdownOpen('action')} data-cy='action-event-dropdown'>
                        {renderContent('action')}
                    </Dropdown>
                </Dropdown.Item>
            )}
            {allowedEventTypes.includes('intent') && (
                <Dropdown.Item className='dropdown-step' key='intents-dropdown-item'>
                    <Dropdown open={dropdownOpen === 'intent'} text='Intents' fluid className='sequence-addition' onClick={() => setDropdownOpen('intent')} data-cy='intent-event-dropdown'>
                        <Dropdown.Menu>
                            <IntentLabel
                                value={null}
                                onlyDataTable
                                allowEditing
                                allowAdditions
                                enableReset
                                onChange={v => onAddStep({ name: v, excluded: false, type: 'intent' })}
                                onClose={() => { setDropdownOpen(null); setMainDropdownOpen(false); }}
                            />
                        </Dropdown.Menu>
                    </Dropdown>
                </Dropdown.Item>
            )}
            {allowedEventTypes.includes('slot') && (
                <Dropdown.Item className='dropdown-step' key='slots-dropdown-item'>
                    <Dropdown scrolling open={dropdownOpen === 'slot'} text='Slot events' fluid className='sequence-addition' onClick={() => setDropdownOpen('slot')} data-cy='slot-event-dropdown'>
                        {renderContent('slot')}
                    </Dropdown>
                </Dropdown.Item>
            )}
        </Dropdown.Menu>
    );

    const renderSingleTypeDropdown = (type) => {
        if (type === 'intent') {
            return (
                <Dropdown.Menu>
                    <IntentLabel
                        onlyDataTable
                        allowEditing
                        allowAdditions
                        enableReset
                        onChange={onAddStep}
                        onClose={() => { setDropdownOpen(null); setMainDropdownOpen(false); }}
                        width='400'
                    />
                </Dropdown.Menu>
            );
        }
        return <></>;
    };

    const getItemName = (item) => {
        if (enableExclusions) {
            return item.name;
        }
        return item;
    };

    const getLabelColor = (item) => {
        if (!enableExclusions) return null;
        return item.excluded ? 'red' : 'green';
    };

    const renderSequenceSelector = () => (
        <div ref={rootRef}>
            <Grid className={`sequence-selector-grid ${bordered ? 'bordered-sequence-selector' : ''}`}>
                <Grid.Column data-cy='sequence-container' floated='left' width={width} className={`sequence-item-container ${bordered ? 'bordered-sequence-selector' : ''}`}> {sequence.map((step, index) => (
                    <Label
                        key={`sequence-step-${index}`}
                        className='sequence-step'
                        data-cy={`sequence-step-${index}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (enableExclusions) switchLabel(index, !step.excluded);
                        }}
                        color={getLabelColor(step)}
                    >
                        {step.excluded && (
                            <Icon
                                name='ban'
                                color='white'
                                size='small'
                            />
                        )}{step.type === 'slot' ? `slot:${getItemName(step)}` : getItemName(step)}<Icon
                            name='delete'
                            data-cy={`remove-step-${index}`}
                            onClick={(e) => { e.stopPropagation(); onRemoveStep(index); }}
                        />
                    </Label>
                ))}
                </Grid.Column>
                <Grid.Column floated='right' width={2} className={`add-event-button ${bordered ? 'bordered-sequence-selector' : ''}`}>
                    <Dropdown
                        icon='add'
                        text=' '
                        className='icon event-selector-dropdown'
                        floating
                        button
                        size='mini'
                        data-cy='sequence-selector'
                        value=' '
                        open={mainDropdownOpen}
                        onClick={() => setMainDropdownOpen(true)}
                        direction={direction}
                    >
                        {allowedEventTypes.length > 1 ? renderMultiTypeDropdown() : renderSingleTypeDropdown(allowedEventTypes[0])}
                    </Dropdown>
                </Grid.Column>
            </Grid>
        </div>

    );

    if (bordered) {
        return (
            <Segment className='sequence-selector-wrapper'>
                {renderSequenceSelector()}
            </Segment>
        );
    }
    return renderSequenceSelector();
}


SequenceSelector.propTypes = {
    sequence: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    actionOptions: PropTypes.array,
    slotOptions: PropTypes.array,
    allowedEventTypes: PropTypes.array,
    bordered: PropTypes.bool,
    enableExclusions: PropTypes.bool,
    width: PropTypes.number,
    direction: PropTypes.string,
};


SequenceSelector.defaultProps = {
    sequence: [],
    actionOptions: [],
    slotOptions: [],
    allowedEventTypes: ['slot', 'intent', 'action'],
    bordered: false,
    enableExclusions: true,
    width: 14,
    direction: 'right',
};


export default SequenceSelector;
