import React from 'react';
import PropTypes from 'prop-types';
import { Popup, Icon } from 'semantic-ui-react';
import UserUtteranceViewer from './UserUtteranceViewer';

const CanonicalPopup = (props) => {
    const {
        trigger,
        example,
    } = props;
    const renderPopupContent = () => {
        if (!example) {
            return (
                <span className='canonical-popup-content'>
                    <p>There are no examples associated with this intent</p>
                </span>
            );
        }
        return (
            <span className='canonical-popup-content'>
                <Icon name={example.canonical === true ? 'gem' : 'tag'} />
                <UserUtteranceViewer
                    value={example}
                    disableEditing
                    showIntent={false}
                />
            </span>
        );
    };
    const renderCanonicalPopup = () => (
        <Popup
            content={renderPopupContent}
            /* if the root element of the trigger has custom hover behaviour it
               prevents the popup from opening, wrapping the trigger in a div this ensures
               the popup will open
            */
            trigger={<div className='canonical-popup-trigger'>{trigger}</div>}
            position='bottom right'
            inverted
            basic
            flowing
            hoverable
            className='canonical-popup'
        />
    );
    return renderCanonicalPopup();
};

CanonicalPopup.propTypes = {
    trigger: PropTypes.element.isRequired,
    example: PropTypes.object,
};
CanonicalPopup.defaultProps = {
    example: undefined,
};
export default CanonicalPopup;
