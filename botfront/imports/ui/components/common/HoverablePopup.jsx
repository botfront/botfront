import {
    Popup,
    Item,
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

    openPopup = () => {
        const { controlled, setOpen } = this.props;
        if (!controlled) {
            this.setState({ open: true });
            return;
        }
        setOpen();
    }

    closePopup = () => {
        const { controlled, setClosed } = this.props;
        if (!controlled) {
            this.setState({ open: false });
            return;
        }
        setClosed();
    }


    handleScroll = (event) => {
        if (this.popupNode.current && !this.popupNode.current.contains(event.target)) {
            this.closePopup();
        }
    };

    handleClickOutside = (event) => {
        if (
            this.entityNode.current
            && !this.entityNode.current.contains(event.target)
            && (!this.popupNode.current || !this.popupNode.current.contains(event.target))
        ) {
            this.closePopup();
        }
    };

    handleMouseEnter = (delayOpen = 0) => {
        clearTimeout(this.mouseLeaveTimer);
        this.mouseEnterTimer = setTimeout(() => {
            this.openPopup();
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
            this.closePopup();
        }, leaveTime);
    };

    render() {
        const {
            trigger,
            disabled,
            content,
            controlled,
            open: openFromProps,
            on,
            className,
            flowing,
        } = this.props;
        const { open: openFromState } = this.state;
        return (
            <Popup
                className={className}
                trigger={(
                    <Item
                        as='span'
                        className='popup-trigger-wrapper'
                        onMouseEnter={() => {
                            if (on === 'click') return;
                            this.handleMouseEnter(75);
                        }}
                        onMouseLeave={() => this.handleMouseLeave(200)}
                        onClick={() => {
                            if (on === 'click') {
                                this.openPopup();
                            }
                        }}
                    >
                        {trigger}
                    </Item>
                )}
                content={(
                    <div
                        onMouseEnter={this.handleMouseEnter}
                        onMouseLeave={this.handleMouseLeave}
                        ref={this.popupNode}
                    >
                        {content}
                        {/*
                            the extended-hover-target covers the space
                            inbetween the popup and the trigger.
                            it prevents the popup from closing when
                            the user is slow to move their mouser from
                            the trigger to the popup
                        */}
                        <div className='extended-hover-container'>
                            <div className='extended-hover-target' />
                        </div>
                    </div>
                )}
                position='top center'
                open={controlled ? openFromProps : openFromState}
                disabled={disabled}
                flowing={flowing}
            />
        );
    }
}

HoverablePopup.propTypes = {
    content: PropTypes.element.isRequired,
    trigger: PropTypes.element.isRequired,
    disabled: PropTypes.bool,
    on: PropTypes.oneOf(['click', 'hover']),
    controlled: PropTypes.bool,
    setOpen: PropTypes.func,
    setClosed: PropTypes.func,
    open: PropTypes.bool,
    className: PropTypes.string,
    flowing: PropTypes.bool,
};

HoverablePopup.defaultProps = {
    disabled: false,
    on: 'hover',
    controlled: false,
    setOpen: () => {},
    setClosed: () => {},
    open: null,
    flowing: false,
    className: '',
};

export default HoverablePopup;
