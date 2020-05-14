import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import { debounce } from 'lodash';
import UserUtteranceViewer from '../nlu/common/UserUtteranceViewer';
import { wrapMeteorCallback } from '../utils/Errors';

export default class NLUExampleTester extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            example: null,
            clickable: false,
            text: this.props.text,
        };
        this.debouncedFunction = debounce(() => {
            this.parseNlu();
        }, 300);
    }

    componentDidMount() {
        this._ismounted = true;
        this.parseNlu();
    }

    componentWillReceiveProps(props) {
        this.props = props;

        if (this._ismounted) {
            this.setState({ text: this.props.text });
            this.debouncedFunction();
        }
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    parseNlu = () => {
        const { text } = this.state;
        const { text: propsText } = this.props;
        const {
            silenceRasaErrors,
            instance,
            model: { language: lang },
        } = this.props;
        if (text == null || text.length === 0) {
            this.setState({ text: propsText, example: null, clickable: false });
            return;
        }

        Meteor.call(
            'rasa.parse',
            instance,
            [{ text, lang }],
            { failSilently: silenceRasaErrors },
            wrapMeteorCallback((err, example) => {
                if (err) {
                    return this.setState({ example: null, clickable: false });
                }
                if (!example.text) Object.assign(example, { text: propsText });
                Object.assign(example, { intent: example.intent ? example.intent.name : null });
                return this.setState({ example, clickable: true });
            }),
        );
    };

    onDone = () => {
        const { onDone } = this.props;
        const { example } = this.state;
        onDone(example);
        this.setState({ text: '', example: null });
    };

    render() {
        const { clickable, example } = this.state;
        const optionalProps = clickable ? { onClick: this.onDone } : {};
        return (
            <div className='tester' {...optionalProps} data-cy='nlu-example-tester'>
                {example && (
                    <Segment>
                        <UserUtteranceViewer
                            onEnter={this.onDone}
                            value={example}
                            disableEditing
                        />
                    </Segment>
                )}
            </div>
        );
    }
}

NLUExampleTester.propTypes = {
    text: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired,
    entities: PropTypes.array.isRequired,
    onDone: PropTypes.func,
    silenceRasaErrors: PropTypes.bool,
};

NLUExampleTester.defaultProps = {
    onDone: () => {},
    silenceRasaErrors: false,
};
