import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popup, Icon } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';
import SmartTip from './SmartTip';

export default function ActivityActionsColumn(props) {
    const {
        datum,
        data,
        getSmartTips,
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

    const size = 'small';
    const deleteable = data.filter(u => getSmartTips(u).code === 'aboveTh');
    const { code, tip, message } = getSmartTips(datum);
    let action;
    if (!!datum.validated) {
        action = (
            <IconButton
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
                button={(
                    <IconButton
                        basic
                        size={size}
                        color='teal'
                        icon='trash'
                    />
                )}
            />
        );
    } else if (code === 'entitiesInTD') {
        action = (
            <SmartTip
                tip={tip}
                message={message}
                mainAction={renderDeleteButton(datum)}
                otherActions={[renderValidateButton(datum)]}
                button={(
                    <IconButton
                        basic
                        size={size}
                        color='yellow'
                        icon='info'
                    />
                )}
            />
        );
    } else if (!datum.intent) {
        action = (
            <Popup
                inverted
                content='Mark this utterance OoS'
                trigger={(
                    <IconButton
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
                    <IconButton
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
        <div key={`${datum._id}-actions`} className='side-by-side narrow right'>
            {action}
            {!['aboveTh'].includes(code) && (
                <IconButton
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
    onMarkOoS: PropTypes.func.isRequired,
    onToggleValidation: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

ActivityActionsColumn.defaultProps = {};
