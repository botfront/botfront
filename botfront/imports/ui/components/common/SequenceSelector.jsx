import 'react-dates/initialize';
import React, { useState } from 'react';
import {
    Dropdown, Label, Icon, Input, Grid,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';


function SequenceSelector({
    sequence, onChange, options,
}) {
    const [search, setSearch] = useState('');

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
        if (e.key === 'Enter') {
            onAddStep({ name: search, excluded: false });
            setSearch('');
        }
    }
    return (
   
        <Grid className='sequence-selector-grid'>
            <Grid.Column data-cy='sequence-container' floated='left' width={10} className='sequence-item-container'> {sequence.map((step, index) => (
                <Label
                    className='sequence-step'
                    data-cy={`sequence-step-${index}`}
                    onClick={(e) => { e.stopPropagation(); switchLabel(index, !step.excluded); }}
                    color={step.excluded ? 'red' : 'green'}
                >
                    {step.excluded && (
                        <Icon
                            name='ban'
                            color='white'
                        />
                    )}{step.name}<Icon
                        name='delete'
                        data-cy={`remove-step-${index}`}
                        onClick={(e) => { e.stopPropagation(); onRemoveStep(index); }}
                    />
                </Label>
            ))}
    
            </Grid.Column>
            <Grid.Column floated='right' width={2}>
                <Dropdown
                    icon='add'
                    text=' '
                    className='icon sequence-addition'
                    button
                    floating
                    scrolling
                    allowAdditions
                    size='mini'
                    data-cy='sequence-selector'
                    value=' '
               
                >
                    <Dropdown.Menu>
                        <Input
                            value={search}
                            icon='search'
                            iconPosition='left'
                            className='search'
                            onKeyDown={handleKeyDown}
                            onClick={e => e.stopPropagation()} // otherwise a click close the dropdown
                            onChange={(e, data) => setSearch(data.value)}
                        />
                        <Dropdown.Divider />
                        {options
                            .filter(option => option.text.includes(search))
                            .map((option, idx) => (
                                <Dropdown.Item
                                    data-cy={`sequence-option-${idx}`}
                                    text={option.text}
                                    onClick={() => onAddStep(option.value)}
                                />
                            ))}
                        {search !== ''
                            && (
                                <Dropdown.Item
                                    data-cy='add-option'
                                    text={`add: ${search}`}
                                    onClick={() => { onAddStep({ name: search, excluded: false }); setSearch(''); }}
                                />
                            )}
                        
                    </Dropdown.Menu>

                </Dropdown>
            </Grid.Column>
        </Grid>
    );
}


SequenceSelector.propTypes = {
    sequence: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array,
};


SequenceSelector.defaultProps = {
    sequence: [],
    options: [],
};


export default SequenceSelector;
