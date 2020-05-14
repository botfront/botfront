import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon, Input } from 'semantic-ui-react';
import IntentLabel from '../../nlu/common/IntentLabel';
import EntityDropdown from '../../nlu/common/EntityDropdown';
import IconButton from '../../common/IconButton';
import DashedButton from './DashedButton';
import { ProjectContext } from '../../../layouts/context';

const PayloadEditor = (props) => {
    const {
        entities: availableEntities,
        addEntity,
    } = useContext(ProjectContext);
    const {
        value: { intent = '', entities: originalEntities = [] },
        onChange,
    } = props;
    const entities = originalEntities.map(oe => ({
        entity: oe.entity,
        value: oe.entity,
        entityValue: oe.value,
    }));

    const getEntitiesInRasaFormat = ents => ents.map(({ entity, entityValue }) => ({
        entity,
        value: entityValue,
        entityValue,
    }));

    function handleAddOrChangeIntent(value) {
        onChange({
            intent: value,
            entities: getEntitiesInRasaFormat(entities),
        });
    }

    function handleAddOrChangeEntity(currentEntity, newEntity, index) {
        const newEntities = [
            ...originalEntities.slice(0, index),
            { entity: newEntity, entityValue: currentEntity.entityValue, value: currentEntity.entityValue },
            ...originalEntities.slice(index + 1),
        ];
        onChange({ intent, entities: newEntities });
    }

    return (
        <div>
            <h4 className='payload-title'>Payload</h4>
            <Grid columns={2} className='story-payload-editor'>
                <Grid.Row>
                    <Grid.Column>
                        <IntentLabel
                            value={intent}
                            allowEditing
                            allowAdditions
                            onChange={i => handleAddOrChangeIntent(i)}
                        />
                    </Grid.Column>
                </Grid.Row>
                {entities.map((entity, i) => (
                    <Grid.Row className='hoverTarget'>
                        <Grid.Column>
                            <EntityDropdown
                                key={`entityfield-for-${entity.entity}`}
                                options={[...availableEntities, entity.entity]
                                    .filter(
                                        e => e === entity.entity
                                            || !entities.map(f => f.entity).includes(e),
                                    )
                                    .map(e => ({ entity: e, value: e }))}
                                allowAdditions
                                onChange={(_event, { value: newEntity }) => {
                                    handleAddOrChangeEntity(entity, newEntity, i);
                                }}
                                onAddItem={(_event, { value: newEntity }) => {
                                    addEntity(newEntity);
                                    handleAddOrChangeEntity(entity, newEntity, i);
                                }}
                                entity={entity}
                                autofocus
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <Input
                                key={`value-for-${entity.entity}`}
                                data-cy='entity-value-input'
                                value={entity.entityValue}
                                onChange={(e, { value }) => {
                                    const newEnts = [
                                        ...originalEntities.slice(0, i),
                                        { entity: entity.entity, value, entityValue: value },
                                        ...originalEntities.slice(i + 1),
                                    ];
                                    onChange({ intent, entities: newEnts });
                                }}
                            />
                            <IconButton
                                icon='trash'
                                onClick={() => {
                                    const newEnts = [
                                        ...originalEntities.slice(0, i),
                                        ...originalEntities.slice(i + 1),
                                    ];
                                    onChange({ intent, entities: newEnts });
                                }}
                            />
                        </Grid.Column>
                    </Grid.Row>
                ))}
            </Grid>
            {entities.every(e => e.entityValue && e.entityValue.trim() !== '') ? (
                <div className='add-entity-wrap'>
                    <DashedButton
                        data-cy='add-entity'
                        color='blue'
                        size='mini'
                        onClick={() => onChange({
                            intent,
                            entities: [
                                ...getEntitiesInRasaFormat(entities),
                                { entity: '', value: '', entityValue: '' },
                            ],
                        })
                        }
                    >
                        <Icon name='plus' />
                        Add entity
                    </DashedButton>
                </div>
            ) : (
                <>
                    <br />
                    <br />
                </>
            )}
        </div>
    );
};

PayloadEditor.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.object,
};

PayloadEditor.defaultProps = {
    onChange: () => {},
    value: null,
};

export default PayloadEditor;
