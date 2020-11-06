
import gql from 'graphql-tag';

export const importFilesMutation = gql`
mutation (
    $projectId: String!
    $files: [Upload]!
    $noValidate: Boolean, 
    $onlyValidate: Boolean, 
    $wipeCurrent: Boolean,
    $fallbackLang: String
) {
    import(
        projectId: $projectId
        files: $files
        noValidate: $noValidate
        onlyValidate: $onlyValidate
        wipeCurrent: $wipeCurrent
        fallbackLang: $fallbackLang
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
