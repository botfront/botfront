import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Responsive, Button, Dropdown } from 'semantic-ui-react';
import { Widget } from 'rasa-webchat/module';
import { Loading } from '../components/utils/Utils';

const ResponsiveAlternants = ({ cutoff, children, ...props }) => (
    <>
        <Responsive {...props} minWidth={cutoff}>
            {children[0]}
        </Responsive>
        <Responsive {...props} maxWidth={cutoff - 1}>
            {children[1]}
        </Responsive>
    </>
);

const ChatDemo = (props) => {
    const { params: { project_id: projectId = '' } = {}, router } = props;
    const {
        location: { pathname, query: queryParams },
    } = router;
    const [loading, setLoading] = useState(true);
    const [widgetProps, setWidgetProps] = useState({
        languages: [],
    });
    const [language, setLanguage] = useState();
    const [updateKey, setUpdateKey] = useState();
    const [error, setError] = useState();

    const handleChangeLanguage = (lang) => {
        window.localStorage.removeItem('chat_session');
        setLanguage(lang);
        router.replace({ pathname, query: { lang } });
        setUpdateKey(new Date());
    };

    const handleRestart = () => handleChangeLanguage(language);

    useEffect(
        () => Meteor.call('project.getChatProps', projectId, (err, res) => {
            if (err) setError(err.message);
            else {
                setWidgetProps(res);
                const initLang = 'lang' in queryParams
                        && res.languages.some(({ value }) => value === queryParams.lang)
                    ? queryParams.lang
                    : res.defaultLanguage;
                handleChangeLanguage(initLang);
            }
            setLoading(false);
        }),
        [],
    );

    const renderError = () => <h1>{error}</h1>;

    const renderTopMenu = () => (
        <div className='side-by-side middle'>
            <ResponsiveAlternants
                cutoff={500}
                as='span'
                style={{ marginTop: '10px' }}
                className='logo pale-grey'
            >
                <>Botfront.</>
                <>B.</>
            </ResponsiveAlternants>
            <ResponsiveAlternants cutoff={1000} as='span' className='large grey'>
                <>
                    Try out the&nbsp;
                    <b>{widgetProps.projectName}</b> assistant!
                </>
                <b>{widgetProps.projectName}</b>
            </ResponsiveAlternants>
            <ResponsiveAlternants cutoff={769}>
                <Button.Group className='transparent grey'>
                    <Button basic icon='redo' content='Restart' onClick={handleRestart} />
                    <Dropdown
                        button
                        icon={null}
                        value={language}
                        onChange={(_, { value }) => handleChangeLanguage(value)}
                        className='icon basic'
                        text='Change language'
                        options={widgetProps.languages}
                    />
                </Button.Group>
                <Dropdown button icon='bars' className='icon basic'>
                    <Dropdown.Menu direction='left'>
                        <Dropdown.Item
                            icon='redo'
                            text='Restart'
                            onClick={handleRestart}
                        />
                        <Dropdown.Header content='Change language' />
                        {widgetProps.languages.map(({ text, value }) => (
                            <Dropdown.Item
                                content={text}
                                key={value}
                                active={language === value}
                                selected={language === value}
                                onClick={() => handleChangeLanguage(value)}
                            />
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </ResponsiveAlternants>
        </div>
    );

    const render = () => (
        <>
            {renderTopMenu()}
            <div className='widget-container'>
                <Widget
                    interval={0}
                    initPayload={widgetProps.initPayload}
                    socketUrl={widgetProps.socketUrl}
                    socketPath={widgetProps.socketPath}
                    inputTextFieldHint='Try out your chatbot...'
                    hideWhenNotConnected={false}
                    customData={{ language }}
                    embedded
                    customMessageDelay={() => 0}
                    key={updateKey}
                />
            </div>
        </>
    );

    return (
        <div className='chat-demo-container'>
            <Loading loading={loading}>{error ? renderError() : render()}</Loading>
        </div>
    );
};

ChatDemo.propTypes = {
    params: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
};

ResponsiveAlternants.propTypes = {
    cutoff: PropTypes.number.isRequired,
    children: PropTypes.any.isRequired,
};

export default ChatDemo;
