import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Segment,
    Input,
    Dropdown,
    Button,
    Accordion,
    Label,
    Icon,
} from 'semantic-ui-react';
import DatePicker from '../common/DatePicker';
import AndOrMultiSelect from './AndOrMultiSelect';

const ConversationFilters = ({
    activeFilters,
    changeFilters,
    actionsOptions,
    setActionOptions,
    intentsOptions,
    onDownloadConversations,
}) => {
    const [newFilters, setNewFilters] = useState(activeFilters);
    useEffect(() => setNewFilters(activeFilters), [activeFilters]);
    const setFilter = (key, val) => setNewFilters({ ...newFilters, [key]: val });
    const [activeAccordion, setActiveAccordion] = useState(true);

    const filterLengthOptions = [
        { value: 'greaterThan', text: '≥' },
        { value: 'lessThan', text: '≤' },
        { value: 'equals', text: '=' },
    ];

    const setNewDates = (startDate, endDate) => {
        setNewFilters({ ...newFilters, startDate, endDate });
    };

    const applyFilters = () => changeFilters(newFilters);

    const resetFilters = (e) => {
        e.stopPropagation();
        changeFilters();
    };

    let numberOfActiveFilter = 0;
    // We check that the filter does not have their empty value and that they match the props ( meaning that they have been applied)
    if (newFilters.lengthFilter.compare >= 0
        && newFilters.lengthFilter.compare === activeFilters.lengthFilter.compare
    ) {
        numberOfActiveFilter += 1;
    }
    if (
        newFilters.confidenceFilter.compare > 0
        && newFilters.confidenceFilter.compare === activeFilters.confidenceFilter.compare
    ) {
        numberOfActiveFilter += 1;
    }
    if (
        newFilters.actionFilters.length > 0
        && newFilters.actionFilters.every(e => activeFilters.actionFilters.includes(e))
    ) {
        numberOfActiveFilter += 1;
    }
    if (
        newFilters.intentFilters.length > 0
        && newFilters.intentFilters.every(e => activeFilters.intentFilters.includes(e))
    ) {
        numberOfActiveFilter += 1;
    }
    if (
        newFilters.startDate !== null
        && newFilters.endDate !== null
        && newFilters.startDate === activeFilters.startDate
        && newFilters.endDate === activeFilters.endDate
    ) {
        numberOfActiveFilter += 1;
    }

    const numberOfActiveFilterString = numberOfActiveFilter
        ? `(${numberOfActiveFilter})`
        : '';

    const handleAccordionClick = () => setActiveAccordion(!activeAccordion);

    const addNewOption = (newOption) => {
        const optionObject = { key: newOption, value: newOption, text: newOption };
        setActionOptions([...actionsOptions, optionObject]);
    };

    return (
        <Accordion className='filter-accordion'>
            <Accordion.Title
                active={activeAccordion}
                onClick={() => handleAccordionClick()}
                data-cy='toggle-filters'
                className='filter-accordian-title'
            >
                <Icon name='dropdown' />
                <span className='toggle-filters'>
                    {activeAccordion
                        ? `Hide Filters ${numberOfActiveFilterString}`
                        : `Show Filters ${numberOfActiveFilterString}`}
                </span>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                <span
                    data-cy='reset-filter'
                    onClick={e => resetFilters(e)}
                    role='button'
                    tabIndex='0'
                    className='reset-button'
                >
                    <Icon name='redo' size='small' /> Reset
                </span>
            </Accordion.Title>
            <Accordion.Content active={activeAccordion}>
                <div className='conversation-filter-container'>
                    <Button.Group color='teal' className='filter-buttons'>
                        <Button
                            data-cy='apply-filters'
                            onClick={() => applyFilters()}
                            content='Apply'
                        />
                        <Dropdown
                            className='button icon'
                            floating
                            trigger={<React.Fragment />}
                        >
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => onDownloadConversations({ format: 'json' })} icon='download' text='Download results (JSON)' />
                                <Dropdown.Item onClick={() => onDownloadConversations({ format: 'md' })} icon='download' text='Download results (text)' />
                            </Dropdown.Menu>
                        </Dropdown>
                    </Button.Group>
                    {/* conversation length filter */}
                    <div
                        className='conversation-filter conv-length'
                        data-cy='length-filter'
                    >
                        <Segment.Group horizontal>
                            <Segment className='x-than-filter'>
                                <Label> Length</Label>
                            </Segment>
                            <Dropdown
                                className='filter-dropdown'
                                options={filterLengthOptions}
                                selection
                                fluid
                                value={newFilters.lengthFilter.xThan}
                                onChange={(e, { value }) => setFilter('lengthFilter', {
                                    ...newFilters.lengthFilter,
                                    xThan: value,
                                })
                                }
                            />
                            <Segment className='number-filter'>
                                <Input
                                    value={
                                        newFilters.lengthFilter.compare > 0
                                            ? newFilters.lengthFilter.compare
                                            : ''
                                    }
                                    onChange={(e, { value }) => setFilter('lengthFilter', {
                                        ...newFilters.lengthFilter,
                                        compare: +value,
                                    })
                                    }
                                />
                            </Segment>
                        </Segment.Group>
                    </div>
                    {/* conversation duration filter */}
                    <div
                        className='conversation-filter conv-duration'
                        data-cy='duration-filter'
                    >
                        <Segment.Group horizontal>
                            <Segment className='x-than-filter'>
                                <Label> Duration</Label>
                            </Segment>
                            <Dropdown
                                className='filter-dropdown'
                                options={filterLengthOptions.filter(({ value }) => value !== 'equals')}
                                selection
                                fluid
                                value={newFilters.durationFilter.xThan}
                                onChange={(e, { value }) => setFilter('durationFilter', {
                                    ...newFilters.durationFilter,
                                    xThan: value,
                                })
                                }
                            />
                            <Segment className='duration-number-filter'>
                                <Input
                                    value={
                                        newFilters.durationFilter.compare > 0
                                            ? newFilters.durationFilter.compare
                                            : ''
                                    }
                                    onChange={(e, { value }) => setFilter('durationFilter', {
                                        ...newFilters.durationFilter,
                                        compare: +value,
                                    })
                                    }
                                />
                            </Segment>
                            <Segment className='static-symbol seconds'>
                                <p className='static-symbol-text'>(seconds)</p>
                            </Segment>
                        </Segment.Group>
                    </div>
                    {/* date picker */}
                    <div className='conversation-filter' data-cy='date-filter'>
                        <Segment className='date-filter' data-cy='date-picker-container'>
                            <DatePicker
                                position='bottom left'
                                startDate={newFilters.startDate}
                                endDate={newFilters.endDate}
                                onConfirm={setNewDates}
                            />
                        </Segment>
                    </div>
                    {/* user id filter */}
                    <div className='conversation-filter id-filter' data-cy='id-filter'>
                        <Segment.Group
                            horizontal
                            data-cy='id-filter'
                            className='conversation-filter'
                        >
                            <Segment className='uid-label'>
                                <Label>User ID</Label>
                            </Segment>
                            <Segment className='id-filter'>
                                <Input
                                    value={newFilters.userId || ''}
                                    onChange={(_e, { value }) => setFilter(
                                        'userId',
                                        value.trim(),
                                    )}
                                    placeholder='unique identifier'
                                />
                            </Segment>
                        </Segment.Group>
                    </div>
                    {/* conversation confidence filter */}
                    <div className='conversation-filter' data-cy='confidence-filter'>
                        <Segment.Group
                            horizontal
                            data-cy='confidence-filter'
                            className='conversation-filter'
                        >
                            <Segment className='x-than-filter'>
                                <Label> Confidence &le;</Label>
                            </Segment>
                            <Segment className='number-filter'>
                                <Input
                                    value={
                                        // bounds the confidence value to 0-100
                                        newFilters.confidenceFilter.compare * 100 > 0
                                            ? newFilters.confidenceFilter.compare * 100 < 100
                                                ? Math.round(newFilters.confidenceFilter.compare * 100)
                                                : 100
                                            : ''
                                    }
                                    onChange={(e, { value }) => setFilter('confidenceFilter', {
                                        ...newFilters.confidenceFilter,
                                        compare: value / 100,
                                    })}
                                />
                            </Segment>
                            <Segment className='static-symbol'>
                                <p className='static-symbol-text'>%</p>
                            </Segment>
                        </Segment.Group>
                    </div>
                    {/* intents filter */}
                    <div className='conversation-filter intents' data-cy='intent-filter'>
                        <AndOrMultiSelect
                            values={newFilters.intentFilters}
                            options={intentsOptions}
                            onChange={val => setFilter('intentFilters', val)}
                            operatorChange={val => setFilter('operatorIntentsFilters', val)}
                            placeholder='Intent name'
                        />
                    </div>
                    {/* actions filter */}
                    <div className='conversation-filter actions' data-cy='action-filter'>
                        <AndOrMultiSelect
                            values={newFilters.actionFilters}
                            addItem={addNewOption}
                            options={actionsOptions}
                            onChange={val => setFilter('actionFilters', val)}
                            operatorChange={val => setFilter('operatorActionsFilters', val)}
                            placeholder='Action name'
                            allowAdditions
                        />
                    </div>
                </div>
            </Accordion.Content>
        </Accordion>
    );
};

ConversationFilters.propTypes = {
    changeFilters: PropTypes.func.isRequired,
    activeFilters: PropTypes.object.isRequired,
    actionsOptions: PropTypes.array,
    setActionOptions: PropTypes.func.isRequired,
    intentsOptions: PropTypes.array,
    onDownloadConversations: PropTypes.func.isRequired,
};

ConversationFilters.defaultProps = {
    actionsOptions: [],
    intentsOptions: PropTypes.array,
};

export default ConversationFilters;
