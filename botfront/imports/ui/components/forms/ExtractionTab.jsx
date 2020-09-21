import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import { connect } from 'react-redux';
import ExtractionItem from './ExtractionItem';
import { can } from '../../../lib/scopes';

const ExtractionTab = (props) => {
    const {
        slotSettings,
        slot,
        onChange,
        addCondition,
        deleteCondition,
        projectId,
    } = props;

    const handleAddCondition = () => {
        addCondition();
    };

    const renderExtractionItem = (settings, i) => (
        <ExtractionItem
            key={`extration-item-${i}`}
            slotFilling={settings}
            index={i}
            slot={slot}
            onChange={v => onChange(v, i)}
            onDelete={deleteCondition}
            projectId={projectId}
        />
    );
    return (
        <>
            {slotSettings.length > 0 && slotSettings.map(renderExtractionItem)}
            {slotSettings.length === 0 && renderExtractionItem({ type: 'from_text' }, 0)}
            {can('stories:w', projectId) && (
                <Button
                    data-cy='add-condition'
                    className='add-condition-button'
                    basic
                    color='blue'
                    onClick={handleAddCondition}
                >
                Add condition
                </Button>
            )}
        </>
    );
};

ExtractionTab.propTypes = {
    slotSettings: PropTypes.array.isRequired,
    slot: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    addCondition: PropTypes.func.isRequired,
    deleteCondition: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

ExtractionTab.defaultProps = {
    onChange: () => {},
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ExtractionTab);
