import React, { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popup, Icon } from 'semantic-ui-react';
import UserUtteranceViewer from './UserUtteranceViewer';
import { ProjectContext } from '../../../layouts/context';

const CanonicalPopup = React.forwardRef((props, ref) => {
    const {
        trigger,
        example,
        example: { intent },
    } = props;

    const { getCanonicalExamples } = useContext(ProjectContext);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const canonicalExample = getCanonicalExamples({ intent })[0];
    const defaultLabelRef = useRef();
    const intentLabelRef = ref || defaultLabelRef;
    
    const renderPopupContent = () => (
        <div className='side-by-side middle'>
            {(!canonicalExample || !canonicalExample.text)
                ? <p>There are no examples associated with this intent.</p>
                : (
                    <>
                        <Icon
                            name={canonicalExample.metadata?.canonical ? 'gem' : 'tag'}
                        />
                        <UserUtteranceViewer
                            value={canonicalExample}
                            disableEditing
                            showIntent={false}
                            projectId=''
                        />
                    </>
                )
            }
        </div>
    );

    const renderCanonicalPopup = () => (
        <Popup
            content={renderPopupContent}
            trigger={(
                <div role='button' tabIndex={0} onKeyDown={null} onClick={() => setTooltipOpen(false)}>
                    <trigger.type
                        {...trigger.props}
                        ref={intentLabelRef}
                    />
                </div>
            )}
            inverted
            on='hover'
            onOpen={() => { if (!intentLabelRef.current.isPopupOpen()) setTooltipOpen(true); }}
            onClose={() => setTooltipOpen(false)}
            open={tooltipOpen}
        />
    );
    if (!example.intent) {
        return (
            <trigger.type
                {...trigger.props}
                ref={intentLabelRef}
            />
        );
    }
    return renderCanonicalPopup();
});

const exampleShape = {
    intent: PropTypes.string,
    text: PropTypes.string.isRequired,
    entities: PropTypes.array,
    canonical: PropTypes.bool,
};

CanonicalPopup.propTypes = {
    trigger: PropTypes.element.isRequired,
    example: PropTypes.shape(exampleShape),
};
CanonicalPopup.defaultProps = {
    example: {},
};
export default CanonicalPopup;
