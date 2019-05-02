import React from 'react';
import PropTypes from 'prop-types';
import {
    Grid, Button, Dropdown, Header, Input, Icon,
} from 'semantic-ui-react';

const isLabelStyle = {
    paddingTop: '0.55em',
    paddingLeft: '0.55em',
};

const criteriaDivStyle = {
    position: 'relative',
};

class NLUCriteria extends React.Component {
    renderIntentDropDown = () => {
        const { intents, selectedIntent, ready } = this.props;
        return (
            <div style={{ maxWidth: '18em' }}>
                <Button.Group fluid size='small' color='purple' basic>
                    <Dropdown
                        basic
                        className='icon'
                        icon='tag'
                        name='intent'
                        button
                        placeholder='Select an intent'
                        labeled
                        search
                        value={selectedIntent}
                        allowAdditions
                        selection
                        additionLabel='Create intent: '
                        disabled={!ready}
                        onAddItem={this.handleIntentChange}
                        onChange={this.handleIntentChange}
                        options={intents.map(intent => ({ text: intent, value: intent }))}
                    />
                </Button.Group>
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

    renderEntitySelector = (entity, index) => {
        const { entities } = this.props;
        return (
            <Grid.Row key={index}>
                <Grid.Column width={3}>
                    <Button.Group size='small' fluid color='blue' basic>
                        <Dropdown
                            openOnFocus
                            icon='code'
                            basic
                            compact
                            fluid
                            button
                            labeled
                            className='icon'
                            placeholder='Select entity '
                            search
                            value={entity.entity}
                            allowAdditions
                            selection
                            additionLabel='Add entity: '
                            onAddItem={(e, { value }) => this.handleEntityChange(index, value)}
                            onChange={(e, { value }) => this.handleEntityChange(index, value)}
                            options={entities.map(e => ({ text: e, value: e }))}
                        />
                    </Button.Group>
                </Grid.Column>
                <Grid.Column width={1}>
                    {entity.entity && (
                        <Header as='h4' style={isLabelStyle}>
                            is
                        </Header>
                    )}
                </Grid.Column>
                <Grid.Column width={3}>{entity.entity && <Input value={entity.value} size='small' onChange={e => this.handleEntityValueChange(index, e)} />}</Grid.Column>

                <Grid.Column width={1}>
                    <Button.Group size='small'>
                        <Button icon='trash' basic onClick={() => this.handleRemoveEntity(index)} />
                    </Button.Group>
                </Grid.Column>
            </Grid.Row>
        );
    };

    render() {
        const { selectedEntities, selectedIntent, deleteButton } = this.props;
        const addEntityButtonStyle = {
            marginBottom: deleteButton ? '1.5em' : '',
        };
        return (
            <div style={criteriaDivStyle} id='criteria-editor'>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={15}>{this.renderIntentDropDown()}</Grid.Column>
                        <Grid.Column width={1} textAlign='right'>
                            {deleteButton && <Icon name='trash' link onClick={this.handleRemoveCriteria} />}
                        </Grid.Column>
                    </Grid.Row>
                    {selectedIntent && selectedEntities.map((entity, index) => this.renderEntitySelector(entity, index))}
                    {/* We display this button if we have an intent and if every entity has a value */}
                    {selectedIntent && selectedEntities.every(entity => entity.value) && (
                        <Grid.Row>
                            <Grid.Column width={16}>
                                <Button size='small' basic icon='add' labelPosition='left' content='Entity' onClick={this.handleAddEntity} style={addEntityButtonStyle} />
                            </Grid.Column>
                        </Grid.Row>
                    )}
                </Grid>
            </div>
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
    ready: PropTypes.bool.isRequired,
};

NLUCriteria.defaultProps = {
    intents: [],
    entities: [],
    selectedIntent: '',
    selectedEntities: [{ entity: '' }],
    deleteButton: false,
};

export default NLUCriteria;
