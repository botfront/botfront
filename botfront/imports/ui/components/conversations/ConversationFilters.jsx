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
import momentPropTypes from 'react-moment-proptypes';
import DatePicker from '../common/DatePicker';
import AndOrMultiSelect from './AndOrMultiSelect';

const ConversationFilters = ({
    lengthFilter,
    xThanLength,
    confidenceFilter,
    xThanConfidence,
    actionFilters,
    intentFilters,
    changeFilters,
    startDate,
    endDate,
    userId,
    actionsOptions,
    setActionOptions,
    intentsOptions,
    operatorActionsFilters,
    operatorIntentsFilters,
    onDownloadConversations,
}) => {
    const [newLengthFilter, setNewLengthFilter] = useState({
        compare: lengthFilter,
        xThan: xThanLength,
    });
    const [newConfidenceFilter, setNewConfidenceFilter] = useState({
        compare: confidenceFilter * 100,
        xThan: xThanConfidence,
    });
    const [newActionFilters, setNewActionFilters] = useState(actionFilters);
    const [newIntentFilters, setNewIntentFilters] = useState(intentFilters);
    const [newStartDate, setNewStartDate] = useState(startDate);
    const [newEndDate, setNewEndDate] = useState(endDate);
    const [newUserIdFilter, setNewUserIdFilter] = useState(userId);
    const [activeAccordion, setActiveAccordion] = useState(true);
    const [newOperatorActionsFilters, setNewOperatorActionsFilters] = useState(operatorActionsFilters);
    const [newOperatorIntentsFilters, setNewOperatorIntentsFilters] = useState(operatorIntentsFilters);

    useEffect(() => setNewActionFilters(actionFilters), [actionFilters]);
    useEffect(() => setNewIntentFilters(intentFilters), [intentFilters]);
    useEffect(() => setNewStartDate(startDate), [startDate]);
    useEffect(() => setNewEndDate(endDate), [endDate]);
    useEffect(() => setNewConfidenceFilter({
        compare: confidenceFilter * 100,
        xThan: xThanConfidence,
    }), [confidenceFilter, xThanConfidence]);
    useEffect(() => setNewLengthFilter({
        compare: lengthFilter,
        xThan: xThanLength,
    }), [lengthFilter, xThanLength]);


    const filterLengthOptions = [
        { value: 'greaterThan', text: '≥' },
        { value: 'lessThan', text: '≤' },
        { value: 'equals', text: '=' },
    ];
    /*
    might be useful if more options are needed for the confidence
    const filterConfidenceOptions = [
        { value: 'lessThan', text: 'Less than' },
    ]; */

    const setNewDates = (incomingStartDate, incomingEndDate) => {
        setNewStartDate(incomingStartDate);
        setNewEndDate(incomingEndDate);
    };

    const applyFilters = () => {
        changeFilters(
            newLengthFilter,
            newConfidenceFilter,
            newActionFilters,
            newStartDate,
            newEndDate,
            newUserIdFilter,
            newOperatorActionsFilters,
            newOperatorIntentsFilters,
            newIntentFilters,
        );
    };

    const resetFilters = (e) => {
        e.stopPropagation();
        setNewActionFilters([]);
        setNewStartDate(null);
        setNewEndDate(null);
        setNewConfidenceFilter({
            compare: -1 * 100,
            xThan: xThanConfidence,
        });
        setNewLengthFilter({
            compare: -1,
            xThan: 'greaterThan',
        });
        setNewUserIdFilter(null);
        setNewOperatorActionsFilters('or');
        setNewOperatorIntentsFilters('or');
        changeFilters(
            { compare: -1, xThan: 'greaterThan' },
            { compare: -1, xThan: 'lessThan' },
            [],
            null,
            null,
            null,
            'or',
            'or',
            [],
        );
    };

    let numberOfActiveFilter = 0;
    // We check that the filter does not have their empty value and that they match the props ( meaning that they have been applied)
    if (newLengthFilter.compare >= 0 && newLengthFilter.compare === lengthFilter) {
        numberOfActiveFilter += 1;
    }
    if (
        newConfidenceFilter.compare >= 0
        && newConfidenceFilter.compare === confidenceFilter * 100
    ) {
        numberOfActiveFilter += 1;
    }
    if (
        newActionFilters.length > 0
        && newActionFilters.every(e => actionFilters.includes(e))
    ) {
        numberOfActiveFilter += 1;
    }
    if (
        newIntentFilters.length > 0
        && newIntentFilters.every(e => intentFilters.includes(e))
    ) {
        numberOfActiveFilter += 1;
    }
    if (
        newStartDate !== null
        && newEndDate !== null
        && newEndDate === endDate
        && newStartDate === startDate
    ) {
        numberOfActiveFilter += 1;
    }

    const numberOfActiveFilterString = numberOfActiveFilter
        ? `(${numberOfActiveFilter})`
        : '';

    const handleAccordionClick = () => {
        setActiveAccordion(!activeAccordion);
    };

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
                                <Dropdown.Item onClick={onDownloadConversations} icon='download' text='Download results' />
                            </Dropdown.Menu>
                        </Dropdown>
                    </Button.Group>
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
                                value={newLengthFilter.xThan}
                                onChange={(e, { value }) => setNewLengthFilter({
                                    ...newLengthFilter,
                                    xThan: value,
                                })
                                }
                            />
                            <Segment className='number-filter'>
                                <Input
                                    value={
                                        newLengthFilter.compare > 0
                                            ? newLengthFilter.compare
                                            : ''
                                    }
                                    onChange={(e, { value }) => setNewLengthFilter({
                                        ...newLengthFilter,
                                        compare: value,
                                    })
                                    }
                                />
                            </Segment>
                        </Segment.Group>
                    </div>
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
                                        newConfidenceFilter.compare > 0
                                            ? newConfidenceFilter.compare < 100
                                                ? newConfidenceFilter.compare
                                                : 100
                                            : ''
                                    }
                                    onChange={(e, { value }) => setNewConfidenceFilter({
                                        ...newConfidenceFilter,
                                        compare: value,
                                    })
                                    }
                                />
                            </Segment>
                            <Segment className='static-symbol'>
                                <p>%</p>
                            </Segment>
                        </Segment.Group>
                    </div>
                    <div className='conversation-filter' data-cy='date-filter'>
                        <Segment className='date-filter' data-cy='date-picker-container'>
                            <DatePicker
                                position='bottom left'
                                startDate={newStartDate}
                                endDate={newEndDate}
                                onConfirm={setNewDates}
                            />
                        </Segment>
                    </div>
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
                                    onChange={(e, { value }) => setNewUserIdFilter(
                                        value.trim(),
                                    )
                                    }
                                    placeholder='unique identifier'
                                />
                            </Segment>
                        </Segment.Group>
                    </div>
                </div>
                <div className='conversation-filter-container'>
                    <div className='conversation-filter actions' data-cy='action-filter'>
                        <AndOrMultiSelect
                            values={newActionFilters}
                            addItem={addNewOption}
                            options={actionsOptions}
                            onChange={setNewActionFilters}
                            operatorChange={setNewOperatorActionsFilters}
                            placeholder='Action name'
                            allowAdditions
                        />
                    </div>
                    <div className='conversation-filter intents' data-cy='intent-filter'>
                        <AndOrMultiSelect
                            values={newIntentFilters}
                            options={intentsOptions}
                            onChange={setNewIntentFilters}
                            operatorChange={setNewOperatorIntentsFilters}
                            placeholder='Intent name'
                        />
                    </div>
                </div>
            </Accordion.Content>
        </Accordion>
    );
};

ConversationFilters.propTypes = {
    lengthFilter: PropTypes.number.isRequired,
    xThanLength: PropTypes.string.isRequired,
    confidenceFilter: PropTypes.number.isRequired,
    xThanConfidence: PropTypes.string.isRequired,
    changeFilters: PropTypes.func.isRequired,
    actionFilters: PropTypes.array,
    intentFilters: PropTypes.array,
    startDate: momentPropTypes.momentObj,
    endDate: momentPropTypes.momentObj,
    actionsOptions: PropTypes.array,
    setActionOptions: PropTypes.func.isRequired,
    userId: PropTypes.string,
    intentsOptions: PropTypes.array,
    operatorActionsFilters: PropTypes.string,
    operatorIntentsFilters: PropTypes.string,
    onDownloadConversations: PropTypes.func.isRequired,
};

ConversationFilters.defaultProps = {
    startDate: null,
    endDate: null,
    actionFilters: [],
    intentFilters: [],
    actionsOptions: [],
    userId: null,
    intentsOptions: PropTypes.array,
    operatorActionsFilters: 'or',
    operatorIntentsFilters: 'or',
};

export default ConversationFilters;
