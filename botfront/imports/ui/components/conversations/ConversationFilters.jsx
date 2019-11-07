import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Segment, Input, Dropdown,
} from 'semantic-ui-react';

const ConversationFilters = ({
    lengthFilter,
    xThanLength,
    confidenceFilter,
    xThanConfidence,
    updateLengthFilter,
    updateConfidenceFilter,
    updateActionFilter,
}) => {
    const [actionOptions, setActionOptions] = useState([]);
    const filterLengthOptions = [
        { value: 'greaterThan', text: 'Greater than' },
        { value: 'lessThan', text: 'Less than' },
        { value: 'equals', text: 'Equals' },
    ];
    const filterConfidenceOptions = [
        { value: 'greaterThan', text: 'Greater than' },
        { value: 'lessThan', text: 'Less than' },
    ];

    const handleLengthValueChange = (e) => {
        const regex = /[1234567890]/;
        if (e.key.length === 1 && e.key.match(regex) === null) {
            e.preventDefault();
        }
    };

    const handleConfidenceValueChange = (e) => {
        const regex = /[1234567890.]/;
        if (e.key.length === 1 && e.key.match(regex) === null) {
            e.preventDefault();
        }
    };

    const handleOnChangeConfidenceValue = (e) => {
        const updateValue = e.target.value;
        if (parseFloat(updateValue) > 100 || parseFloat(updateValue) < 0) {
            return;
        }
        if (parseFloat(updateValue) < 0) {
            return;
        }
        updateConfidenceFilter(updateValue, xThanConfidence);
    };
    const addActionOption = (e) => {
        const newOption = { value: e.target.value, text: e.target.value };
        setActionOptions([...actionOptions, newOption]);
    };
    const handleActionChange = (event, element) => {
        updateActionFilter(element.value);
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
                            value={xThanLength}
                            onChange={(e, { value }) => updateLengthFilter(lengthFilter, value)}
                        />
                    </Segment>
                    <Segment className='number-filter'>
                        <Input
                            value={lengthFilter > -1 ? lengthFilter : ''}
                            onKeyDown={handleLengthValueChange}
                            onChange={e => updateLengthFilter(e.target.value, xThanLength)}
                            onFocus={e => e.target.select()}
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
                            value={xThanConfidence}
                            onChange={(e, { value }) => updateConfidenceFilter(confidenceFilter, value)}
                        />
                    </Segment>
                    <Segment className='number-filter'>
                        <Input
                            value={confidenceFilter > -1 ? confidenceFilter : ''}
                            onKeyDown={handleConfidenceValueChange}
                            onChange={handleOnChangeConfidenceValue}
                            onFocus={e => e.target.select()}
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
                        allowAdditions
                        onChange={handleActionChange}
                        onAddItem={addActionOption}
                        options={actionOptions}
                        additionLabel=''
                        noResultsMessage='Type to add action filters'
                    />
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
    updateLengthFilter: PropTypes.func.isRequired,
    updateConfidenceFilter: PropTypes.func.isRequired,
    updateActionFilter: PropTypes.func.isRequired,
};

export default ConversationFilters;
