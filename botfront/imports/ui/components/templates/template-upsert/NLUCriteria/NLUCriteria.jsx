/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import {
    Grid, Button, Dropdown, Input, Icon, Popup, Header, Segment,
} from 'semantic-ui-react';

import EntityDropdown from '../../../nlu/common/EntityDropdown';
import IntentDropdown from '../../../nlu/common/IntentDropdown';
import { isEntityValid } from '../../../../../lib/utils';

class NLUCriteria extends React.Component {
    constructor(props) {
        super(props);
        const options = this.prepareOptions();
        this.state = options;
    }

    componentWillReceiveProps(props) {
        this.props = props;
        console.log(this.prepareOptions());
        this.setState(this.prepareOptions());
    }

    prepareOptions = () => {
        const {
            entities, intents, selectedIntent, selectedEntities,
        } = this.props;
        console.log(entities, selectedEntities);
        // Dropdown options are intents/entities existing in models + those selected
        return {
            intents: Array.from(new Set(intents.concat([selectedIntent].filter(i => !!i)))).sort(),
            entities: Array.from(new Set(entities.concat(selectedEntities.map(e => e.entity).filter(e => !!e.length)))).sort(),
        };
    }

    renderIntentDropDown = () => {
        const { selectedIntent } = this.props;
        const { intents } = this.state;
        const options = intents.map(intent => ({ text: intent, value: intent }));
        return (
            <div className='intent'>
                <IntentDropdown
                    autofocus
                    intent={selectedIntent}
                    onAddItem={this.handleIntentChange}
                    onChange={this.handleIntentChange}
                    options={options}
                />
            </div>
        );
    };

    handleIntentChange = (e, { value }) => {
        const { selectedEntities, onChange } = this.props;

        onChange({
            entities: selectedEntities,
            intent: value,
        });
    };

    handleEntityChange = (index, value) => {
        const { selectedIntent, onChange, selectedEntities } = this.props;

        onChange({
            intent: selectedIntent,
            entities: selectedEntities.map((entity, entityIndex) => {
                if (index === entityIndex) {
                    return {
                        entity: value,
                        value: '',
                    };
                }
                return entity;
            }),
        });
    };

    handleEntityValueChange = (index, e) => {
        const { selectedIntent, onChange, selectedEntities } = this.props;
        onChange({
            intent: selectedIntent,
            entities: selectedEntities.map((entity, entityIndex) => {
                if (index === entityIndex) {
                    return {
                        entity: entity.entity,
                        value: e.target.value,
                    };
                }
                return entity;
            }),
        });
    };

    handleEntityConditionChange = (index, { value }) => {
        const { selectedIntent, onChange, selectedEntities } = this.props;
        onChange({
            intent: selectedIntent,
            entities: selectedEntities.map((entity, entityIndex) => {
                if (index === entityIndex) {
                    return value === 'has value' ? { entity: entity.entity, value: '' } : { entity: entity.entity };
                }
                return entity;
            }),
        });
    };

    handleRemoveCriteria = () => {
        const { onRemove } = this.props;
        onRemove();
    };

    handleAddEntity = (e) => {
        e.preventDefault();
        const { selectedIntent, onChange, selectedEntities } = this.props;
        onChange({
            intent: selectedIntent,
            entities: selectedEntities.concat([{ entity: '' }]),
        });
    };

    handleRemoveEntity = (index) => {
        const { selectedIntent, onChange, selectedEntities } = this.props;
        onChange({
            intent: selectedIntent,
            entities: [...selectedEntities.slice(0, index), ...selectedEntities.slice(index + 1)],
        });
    };

    renderAddEntityButton = cssId => <Popup trigger={<Button id={cssId} basic icon='add' color='blue' size='mini' onClick={this.handleAddEntity} />} content='Add an entity to this condition' />

