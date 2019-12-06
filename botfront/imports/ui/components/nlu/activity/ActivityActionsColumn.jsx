import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popup, Icon } from 'semantic-ui-react';

import SmartTip from './SmartTip';

export default function ActivityActionsColumn(props) {
    const {
        datum,
        data,
        getSmartTips,
        isUtteranceReinterpreting,
        onToggleValidation,
        onMarkOoS,
        onDelete,
    } = props;

    const renderDeleteAllButton = utterances => mainAction => (
        <Button
            className='icon'
            color='teal'
            size='mini'
            icon
            fluid={mainAction}
            labelPosition='left'
            onClick={() => onDelete(utterances)}
        >
            <Icon name='trash' />
            {utterances.length === 1
                ? 'Delete this utterance'
                : `Delete ${utterances.length} utterances like this`}
        </Button>
    );

    const renderDeleteButton = utterance => mainAction => (
        <Button
            className='icon'
            color={mainAction ? 'teal' : 'grey'}
            size='mini'
            icon
            fluid={mainAction}
            basic={!mainAction && true}
            labelPosition='left'
            onClick={() => onDelete([utterance])}
            key={`${utterance._id}-delete`}
        >
            <Icon name='trash' />{' '}
            {mainAction ? 'Delete this utterance' : 'Delete this one only'}
        </Button>
    );

    const renderValidateButton = u => mainAction => (
        <Button
            color='orange'
            size='mini'
            basic
            fluid={mainAction}
            content='Validate anyway'
            onClick={() => onToggleValidation(u)}
            key={`${u._id}-validate`}
        />
    );

    const size = 'mini';
    const deleteable = data.filter(u => getSmartTips(u).code === 'aboveTh');
    const { code, tip, message } = getSmartTips(datum);
    let action;
    if (code === 'outdated') {
        action = (
            <Button
                size={size}
                disabled
                basic
                icon='redo'
                loading={isUtteranceReinterpreting(datum)}
            />
        );
    } else if (!!datum.validated) {
        action = (
            <Button
                size={size}
                onClick={() => onToggleValidation(datum)}
                color='green'
                icon='check'
                data-cy='valid-utterance-button'
            />
        );
    } else if (code === 'aboveTh') {
        action = (
            <SmartTip
                tip={tip}
                message={message}
                mainAction={renderDeleteAllButton(deleteable)}
                otherActions={[
                    renderValidateButton(datum),
                    ...(deleteable.length > 1 ? [renderDeleteButton(datum)] : []),
                ]}
                button={<Button size={size} icon='trash' color='teal' basic />}
            />
        );
    } else if (code === 'entitiesInTD') {
        action = (
            <SmartTip
                tip={tip}
                message={message}
                mainAction={renderDeleteButton(datum)}
                otherActions={[renderValidateButton(datum)]}
                button={<Button size={size} icon='info' color='yellow' />}
            />
        );
    } else if (!datum.intent) {
        action = (
            <Popup
                inverted
                content='Mark this utterance OoS'
                trigger={(
                    <Button
                        basic
                        size={size}
                        onClick={() => onMarkOoS(datum)}
                        color='black'
                        icon='sign-out'
                    />
                )}
            />
        );
    } else {
        action = (
            <Popup
                inverted
                content='Mark this utterance valid'
                trigger={(
                    <Button
                        basic
                        size={size}
                        disabled={!datum.intent}
                        onClick={() => onToggleValidation(datum)}
                        color='green'
                        icon='check'
                        data-cy='invalid-utterance-button'
                    />
                )}
            />
        );
    }

    return (
        <div key={`${datum._id}-actions`}>
            {action}
            {!['aboveTh'].includes(code) && !isUtteranceReinterpreting(datum) && (
                <Button
                    basic
                    size={size}
                    onClick={() => onDelete([datum])}
                    color='grey'
                    icon='trash'
                    data-cy='trash icon-trash'
                />
            )}
        </div>
    );
}

ActivityActionsColumn.propTypes = {
    datum: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    getSmartTips: PropTypes.func.isRequired,
    isUtteranceReinterpreting: PropTypes.func.isRequired,
    onMarkOoS: PropTypes.func.isRequired,
    onToggleValidation: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

ActivityActionsColumn.defaultProps = {};
