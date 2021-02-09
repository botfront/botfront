import React from 'react';
import PropTypes from 'prop-types';
import { Popup, Accordion, Icon } from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import { formatMessage } from '../../../../lib/utils';

export default class SmartTip extends React.Component {
    state = {
        accordionOpen: false,
    }

    onMouseDown = {
        onMouseDown: e => e.stopPropagation(),
    }
    
    handleMouseEnter = () => {
        clearTimeout(this.mouseLeaveTimer);
        this.setState({ hovering: true });
    };

    handleMouseLeave = () => {
        this.mouseLeaveTimer = setTimeout(() => {
            this.setState({ hovering: false });
        }, 50);
    };

    handleAccordionClick = () => {
        const { accordionOpen } = this.state;
        this.setState({ accordionOpen: !accordionOpen });
    }

    render() {
        const {
            button, tip, message, mainAction, otherActions,
        } = this.props;
        const { hovering, accordionOpen } = this.state;
        return (
            <div
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                style={{ display: 'inline-block' }}
            >
                <Popup
                    style={{ textAlign: 'center' }}
                    wide
                    header={tip}
                    content={(
                        <div {...this.onMouseDown}>
                            <div style={{ padding: '5px' }}>
                                {formatMessage(message)}
                            </div>
                            { mainAction && (
                                <div style={{ padding: '5px' }}>
                                    {mainAction(true)}
                                </div>
                            )}
                            {otherActions.length > 0 && (
                                <Accordion>
                                    <Accordion.Title active={accordionOpen} onClick={this.handleAccordionClick}>
                                        <Icon name='dropdown' />
                                            Other actions
                                    </Accordion.Title>
                                    <Accordion.Content active={accordionOpen}>
                                        <p>
                                            {otherActions.map(a => a(false))}
                                        </p>
                                    </Accordion.Content>
                                </Accordion>
                            )}
                        </div>
                    )}
                    trigger={button}
                    hoverable
                    position='left center'
                    open={hovering}
                />
            </div>
        );
    }
}

SmartTip.propTypes = {
    button: PropTypes.element.isRequired,
    tip: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    mainAction: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
    otherActions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.element, PropTypes.func])),
};

SmartTip.defaultProps = {
    otherActions: [],
};