    renderEntitySelector = (entity, index) => {
        const { selectedEntities, selectedIntent } = this.props;
        const { entities } = this.state;
        const conditionsOptions = ['has value', 'is detected'].map(c => ({ text: c, value: c }));
        const isLastEntity = index === selectedEntities.length - 1;
        const shouldShowAddEntityButton = selectedIntent && selectedEntities.every(isEntityValid) && isLastEntity;
        const entityOptions = entities.map(e => ({ text: e, value: e }));
        console.log(entityOptions);
        return (
            <React.Fragment key='index'>
                <Grid.Row style={{ marginTop: '0.8em' }}>
                    <Grid.Column width={16}>
                        <Header as='h4' content={<><span className='conditional'>AND</span> the entity</>} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={4} className='entity' id={`entity-name-dropdown-${index}`}>
                        <EntityDropdown
                            entity={entity}
                            onAddItem={(e, { value }) => this.handleEntityChange(index, value)}
                            onChange={(e, { value }) => this.handleEntityChange(index, value)}
                            options={entityOptions}
                        />
                    </Grid.Column>
                    {entity.entity && (
                        <Grid.Column width={2} textAlign='left' verticalAlign='middle' className='entity' id={`entity-condition-${index}`}>
                            <Dropdown
                                size='large'
                                fluid
                                placeholder='condition'
                                value={entity.value || entity.value === '' ? 'has value' : 'is detected'}
                                search
                                selection
                                onChange={(e, t) => this.handleEntityConditionChange(index, t)}
                                options={conditionsOptions}
                            />
                        </Grid.Column>
                    )}
                    {(entity.value || entity.value === '') && (
                        <Grid.Column width={3} className='entity'>
                            <Input
                                fluid
                                value={entity.value}
                                id={`entity-value-${index}`}
                                onChange={e => this.handleEntityValueChange(index, e)}
                            />
                        </Grid.Column>
                    )}
                    <Grid.Column width={1} textAlign='left' verticalAlign='middle'>
                        <Button.Group size='mini'>
                            <Button id={`delete-entity-button-${index}`} basic icon='trash' color='orange' onClick={() => this.handleRemoveEntity(index)} />
                            {shouldShowAddEntityButton && this.renderAddEntityButton(`add-entity-button-${index}`)}
                        </Button.Group>
                    </Grid.Column>
                </Grid.Row>
            </React.Fragment>
        );
    };

    render() {
        const {
            selectedEntities, selectedIntent, deleteButton, criteriumIndex,
        } = this.props;
        const shouldShowAddEntityButton = selectedEntities.length === 0 && selectedIntent;
        return (
            <Segment clearing className='criteria-editor'>
                <Grid>
                    <Grid.Row style={{ marginTop: '0.8em' }}>
                        <Grid.Column width={15}>
                            <Header as='h4' content={<><span className='conditional'>IF</span> the intent is</>} />
                        </Grid.Column>
                        <Grid.Column width={1}>
                            { deleteButton && <Icon name='trash' id={`delete-criterium-button-${criteriumIndex}`} basic link onClick={this.handleRemoveCriteria} /> }
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={4}>{this.renderIntentDropDown()}</Grid.Column>
                        <Grid.Column width={1} verticalAlign='bottom'>{ shouldShowAddEntityButton && this.renderAddEntityButton('add-entity-button')}</Grid.Column>
                    </Grid.Row>
                    {selectedIntent && selectedEntities.map((entity, index) => this.renderEntitySelector(entity, index))}
                </Grid>
            </Segment>
        );
    }
}

NLUCriteria.propTypes = {
    intents: PropTypes.array,
    entities: PropTypes.array,
    selectedIntent: PropTypes.string,
    selectedEntities: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    deleteButton: PropTypes.bool,
    criteriumIndex: PropTypes.number.isRequired,
};

NLUCriteria.defaultProps = {
    intents: [],
    entities: [],
    selectedIntent: '',
    selectedEntities: [{ entity: '' }],
    deleteButton: false,
};

export default NLUCriteria;
