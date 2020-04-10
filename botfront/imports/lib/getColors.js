import randomSeed from 'random-seed';

const TODAY = new Date().toDateString();

const allColors = [
    { name: 'violet', bg: '#6435C9' },
    { name: 'blue', bg: '#2185D0' },
    { name: 'orange', bg: '#F2711C' },
    { name: 'green', bg: '#21BA45' },
    { name: 'red', bg: '#DB2828' },
    { name: 'yellow', bg: '#FBBD08' },
    { name: 'teal', bg: '#00B5AD' },
    { name: 'pink', bg: '#E03997' },
    { name: 'brown', bg: '#A5673F' },
    { name: 'olive', bg: '#B5CC18' },
];

const hashCode = input => Math.abs(Array.from(`${input}`)
    .reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) || 0, 0));

/**
 * Get a color
 * @param index: an index, or string
 * @param name: return the color name if true, the color code if false
 * @returns {*}
 */
export default function getColor(index, name = false, exclude = []) {
    const colors = allColors.filter(c => !exclude.includes(c.name));
    const rand = randomSeed.create(TODAY);
    const startIndex = rand(colors.length);
    const color = colors[(startIndex + hashCode(index)) % colors.length];

    if (name) {
        return color.name;
    } return {
        backgroundColor: color.bg,
        opacity: 0.3,
    };
}

global.getColor = getColor;
