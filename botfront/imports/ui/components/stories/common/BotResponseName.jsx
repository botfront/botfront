import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
    Loader, Header, List, Input, Popup,
} from 'semantic-ui-react';
import HoverablePopup from '../../common/HoverablePopup';
import { ConversationOptionsContext } from '../Context';
import { generateRenamingErrorMessage } from '../../../../lib/botResponse.utils';

const BotResponseName = (props) => {
    const {
        responseLocations,
        loading,
        linkToStory,
        name,
        onChange,
    } = props;

    const { reloadStories } = useContext(ConversationOptionsContext);

    const [popupOpen, setPopupOpen] = useState(false);
    const [nameInputValue, setNameInputValue] = useState(name);
    const [renameError, setRenameError] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSaveName = (e) => {
        setSaving(true);
        const newName = e.target.value;
        if (!/^utter_/.test(newName)) {
            e.preventDefault();
            setRenameError('Response names must start with utter_');
            setSaving(false);
            return;
        }
        if (name === newName) {
            setRenameError(false);
            setSaving(false);
            return;
        }
        onChange(newName)
            .then(() => {
                setRenameError(null);
                setSaving(false);
                reloadStories();
            })
            .catch((err) => {
                setRenameError(generateRenamingErrorMessage(err));
                setSaving(false);
            });
    };

    const handleNameInputChange = (_, target) => {
        if (saving) return;
        setNameInputValue(target.value);
    };

    const renderNameInput = () => (
        <>
            <Popup
                disabled={!renameError}
                content={renameError}
                inverted
                size='tiny'
                trigger={(
                    <span>
                        <Input
                            disabled={saving}
                            className={`response-name-input ${renameError ? 'error' : ''}`}
                            value={nameInputValue}
                            onBlur={handleSaveName}
                            onChange={handleNameInputChange}
                            data-cy='bot-response-name-input'
                        />
                    </span>
                )}
            />
            <Loader inline size='tiny' active={loading || saving} className='response-name-loader' data-cy='response-name-loader' />
        </>
    );
    const renderLocationsPopup = () => (
        <>
            {renderNameInput()}
            {!saving && !loading && (
                <HoverablePopup
                    className='response-locations-popup'
                    trigger={(
                        <>
                            <span className='response-locations-count'>({responseLocations.length})</span>
                        </>
                    )}
                    content={(
                        <>
                            <Header>This response is used in {responseLocations.length} stories</Header>
                            <List data-cy='response-locations-list' className='response-locations-list'>
                                {responseLocations.map(({ title, _id, storyGroupId }) => (
                                    <List.Item
                                        className='story-name-link'
                                        key={_id}
                                        onClick={() => {
                                            setPopupOpen(false);
                                            linkToStory(_id, storyGroupId);
                                        }}
                                        data-cy='story-name-link'
                                    >
                                    ##{title}
                                    </List.Item>
                                ))}
                            </List>
                        </>
                    )}
                    controlled
                    open={popupOpen}
                    setOpen={() => setPopupOpen(true)}
                    setClosed={() => setPopupOpen(false)}
                    on='click'
                    flowing
                />
            )}
        </>
    );
    return (
        <div className='response-name-container'>
            <div className={`response-name ${responseLocations.length > 1 ? 'locations-link' : ''}`}>
                {responseLocations.length > 1 ? renderLocationsPopup() : renderNameInput()}
            </div>
        </div>
    );
};

BotResponseName.propTypes = {
    responseLocations: PropTypes.array,
    loading: PropTypes.bool,
    linkToStory: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
};

BotResponseName.defaultProps = {
    responseLocations: [],
    loading: false,
    onChange: () => new Promise(resolve => resolve()),
};

export default BotResponseName;
