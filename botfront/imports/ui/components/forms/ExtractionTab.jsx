import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import ExtractionItem from './ExtractionItem';

import { ProjectContext } from '../../layouts/context';

const ExtractionTab = (props) => {
    const {
        slotSettings,
        slot,
        onChange,
        addCondition,
        deleteCondition,
    } = props;

    const { intents, entities } = useContext(ProjectContext);
    const intentOptions = useMemo(() => intents.map(intentName => ({ value: intentName, text: intentName })));
    const entityOptions = useMemo(() => entities.map(entityName => ({ value: entityName, text: entityName })));

    const handleAddCondition = () => {
        addCondition();
    };

    const renderExtractionItem = (settings, i) => (
        <ExtractionItem
            intents={intentOptions}
            slotFilling={settings}
            index={i}
            slot={slot}
            entities={entityOptions}
            onChange={v => onChange(v, i)}
            onDelete={deleteCondition}
        />
    );
    return (
        <>
            {slotSettings.length > 0 && slotSettings.map(renderExtractionItem)}
            {slotSettings.length === 0 && renderExtractionItem({ type: 'from_text' }, 0)}
            <Button
                className='add-condition-button'
                basic
                color='blue'
                onClick={handleAddCondition}
            >
                Add condition
            </Button>
        </>
    );
};

ExtractionTab.propTypes = {
    slotSettings: PropTypes.array.isRequired,
    slot: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    addCondition: PropTypes.func.isRequired,
    deleteCondition: PropTypes.func.isRequired,
};

ExtractionTab.defaultProps = {
    onChange: () => {},
};

export default ExtractionTab;
