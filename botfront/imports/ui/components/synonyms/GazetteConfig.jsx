

const modeDefault = "ratio";
const minScoreDefault = 80;

export function setGazetteDefaults(gazette) {
    gazette.mode = gazette.mode || modeDefault;
    gazette.min_score = gazette.min_score || minScoreDefault;
}