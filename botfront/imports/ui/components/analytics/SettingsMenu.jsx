import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Icon, Button, Popup,
} from 'semantic-ui-react';
import SettingsPortal from './SettingsPortal';

export const filters = ['includeActions', 'excludeAction', 'includeActions', 'excludeIntents', 'selectedSequence', 'conversationLength', 'limit', 'eventFilter'];
export const conversationTypes = ['userInitiatedConversations', 'triggeredConversations'];

const SettingsMenu = (props) => {
    const {
        settings,
        titleDescription,
        onChangeSettings,
        displayConfigs,
        denominatorLine,
        exportData,
        canExport,
    } = props;

    const displayTypeHeader = useMemo(() => (
        displayConfigs.some(setting => conversationTypes.includes(setting))
    ), [displayConfigs]);
    const displayFiltersHeader = useMemo(() => (
        displayConfigs.some(setting => filters.includes(setting))
    ), [displayConfigs]);

    const [settingsOpen, setSettingsOpen] = useState();

    const renderCheckOption = (text, setting, value) => (
        <React.Fragment key={setting}>
            <Dropdown.Item
                data-cy={`edit-${setting}`}
                className='toggle-item'
                onClick={() => onChangeSettings({ [setting]: !value })}
                content={<>{text}{value && <Icon name='check' className='card-settings-checkmark' />}</>}
            />
        </React.Fragment>
    );

    const getSettingsPortalProps = (setting) => {
        const values = settings[setting] || [];
        const valueText = `(${values.length})`;
        switch (setting) {
        case 'includeActions':
            return { text: 'Included actions', valueText, values };
        case 'excludeActions':
            return { text: 'Excluded actions', valueText, values };
        case 'includeIntents':
            return { text: 'Included intents', valueText, values };
        case 'excludeIntents':
            return { text: 'Excluded intents', valueText, values };
        case 'selectedSequence':
            return { text: 'Selected sequence', valueText, values };
        case 'conversationLength':
            return {
                text: 'Minimum number of utterances',
                valueText: settings[setting] ? `: ${settings[setting]}` : '',
                values,
            };
        case 'limit':
            return {
                text: 'Display limit',
                valueText: settings[setting] ? `: ${settings[setting]}` : '',
                values: settings[setting],
            };
        case 'eventFilter':
            return {
                text: 'Filter conversation events',
                valueText,
                values: { selection: settings[setting] || [], operator: settings.eventFilterOperator || 'or' },
            };
        default:
            return {};
        }
    };

    const renderExtraOptionsLink = (setting) => {
        const { text, valueText, values } = getSettingsPortalProps(setting);
        if (!text) return <React.Fragment key={setting} />;
        return (
            <React.Fragment key={setting}>
                <SettingsPortal
                    text={text}
                    setting={setting}
                    onClose={() => setSettingsOpen(false)}
                    open={settingsOpen === setting}
                    value={values}
                    onChange={(newVal) => {
                        if (setting === 'eventFilter') {
                            onChangeSettings({ eventFilter: newVal.selection, eventFilterOperator: newVal.operator });
                            return;
                        }
                        onChangeSettings({ [setting]: newVal });
                    }
                    }
                />
                <Dropdown.Item
                    text={`${text}${valueText}`}
                    data-cy={`edit-${setting}`}
                    onClick={() => setSettingsOpen(setting)}
                />
            </React.Fragment>
        );
    };

    return (
        <Dropdown
            trigger={(
                <Button
                    className='export-card-button'
                    icon='ellipsis vertical'
                    basic
                    data-cy='card-ellipsis-menu'
                />
            )}
            basic
        >
            <Dropdown.Menu>
                <Dropdown.Header content='Appearance' onClick={e => e.stopPropagation()} />
                <Dropdown.Item
                    text={settings.wide ? 'Shrink to half width' : 'Expand to full width'}
                    data-cy='toggle-wide'
                    onClick={() => onChangeSettings({ wide: !settings.wide })}
                />
                <React.Fragment key='edit-description'>
                    <SettingsPortal
                        text='Edit description'
                        onClose={() => setSettingsOpen(false)}
                        open={settingsOpen === 'description'}
                        values={titleDescription}
                        onChange={newVal => onChangeSettings({ description: newVal })}
                    />
                    <Dropdown.Item
                        text='Edit description'
                        data-cy='edit-description'
                        onClick={() => setSettingsOpen('description')}
                    />
                </React.Fragment>
                {denominatorLine && (
                    <Dropdown.Item
                        text={settings.showDenominator ? 'Hide total conversations' : 'Show total conversations'}
                        data-cy='toggle-denominator'
                        onClick={() => onChangeSettings({ showDenominator: !settings.showDenominator })}
                    />
                )}
                {displayTypeHeader && <Dropdown.Header content='Types of conversations' onClick={e => e.stopPropagation()} /> }
                {displayConfigs.includes('userInitiatedConversations') && renderCheckOption('User initiated conversations', 'userInitiatedConversations', settings.userInitiatedConversations)}
                {displayConfigs.includes('triggerConversations') && renderCheckOption('Triggered conversations', 'triggerConversations', settings.triggerConversations)}
                {displayFiltersHeader && <Dropdown.Header content='Filters' onClick={e => e.stopPropagation()} />}
                {(displayConfigs || []).map(renderExtraOptionsLink)}
                <Dropdown.Header content='Extras' onClick={e => e.stopPropagation()} />
                <Popup
                    content='There is no data in this card to download'
                    inverted
                    disabled={canExport}
                    trigger={(
                        <Dropdown.Item
                            onClick={e => (canExport ? exportData() : e.stopPropagation())}
                            className={!canExport ? 'disabled-popup-item' : ''}
                            data-cy='export-card'
                        >
                            Export this card (.csv)
                        </Dropdown.Item>
                    )}
                />
            </Dropdown.Menu>
        </Dropdown>
    );
};

SettingsMenu.propTypes = {
    settings: PropTypes.object.isRequired,
    titleDescription: PropTypes.string.isRequired,
    onChangeSettings: PropTypes.func.isRequired,
    displayConfigs: PropTypes.array,
    denominatorLine: PropTypes.bool,
    exportData: PropTypes.func.isRequired,
    canExport: PropTypes.bool,
};

SettingsMenu.defaultProps = {
    displayConfigs: [],
    denominatorLine: false,
    canExport: false,
};

export default SettingsMenu;
