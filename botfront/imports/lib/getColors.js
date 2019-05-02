import randomSeed from 'random-seed';

const TODAY = new Date().toDateString();

const colors = [
    { name: 'violet', bg: '#6435C9' },
    { name: 'blue', bg: '#2185D0' },
    { name: 'orange', bg: '#F2711C' },
    { name: 'green', bg: '#21BA45' },
    { name: 'red', bg: '#DB2828' },
    { name: 'yellow', bg: '#FBBD08' },
    { name: 'teal', bg: '#00B5AD' },
    { name: 'olive', bg: '#B5CC18' },
];


const unknownColor = { name: 'grey', bg: '#aaaaaa' };

/**
 * Get a color
 * @param an index
 * @param name: return the color name if true, the color code if false
 * @returns {*}
 */
export default function getColor(index, name = false) {
    const rand = randomSeed.create(TODAY);
    const startIndex = rand(colors.length);
    const color = index < 0
        ? unknownColor
        : colors[(startIndex + index) % colors.length];

    if (name) {
        return color.name;
    } return {
        backgroundColor: color.bg,
        opacity: 0.3,
    };
}

global.getColor = getColor;
