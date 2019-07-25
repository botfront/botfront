import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon, Input } from 'semantic-ui-react';
import IntentDropdown from '../../nlu/common/IntentDropdown';
import EntityDropdown from '../../nlu/common/EntityDropdown';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import DashedButton from './DashedButton';
import { ConversationOptionsContext } from '../../utils/Context';

const PayloadEditor = (props) => {
    const { intents: availableIntents, entities: availableEntities } = useContext(ConversationOptionsContext);
    const { value: { intent, entities }, onChange } = props;

    return (
        <div>
            <h4>Payload</h4>
            <Grid columns={2} className='story-payload-editor'>
                <Grid.Row>
                    <Grid.Column>
                        <IntentDropdown
                            options={availableIntents.map(i => ({ text: i, value: i }))}
                            allowAdditions={false}
                            onChange={(event, { value }) => { onChange({ intent: value, entities }); }}
                            intent={intent}
                            autofocus={!intent}
                        />
                    </Grid.Column>
                </Grid.Row>
                { entities.map((entity, i) => (
                    <Grid.Row className='hoverTarget'>
                        <Grid.Column>
                            <EntityDropdown
                                key={`entityfield-for-${entity.entity}`}
                                options={
                                    availableEntities
                                        .filter(e => e === entity.entity || !entities.map(f => f.entity).includes(e))
                                        .map(e => ({ entity: e, value: e }))
                                }
                                allowAdditions={false}
                                onChange={(event, { value }) => {
                                    const newEnts = [
                                        ...entities.slice(0, i),
                                        { ...entity, entity: value, value },
                                        ...entities.slice(i + 1),
                                    ];
                                    onChange({ intent, entities: newEnts });
                                }}
                                entity={entity}
                                autofocus
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <Input
                                key={`value-for-${entity.entity}`}
                                value={entity.entityValue}
                                onChange={(e, { value }) => {
                                    const newEnts = [
                                        ...entities.slice(0, i),
                                        { ...entity, entityValue: value },
                                        ...entities.slice(i + 1),
                                    ];
                                    onChange({ intent, entities: newEnts });
                                }}
                            />
                            <FloatingIconButton
                                icon='trash'
                                onClick={() => {
                                    const newEnts = [
                                        ...entities.slice(0, i),
                                        ...entities.slice(i + 1),
                                    ];
                                    onChange({ intent, entities: newEnts });
                                }}
                            />
                        </Grid.Column>
                    </Grid.Row>
                ))}
            </Grid>
            { availableEntities.length > entities.length && entities.every(e => e.entityValue && e.entityValue.trim() !== '')
                ? (
                    <div className='add-entity-wrap'>
                        <DashedButton
                            color='blue'
                            size='mini'
                            onClick={() => onChange({
                                intent,
                                entities: [...entities, { entity: null, value: null, entityValue: '' }],
                            })}
                        >
                            <Icon name='plus' />Add entity
                        </DashedButton>
                    </div>
                ) : null }
        </div>
    );
};

PayloadEditor.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.object,
};

PayloadEditor.defaultProps = {
    onChange: () => {},
    value: { intent: '', entities: [] },
};

export default PayloadEditor;
