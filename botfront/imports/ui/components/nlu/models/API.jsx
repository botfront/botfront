/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import {
    TextArea, Form, Dropdown, Input, Checkbox,
} from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import queryString from 'query-string';

class API extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: 'hello',
            output: {},
            tz: null,
            reftime: 0,
        };
        this.debouncedFunction = debounce(() => {
            this.parseNlu();
        }, 1000);
    }

    componentDidMount() {
        this.debouncedFunction();
    }

    getCodeString() {
        const {
            instance: { host, token },
            model: { language: lang },
        } = this.props;
        const { query, reftime, tz } = this.state;

        const url = `${host}/model/parse`;
        const queryparams = {};
        if (tz) queryparams.timezone = tz;
        if (reftime) queryparams.reference_time = reftime;
        if (token) queryparams.toekn = token;
        const qs = queryString.stringify(queryparams);
        const payload = { text: query, lang };

        return `curl -X POST ${url}${qs} -d '${JSON.stringify(payload)}'`;
    }

    handleChange = (e, { name, value }) => {
        const update = {};
        update[name] = value;
        this.setState(update);
        this.debouncedFunction();
    };

    handleDucklingOptionsChange = (e, { checked }) => {
        this.setState(checked ? { tz: moment.tz.guess(), reftime: moment().valueOf() } : { tz: null, reftime: 0 });
        this.debouncedFunction();
    };

    handleTextChange = (e, { value }) => {
        this.setState({ query: value });
        this.debouncedFunction();
    };

    parseNlu = () => {
        const {
            model: { language },
            instance,
        } = this.props;
        const { query, tz, reftime } = this.state;

        if (query == null || query.length === 0) {
            return this.setState({ output: {} });
        }
        const queryParams = { q: query };
        if (tz) Object.assign(queryParams, { timezone: tz });
        if (reftime > 0) Object.assign(queryParams, { reference_time: reftime });

        return Meteor.call('rasa.parse', instance, [{ text: query, lang: language }], (err, output) => this.setState({ output }));
    };

    render() {
        const {
            query, output, reftime, tz,
        } = this.state;
        const tzOptions = moment.tz.names().map(n => ({ value: n, text: n }));

        const codeString = this.getCodeString();
        return (
            <div className='glow-box extra-padding no-margin'>
                <br />
                <div id='playground'>
                    <Form>
                        <Form.Field>
                            <TextArea name='query' placeholder='User says...' autoheight='true' rows={1} value={query} onChange={this.handleTextChange} />
                        </Form.Field>
                        <br />
                        <Checkbox slider label='Show Duckling params' onChange={this.handleDucklingOptionsChange} />
                        <br />
                        <br />
                        {tz && (
                            <Form.Field>
                                <label>Timezone: </label>
                                <Dropdown name='tz' placeholder='Select timezone' search selection value={tz} options={tzOptions} onChange={this.handleChange} />
                            </Form.Field>
                        )}
                        {reftime !== 0 && (
                            <Form.Field>
                                <label>Ref. time:</label>
                                <Input name='reftime' value={reftime} placeholder='Ref. time' onChange={this.handleChange} />
                            </Form.Field>
                        )}
                    </Form>
                </div>
                <br />
                <div style={{ width: '100%', backgroundColor: '#efefef', padding: '1em' }}>
                    <code>{codeString}</code>
                </div>
                <br />
                <ReactJson src={output} collapsed={3} name={false} />
            </div>
        );
    }
}

API.propTypes = {
    model: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(API);
