
import gql from 'graphql-tag';

export const importFilesMutation = gql`
mutation (
    $projectId: String!
    $files: [Upload]!
    $onlyValidate: Boolean
    $wipeInvolvedCollections: Boolean
    $wipeProject: Boolean
    $fallbackLang: String!
) {
    import(
        projectId: $projectId
        files: $files
        onlyValidate: $onlyValidate
        wipeInvolvedCollections: $wipeInvolvedCollections
        fallbackLang: $fallbackLang
        wipeProject:$wipeProject
    ) {
        fileMessages {
            errors { text, longText }
            warnings { text, longText }
            info { text, longText }
            conflicts
            filename        
        }
        summary { text, longText }
    }
}
`;
