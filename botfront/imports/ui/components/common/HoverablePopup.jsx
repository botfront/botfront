import {
    Popup,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';


class HoverablePopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
        this.entityNode = React.createRef();
        this.popupNode = React.createRef();
        this.trigger = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        window.removeEventListener('scroll', this.handleScroll, true);
        clearTimeout(this.mouseLeaveTimer);
    }


    handleScroll = (event) => {
        if (this.popupNode.current && !this.popupNode.current.contains(event.target)) {
            this.setState({ open: false });
        }
    };

    handleClickOutside = (event) => {
        if (
            this.entityNode.current
            && !this.entityNode.current.contains(event.target)
            && (!this.popupNode.current || !this.popupNode.current.contains(event.target))
        ) {
            this.setState({ open: false });
        }
    };

    handleMouseEnter = (delayOpen = 0) => {
        clearTimeout(this.mouseLeaveTimer);
        this.mouseEnterTimer = setTimeout(() => {
            this.setState({ open: true });
        }, delayOpen);
    };

    handleMouseLeave = (overideLeaveTime) => {
        // The time in ms before the component actually close the popup
        // this is useful for allowing the user to put his mouse on the popup before it closes.
        // reduce this value to improve responsiveness, but this will reduce the time the user
        // has to move his mouse to the popup.
        clearTimeout(this.mouseEnterTimer);
        const leaveTime = overideLeaveTime || 100;
        this.mouseLeaveTimer = setTimeout(() => {
            // this lets the user time to put his mouse on the popup after leaving the label
            this.setState({ open: false });
        }, leaveTime);
    };

    render() {
        const {
            trigger,
            disabled,
            content,
        } = this.props;
        const { open } = this.state;
        return (
            <Popup
                trigger={(
                    <div
                        onMouseEnter={() => this.handleMouseEnter(50)}
                        onMouseLeave={() => this.handleMouseLeave(200)}
                    >
                        {trigger}
                    </div>
                )}
                content={(
                    <div
                        onMouseEnter={this.handleMouseEnter}
                        onMouseLeave={this.handleMouseLeave}
                        ref={this.popupNode}
                    >
                        {content}
                    </div>
                )}
                position='top center'
                open={open}
                disabled={disabled}
                className='entity-popup'
            />
        );
    }
}

HoverablePopup.propTypes = {
    content: PropTypes.element.isRequired,
    trigger: PropTypes.element.isRequired,
    disabled: PropTypes.bool,
};

HoverablePopup.defaultProps = {
    disabled: false,
};

export default HoverablePopup;
