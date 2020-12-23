export const validWidgetSettings = {
    filename: 'widgetsettings.yml',
    rawText:
    `title: aaa
customData:
  language: en
subtitle: Happy to
inputTextFieldHint: Type your message...
initPayload: /ate
hideWhenNotConnected: true
userTextColor: '#784444'
    `,
    dataType: 'widgetsettings',
};

export const validWidgetSettingsParsed = {
    customData: { language: 'en' },
    hideWhenNotConnected: true,
    initPayload: '/ate',
    inputTextFieldHint: 'Type your message...',
    subtitle: 'Happy to',
    title: 'aaa',
    userTextColor: '#784444',
};
