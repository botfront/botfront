import { expect } from 'chai';
import { hasTriggerRules } from './storyRules.utils';

// url test data

const urlTriggerExists = [
    {
        text: 'text',
        trigger: {
            url: [{ path: 'url' }],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const urlTriggerEmptyA = [
    {
        text: 'text',
        trigger: {
            url: [''],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const urlTriggerEmptyB = [
    {
        text: 'text',
        trigger: {
            url: [],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const urlTriggerEmptyC = [
    {
        text: 'text',
        trigger: {
            url: undefined,
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];


// number of visits test data

const urlNumberOfVisitsExistsA = [
    {
        text: 'text',
        trigger: {
            numberOfVisits: '12',
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const urlNumberOfVisitsExistsB = [
    {
        text: 'text',
        trigger: {
            numberOfVisits: '0',
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const urlNumberOfVisitsExistsC = [
    {
        text: 'text',
        trigger: {
            numberOfVisits: 0,
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const urlNumberOfVisitsEmpty = [
    {
        text: 'text',
        trigger: {
            numberOfVisits: undefined,
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

// number of page visits test data

const urlNumberOfPageVisitsExistsA = [
    {
        text: 'text',
        trigger: {
            numberOfPageVisits: '12',
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const urlNumberOfPageVisitsExistsB = [
    {
        text: 'text',
        trigger: {
            numberOfPageVisits: '0',
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const urlNumberOfPageVisitsExistsC = [
    {
        text: 'text',
        trigger: {
            numberOfPageVisits: 0,
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const urlNumberOfPageVisitsEmpty = [
    {
        text: 'text',
        trigger: {
            numberOfPageVisits: undefined,
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

// device test data

const deviceTriggerExists = [
    {
        text: 'text',
        trigger: {
            device: 'all',
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const deviceTriggerEmptyA = [
    {
        text: 'text',
        trigger: {
            device: '',
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const deviceTriggerEmptyB = [
    {
        text: 'text',
        trigger: {
            device: undefined,
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const deviceTriggerEmptyC = [
    {
        text: 'text',
        trigger: {
            device: null,
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

// query string test data

const queryStringTriggerExists = [
    {
        text: 'text',
        trigger: {
            queryString: [
                {
                    param: 'hello',
                    value: 'great',
                },
            ],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const queryStringTriggerEmptyA = [
    {
        text: 'text',
        trigger: {
            queryString: [
                {
                    param: 'hello',
                    value: '',
                },
            ],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const queryStringTriggerEmptyB = [
    {
        text: 'text',
        trigger: {
            queryString: [
                {
                    param: '',
                    value: 'great',
                },
            ],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const queryStringTriggerEmptyC = [
    {
        text: 'text',
        trigger: {
            queryString: [
                {
                    param: 'hello',
                },
            ],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const queryStringTriggerEmptyD = [
    {
        text: 'text',
        trigger: {
            queryString: [
                {
                    value: 'great',
                },
                {
                    param: 'test',
                },
            ],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const queryStringTriggerEmptyE = [
    {
        text: 'text',
        trigger: {
            queryString: [],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

// time on page test data

const timeOnPageTriggerExistsA = [
    {
        text: 'text',
        trigger: {
            timeOnPage: '12',
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const timeOnPageTriggerExistsB = [
    {
        text: 'text',
        trigger: {
            timeOnPage: '0',
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const timeOnPageTriggerExistsC = [
    {
        text: 'text',
        trigger: {
            timeOnPage: 0,
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];
const timeOnPageTriggerEmpty = [
    {
        text: 'text',
        trigger: {
            timeOnPage: undefined,
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

// event listener test data

const eventListenerTriggerExistsA = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ selector: 'test', event: 'mouseover' }],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];


const eventListenerTriggerExistsB = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ selector: 'test', event: 'mouseover' }],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const eventListenerTriggerEmptyA = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ selector: 'test' }],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const eventListenerTriggerEmptyB = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ event: 'mouseover' }],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const eventListenerTriggerEmptyC = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ event: 'mouseover' }, { selector: 'test' }],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const eventListenerTriggerEmptyD = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ selector: '', event: '' }],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];

const eventListenerTriggerEmptyE = [
    {
        text: 'text',
        trigger: {
            eventListeners: [],
        },
        payload: '/trigger_wbaw9f65oqNZ5KgQB',
    },
];


describe('checking form empty', () => {
    it('should validate url', () => {
        expect(hasTriggerRules(urlTriggerExists)).to.be.equal(true);
        expect(hasTriggerRules(urlTriggerEmptyA)).to.be.equal(false);
        expect(hasTriggerRules(urlTriggerEmptyB)).to.be.equal(false);
        expect(hasTriggerRules(urlTriggerEmptyC)).to.be.equal(false);
    });
    it('should validate number of visits', () => {
        expect(hasTriggerRules(urlNumberOfVisitsExistsA)).to.be.equal(true);
        expect(hasTriggerRules(urlNumberOfVisitsExistsB)).to.be.equal(true);
        expect(hasTriggerRules(urlNumberOfVisitsExistsC)).to.be.equal(true);
        expect(hasTriggerRules(urlNumberOfVisitsEmpty)).to.be.equal(false);
    });
    it('should validate number page of visits', () => {
        expect(hasTriggerRules(urlNumberOfPageVisitsExistsA)).to.be.equal(true);
        expect(hasTriggerRules(urlNumberOfPageVisitsExistsB)).to.be.equal(true);
        expect(hasTriggerRules(urlNumberOfPageVisitsExistsC)).to.be.equal(true);
        expect(hasTriggerRules(urlNumberOfPageVisitsEmpty)).to.be.equal(false);
    });
    it('should validate time on page', () => {
        expect(hasTriggerRules(timeOnPageTriggerExistsA)).to.be.equal(true);
        expect(hasTriggerRules(timeOnPageTriggerExistsB)).to.be.equal(true);
        expect(hasTriggerRules(timeOnPageTriggerExistsC)).to.be.equal(true);
        expect(hasTriggerRules(timeOnPageTriggerEmpty)).to.be.equal(false);
    });
    it('should validate device', () => {
        expect(hasTriggerRules(deviceTriggerExists)).to.be.equal(true);
        expect(hasTriggerRules(deviceTriggerEmptyA)).to.be.equal(false);
        expect(hasTriggerRules(deviceTriggerEmptyB)).to.be.equal(false);
        expect(hasTriggerRules(deviceTriggerEmptyC)).to.be.equal(false);
    });
    it('should validate query string', () => {
        expect(hasTriggerRules(queryStringTriggerExists)).to.be.equal(true);
        expect(hasTriggerRules(queryStringTriggerEmptyA)).to.be.equal(false);
        expect(hasTriggerRules(queryStringTriggerEmptyB)).to.be.equal(false);
        expect(hasTriggerRules(queryStringTriggerEmptyC)).to.be.equal(false);
        expect(hasTriggerRules(queryStringTriggerEmptyD)).to.be.equal(false);
        expect(hasTriggerRules(queryStringTriggerEmptyE)).to.be.equal(false);
    });
    it('should validate time on page', () => {
        expect(hasTriggerRules(eventListenerTriggerExistsA)).to.be.equal(true);
        expect(hasTriggerRules(eventListenerTriggerExistsB)).to.be.equal(true);
        expect(hasTriggerRules(eventListenerTriggerEmptyA)).to.be.equal(false);
        expect(hasTriggerRules(eventListenerTriggerEmptyB)).to.be.equal(false);
        expect(hasTriggerRules(eventListenerTriggerEmptyC)).to.be.equal(false);
        expect(hasTriggerRules(eventListenerTriggerEmptyD)).to.be.equal(false);
        expect(hasTriggerRules(eventListenerTriggerEmptyE)).to.be.equal(false);
    });
});
