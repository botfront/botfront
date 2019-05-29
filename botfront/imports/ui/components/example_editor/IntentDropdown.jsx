import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'semantic-ui-react';


export default class IntentDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            intent: '',
            intents: props.intents,
        };

        this.handleChangeOrAddIntent = this.handleChangeOrAddIntent.bind(this);
    }

    handleChangeOrAddIntent(e, { value }) {
        const { setIntent } = this.props;
        let { intents } = this.state;

        if (intents.indexOf(value) === -1) {
            intents = [value, ...intents];
        }

        this.setState({
            intent: value,
            intents,
        });

        setIntent(value);
    }

    render() {
        const { intent, intents } = this.state;

        return (
            <Button.Group color='purple'>
                <Dropdown
                    name='intent'
                    placeholder='Select an intent'
                    button
                    fluid
                    value={intent}
                    labeled
                    floating
                    className='icon'
                    search
                    allowAdditions
                    additionLabel='Create intent: '
                    onAddItem={this.handleChangeOrAddIntent}
                    onChange={this.handleChangeOrAddIntent}
                    options={intents.map(i => ({ text: i, value: i }))}
                    data-cy='intent-dropdown'
                />
            </Button.Group>
        );
    }
}

IntentDropdown.propTypes = {
    intents: PropTypes.arrayOf(PropTypes.string).isRequired,
    setIntent: PropTypes.func.isRequired,
};
