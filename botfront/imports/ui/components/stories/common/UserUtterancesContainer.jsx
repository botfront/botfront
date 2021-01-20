import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';

import IconButton from '../../common/IconButton';
import UserUtteranceContainer from './UserUtteranceContainer';
import UserUtterancePopupContent from './UserUtterancePopupContent';
import { can } from '../../../../lib/scopes';
import { ProjectContext } from '../../../layouts/context';
import { USER_LINE_EDIT_MODE } from '../../../../lib/story.utils';

const UserUtterancesContainer = (props) => {
    const {
        deletable, value, onChange, onDelete, editable: initialEditable, theme,
    } = props;
    const { addUtterancesToTrainingData, project: { _id: projectId } } = useContext(ProjectContext);
    const editable = can('stories:w', projectId) && initialEditable;

    const somethingIsBeingInput = useMemo(() => value.some(disjunct => disjunct === USER_LINE_EDIT_MODE), [value]);

    const parseEntity = (entity) => {
        const {
            entity: entityName, value: entityValue, start, end,
        } = entity;
        if (entityName && entityValue && (start || start === 0) && (end || end === 0)) {
            return entity;
        }
        return {
            entity: Object.keys(entity)[0],
            value: entity[Object.keys(entity)[0]],
        };
    };

    const convertCoreToNlu = ({ user, entities, ...payload } = {}) => ({
        ...payload,
        ...(user ? { text: user } : {}),
        ...(entities
            ? {
                entities: entities.map(parseEntity),
            }
            : {}),
    });
    const convertNluToCore = ({ text, entities, ...payload } = {}) => ({
        ...payload,
        ...(text ? { user: text } : {}),
        ...(entities ? { entities: entities.map(({ entity: k, value: v }) => ({ [k]: v })) } : {}),
    });

    const handleDeleteDisjunct = (index) => {
        if (value.length > 1) {
            return onChange([...value.slice(0, index), ...value.slice(index + 1)]);
        }
        return onDelete();
    };

    const handleUpdateDisjunct = (index, contentInNluFormat) => {
        const content = convertNluToCore(contentInNluFormat);
        const identicalPayload = value
            .filter(v => v)
            .find(
                disjunct => disjunct.intent === content.intent
                    && ((disjunct.entities || []).some(e1 => (content.entities || []).some(
                        e2 => e1.value === e2.value && e1.entity === e2.entity,
                    ))
                        || !(content.entities || []).length),
            );
        if (identicalPayload) return handleDeleteDisjunct(index);
        return addUtterancesToTrainingData([contentInNluFormat], (err) => {
            if (!err) onChange([...value.slice(0, index), content, ...value.slice(index + 1)]);
        });
    };

    const handleInsertDisjunct = (index, payload) => {
        onChange([
            ...value.slice(0, index + 1),
            payload || { intent: USER_LINE_EDIT_MODE },
            ...value.slice(index + 1),
        ]);
    };

    const renderThemeTag = () => (<span className='user-utterance theme-tag'>{theme}</span>);

    const renderResponse = (payload, index) => (
        <React.Fragment
            key={payload ? `${payload.intent}${JSON.stringify(payload.entities)}` : 'new'}
        >
            <div className='story-line'>
                <UserUtteranceContainer
                    value={convertCoreToNlu(payload)}
                    onInput={content => handleUpdateDisjunct(index, content)}
                    onAbort={() => { if (value.length > 1) handleDeleteDisjunct(index); }}
                    onDelete={() => { handleDeleteDisjunct(index); }}
                />
                {payload && editable && index !== value.length - 1 && (
                    <IconButton icon='add' className='or-label' color='vk' />
                )}
                {editable && !somethingIsBeingInput && index === value.length - 1 && (
                    <UserUtterancePopupContent
                        trigger={<IconButton icon='add' className='or-icon-button' />}
                        onCreateFromInput={() => handleInsertDisjunct(index)}
                        onCreateFromPayload={selectedPayload => handleInsertDisjunct(index, selectedPayload)}
                    />
                )}
                {deletable
                    && editable
                    && (!somethingIsBeingInput || !payload)
                    && value.length > 1 && (
                    <IconButton
                        onClick={() => handleDeleteDisjunct(index)}
                        icon='trash'
                    />
                )}
            </div>
        </React.Fragment>
    );

    return (
        <div className={`utterances-container exception-wrapper-target theme-${theme}`}>
            {value.map(renderResponse)}
            <div className='side-by-side right narrow top-right'>
                {deletable && onDelete && editable && <IconButton onClick={onDelete} icon='trash' />}
            </div>
            {theme !== 'default' && renderThemeTag()}
        </div>
    );
};

UserUtterancesContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    editable: PropTypes.bool,
    theme: PropTypes.string,
};

UserUtterancesContainer.defaultProps = {
    deletable: true,
    onChange: () => {},
    onDelete: null,
    editable: true,
    theme: 'default',
};

export default UserUtterancesContainer;
