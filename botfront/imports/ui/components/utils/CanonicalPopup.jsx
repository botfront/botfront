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
                <Icon
                    name={example.canonical === true ? 'gem' : 'tag'}
                    // size='small'
                />
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
               prevents the popup from opening. Wrapping the trigger in a div ensures
               the popup will open
            */
            trigger={<div className='canonical-popup-trigger'>{trigger}</div>}
            inverted
            flowing
            hoverable
            open
            className='canonical-popup'
        />
    );
    return renderCanonicalPopup();
};

const exampleShape = {
    text: PropTypes.string.isRequired,
    entities: PropTypes.array.isRequired,
    canonical: PropTypes.bool,
};

CanonicalPopup.propTypes = {
    trigger: PropTypes.element.isRequired,
    example: PropTypes.shape(exampleShape),
};
CanonicalPopup.defaultProps = {
    example: undefined,
};
export default CanonicalPopup;
