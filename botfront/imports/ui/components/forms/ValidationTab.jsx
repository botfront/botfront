import {
    Select, Input, Dropdown, Header, Checkbox,
} from 'semantic-ui-react';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import BotResponsesContainer from '../stories/common/BotResponsesContainer';
import { ProjectContext } from '../../layouts/context';
import ChangeResponseType from './ChangeResponseType';
import { can } from '../../../lib/scopes';
import StrictNumberInput from '../common/StrictNumberInput';

const validationOptions = [
    { key: 'is_in', value: 'is_in', text: 'be in' },
    { key: 'is_exactly', value: 'is_exactly', text: 'be exactly' },
    { key: 'contains', value: 'contains', text: 'contain' },
    { key: 'longer', value: 'longer', text: 'have a character count greater than' },
    {
        key: 'longer_or_equal',
        value: 'longer_or_equal',
        text: 'have a character count greater or equal to',
    },
    { key: 'shorter', value: 'shorter', text: 'have a character count less than' },
    {
        key: 'shorter_or_equal',
        value: 'shorter_or_equal',
        text: 'have a character count less or equal to',
    },
    {
        key: 'word',
        value: 'word',
        text: 'be a single word, with no whitespace or special characters',
    },
    { key: 'starts_with', value: 'starts_with', text: 'start with' },
    { key: 'ends_with', value: 'ends_with', text: 'end with' },
    { key: 'matches', value: 'matches', text: 'match a regex expression' },
    { key: 'eq', value: 'eq', text: 'be equal to' },
    { key: 'gt', value: 'gt', text: 'be greater than' },
    { key: 'gte', value: 'gte', text: 'be greater than or equal to ' },
    { key: 'lt', value: 'lt', text: 'be less than' },
    { key: 'lte', value: 'lte', text: 'be less than or equal to' },
    { key: 'email', value: 'email', text: 'be an email' },
];

const ValidationTab = (props) => {
    const {
        validation,
        onChange,
        validResponse,
        invalidResponse,
        slotName,
        utterOnNewValidSlot,
        onToggleUtterValidSlot,
        projectId,
    } = props;

    const initialValue = { operator: 'is_in', comparatum: null };

    const canEdit = can('stories:w', projectId);

    const { upsertResponse } = useContext(ProjectContext);
    /*
        allow '-' and '' to appear in the input field
        while ensuring that the value in the database is always a number
    */
    const handleChange = (newValidation) => {
        onChange(newValidation);
    };

    const handleResponseChange = (content, name) => {
        upsertResponse(name, content, 0);
    };

    const handleRenderComparatum = () => {
        const { operator, comparatum } = validation;
        if (operator === 'is_in') {
            return (
                <Dropdown
                    placeholder='Add values'
                    allowAdditions
                    multiple
                    disabled={!canEdit}
                    selection
                    search
                    options={
                        Array.isArray(comparatum)
                            ? comparatum.map(value => ({ text: value, value }))
                            : []
                    }
                    value={Array.isArray(comparatum) ? comparatum : []}
                    onChange={(_, { value }) => {
                        handleChange({ ...validation, comparatum: value });
                    }}
                />
            );
        }
        if (
            ['is_exactly', 'contains', 'starts_with', 'ends_with', 'matches'].includes(
                operator,
            )
        ) {
            return (
                <Input
                    value={typeof comparatum === 'string' ? comparatum : ''}
                    disabled={!canEdit}
                    onChange={(_, { value }) => {
                        handleChange({ ...validation, comparatum: value });
                    }}
                />
            );
        }
        if (
            [
                'eq',
                'eq',
                'gt',
                'gte',
                'lt',
                'lte',
                'longer',
                'longer_or_equal',
                'shorter',
                'shorter_or_equal',
            ].includes(operator)
        ) {
            const parsedComparatum = parseFloat(comparatum, 10);
            return (
                <StrictNumberInput
                    value={parsedComparatum}
                    disabled={!canEdit}
                    onChange={(value) => {
                        handleChange({
                            ...validation,
                            comparatum: value,
                        });
                    }}
                    fallbackValue={0}
                />
            );
        }
        return <></>;
    };

    return (
        <div className='validation-tab'>
            <Checkbox
                disabled={!canEdit}
                toggle
                label='Validate the slot'
                checked={!!validation}
                onChange={() => handleChange(validation ? null : initialValue)}
            />
            {!!validation && (
                <>
                    <div className='validation-criteria'>
                        <span>The value of the slot must </span>
                        <br />
                        <Select
                            options={validationOptions}
                            disabled={!canEdit}
                            value={validation.operator || 'is_in '}
                            onChange={(_, { value }) => {
                                handleChange({
                                    ...validation,
                                    operator: value,
                                    comparatum: null,
                                });
                            }}
                            className='validation-operator'
                        />
                        {handleRenderComparatum()}
                    </div>
                    <div className='response-form first'>
                        <Header size='small'>
                            If the collected value is invalid, utter the following
                            message:
                        </Header>
                        <BotResponsesContainer
                            deletable={false}
                            name={
                                `utter_invalid_${slotName}`
                            }
                            initialValue={invalidResponse}
                            onChange={content => handleResponseChange(content, `utter_invalid_${slotName}`)
                            }
                            enableEditPopup
                            enableChangeType
                            renameable={false}
                        />
                        <ChangeResponseType
                            name={
                                `utter_invalid_${slotName}`
                            }
                            // eslint-disable-next-line no-underscore-dangle
                            currentType={invalidResponse && invalidResponse.__typename}
                        />
                    </div>
                </>
            )}
            <div className='response-form'>
                <Checkbox
                    label='Display a message when the slot is set and valid'
                    checked={utterOnNewValidSlot}
                    disabled={!canEdit}
                    onChange={onToggleUtterValidSlot}
                    toggle
                />
                {utterOnNewValidSlot && (
                    <>
                        <BotResponsesContainer
                            deletable={false}
                            name={
                                (validResponse && validResponse.name)
                                || `utter_valid_${slotName}`
                            }
                            initialValue={validResponse}
                            onChange={content => handleResponseChange(content, `utter_valid_${slotName}`)
                            }
                            enableEditPopup
                            enableChangeType
                            renameable={false}
                        />
                        <ChangeResponseType
                            name={
                                (validResponse && validResponse.name)
                                || `utter_valid_${slotName}`
                            }
                            currentType={
                                // eslint-disable-next-line no-underscore-dangle
                                validResponse && validResponse.__typename
                            }
                        />
                    </>
                )}
            </div>
        </div>
    );
};

ValidationTab.propTypes = {
    validation: PropTypes.object,
    validResponse: PropTypes.object,
    invalidResponse: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    slotName: PropTypes.string.isRequired,
    utterOnNewValidSlot: PropTypes.bool.isRequired,
    onToggleUtterValidSlot: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

ValidationTab.defaultProps = {
    validation: null,
    validResponse: null,
    invalidResponse: null,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ValidationTab);
