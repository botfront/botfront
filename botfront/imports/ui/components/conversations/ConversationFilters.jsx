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
    Popup,
    Message,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import DatePicker from '../common/DatePicker';
import IntentAndActionSelector from '../common/IntentAndActionSelector';
import ToggleButtonGroup from '../common/ToggleButtonGroup';
import { validateEventFilters } from '../../../lib/eventFilter.utils';

const ConversationFilters = ({
    activeFilters,
    changeFilters,
    onDownloadConversations,
    projectId,
}) => {
    const [filtersErrors, setFiltersErrors] = useState(activeFilters);
    const [slotOptions, setSlotOptions] = useState();
    const [actionOptions, setActionOptions] = useState();

    useEffect(() => {
        Meteor.call(
            'project.getActions',
            projectId,
            (err, availableActions) => {
                if (!err) {
                    setActionOptions(availableActions.map(action => ({ key: action, text: action, value: { name: action, excluded: false } })));
                }
            },
        );
        Meteor.call('slots.getSlots', projectId, (err, slots) => {
            if (!err) {
                setSlotOptions(slots.map(({ name: slotName }) => ({ key: slotName, text: slotName, value: { name: slotName, type: 'slot', excluded: false } })));
            }
        });
    }, []);

    const [newFilters, setNewFilters] = useState(activeFilters);
    useEffect(() => setNewFilters(activeFilters), [activeFilters]);
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

    const setFilter = (key, val) => {
        const updatedFilters = { ...newFilters, [key]: val };
        setNewFilters(updatedFilters);
        setFiltersErrors(validateEventFilters(updatedFilters.eventFilter, updatedFilters.eventFilterOperator));
    };

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
            
                {filtersErrors.length > 0 ? (<Message negative header='Errors' list={filtersErrors} />) : null}
           

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
                    {/* conversation type filter */}
                    <div className='conversation-filter conversation-type-buttons' data-cy='conversation-type-filter'>
                        <ToggleButtonGroup
                            onChange={(name, value) => setFilter(name, value)}
                            options={[
                                { text: 'User initiated', value: 'userInitiatedConversations' },
                                { text: 'Triggered', value: 'triggeredConversations' },
                            ]}
                            values={newFilters}
                        />
                    </div>
                    {/* intents actions filter */}
                    <div className='conversation-filter intents-actions' data-cy='intents-actions-filter'>
                        <IntentAndActionSelector
                            actionOptions={actionOptions}
                            slotOptions={slotOptions}
                            operatorValue={newFilters.eventFilterOperator}
                            sequence={newFilters.eventFilter}
                            operatorChange={value => setFilter('eventFilterOperator', value)}
                            onChange={value => setFilter('eventFilter', [...value])}
                        />
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
                                    data-cy='conversation-length-filter'
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
                            <Popup
                                inverted
                                content='time elapsed between the first and last message in seconds'
                                trigger={(
                                    <Segment className='x-than-filter'>
                                        <Label> Duration</Label>
                                    </Segment>
                                )}
                            />
                            <Segment className='duration-number-filter'>
                                <Input
                                    data-cy='duration-filter-from'
                                    value={
                                        newFilters.durationFilter.compareLowerBound > 0
                                            ? newFilters.durationFilter.compareLowerBound
                                            : ''
                                    }
                                    onChange={(e, { value }) => setFilter('durationFilter', {
                                        ...newFilters.durationFilter,
                                        compareLowerBound: +value,
                                    })
                                    }
                                />
                            </Segment>
                            <Segment className='static-symbol'>
                                <p className='static-symbol-text white'>≤</p>
                            </Segment>
                            <Segment className='duration-number-filter'>
                                <Input
                                    data-cy='duration-filter-to'
                                    value={
                                        newFilters.durationFilter.compareUpperBound > 0
                                            ? newFilters.durationFilter.compareUpperBound
                                            : ''
                                    }
                                    onChange={(e, { value }) => setFilter('durationFilter', {
                                        ...newFilters.durationFilter,
                                        compareUpperBound: +value,
                                    })
                                    }
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
                </div>
            </Accordion.Content>
        </Accordion>
    );
};

ConversationFilters.propTypes = {
    changeFilters: PropTypes.func.isRequired,
    activeFilters: PropTypes.object.isRequired,
    onDownloadConversations: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

ConversationFilters.defaultProps = {
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ConversationFilters);
