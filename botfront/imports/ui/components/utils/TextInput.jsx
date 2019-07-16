import React from 'react';
import PropTypes from 'prop-types';
import requiredIf from 'react-required-if';
import { Input } from 'semantic-ui-react';

export default class TextInput extends React.Component {
    static toSize(size) {
        return `${size}px`;
    }

    constructor(props) {
        super(props);
        this.state = {
            textWidth: 100,
        };

        this.fullRender = false;
        this.renderWidth = -1;

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    
    componentDidMount() {
        this.afterRender();
    }

    componentWillReceiveProps() {
        this.fullRender = false;
    }


    componentDidUpdate() {
        this.afterRender();
    }

    afterRender() {
        if (!this.fullRender) {
            this.fullRender = true;
            this.setState({ textWidth: this.renderWidth });
        }
    }

    handleChange(event, { value }) {
        this.fullRender = false;
        this.props.onTextChange(value);
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.target.blur();
            this.props.onEnter();
        }
    }

    render() {
        const { textWidth } = this.state;
        const { text, onBlur, placeholder, staticText } = this.props;

        const renderedText = (placeholder && text === staticText) ? '' : text;
        const refFunction = (node) => {
            if (node) {
                this.renderWidth = node.clientWidth + 1; // 1 pixel buffer
            }
        };

        return (
            <div className='input-container'>
                <Input
                    style={{ width: TextInput.toSize(textWidth) }}
                    value={renderedText}
                    input={<input type='text' onBlur={onBlur} />}
                    onKeyDown={this.handleKeyPress}
                    onChange={this.handleChange}
                    transparent
                    placeholder={staticText}
                />
                {!this.fullRender && (
                    <p className='hidden-component' ref={refFunction}>
                        {text}
                    </p>
                )}
            </div>
        );
    }
}

TextInput.propTypes = {
    text: PropTypes.string.isRequired,
    onTextChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onEnter: PropTypes.func,
    placeholder: PropTypes.bool,
    staticText: requiredIf(PropTypes.string, ({ placeholder }) => placeholder),
};

TextInput.defaultProps = {
    onBlur: () => {},
    onEnter: () => {},
    placeholder: false,
    staticText: '',
};
