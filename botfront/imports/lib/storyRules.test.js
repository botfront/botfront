import { expect } from 'chai';
import { hasTriggerRules } from './storyRules.utils';

// url test data

const urlTriggerExists = [
    {
        text: 'text',
        trigger: {
            url: [{ path: 'url' }],
        },
    },
];

const urlTriggerEmptyA = [
    {
        text: 'text',
        trigger: {
            url: [''],
        },
    },
];

const urlTriggerEmptyB = [
    {
        text: 'text',
        trigger: {
            url: [],
        },
    },
];

const urlTriggerEmptyC = [
    {
        text: 'text',
        trigger: {
            url: undefined,
        },
    },
];


// number of visits test data

const urlNumberOfVisitsExistsA = [
    {
        text: 'text',
        trigger: {
            numberOfVisits: '12',
        },
    },
];
const urlNumberOfVisitsExistsB = [
    {
        text: 'text',
        trigger: {
            numberOfVisits: '0',
        },
    },
];
const urlNumberOfVisitsExistsC = [
    {
        text: 'text',
        trigger: {
            numberOfVisits: 0,
        },
    },
];
const urlNumberOfVisitsEmpty = [
    {
        text: 'text',
        trigger: {
            numberOfVisits: undefined,
        },
    },
];

// number of page visits test data

const urlNumberOfPageVisitsExistsA = [
    {
        text: 'text',
        trigger: {
            numberOfPageVisits: '12',
        },
    },
];
const urlNumberOfPageVisitsExistsB = [
    {
        text: 'text',
        trigger: {
            numberOfPageVisits: '0',
        },
    },
];
const urlNumberOfPageVisitsExistsC = [
    {
        text: 'text',
        trigger: {
            numberOfPageVisits: 0,
        },
    },
];
const urlNumberOfPageVisitsEmpty = [
    {
        text: 'text',
        trigger: {
            numberOfPageVisits: undefined,
        },
    },
];

// device test data

const deviceTriggerExists = [
    {
        text: 'text',
        trigger: {
            device: 'all',
        },
    },
];

const deviceTriggerEmptyA = [
    {
        text: 'text',
        trigger: {
            device: '',
        },
    },
];
const deviceTriggerEmptyB = [
    {
        text: 'text',
        trigger: {
            device: undefined,
        },
    },
];
const deviceTriggerEmptyC = [
    {
        text: 'text',
        trigger: {
            device: null,
        },
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
    },
];
const queryStringTriggerEmptyE = [
    {
        text: 'text',
        trigger: {
            queryString: [],
        },
    },
];

// time on page test data

const timeOnPageTriggerExistsA = [
    {
        text: 'text',
        trigger: {
            timeOnPage: '12',
        },
    },
];
const timeOnPageTriggerExistsB = [
    {
        text: 'text',
        trigger: {
            timeOnPage: '0',
        },
    },
];
const timeOnPageTriggerExistsC = [
    {
        text: 'text',
        trigger: {
            timeOnPage: 0,
        },
    },
];
const timeOnPageTriggerEmpty = [
    {
        text: 'text',
        trigger: {
            timeOnPage: undefined,
        },
    },
];

// event listener test data

const eventListenerTriggerExistsA = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ selector: 'test', event: 'mouseover' }],
        },
    },
];


const eventListenerTriggerExistsB = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ selector: 'test', event: 'mouseover' }],
        },
    },
];

const eventListenerTriggerEmptyA = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ selector: 'test' }],
        },
    },
];

const eventListenerTriggerEmptyB = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ event: 'mouseover' }],
        },
    },
];

const eventListenerTriggerEmptyC = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ event: 'mouseover' }, { selector: 'test' }],
        },
    },
];

const eventListenerTriggerEmptyD = [
    {
        text: 'text',
        trigger: {
            eventListeners: [{ selector: '', event: '' }],
        },
    },
];

const eventListenerTriggerEmptyE = [
    {
        text: 'text',
        trigger: {
            eventListeners: [],
        },
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
