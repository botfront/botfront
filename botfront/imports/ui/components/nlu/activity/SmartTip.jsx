import React from 'react';
import PropTypes from 'prop-types';
import { Popup, Accordion, Icon } from 'semantic-ui-react';
import 'react-select/dist/react-select.css';

export default class SmartTip extends React.Component {
    state = {
        accordionOpen: false,
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
                    content={(<>
                        <div style={{ padding: '5px' }}>
                            {message}
                        </div>
                        { mainAction && (
                            <div style={{ padding: '5px' }}>
                                {mainAction(true)}
                            </div>
                        )}
                        { otherActions && otherActions.length && (
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
                    </>)}
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
    button: PropTypes.element,
    tip: PropTypes.string,
    message: PropTypes.string,
    mainAction: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    otherActions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.element, PropTypes.func])),
};
