import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Segment, Input, Dropdown, Button,
} from 'semantic-ui-react';
import momentPropTypes from 'react-moment-proptypes';
import DatePicker from '../common/DatePicker';


const ConversationFilters = ({
    lengthFilter,
    xThanLength,
    confidenceFilter,
    xThanConfidence,
    actionFilters,
    changeFilters,
    startDate,
    endDate,
}) => {
    const [actionOptions, setActionOptions] = useState([]);
    const [newLengthFilter, setNewLengthFilter] = useState({ compare: lengthFilter, xThan: xThanLength });
    const [newConfidenceFilter, setNewConfidenceFilter] = useState({ compare: confidenceFilter * 100, xThan: xThanConfidence });
    const [newActionFilters, setNewActionFilters] = useState(actionFilters);
    const [newStartDate, setNewStartDate] = useState(startDate);
    const [newEndDate, setNewEndDate] = useState(endDate);


    const filterLengthOptions = [
        { value: 'greaterThan', text: 'Greater than' },
        { value: 'lessThan', text: 'Less than' },
        { value: 'equals', text: 'Equals' },
    ];
    const filterConfidenceOptions = [
        { value: 'greaterThan', text: 'Greater than' },
        { value: 'lessThan', text: 'Less than' },
    ];

    const setNewDates = (incomingStartDate, incomingEndDate) => {
        setNewStartDate(incomingStartDate);
        setNewEndDate(incomingEndDate);
    };

    const applyFilters = () => {
        changeFilters(newLengthFilter, newConfidenceFilter, newActionFilters, newStartDate, newEndDate);
    };

    return (
        <div className='conversation-filter-container'>
            <div className='conversation-filter' data-cy='length-filter'>
                <b>Filter by conversation length</b>
                <Segment.Group horizontal>
                    <Segment className='x-than-filter'>
                        <Dropdown
                            className='filter-dropdown'
                            options={filterLengthOptions}
                            selection
                            fluid
                            value={newLengthFilter.xThan}
                            onChange={(e, { value }) => setNewLengthFilter({ ...newLengthFilter, xThan: value })}
                        />
                    </Segment>
                    <Segment className='number-filter'>
                        <Input
                            value={newLengthFilter.compare > 0 ? newLengthFilter.compare : ''}
                            onChange={(e, { value }) => setNewLengthFilter({ ...newLengthFilter, compare: value })}
                        />
                    </Segment>
                </Segment.Group>
            </div>
            <div className='conversation-filter' data-cy='confidence-filter'>
                <b>Filter by confidence level</b>
                <Segment.Group horizontal>
                    <Segment className='x-than-filter'>
                        <Dropdown
                            className='filter-dropdown'
                            options={filterConfidenceOptions}
                            selection
                            fluid
                            value={newConfidenceFilter.xThan}
                            onChange={(e, { value }) => setNewConfidenceFilter({ ...newConfidenceFilter, xThan: value })}
                        />
                    </Segment>
                    <Segment className='number-filter'>
                        <Input
                            value={newConfidenceFilter.compare > 0 ? newConfidenceFilter.compare : ''}
                            onChange={(e, { value }) => setNewConfidenceFilter({ ...newConfidenceFilter, compare: value })}
                        />
                    </Segment>
                    <Segment className='static-symbol'>
                        <p>
                            %
                        </p>
                    </Segment>
                </Segment.Group>
            </div>
            <div className='conversation-filter' data-cy='action-filter'>
                <b>Filter by actions</b>
                <Segment className='action-filter'>
                    <Dropdown
                        className='filter-dropdown multi-select'
                        placeholder='Action name'
                        fluid
                        multiple
                        search
                        selection
                        clearable
                        allowAdditions
                        onChange={(e, { value }) => setNewActionFilters(value)}
                        options={actionOptions}
                        value={newActionFilters}
                        additionLabel=''
                        noResultsMessage='Type to add action filters'
                    />
                </Segment>
            </div>
            <div className='conversation-filter' data-cy='date-filter'>
                <b>Filter by date</b>
                <Segment className='date-filter'>
                    <DatePicker
                        position='bottom left'
                        startDate={newStartDate}
                        endDate={newEndDate}
                        onConfirm={setNewDates}
                    />
                </Segment>
            </div>

            <div className='conversation-filter apply'>
                <Segment className='apply-filter'>
                    <Button primary onClick={() => applyFilters()}> Apply filters</Button>
                </Segment>
            </div>
           
        </div>
    );
};

ConversationFilters.propTypes = {
    lengthFilter: PropTypes.number.isRequired,
    xThanLength: PropTypes.string.isRequired,
    confidenceFilter: PropTypes.number.isRequired,
    xThanConfidence: PropTypes.string.isRequired,
    changeFilters: PropTypes.func.isRequired,
    actionFilters: PropTypes.array.isRequired,
    startDate: momentPropTypes.momentObj,
    endDate: momentPropTypes.momentObj,
};

ConversationFilters.defaultProps = {
    startDate: null,
    endDate: null,
};

export default ConversationFilters;
