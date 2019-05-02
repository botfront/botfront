import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import Alert from 'react-s-alert';
import { Meteor } from 'meteor/meteor';
import {
    Icon, Loader, Popup, Menu, Button, Message, Segment, Dimmer, Container,
} from 'semantic-ui-react';

export function Info({ info }) {
    return <Popup trigger={<Icon name='question circle' color='grey' />} content={info} />;
}

Info.propTypes = {
    info: PropTypes.string.isRequired,
};

export function Loading({ loading, children }) {
    return !loading ? children : <Loader active inline='centered' />;
}

Loading.propTypes = {
    loading: PropTypes.bool.isRequired,
};

export class JSONDropzone extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dropped: false,
            loading: false,
        };

        this.loadFiles = this.loadFiles.bind(this);
    }

    loadFiles(files) {
        const { loadJSON } = this.props;

        if (files.length > 1) {
            throw new Meteor.Error('You can only upload one file.');
        }

        this.setState({ success: true, loading: true });
        const callback = (problem = false) => {
            if (this.state.loading && !problem) {
                this.setState({ loading: false });
            } else {
                this.setState({ loading: false, success: false });
            }
        };

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    loadJSON(data, callback);
                } catch (e) {
                    callback(true);
                    Alert.error('Error: you must upload a JSON file with the same format as an export', {
                        position: 'top',
                        timeout: 'none',
                    });
                }
            };

            reader.onabort = () => {
                callback(true);
                console.log('file reading was aborted');
            };
            reader.onerror = () => {
                callback(true);
                console.log('file reading has failed');
            };

            reader.readAsText(file, 'utf-8');
        });
    }

    render() {
        const { text, loadJSON, ...props } = this.props;
        const { dropped, loading } = this.state;

        return !dropped ? (
            <Dropzone
                style={{
                    padding: '10px',
                    width: '100%',
                    height: '120px',
                    borderWidth: '2px',
                    borderColor: 'black',
                    borderStyle: 'dashed',
                    borderRadius: '5px',
                }}
                multiple={false}
                onDrop={this.loadFiles}
                {...props}
            >
                {text}
            </Dropzone>
        ) : (
            <Loading loading={loading}>
                <Message positive header='Success' icon='check' content='Your file is ready to be uploaded.' />
            </Loading>
        );
    }
}

JSONDropzone.propTypes = {
    loadJSON: PropTypes.func.isRequired,
    text: PropTypes.string,
};

JSONDropzone.defaultProps = {
    text: 'Drop data in json format',
};

export function SegmentLoader({ loading, children }) {
    return (
        <Segment>
            <Dimmer active={loading} inverted>
                <Loader>Loading</Loader>
            </Dimmer>
            {children}
        </Segment>
    );
}

SegmentLoader.propTypes = {
    loading: PropTypes.bool.isRequired,
    children: PropTypes.node,
};

export function ContainerLoader({ loading, children }) {
    return (
        <Container>
            <Dimmer active={loading} inverted>
                <Loader>Loading</Loader>
            </Dimmer>
            {children}
        </Container>
    );
}

ContainerLoader.propTypes = {
    loading: PropTypes.bool.isRequired,
    children: PropTypes.node,
};

export function PageMenu(props) {
    const { title, icon } = props;
    return (
        <Menu pointing secondary style={{ background: '#fff' }}>
            <Menu.Item>
                <Menu.Header as='h3'>
                    <Icon name={icon} />
                    {` ${title}`}
                </Menu.Header>
            </Menu.Item>
            {props.children}
        </Menu>
    );
}

PageMenu.defaultProps = {
    children: null,
};

PageMenu.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
