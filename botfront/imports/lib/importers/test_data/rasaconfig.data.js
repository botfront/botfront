export const validRasaConfig = {
    filename: 'configtest.yml',
    rawText:
    `pipeline:
  - name: WhitespaceTokenizer
  - name: LexicalSyntacticFeaturizer
  - name: CountVectorsFeaturizer
  - name: CountVectorsFeaturizer
    analyzer: char_wb
    min_ngram: 1
    max_ngram: 4
  - name: DIETClassifier
    epochs: 200
  - name: >-
      rasa_addons.nlu.components.intent_ranking_canonical_example_injector.IntentRankingCanonicalExampleInjector
  - name: EntitySynonymMapper
language: en

policies:
  - name: TEDPolicy
    epochs: 50
    max_history: 5
    batch_size:
      - 32
      - 64
  - name: RulePolicy
    enable_fallback_prediction: false
  - name: AugmentedMemoizationPolicy`,
    dataType: 'rasaconfig',
};

export const validRasaConfigParsed = {
    language: 'en',
    pipeline: [
        {
            name: 'WhitespaceTokenizer',
        },
        {
            name: 'LexicalSyntacticFeaturizer',
        },
        {
            name: 'CountVectorsFeaturizer',
        },
        {
            analyzer: 'char_wb',
            max_ngram: 4,
            min_ngram: 1,
            name: 'CountVectorsFeaturizer',
        },
        {
            epochs: 200,
            name: 'DIETClassifier',
        },
        {
            name: 'rasa_addons.nlu.components.intent_ranking_canonical_example_injector.IntentRankingCanonicalExampleInjector',
        },
        {
            name: 'EntitySynonymMapper',
        },
    ],
    policies: [
        {
            batch_size: [
                32,
                64,
            ],
            epochs: 50,
            max_history: 5,
            name: 'TEDPolicy',
        },
        {
            enable_fallback_prediction: false,
            name: 'RulePolicy',
        },
        {
            name: 'AugmentedMemoizationPolicy',
        },
    ],
};
