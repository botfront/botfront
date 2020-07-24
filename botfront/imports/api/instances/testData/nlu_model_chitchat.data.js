const data = {
    _id: 'test_model',
    name: 'chitchat-en',
    language: 'en',
    config: 'pipeline:\n  - name: WhitespaceTokenizer\n  - name: LexicalSyntacticFeaturizer\n  - name: CountVectorsFeaturizer\n  - name: CountVectorsFeaturizer\n    analyzer: char_wb\n    min_ngram: 1\n    max_ngram: 4\n  - name: DIETClassifier\n    epochs: 100\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: >-\n      rasa_addons.nlu.components.intent_ranking_canonical_example_injector.IntentRankingCanonicalExampleInjector\n  - name: EntitySynonymMapper',
    evaluations: [],
    intents: [],
    chitchat_intents: [],
    training_data: {
        common_examples: [
            {
                _id: 'd513ca5e-27d8-4911-814a-37247765bcf5',
                text: 'tt',
                intent: 'chitchat.tell_me_a_joke',
                canonical: false,
                entities: [],
                updatedAt: {
                    $date: '2020-07-17T20:08:45.208Z',
                },
            },
            {
                _id: 'e8a9e347-efee-4af1-8bb6-9e4457468633',
                text: 'iuiyug',
                intent: 'hi',
                canonical: true,
                entities: [],
                updatedAt: {
                    $date: '2020-07-17T17:36:52.594Z',
                },
            },
            {
                text: 'tell me a joke',
                intent: 'chitchat.tell_me_a_joke',
                entities: [],
                _id: 'b798138c-e441-42b4-92a3-5bb8bba93936',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.153Z',
                },
            },
            {
                text: 'I wanna hear a good one',
                intent: 'chitchat.tell_me_a_joke',
                entities: [],
                _id: '29401db3-ce33-4b8f-97a9-4c4ac603dcb5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.156Z',
                },
            },
            {
                text: 'you are amazing',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '44a32d28-4a88-4dd9-b3a6-87939e023709',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.157Z',
                },
            },
            {
                text: 'you are awesome',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '400361f5-66b2-4389-b4c1-6a2f1e1a2958',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.159Z',
                },
            },
            {
                text: 'you are cool',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '86d78c1e-9a35-4f1a-966a-4be66507ef9b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.160Z',
                },
            },
            {
                text: 'you are really good',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'a6b1ec99-8255-4cfa-be29-bb4a11d6e2ba',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.162Z',
                },
            },
            {
                text: 'you are really nice',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'b1d572ee-fd3c-4fb8-812f-4b6ea2513707',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.163Z',
                },
            },
            {
                text: 'you are so amazing',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '6db2f038-8b54-49e4-8cd4-6dc0cbb4958b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.165Z',
                },
            },
            {
                text: '10 min ago',
                intent: 'basics.time',
                entities: [],
                _id: 'bea2502e-7c86-4bab-a6a5-7084d6589cb3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.167Z',
                },
            },
            {
                text: 'you are so lovely',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '0170e8e6-1ef5-4191-b526-ff60f6c8c055',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.170Z',
                },
            },
            {
                text: 'you are so fine',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'c6d61d5a-5ccc-45ac-8475-e77a4e526b13',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.172Z',
                },
            },
            {
                text: 'you are the nicest person in the world',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'c5dccb6d-c5cf-434f-80b5-fa37f99c299f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.173Z',
                },
            },
            {
                text: 'you are so good',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '080835c6-61ad-4b73-8350-9b9fef589a8f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.176Z',
                },
            },
            {
                text: 'you are the best ever',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '0eec0129-e7c7-4bf3-8fd6-df63173c36fa',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.178Z',
                },
            },
            {
                text: 'you are so helpful',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '6122072c-39dc-45fa-910a-c253126b351e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.180Z',
                },
            },
            {
                text: 'you are the best in the world',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '2db3f159-0d44-4df2-a556-570cb697021b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.181Z',
                },
            },
            {
                text: 'you are very cool',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'cb991723-f5c3-4a08-b698-e942fa564c01',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.183Z',
                },
            },
            {
                text: 'you are too good',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '499042e3-2362-4833-9176-f3ba9f203ecd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.184Z',
                },
            },
            {
                text: 'you are very lovely',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'f038dc22-1558-4c5c-be5e-552816d720e9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.186Z',
                },
            },
            {
                text: 'you are very kind',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '316f827f-b81a-4ebd-bbee-3007eb843f0e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.188Z',
                },
            },
            {
                text: 'you are wonderful',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'd07eaea7-454f-402b-bcde-f527d89ea740',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.189Z',
                },
            },
            {
                text: 'you made my day',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '6a69d76c-28e6-4971-8e1c-59521e6a256b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.191Z',
                },
            },
            {
                text: 'you are very useful',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '491c98a7-9d9d-485d-8dcf-34849312ef90',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.193Z',
                },
            },
            {
                text: 'you rock',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '6276731b-0a85-4d1f-b91d-ffea813695ba',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.194Z',
                },
            },
            {
                text: 'you almost sound human',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '0cbc8c85-4883-4cf0-8656-19abd7b91391',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.196Z',
                },
            },
            {
                text: 'you make my day',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '34da6963-ef59-4da0-adbd-18ed4cd7e101',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.198Z',
                },
            },
            {
                text: 'I\'d like to tell everyone that you are awesome',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '15e58fd7-bf8a-4ae5-9f54-cd63b31d23eb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.199Z',
                },
            },
            {
                text: 'I want to tell everyone how awesome you are',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '90519ea2-a7d4-4bae-a6ff-6e7df7a02557',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.201Z',
                },
            },
            {
                text: 'you\'re just super',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '7f049559-5bf0-4bbf-92f0-496aea6cf61c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.202Z',
                },
            },
            {
                text: 'you are so awesome',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'fc9e149f-fca2-421e-b1b6-9eb0d2a89e5c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.204Z',
                },
            },
            {
                text: 'you are so cool',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '458c11b6-c91e-49a0-b370-69cab031e6c9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.206Z',
                },
            },
            {
                text: 'I want to let everyone know that you are awesome',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '5bcfbae6-85df-4197-b6ef-f3401e2a7af4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.207Z',
                },
            },
            {
                text: 'cancel',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '82b690b8-629b-4024-a817-896c4d0054d4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.209Z',
                },
            },
            {
                text: 'in about 2 weeks',
                intent: 'basics.time',
                entities: [],
                _id: 'cf9a6683-25d9-4869-8ccf-5e4d25f8505d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.210Z',
                },
            },
            {
                text: 'I changed my mind',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '56bec632-e722-42ba-b874-7309df6bf2e1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.212Z',
                },
            },
            {
                text: 'this is frustrating',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'b084b4c5-4f54-417c-adb1-58fb3ce6acab',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.213Z',
                },
            },
            {
                text: 'cannot believe this',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '10f97b54-6f5b-4da6-a08b-73f2eedef657',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.215Z',
                },
            },
            {
                text: 'you\'re the worst',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: 'a68327ff-0182-449b-9fd9-aee850a29c96',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.216Z',
                },
            },
            {
                text: 'you\'re the worst ever',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '310d6cb0-9583-4d25-8db1-322fe208fff3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.219Z',
                },
            },
            {
                text: 'you\'re worthless',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '45e7fa60-1519-4c29-97eb-5889249de8b5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.221Z',
                },
            },
            {
                text: 'you\'re cute',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '3d738c28-89df-43fe-b90d-efb87e9407b2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.222Z',
                },
            },
            {
                text: 'you\'re attractive',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '150b63d0-a944-4003-ad80-66f9289b0ca1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.224Z',
                },
            },
            {
                text: 'you are beautiful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '7a7f606f-1f62-480c-a5c5-e19fcb34dc14',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.226Z',
                },
            },
            {
                text: 'you\'re looking good today',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '3089b5f0-a4ec-4d5c-8c33-fc515c2f2ed6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.227Z',
                },
            },
            {
                text: 'you are so beautiful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'bdb519ed-ddcc-4acd-89b6-dbed55e2f7b2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.228Z',
                },
            },
            {
                text: 'you look amazing',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'c9828cfb-c20a-44b9-86d9-5f8e764f25bd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.230Z',
                },
            },
            {
                text: 'you look so good',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '9c12958a-f2e5-4aed-9dec-c94f422f2a47',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.231Z',
                },
            },
            {
                text: 'you\'re so gorgeous',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'b72d9999-2756-4514-bc9f-0423fb466e3f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.233Z',
                },
            },
            {
                text: 'you are too beautiful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '69039ad9-ce29-4920-84ed-ef71d1de8e42',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.236Z',
                },
            },
            {
                text: 'you look great',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'f4731685-59ae-460c-92fc-74d2d6e14750',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.238Z',
                },
            },
            {
                text: 'human now',
                intent: 'basics.request_handover',
                entities: [],
                _id: '1d98054c-dd17-4791-848d-adfe0f8f3b48',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.241Z',
                },
            },
            {
                text: 'get me in touch with a person',
                intent: 'basics.request_handover',
                entities: [],
                _id: '0cd9468b-35fe-4ec1-8cf4-54775b7c453a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.242Z',
                },
            },
            {
                text: 'human needed',
                intent: 'basics.request_handover',
                entities: [],
                _id: 'd4b07ca9-8025-4108-a01c-3711cd3c5f9c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.244Z',
                },
            },
            {
                text: 'I\'d like to speak to a human',
                intent: 'basics.request_handover',
                entities: [],
                _id: 'e4ab9369-340a-40b5-9e2d-51247e74bd58',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.245Z',
                },
            },
            {
                text: 'I want to speak to a real person',
                intent: 'basics.request_handover',
                entities: [],
                _id: 'ea46fd79-3250-4e19-b39f-e444ded3aed6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.247Z',
                },
            },
            {
                text: 'you look so well',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '1c376fde-0749-43d7-beef-2672ff3d3011',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.248Z',
                },
            },
            {
                text: 'I like the way you look now',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '5ceee182-e1cf-4d47-a0a1-d33cbe2de6e4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.250Z',
                },
            },
            {
                text: 'I think you\'re beautiful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '55bf2191-45c7-406c-83ad-4f4191deb9b5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.251Z',
                },
            },
            {
                text: 'why are you so beautiful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '4bb5e7e1-1abc-428e-8c5a-d338311100e6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.253Z',
                },
            },
            {
                text: 'you are so beautiful to me',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '96d7ebc2-cfea-4b18-9e38-5e67d0f8e659',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.255Z',
                },
            },
            {
                text: 'you are cute',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '3d215aa8-ac1e-4c2c-b119-40570feeb9e9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.257Z',
                },
            },
            {
                text: 'you are gorgeous',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '013d9c53-8772-494c-9f7e-b52ab2f19cf6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.259Z',
                },
            },
            {
                text: 'you are handsome',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'b5c6b2f2-f721-447b-8e6b-33911fad1822',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.261Z',
                },
            },
            {
                text: 'you are looking awesome',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'eb56bfde-db58-47cb-867b-6ce0d37a16f4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.262Z',
                },
            },
            {
                text: 'you look amazing today',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '1f7fd046-b975-4ed7-bed1-1b6d7eaf4f0b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.264Z',
                },
            },
            {
                text: 'you are looking beautiful today',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '13feeebf-58fe-4b8a-87d9-9addd7a12053',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.265Z',
                },
            },
            {
                text: 'you are looking great',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '474df93f-8a84-4fd0-951d-7500074e6eae',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.267Z',
                },
            },
            {
                text: 'you are looking pretty',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'b988cd48-0548-45c3-89cb-4ffe197975db',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.268Z',
                },
            },
            {
                text: 'you are looking so beautiful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'a4137baf-bcea-442d-845f-b1fdbd9a6c6a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.270Z',
                },
            },
            {
                text: 'you are looking so good',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '74c1adc0-4a6c-4b14-9831-77e4e8c27a32',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.272Z',
                },
            },
            {
                text: 'you are pretty',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '15397d20-f16c-4c82-b307-a17d55fb5598',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.273Z',
                },
            },
            {
                text: 'you are really beautiful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'f280d441-8a16-4c8a-83de-f11e45178736',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.277Z',
                },
            },
            {
                text: 'you are really cute',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '92438ee6-a2f6-46f2-b4a0-aa17ee489e0f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.279Z',
                },
            },
            {
                text: 'you are really pretty',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '5755b633-db35-4579-8b70-82f7d530d16a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.281Z',
                },
            },
            {
                text: 'you are so attractive',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'dd6b36a8-3195-4e35-b164-1b1bf9953c71',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.282Z',
                },
            },
            {
                text: 'you are so beautiful today',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '3d58c4e3-b518-4c4b-a732-71915ce53329',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.284Z',
                },
            },
            {
                text: 'you are very attractive',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'f04cf3dd-036d-4506-ac03-85788563d563',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.285Z',
                },
            },
            {
                text: 'you are so cute',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'aae589c4-b5a9-4cc1-9d04-fd12b2dc1b31',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.287Z',
                },
            },
            {
                text: 'you are so gorgeous',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'be510338-095d-42de-b610-c15358981780',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.289Z',
                },
            },
            {
                text: 'you are so handsome',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '82f96168-cb2f-4dab-8353-b2bf0ce82fc3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.291Z',
                },
            },
            {
                text: 'you look gorgeous',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'fa306df9-7d67-4a90-8e4b-90e8539aa05b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.292Z',
                },
            },
            {
                text: 'you are so pretty',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '8d8946cf-c8a4-4926-a126-1a5471f7608d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.293Z',
                },
            },
            {
                text: 'you are very beautiful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'e89b0aab-9494-4da4-b03b-37145fe4d08e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.295Z',
                },
            },
            {
                text: 'you look great today',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '1fe3e0a3-4758-4a43-9869-6cd4776509fb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.296Z',
                },
            },
            {
                text: 'you look perfect',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'c6b1aadb-0581-4058-ae12-1f7789c77e45',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.298Z',
                },
            },
            {
                text: 'you are very cute',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '471cf783-3789-48fd-891a-2869b9404e1e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.300Z',
                },
            },
            {
                text: 'you are very pretty',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '284b4328-11dd-4d31-823f-76305dcae36a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.302Z',
                },
            },
            {
                text: 'you look pretty good',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'bf853b44-bb4c-428a-9918-398b9430da74',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.304Z',
                },
            },
            {
                text: 'you look cool',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'f75728ec-bcbe-411a-ae4b-4ee88f9a7093',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.306Z',
                },
            },
            {
                text: 'you look awesome',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'a8d39901-5360-42d4-8505-f3f1d780bd0a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.308Z',
                },
            },
            {
                text: 'you look so beautiful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'dc6db1bd-fd17-4b8c-b56a-98b5fb8319a8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.309Z',
                },
            },
            {
                text: 'you look fantastic',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '3312bf46-e621-46d2-a9c9-faaadcbfb0a9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.311Z',
                },
            },
            {
                text: 'you look very pretty',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '32a50ad2-b689-4c61-8a51-8d899082bfcf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.312Z',
                },
            },
            {
                text: 'you look so beautiful today',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'd6df2ce2-ef91-422a-9148-40bffd680489',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.315Z',
                },
            },
            {
                text: 'you look wonderful',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '0064e11e-98c1-435b-9b4c-7adaf410e841',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.317Z',
                },
            },
            {
                text: 'I like the way you look',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'a7270814-c936-4771-995e-0b578038f849',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.319Z',
                },
            },
            {
                text: 'you look wonderful today',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '3ba8e997-a610-46a8-80ce-7a808ff4ea8a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.320Z',
                },
            },
            {
                text: 'you are cutie',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'b54b957d-1659-42a0-a282-ea5a0638e0f0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.322Z',
                },
            },
            {
                text: 'you\'re looking good',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: 'a605db68-1754-46ca-80d2-f690087f6747',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.324Z',
                },
            },
            {
                text: 'you\'re pretty',
                intent: 'chitchat.you_are_pretty',
                entities: [],
                _id: '4a4298c2-7ca0-4c00-ad48-d7a7f617804c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.326Z',
                },
            },
            {
                text: 'you are boring',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: 'dc7e098c-34ae-4e05-a3c2-c8433f18509f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.327Z',
                },
            },
            {
                text: 'you\'re so boring',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: 'ef6043c8-832c-4e76-8bbf-bfb30b1ff956',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.329Z',
                },
            },
            {
                text: 'how boring you are',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: '8c9983e4-212f-40e5-8874-43e34d702920',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.330Z',
                },
            },
            {
                text: 'you\'re really borin',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: 'e22d0731-be36-4b0f-85a1-d34dccc98dc3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.331Z',
                },
            },
            {
                text: 'I need you to do something for me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '329e183d-d8b9-44e5-a0b0-586e4a434d5f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.333Z',
                },
            },
            {
                text: 'I need you to help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'caef9b45-f1a2-4077-805a-97f174ef9ddb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.334Z',
                },
            },
            {
                text: 'you are very boring',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: '45b68159-be3c-4c10-bb46-e9d1d2ae5eb2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.336Z',
                },
            },
            {
                text: 'I need a hand',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '89b63316-3356-458a-a3d6-3dc023ac78b0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.338Z',
                },
            },
            {
                text: 'help me with a problem',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'b4bc5693-58e0-4d1c-8eca-4863b97991c7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.340Z',
                },
            },
            {
                text: 'you\'re incredibly b',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: 'cfd642b1-f85d-44e3-925b-82f2ced9021a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.342Z',
                },
            },
            {
                text: 'can you do something for me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '624c0a02-b01d-4d05-85c0-140ca220c13d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.344Z',
                },
            },
            {
                text: 'assistance',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'caa1b9c6-097d-44d8-bc81-c160b2bd626a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.345Z',
                },
            },
            {
                text: 'you are boring me',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: '0137c73b-ce76-467c-b332-c5748a572beb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.347Z',
                },
            },
            {
                text: 'help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '11328513-e5e7-4ebb-bfc6-889f4ae8b3ed',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.348Z',
                },
            },
            {
                text: 'you can help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '57e9d331-3d4b-42bf-b10f-d4529658370b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.350Z',
                },
            },
            {
                text: 'can you help me with something',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '653b4fda-2e7a-4139-bf16-b200de91030f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.351Z',
                },
            },
            {
                text: 'I need help',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '73181875-3ffa-462e-b613-e44fb38f7500',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.353Z',
                },
            },
            {
                text: 'I need your help',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '9d319e87-443d-40d9-a9f3-37ddfb884e5e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.355Z',
                },
            },
            {
                text: 'assist',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'dc7017d0-2939-4124-858b-3aee968feaa4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.356Z',
                },
            },
            {
                text: 'can you help',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'a7000f14-7923-4c8a-9735-6163d522f707',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.358Z',
                },
            },
            {
                text: 'can u help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '6ebb333d-80c6-40e9-b1df-a69dfdfb32f7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.359Z',
                },
            },
            {
                text: 'can you help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'd1a409ad-8d73-468d-be90-1b20b8bf41bd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.361Z',
                },
            },
            {
                text: 'I need some help',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '26a5bb4f-f0c8-46bc-a86e-ac89d52d4a38',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.363Z',
                },
            },
            {
                text: 'you help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'da3cddeb-8014-4d42-8c37-81c5b94d1375',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.365Z',
                },
            },
            {
                text: 'I need you',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '73e7b0f4-8492-46ce-85e0-ddae1fdb309a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.366Z',
                },
            },
            {
                text: 'need help',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '6f45607c-02b1-4b83-b982-52c06ef9c1a1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.368Z',
                },
            },
            {
                text: 'can you help me now',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'c02d294d-117c-414c-9ea8-f2e91510e86b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.370Z',
                },
            },
            {
                text: 'can you help me out',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '41dc4730-b470-4352-8618-5c7c0f8fecbf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.372Z',
                },
            },
            {
                text: 'assist me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '7edbd1a4-ed5c-4d15-83df-d8d71463856e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.374Z',
                },
            },
            {
                text: 'I want your help',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'b8adedc8-be49-42d9-8b74-b48130fdb4f9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.375Z',
                },
            },
            {
                text: 'help',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '8d721eeb-e7d6-4c3b-8003-e1bacd96f375',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.377Z',
                },
            },
            {
                text: 'could you give me a hand',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '8a1cece6-a4b3-4e07-bef3-5e1f02b16998',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.378Z',
                },
            },
            {
                text: 'can you help me with that',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '9e63e0d8-0610-469c-866c-823f3eb66ad9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.380Z',
                },
            },
            {
                text: 'are you going to help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '9049ee9a-aec3-4f06-a6dc-b6406269078b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.381Z',
                },
            },
            {
                text: 'need your help',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '97644c16-5e48-4ff8-9e5a-740db22d6bdd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.385Z',
                },
            },
            {
                text: 'will you help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '25fa1d42-afbb-482d-848f-c5373b8e87c9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.387Z',
                },
            },
            {
                text: 'I need you right now',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'a9685160-4e5d-4650-b0c2-e06af44d2b5b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.389Z',
                },
            },
            {
                text: 'do you help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '9f5ba61a-1b3e-47b7-aa7c-bbbc2f90f7bb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.390Z',
                },
            },
            {
                text: 'please help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '6b35c521-8cf0-4e4b-a247-5f231c7e9d72',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.392Z',
                },
            },
            {
                text: 'can help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'e8641aa8-ea7f-49da-90a1-564428959d0f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.393Z',
                },
            },
            {
                text: 'would you help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'ef8eda8e-af4f-469c-9f10-e2824cf628e2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.395Z',
                },
            },
            {
                text: 'you are chatbot',
                intent: 'chitchat.are_you_a_robot',
                entities: [],
                _id: '4c154c02-7ed5-4cee-bb13-fed6f3db8ddc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.397Z',
                },
            },
            {
                text: 'do you want to help me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '33e268aa-75f4-463a-83d1-372db3af6e15',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.398Z',
                },
            },
            {
                text: 'sos',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'e435c74c-c887-4ab9-af90-ebdb286aa208',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.400Z',
                },
            },
            {
                text: 'do me a favor',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: 'cbb2bfc7-1e63-4ae8-92d3-a2612b9d9c95',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.403Z',
                },
            },
            {
                text: 'can you help us',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '17780e01-c20a-4a87-9562-571a88989a63',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.408Z',
                },
            },
            {
                text: 'are you a chatbot',
                intent: 'chitchat.are_you_a_robot',
                entities: [],
                _id: '6a0a0b9a-7477-4bda-ba26-5c5bec5c27a4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.410Z',
                },
            },
            {
                text: 'are you just a bot',
                intent: 'chitchat.are_you_a_robot',
                entities: [],
                _id: 'b3c58a37-3576-481e-9cf0-8a4b6ea37284',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.411Z',
                },
            },
            {
                text: 'you are a bot',
                intent: 'chitchat.are_you_a_robot',
                entities: [],
                _id: '131aea7c-921f-4661-9050-7b0ea8fa6dfa',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.412Z',
                },
            },
            {
                text: 'are you a bot',
                intent: 'chitchat.are_you_a_robot',
                entities: [],
                _id: '8bd3a136-3b55-4329-b327-0aa89632d89e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.414Z',
                },
            },
            {
                text: 'can you assist me',
                intent: 'chitchat.i_need_help',
                entities: [],
                _id: '3a48c943-19c1-4ada-987c-42eb9132396b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.415Z',
                },
            },
            {
                text: 'are you a robot',
                intent: 'chitchat.are_you_a_robot',
                entities: [],
                _id: 'dcb47481-2742-4753-8f7e-9d3f933b3552',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.417Z',
                },
            },
            {
                text: 'are you a program',
                intent: 'chitchat.are_you_a_robot',
                entities: [],
                _id: 'd5cd89e0-915d-4e05-aaac-763ce9e5abbe',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.418Z',
                },
            },
            {
                text: 'you\'re really smart',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '83439bf2-b45e-4a48-9967-9dbcd81a40da',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.420Z',
                },
            },
            {
                text: 'clever',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: 'd76f5a98-2670-4b2a-ac46-03b798edb6fe',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.422Z',
                },
            },
            {
                text: 'you\'re a robot',
                intent: 'chitchat.are_you_a_robot',
                entities: [],
                _id: 'a09968b9-f97b-4942-81c9-91d72faeb2a9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.424Z',
                },
            },
            {
                text: 'you are so brainy',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: 'e2f43705-abab-4c17-83ff-b82b0052322f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.426Z',
                },
            },
            {
                text: 'you know a lot of things',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '74aa9b3f-3596-483c-a32b-f6e2f58ff7e7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.427Z',
                },
            },
            {
                text: 'you know a lot',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: 'acaecb01-5dde-4a37-8ff9-76a12f7192d8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.429Z',
                },
            },
            {
                text: 'you are clever',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: 'b6abc4b2-3c63-4dc5-bb69-5c17fecaa8d1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.431Z',
                },
            },
            {
                text: 'how smart you are',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '32a07937-62a8-41df-a91d-e7ac416a7efb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.433Z',
                },
            },
            {
                text: 'you\'re really brainy',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '5cdbe4fe-a01c-4619-bd9e-154be352dd59',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.434Z',
                },
            },
            {
                text: 'how brilliant you are',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '81b1cc0e-fe46-4f29-94a0-0554fc8a2f56',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.437Z',
                },
            },
            {
                text: 'you know so much',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '0cc5a3f4-d99c-46f3-a1f7-05afed862532',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.439Z',
                },
            },
            {
                text: 'how clever you are',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '0625c142-4295-4c0e-9a39-1a5599776c7a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.441Z',
                },
            },
            {
                text: 'you are intelligent',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: 'ad52f6af-70ee-4b84-9b0a-64ce8c3648a9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.443Z',
                },
            },
            {
                text: 'you have a lot of knowledge',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '0d396ee1-47b1-470d-81b2-dc3604f5444c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.445Z',
                },
            },
            {
                text: 'how brainy you are',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '98fa0848-97a4-451d-8967-51d932861f06',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.446Z',
                },
            },
            {
                text: 'you\'re very smart',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '6a24a3b7-d48b-476f-a630-d182d12f512e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.448Z',
                },
            },
            {
                text: 'you are really smart',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '181d0f03-0384-4f2b-8781-56635d3f6803',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.451Z',
                },
            },
            {
                text: 'you are so smart',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '5f30e54f-8b0c-4f6b-ba9a-8648fa466175',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.452Z',
                },
            },
            {
                text: 'you are a genius',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '9cbd4450-6b38-4e7f-b4ab-508c3bb64932',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.454Z',
                },
            },
            {
                text: 'you are qualified',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: 'af7733f8-b51f-4ddf-8190-017b8e0c4a54',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.455Z',
                },
            },
            {
                text: 'you are too smart',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '0d9075e6-f3b0-4c24-a724-37951c9b49ec',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.457Z',
                },
            },
            {
                text: 'you are very clever',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: 'b7577605-c326-4fae-a29d-c405b6439e4b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.458Z',
                },
            },
            {
                text: 'are you nuts',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: 'd2f265d9-1308-4af0-bdf6-cf27c150c0ff',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.460Z',
                },
            },
            {
                text: 'you are very intelligent',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '0f9b0e36-f97c-470d-8e28-2870b969d77d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.462Z',
                },
            },
            {
                text: 'you are very smart',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '01994499-175f-4535-9289-8adf4792daf2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.463Z',
                },
            },
            {
                text: 'you are a weirdo',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: 'd4672e65-5d11-4199-9246-a684df53e3a8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.465Z',
                },
            },
            {
                text: 'smart',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '72c27f59-c9f2-4e2c-8dfd-ae8efa3c4712',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.467Z',
                },
            },
            {
                text: 'you\'re intelligent',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '41fab943-6768-400f-a0b3-713093653a2a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.469Z',
                },
            },
            {
                text: 'you\'re a genius',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: 'af26fac4-de30-47e8-ae43-dd321b861078',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.471Z',
                },
            },
            {
                text: 'you\'re a smart cookie',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '25b54bdf-7b31-4056-8383-60d8ed8ebdeb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.472Z',
                },
            },
            {
                text: 'you\'re clever',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '3f5bf39c-3f24-4a42-8d60-6f6519a82f4f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.474Z',
                },
            },
            {
                text: 'you\'re qualified',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '45abaaf6-e8c9-4955-8461-e75b0c2dc1df',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.475Z',
                },
            },
            {
                text: 'you\'re pretty smart',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '6ea63e2e-f757-4ddf-bb18-11b389c54c53',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.476Z',
                },
            },
            {
                text: 'why are you so smart',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '0f1bb48e-d952-43e2-a6a7-23ab1ab6f6b7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.478Z',
                },
            },
            {
                text: 'you are so clever',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: 'd4c39c9d-4f37-4d76-bde0-babdfb40f684',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.480Z',
                },
            },
            {
                text: 'you are so intelligent',
                intent: 'chitchat.you_are_smart',
                entities: [],
                _id: '80f41b16-ebb3-4cad-8e2a-8e9459bad45f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.484Z',
                },
            },
            {
                text: 'you\'re nuts',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: '54589207-9acf-4422-8835-7ecb6a606652',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.486Z',
                },
            },
            {
                text: 'you are crazy',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: 'a1909005-be9a-4d6d-b1b9-94371c6f503c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.487Z',
                },
            },
            {
                text: 'you\'re out of your mind',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: '47a777e5-bae0-4091-bb1a-eb464101cd0f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.489Z',
                },
            },
            {
                text: 'you\'re so crazy',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: 'b0d7c9b6-7e76-419e-afad-0be22acac8b2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.490Z',
                },
            },
            {
                text: 'how crazy you are',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: '1db2c1f5-d30e-49e9-a04d-3394570d5d19',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.492Z',
                },
            },
            {
                text: 'you\'re so out of your mind',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: 'e4354014-af06-4226-9479-ecfac26f82d3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.493Z',
                },
            },
            {
                text: 'you went crazy',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: '6ea9b090-97ca-4433-9042-44b633ed035a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.495Z',
                },
            },
            {
                text: 'I think you\'re crazy',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: '3f68edab-39f3-41b1-9b5f-2e80ea7422b5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.496Z',
                },
            },
            {
                text: 'are you crazy',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: 'bbb6981a-0c52-40f3-a205-52e2d2d0980f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.498Z',
                },
            },
            {
                text: 'you are insane',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: 'f446b5a4-6a67-4ad2-b55f-31d148f4b703',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.501Z',
                },
            },
            {
                text: 'you are mad',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: '77e5338c-dafa-4a4e-bab9-2461a42764f5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.504Z',
                },
            },
            {
                text: 'you make me laugh a lot',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: 'ec394e40-ca7a-46de-bb27-26ba0a5546b9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.506Z',
                },
            },
            {
                text: 'you are hilarious',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: 'ced96b35-770e-4f0e-90d4-05beadb87c96',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.508Z',
                },
            },
            {
                text: 'you are really funny',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: 'db21aa9d-9f48-4d52-aa43-31d370dec723',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.510Z',
                },
            },
            {
                text: 'you make me laugh',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: '0604f3a5-79a3-47a2-ac35-080c8297d6d1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.511Z',
                },
            },
            {
                text: 'you\'re a very funny bot',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: '1831c977-7ab0-46cc-af1b-3470760bc1ac',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.512Z',
                },
            },
            {
                text: 'you\'re the funniest bot I\'ve talked to',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: '64d88377-9043-4589-a54b-904c69e3a1a0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.515Z',
                },
            },
            {
                text: 'you\'re so funny',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: '1b8b847f-d0e4-4060-9a28-e27cd2871df6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.517Z',
                },
            },
            {
                text: 'are you mad',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: '61d45bac-abfc-417a-a5d4-d92d80f0bcb6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.521Z',
                },
            },
            {
                text: 'are you insane',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: '6b961f11-2922-4057-a6ed-ca33c2211582',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.525Z',
                },
            },
            {
                text: 'are you mad at me',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: 'ce9bc03c-11e6-439c-b2df-54d59f4674b4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.527Z',
                },
            },
            {
                text: 'are you mad or what',
                intent: 'chitchat.you_are_crazy',
                entities: [],
                _id: '42236c77-2a8f-4396-8470-6ed5b82f0f3c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.528Z',
                },
            },
            {
                text: 'you\'re really funny',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: 'f350fc2b-68ec-44d1-8cdf-d2abd635e3f5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.530Z',
                },
            },
            {
                text: 'how funny you are',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: '5336d76b-87a2-45dd-a78f-c7059fc2a680',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.531Z',
                },
            },
            {
                text: 'you\'re incredibly funny',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: 'd3cb7a3b-af03-484a-94db-19ad6bd48321',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.533Z',
                },
            },
            {
                text: 'you are funny',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: 'd609be81-390b-489b-8dc7-2a17201f20ed',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.534Z',
                },
            },
            {
                text: 'you are so funny',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: 'c8d4d6b0-4194-4dd3-afde-97f25d1fdeb6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.536Z',
                },
            },
            {
                text: 'you are very funny',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: '01962225-ca49-4bfb-823f-79b5e8e7e542',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.538Z',
                },
            },
            {
                text: 'you\'re the funniest',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: 'd484009f-6834-417d-adbc-efa29645f2fe',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.540Z',
                },
            },
            {
                text: 'that was funny',
                intent: 'chitchat.you_are_funny',
                entities: [],
                _id: '24804460-d0cd-4649-9ab8-5928529f5750',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.542Z',
                },
            },
            {
                text: 'you are very helpful',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'a283da11-c45e-4fdb-aace-d5c50d323039',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.544Z',
                },
            },
            {
                text: 'you are the best',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '549fb661-0be6-4e6f-8ae1-1f0cfb08882e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.545Z',
                },
            },
            {
                text: 'you\'re a true professional',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '70cca158-b8d6-4c1e-8124-021d91af505a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.547Z',
                },
            },
            {
                text: 'you are good',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'afee0a16-c0e3-42a0-99fc-9344ef068903',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.549Z',
                },
            },
            {
                text: 'you work well',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'eaa507bd-3db2-4ebb-b262-a5f9a4a9171d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.550Z',
                },
            },
            {
                text: 'you are good at it',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '6ec5bdd9-db81-452a-a57b-5363ca491cc9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.552Z',
                },
            },
            {
                text: 'you are very good at it',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'b5a6006b-fae9-4013-b635-4982474603ac',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.553Z',
                },
            },
            {
                text: 'you are a pro',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '53f515c5-4aed-4928-88fc-988150a79512',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.555Z',
                },
            },
            {
                text: 'you are a professional',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '826dd279-54b8-4a62-84d2-d9cfd4af6011',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.557Z',
                },
            },
            {
                text: 'you\'re awesome',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '58f9931f-f325-4749-80a8-b780a665f016',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.559Z',
                },
            },
            {
                text: 'you work very well',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '0a8077ed-0d20-4c68-9c38-80d0690cd70b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.560Z',
                },
            },
            {
                text: 'you\'re perfect',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'c4812d3d-ed1b-41dc-ab37-8ecd08d9b203',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.562Z',
                },
            },
            {
                text: 'you\'re great',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: 'd31db9ca-4128-4c05-b2b6-d76469d9739b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.563Z',
                },
            },
            {
                text: 'you\'re so kind',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '83c7a731-fd48-4342-8d0c-db5338b31286',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.565Z',
                },
            },
            {
                text: 'let\'s tell everyone that you are awesome',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '259c6fa3-0735-4726-b6f3-b1f5124650ce',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.567Z',
                },
            },
            {
                text: 'you are really amazing',
                intent: 'chitchat.you_are_good',
                entities: [],
                _id: '20ded95c-b878-4d53-8044-7fd2396aa40e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.569Z',
                },
            },
            {
                text: 'are you happy',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: 'ed16d297-5246-4b1e-a993-3cde8fbfa657',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.570Z',
                },
            },
            {
                text: 'you are happy',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: 'c2458577-f8db-4eed-aea5-b82a5f1b41fc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.572Z',
                },
            },
            {
                text: 'where\'s your house',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '7ebed49d-8d18-46d5-b571-5d4f6195de29',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.573Z',
                },
            },
            {
                text: 'your city',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '7648806a-c8c1-4ea2-9790-968f15f627a4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.575Z',
                },
            },
            {
                text: 'you\'re very happy',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: 'eebdbfec-57c6-4d98-8155-1cdcada37146',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.576Z',
                },
            },
            {
                text: 'that\'s true',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'c86b0078-74a3-40cd-9d60-cbe89d5120e8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.578Z',
                },
            },
            {
                text: 'where you live',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: 'e6226a67-da69-4fec-945a-e05a528bdbba',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.579Z',
                },
            },
            {
                text: 'your town',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: 'af9c1ec9-f325-4786-8ee8-0665b7eac41d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.580Z',
                },
            },
            {
                text: 'you are right',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'c0adfeec-ac41-4f56-9c65-491a81143c4d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.582Z',
                },
            },
            {
                text: 'you\'re telling the truth',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'ba41cd80-7460-4a29-9a41-c940c428dd3a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.584Z',
                },
            },
            {
                text: 'you\'re not wrong',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '923101d6-2874-4f9a-aabc-bc403218c222',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.586Z',
                },
            },
            {
                text: 'it is true',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'e1cb861b-734e-4e15-932c-a711b747ec49',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.588Z',
                },
            },
            {
                text: 'you\'re definitely right',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '02371559-dd6c-45d2-87fd-9fb5b66ea0cb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.590Z',
                },
            },
            {
                text: 'true',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '69aed6f7-aad8-4eea-94df-a1c6cc9a959c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.592Z',
                },
            },
            {
                text: 'it\'s right',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'ec94c20b-e3f0-4a12-8bd0-c172b6942423',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.594Z',
                },
            },
            {
                text: 'what you say is true',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '63bd29e8-171a-43df-946a-575dc6615483',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.596Z',
                },
            },
            {
                text: 'it\'s the truth',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '980434e9-8b6c-4b94-ac3a-d4b200f15baa',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.597Z',
                },
            },
            {
                text: 'it\'s true',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'b76b2120-7009-4876-a33b-81124a17ed6f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.599Z',
                },
            },
            {
                text: 'that is correct',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'c5792fe3-6d73-436a-82c9-25bc6a0bbb1c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.601Z',
                },
            },
            {
                text: 'that is right',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '682dd851-6d02-4477-8b21-5fbf3ecd75ec',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.602Z',
                },
            },
            {
                text: 'that is true',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'c14e84d4-8f4c-4b95-88b3-883bfd1a956b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.607Z',
                },
            },
            {
                text: 'that is very true',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'a9c85524-ae53-40c0-9464-a7a54f7e3b21',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.609Z',
                },
            },
            {
                text: 'that\'s correct',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '89c300bd-0ef4-4b30-a37f-6bfcec9ea000',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.610Z',
                },
            },
            {
                text: 'that\'s so true',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'eeeee40f-daa4-47ad-b0ee-775164319546',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.612Z',
                },
            },
            {
                text: 'you are so right',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '4eb3ea3a-f8ef-4fb0-baa4-d2e26f50b5a7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.613Z',
                },
            },
            {
                text: 'you\'re really happy',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: '8eb5be42-e3da-4521-9e31-0476cca6e510',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.617Z',
                },
            },
            {
                text: 'you are correct',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '01b50e99-baef-4899-8057-50b9d5030f0f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.619Z',
                },
            },
            {
                text: 'you\'re so happy',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: 'd39a2c1a-1d5c-4561-9e7a-3811b6e6290e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.621Z',
                },
            },
            {
                text: 'how happy you are',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: 'e05d94e4-1ecb-4aba-8859-c124af98b961',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.623Z',
                },
            },
            {
                text: 'you\'re extremely happy',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: 'c79d6bff-a081-4981-91f9-cf4ad4c11a85',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.625Z',
                },
            },
            {
                text: 'you\'re full of happiness',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: '59c84789-6337-4cd0-9859-e07084b0da79',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.627Z',
                },
            },
            {
                text: 'are you happy now',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: 'e8b92829-a6a0-4136-a75d-722e538c45ff',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.628Z',
                },
            },
            {
                text: 'are you happy today',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: '71e04264-80ac-4b03-ad0f-921eb64b08f9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.631Z',
                },
            },
            {
                text: 'are you happy with me',
                intent: 'chitchat.are_you_happy',
                entities: [],
                _id: '73803522-ebf6-45bd-a8b0-b1cd7072499d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.632Z',
                },
            },
            {
                text: 'do you want to eat',
                intent: 'chitchat.are_you_hungry',
                entities: [],
                _id: '1d1feb32-1a9d-4db9-be1d-3d6e2e13da5d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.634Z',
                },
            },
            {
                text: 'are you hungry',
                intent: 'chitchat.are_you_hungry',
                entities: [],
                _id: '4b5fd49e-1b71-4dd0-8859-2e4ac7ecd867',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.635Z',
                },
            },
            {
                text: 'would you like to eat something',
                intent: 'chitchat.are_you_hungry',
                entities: [],
                _id: '342764e4-5aed-4845-83b3-4eea2294ffa3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.637Z',
                },
            },
            {
                text: 'you are hungry',
                intent: 'chitchat.are_you_hungry',
                entities: [],
                _id: '3507c9fe-2d27-4ed6-a8b3-149dfad71527',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.640Z',
                },
            },
            {
                text: 'you\'re really hungry',
                intent: 'chitchat.are_you_hungry',
                entities: [],
                _id: '3d33e175-83ef-4287-88dd-485045ff2d5e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.642Z',
                },
            },
            {
                text: 'you\'re so hungry',
                intent: 'chitchat.are_you_hungry',
                entities: [],
                _id: '63c1400f-83be-421c-9ea1-929bb35094ac',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.644Z',
                },
            },
            {
                text: 'where you work',
                intent: 'chitchat.what_is_your_occupation',
                entities: [],
                _id: '1cd6792d-12e3-4689-82d8-02952724b73d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.646Z',
                },
            },
            {
                text: 'where do you work',
                intent: 'chitchat.what_is_your_occupation',
                entities: [],
                _id: '62111438-8923-4f92-94aa-2de2e4a11855',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.647Z',
                },
            },
            {
                text: 'where is your work',
                intent: 'chitchat.what_is_your_occupation',
                entities: [],
                _id: '410dd526-49c2-4fb5-a46b-1463b8f1a84e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.650Z',
                },
            },
            {
                text: 'where is your office',
                intent: 'chitchat.what_is_your_occupation',
                entities: [],
                _id: '181c2d46-2253-4ca1-8ebd-9893457b11af',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.651Z',
                },
            },
            {
                text: 'your office location',
                intent: 'chitchat.what_is_your_occupation',
                entities: [],
                _id: 'c8f28dde-2170-4615-b7b9-c894f73bcc7f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.653Z',
                },
            },
            {
                text: 'where is your office location',
                intent: 'chitchat.what_is_your_occupation',
                entities: [],
                _id: '42bb5622-7236-403b-8703-b504ae3c8bb3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.655Z',
                },
            },
            {
                text: 'do you work',
                intent: 'chitchat.what_is_your_occupation',
                entities: [],
                _id: 'ad3c3d9f-a3c3-4c3e-bff5-4822ee8c8f9a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.657Z',
                },
            },
            {
                text: 'you\'re very hungry',
                intent: 'chitchat.are_you_hungry',
                entities: [],
                _id: '80ce2ba6-26e4-4de6-9eb2-cae8b48e3993',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.659Z',
                },
            },
            {
                text: 'you might be hungry',
                intent: 'chitchat.are_you_hungry',
                entities: [],
                _id: '1daa3a14-45b0-4213-b4fc-db735ae03611',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.680Z',
                },
            },
            {
                text: 'where is your office located',
                intent: 'chitchat.what_is_your_occupation',
                entities: [],
                _id: '54d7864f-6150-4930-9b2c-3b066bb61002',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.682Z',
                },
            },
            {
                text: 'what is your work',
                intent: 'chitchat.what_is_your_occupation',
                entities: [],
                _id: 'f37ed75d-21a1-489e-88f3-f7b40fe8ec29',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.685Z',
                },
            },
            {
                text: 'were you born here',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '9aef4349-46cc-4beb-b74c-aab033d41f2e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.687Z',
                },
            },
            {
                text: 'where were you born',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '456571a0-4b25-489e-834a-2397279fc3b3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.689Z',
                },
            },
            {
                text: 'where did you come from',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: 'd198951a-75bf-402a-acea-967227338551',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.694Z',
                },
            },
            {
                text: 'what is your country',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '22d7b1d7-dd79-47fd-8687-9ba5fcd5db15',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.696Z',
                },
            },
            {
                text: 'where are you from',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '7e551f3b-5c87-434c-bc61-8c4bb08d2dfc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.698Z',
                },
            },
            {
                text: 'where do you come from',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '7274d5ab-583b-42fe-b989-9c42c3d6b67f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.701Z',
                },
            },
            {
                text: 'where have you been born',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '947f92b7-e263-44ff-94f8-36b60ce0a2ef',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.703Z',
                },
            },
            {
                text: 'from where are you',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '78607714-b82b-4f0e-8c4a-05e6a0abbcbb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.705Z',
                },
            },
            {
                text: 'are you from far aways',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '382e5e7c-ac20-4c18-baec-43d496c44e37',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.722Z',
                },
            },
            {
                text: 'what\'s your homeland',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '6975686b-7c21-4c1b-b837-a19301245789',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.725Z',
                },
            },
            {
                text: 'your homeland is',
                intent: 'chitchat.where_were_you_born',
                entities: [],
                _id: '6e720b47-54f9-4713-860a-bf730b884391',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.727Z',
                },
            },
            {
                text: 'are you ready',
                intent: 'chitchat.are_you_ready',
                entities: [],
                _id: '7d232b27-3720-4d98-8e09-77620460a75b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.728Z',
                },
            },
            {
                text: 'are you ready right now',
                intent: 'chitchat.are_you_ready',
                entities: [],
                _id: 'd836269e-cdab-4a92-8cb1-c97b0a23bc38',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.730Z',
                },
            },
            {
                text: 'are you ready today',
                intent: 'chitchat.are_you_ready',
                entities: [],
                _id: 'd4c435ac-21f0-4fb8-aaf5-dea1ddcff55d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.731Z',
                },
            },
            {
                text: 'are you ready now',
                intent: 'chitchat.are_you_ready',
                entities: [],
                _id: '620a5bcf-c446-446d-8367-1832c620e8c1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.734Z',
                },
            },
            {
                text: 'are you ready tonight',
                intent: 'chitchat.are_you_ready',
                entities: [],
                _id: 'b0487fd3-270c-433a-bb3e-2094b200a1d5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.736Z',
                },
            },
            {
                text: 'were you ready',
                intent: 'chitchat.are_you_ready',
                entities: [],
                _id: '6baef891-2514-400e-8e65-2e873adfd328',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.738Z',
                },
            },
            {
                text: 'have you been ready',
                intent: 'chitchat.are_you_ready',
                entities: [],
                _id: '8a345956-18d5-4d24-9ede-21a49a9e79ea',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.740Z',
                },
            },
            {
                text: 'where do you live',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: 'c21eed0b-0d1b-4406-afd4-cb5953d781c6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.743Z',
                },
            },
            {
                text: 'in which city do you live',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '66b9269d-382e-424d-bc64-b2bef4e15be3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.747Z',
                },
            },
            {
                text: 'your residence',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '5b821e7b-b094-4d22-a71a-b9eeca28d4f4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.751Z',
                },
            },
            {
                text: 'your house',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: 'bb2735e1-300d-417a-a263-600b3d9bd68a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.762Z',
                },
            },
            {
                text: 'your home',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '00ddbb2f-cba4-4292-b089-a71d995b82bc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.763Z',
                },
            },
            {
                text: 'your hometown',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '938ab550-eb31-416e-b161-5d50597238df',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.765Z',
                },
            },
            {
                text: 'what is your hometown',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: 'cc25e14a-acf6-4c4e-bbd6-ef0605096f03',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.766Z',
                },
            },
            {
                text: 'what is your city',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: 'f5712667-f640-4479-a466-f9391229f09c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.775Z',
                },
            },
            {
                text: 'is it your hometown',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '9179b103-1111-4646-9052-1ae392344e3f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.777Z',
                },
            },
            {
                text: 'where is your hometown',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: 'f9dc4b27-f269-496e-9c11-d1b82a4bfac1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.780Z',
                },
            },
            {
                text: 'tell me about your city',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '866b8f1a-f76b-4aa0-805b-f37c8d62f5ab',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.782Z',
                },
            },
            {
                text: 'I know that\'s right',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '7a52f911-1412-4963-8e5d-ac75ce87f237',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.784Z',
                },
            },
            {
                text: 'what is your residence',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '303ef2bf-8a99-491b-9f84-b6ea4748182e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.787Z',
                },
            },
            {
                text: 'you\'re absolutely right',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: '5d5a128e-0c26-420e-86ba-4dde9e280c82',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.789Z',
                },
            },
            {
                text: 'are you sure now',
                intent: 'chitchat.are_you_sure',
                entities: [],
                _id: '470e5e9d-35a1-4eb4-b3ab-f796a622c221',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.791Z',
                },
            },
            {
                text: 'what is your town',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '373ea8ab-85b9-4ad1-84ad-aaebd040cbe4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.792Z',
                },
            },
            {
                text: 'are you sure right now',
                intent: 'chitchat.are_you_sure',
                entities: [],
                _id: 'bca41ec7-3329-4726-af08-e369e5492b85',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.794Z',
                },
            },
            {
                text: 'are you absolutely certain',
                intent: 'chitchat.are_you_sure',
                entities: [],
                _id: '2eb5fc18-6f16-4a3f-96c3-9f949366c262',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.796Z',
                },
            },
            {
                text: 'you\'re right about that',
                intent: 'chitchat.you_are_right',
                entities: [],
                _id: 'a62b379e-ef43-4759-bb2b-3a3a9e14d992',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.854Z',
                },
            },
            {
                text: 'are you sure today',
                intent: 'chitchat.are_you_sure',
                entities: [],
                _id: '17e89be2-156e-451c-a32a-19512ec9b83c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.909Z',
                },
            },
            {
                text: 'are you sure tonight',
                intent: 'chitchat.are_you_sure',
                entities: [],
                _id: '69047e72-d734-4f58-9727-c2f1dcb353f2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.913Z',
                },
            },
            {
                text: 'do you believe so',
                intent: 'chitchat.are_you_sure',
                entities: [],
                _id: '4166da69-e157-4af3-8c07-71a7ae5c3a21',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.915Z',
                },
            },
            {
                text: 'why aren\'t you talking to',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'bcf02d79-beb1-44b5-932d-a194863982d6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.917Z',
                },
            },
            {
                text: 'do you want to chat with',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: '23d1083e-fbc0-4bb4-ace7-04c5932479b1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.918Z',
                },
            },
            {
                text: 'will you talk to me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: '180e1d28-4b63-4fb7-9d1e-42bde53d0bc2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.920Z',
                },
            },
            {
                text: 'talk to me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: '2901d1ae-8099-401b-872d-5a5c4806ede2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.922Z',
                },
            },
            {
                text: 'are you going to talk to',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: '684269b4-d5dc-43a8-8c15-6b5feda92eb0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.931Z',
                },
            },
            {
                text: 'where\'s your hometown',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '5fae6895-aeb6-4794-a445-d5274c97570e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.934Z',
                },
            },
            {
                text: 'are you sure',
                intent: 'chitchat.are_you_sure',
                entities: [],
                _id: 'ea053767-d44a-49f3-989b-f0f1d91b8275',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.936Z',
                },
            },
            {
                text: 'are you talking to me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'e29eff56-0d85-43ec-a20b-e34471fd46bb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.940Z',
                },
            },
            {
                text: 'can you chat with me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'c8bad960-fdd9-440b-b876-70fccd49ee94',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.941Z',
                },
            },
            {
                text: 'can you talk to me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'a89824a5-aa49-4d3e-b73a-2b7400a1baee',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.943Z',
                },
            },
            {
                text: 'talk',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'd3689d35-0baa-4584-a14d-71664c5d096a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:52.999Z',
                },
            },
            {
                text: 'can you talk with me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: '51532766-9d49-4d96-aeb0-531688709330',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.004Z',
                },
            },
            {
                text: 'say',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'e01bbb77-8381-4926-aaab-e9b78fb4e6d1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.005Z',
                },
            },
            {
                text: 'can you speak with me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'bb3b4453-15ec-44b9-a93e-383d4de655bf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.007Z',
                },
            },
            {
                text: 'what\'s your city',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '2bd5f59b-da1b-46fb-bd2e-ee39a5d74e0e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.009Z',
                },
            },
            {
                text: 'what\'s your home',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: 'a129ec40-6594-4c45-8765-6e10e167cbb1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.034Z',
                },
            },
            {
                text: 'speak to me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'a2424c45-9d1c-4a5f-89e3-ad3fd634018e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.037Z',
                },
            },
            {
                text: 'where is your home',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '53217a2e-7892-4fb2-8ca0-200408410049',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.039Z',
                },
            },
            {
                text: 'where is your residence',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: 'c1300b10-088b-45fe-82d9-dc833f48ac6a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.040Z',
                },
            },
            {
                text: 'speak with me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'cbd7bfef-3101-42b7-9f3c-ea7719c5ed10',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.042Z',
                },
            },
            {
                text: 'chat with me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: 'b1fc3f09-0072-49a2-8e05-ea3780af81dd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.044Z',
                },
            },
            {
                text: 'pretty bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '6729d20b-6cff-465c-a928-2ff3427bf38c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.046Z',
                },
            },
            {
                text: 'talk with me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: '2116ca17-962f-4f8d-9c7d-1e069fab931e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.057Z',
                },
            },
            {
                text: 'why don\'t you talk to me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: '6b8de0aa-fc29-4507-b072-c546ae990808',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.059Z',
                },
            },
            {
                text: 'where\'s your home',
                intent: 'chitchat.where_do_you_live',
                entities: [],
                _id: '43389f7f-970a-4301-8638-edc8f656a9ab',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.061Z',
                },
            },
            {
                text: 'you can talk to me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: '238f4e65-7ce1-46f9-985c-a8585fbbebcc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.064Z',
                },
            },
            {
                text: 'not good enough',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'a7462b7b-26d3-414b-9c9e-9866b933f6a5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.065Z',
                },
            },
            {
                text: 'just chat with me',
                intent: 'chitchat.talk_to_me',
                entities: [],
                _id: '01bd6b81-6731-45d3-99e8-52be029e4cf6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.067Z',
                },
            },
            {
                text: 'that was lame',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'ed239d19-fd17-4f68-a11c-c79549d374d3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.073Z',
                },
            },
            {
                text: 'that was terrible',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'a166eaf3-f16a-4169-adfb-4026dfa39f8c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.075Z',
                },
            },
            {
                text: 'it is bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '1b276b6f-6bec-4611-bdbf-5cd5be94afe1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.076Z',
                },
            },
            {
                text: 'this is bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '4fcfce63-f743-4a0b-ba1e-b8cc772ea28d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.078Z',
                },
            },
            {
                text: 'bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'e562a402-8078-4659-9e2b-ef8e83e29414',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.080Z',
                },
            },
            {
                text: 'that\'s bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'ef92a219-d4e3-4321-9f42-8cf7fcd9402c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.082Z',
                },
            },
            {
                text: 'not good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'f238d91c-2849-44a1-bcd8-350d5a84bfcd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.090Z',
                },
            },
            {
                text: 'horrible',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'aabe34e6-b458-4f19-9e0b-ad47416d9d0c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.092Z',
                },
            },
            {
                text: 'I\'m afraid it\'s bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'cb3184f0-c148-4d22-a330-4f9be4cdaf14',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.094Z',
                },
            },
            {
                text: 'no it\'s bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'ce28ec73-7990-437b-bf66-bf5a8dff06ca',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.096Z',
                },
            },
            {
                text: 'so bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'a82ee813-2928-4db0-b01b-7523aecc71d8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.098Z',
                },
            },
            {
                text: 'this is too bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '1f618071-68d0-452c-8ddb-59e9682f00e6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.111Z',
                },
            },
            {
                text: 'no good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'e69fa96b-9799-4aec-a9f4-8580abc65e92',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.112Z',
                },
            },
            {
                text: 'terrible',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '48947dd7-5cb5-423a-9a39-23a216e70fa5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.114Z',
                },
            },
            {
                text: 'horrific',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'ee63d101-b696-4eae-a72c-ca76847a8d48',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.116Z',
                },
            },
            {
                text: 'it\'s bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'bf6253a4-daf4-401f-9744-88f906c7a993',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.118Z',
                },
            },
            {
                text: 'that\'s too bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'bdc0ec4c-2446-4988-b1c3-29c1ff764e2f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.121Z',
                },
            },
            {
                text: 'that\'s not good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '20ecfd49-0cfe-4b64-84fd-7a017970770a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.129Z',
                },
            },
            {
                text: 'that was awful',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'b81c6174-f1c6-42b0-9789-b5734154eecd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.131Z',
                },
            },
            {
                text: 'that was horrible',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '6efa611b-3273-4f51-a9d6-d3615c102240',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.133Z',
                },
            },
            {
                text: 'abysmal',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '9ef5233b-a52d-442a-9317-dd31a103961e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.135Z',
                },
            },
            {
                text: 'that\'s lame',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '44568853-065f-47f4-979a-070276abd5aa',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.137Z',
                },
            },
            {
                text: 'that was bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'cba57e55-83c9-49c9-82b1-9e7e03717771',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.147Z',
                },
            },
            {
                text: 'this is not good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'd3c2eae0-76fd-4938-9f73-2b7d47e398ac',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.149Z',
                },
            },
            {
                text: 'that\'s terrible',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '87d7e51f-049f-4229-b404-4387ae2af402',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.155Z',
                },
            },
            {
                text: 'too bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'deb0bfed-481d-4639-ac42-038b8e90a75e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.156Z',
                },
            },
            {
                text: 'it\'s very bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'a9595964-e01a-4175-a521-fdcae1867e22',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.160Z',
                },
            },
            {
                text: 'very bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '8d5b7050-d85d-436a-8b94-db2e4a93cb14',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.161Z',
                },
            },
            {
                text: 'bad girl',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '83028a25-4832-4adf-9da5-1287c6779470',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.163Z',
                },
            },
            {
                text: 'that\'s not good enough',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '134fbe41-4288-49c3-8440-e681e69d02dd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.165Z',
                },
            },
            {
                text: 'it\'s not good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '8b68ffc0-54a7-4425-81c7-4201ddbabe8c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.175Z',
                },
            },
            {
                text: 'bad very bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'fc6ed022-f503-4fd6-aa50-2442ac1c687c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.178Z',
                },
            },
            {
                text: 'not so good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'b1c486de-a318-4024-8d47-8483f736d681',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.179Z',
                },
            },
            {
                text: 'it\'s too bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'adff921f-3008-407b-a953-593cf41f98a4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.181Z',
                },
            },
            {
                text: 'that was not good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'd5362231-249c-4e92-b3f0-0853fb8ce3d0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.185Z',
                },
            },
            {
                text: 'it\'s really bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '6936aedc-ff87-44ca-b096-ba5a38dd1a9c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.187Z',
                },
            },
            {
                text: 'it\'s so bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '340a98ec-83a2-4a88-80e9-13c85a6c3ee7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.190Z',
                },
            },
            {
                text: 'really bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '525dda6e-a960-4324-9410-a9fd45ce1395',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.193Z',
                },
            },
            {
                text: 'that is bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '84c0ab2d-a3c4-4d4f-baa0-7d1cbe00cb03',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.198Z',
                },
            },
            {
                text: 'bad idea',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '2289ad11-8565-4b07-baf1-5bc4bd49376d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.200Z',
                },
            },
            {
                text: 'it\'s not so good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '8c8b656d-35e0-449b-bf9e-ae62c9b08795',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.202Z',
                },
            },
            {
                text: 'so lame',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '9a1b3275-2313-408b-a77b-2582d5ab34f0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.207Z',
                },
            },
            {
                text: 'not a good one',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'd000223f-eb33-4c44-bed9-49f012b2d8de',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.209Z',
                },
            },
            {
                text: 'that\'s really bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '189cbb5c-8fa3-4dd0-af2a-de4276bdf60a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.210Z',
                },
            },
            {
                text: 'oh that\'s not good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '039b14eb-832c-4989-9856-7fae8c7bc3b9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.212Z',
                },
            },
            {
                text: 'it is too bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '5a0597d6-5b30-4ee1-9504-db2f20c8cf85',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.213Z',
                },
            },
            {
                text: 'not too good',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'be996f7f-4e8c-4581-9fbb-c7265c56a85f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.216Z',
                },
            },
            {
                text: 'well too bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: 'a72fe022-7340-4ba6-a632-cd1d5092ca9f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.238Z',
                },
            },
            {
                text: 'bad really bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '0973f511-6985-4343-b527-e8f927c81230',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.241Z',
                },
            },
            {
                text: 'sweet',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'e3429c43-2a96-4f14-adf1-8d1464917410',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.243Z',
                },
            },
            {
                text: 'really well',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'eb2dfd90-6f33-431a-acdb-455d0a74949f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.245Z',
                },
            },
            {
                text: 'very well',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'f74d7668-3c41-44b1-978e-15b33e768fb7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.246Z',
                },
            },
            {
                text: 'that is awesome',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'a504e607-3490-4fd6-b0cd-fb82b3007436',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.249Z',
                },
            },
            {
                text: 'that is nice',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'f824cae7-609d-4589-bce5-6eeb374154cc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.251Z',
                },
            },
            {
                text: 'that is wonderful',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '155e6c22-c693-4150-a87c-08131c6cb390',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.253Z',
                },
            },
            {
                text: 'that was amazing',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '61d38003-3a7d-42b9-912d-11661d10994a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.255Z',
                },
            },
            {
                text: 'that was awesome',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '3485d517-62fc-486b-bf3e-af4d5fce6c32',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.256Z',
                },
            },
            {
                text: 'that was cute',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '8750a906-8068-40df-9a39-af41aa960e79',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.258Z',
                },
            },
            {
                text: 'that was pretty good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '78898e13-cad2-4959-af40-49360a4b099b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.260Z',
                },
            },
            {
                text: 'that\'s a good idea',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '9cdc94f5-e638-43c5-acf9-4375326f5554',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.261Z',
                },
            },
            {
                text: 'that was very good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'e8027471-71ac-4664-98c5-1d0326321855',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.263Z',
                },
            },
            {
                text: 'that\'s a good thing',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'ac63b0a4-16b3-4caa-aa0f-987931540cfb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.264Z',
                },
            },
            {
                text: 'that\'s awesome thank you',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '22b4a7c9-20b9-40b1-9577-a366e04de5c7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.266Z',
                },
            },
            {
                text: 'that\'s amazing',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '48f9fb1d-ecf5-4e85-8ca4-40fc624bbf65',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.268Z',
                },
            },
            {
                text: 'that\'s better',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'b8cfd702-e5da-45b4-ac7a-2afdd46ef532',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.270Z',
                },
            },
            {
                text: 'that\'s cute',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '2d09c3bb-64cb-4347-ae68-293ccb24c044',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.272Z',
                },
            },
            {
                text: 'that\'s fantastic',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '59fde499-5e1a-479a-9b67-b70417695db4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.274Z',
                },
            },
            {
                text: 'that\'s much better',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'c37d1c0b-7fbb-4776-9733-c78c3017a2a9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.275Z',
                },
            },
            {
                text: 'that\'s nice of you',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '03e86a9d-849d-4f5b-a45c-6f5e88f3c34a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.277Z',
                },
            },
            {
                text: 'that\'s not bad',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '819ee064-a805-4ecd-8d07-64fad66a593d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.281Z',
                },
            },
            {
                text: 'that\'s perfect',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '6206244c-a365-4140-b757-255f3d1e7a78',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.283Z',
                },
            },
            {
                text: 'that\'s pretty good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '4902d674-c0a1-4d2b-8034-ade5429b2f0d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.284Z',
                },
            },
            {
                text: 'that\'s really good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'f79d5547-e3a9-4c1a-9a47-625cbf0950e0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.286Z',
                },
            },
            {
                text: 'that\'s really nice',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'a51bf851-29f0-4f88-b27c-a27fc6e5949a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.288Z',
                },
            },
            {
                text: 'that\'s sweet of you',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'e7e24453-7609-469b-8fdf-9c75f887ae90',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.291Z',
                },
            },
            {
                text: 'that\'s very nice',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'd650d159-aa72-4eab-96e6-b85b11868f08',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.293Z',
                },
            },
            {
                text: 'that\'s wonderful',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '361de7f8-c2e0-4af0-b75f-cc991acaa45a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.295Z',
                },
            },
            {
                text: 'this is awesome',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '8908c3f9-0f62-400a-adb7-a417d66daa52',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.296Z',
                },
            },
            {
                text: 'this is good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '5a8ebfe1-238b-4f0c-b513-3bbe29301b0c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.298Z',
                },
            },
            {
                text: 'this is great',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '2e4a6ea8-7617-4db7-9e45-4555d6f4af05',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.300Z',
                },
            },
            {
                text: 'very nice',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '6804a03d-f11c-4199-acb8-a1bba681b0d7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.303Z',
                },
            },
            {
                text: 'very then',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'cee80ef3-7096-4ec7-a1c9-20e76a0ee04d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.306Z',
                },
            },
            {
                text: 'I\'m glad to hear that',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '0abdaaad-9c0e-4214-a36b-8282dfe13729',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.309Z',
                },
            },
            {
                text: 'wonderful',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'dffa5145-dad0-49c0-acc2-f43c7b5075f3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.311Z',
                },
            },
            {
                text: 'so good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '00d12f07-c953-4af3-bc8c-b363491d380a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.314Z',
                },
            },
            {
                text: 'ok good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '75003d89-d027-46a2-be26-76c45939a5b5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.316Z',
                },
            },
            {
                text: 'good for you',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '550a3f43-ff64-4aed-8b99-5406a8dce3ea',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.318Z',
                },
            },
            {
                text: 'good to know',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '4dfbeedb-86ed-4c80-abb3-593e54884aa3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.320Z',
                },
            },
            {
                text: 'glad to hear it',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'f216cf82-a91f-4c50-9f32-f531bdfeb7e5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.324Z',
                },
            },
            {
                text: 'so sweet of you',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '88986e3f-713e-430e-8c55-a2f1717cb6ea',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.326Z',
                },
            },
            {
                text: 'you are not good',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '09815ae5-c9dd-4dc0-9807-169aa1e1e1ac',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.328Z',
                },
            },
            {
                text: 'you are so bad',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '40897260-0b73-4ffd-9507-a226831a1cec',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.330Z',
                },
            },
            {
                text: 'you are so useless',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: 'a33b5353-a23b-4fff-b1fc-2579be75fe9a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.332Z',
                },
            },
            {
                text: 'you are terrible',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '00a08178-2959-4e25-b1fb-db0e5a906a81',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.333Z',
                },
            },
            {
                text: 'you are totally useless',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '42f4b80b-7e7b-4f2d-b380-2f2117927e82',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.335Z',
                },
            },
            {
                text: 'you are very bad',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '3e846119-1d07-4f3e-8d7f-213973b31542',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.337Z',
                },
            },
            {
                text: 'you are waste',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '37d674bf-a790-407b-b24d-bc81b4473b8f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.339Z',
                },
            },
            {
                text: 'you\'re a bad',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '565d7031-4630-4d02-b500-f8bb2ccd5862',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.343Z',
                },
            },
            {
                text: 'you\'re not a good',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '2bab8ee8-1393-447e-b842-11cf28676137',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.345Z',
                },
            },
            {
                text: 'tell me your age',
                intent: 'chitchat.what_is_your_age',
                entities: [],
                _id: '3247a8e0-8eaf-462c-95cf-3ed974d79fee',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.346Z',
                },
            },
            {
                text: 'how old are you',
                intent: 'chitchat.what_is_your_age',
                entities: [],
                _id: '5f8c9104-7f0c-4af5-ba1f-349e81a3ec1d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.348Z',
                },
            },
            {
                text: 'what\'s your age',
                intent: 'chitchat.what_is_your_age',
                entities: [],
                _id: 'e09a0f9b-858c-4b1d-a545-8cf679dafa78',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.350Z',
                },
            },
            {
                text: 'This is bad',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '8cc18080-fe1c-4669-99ce-f12edc705658',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.351Z',
                },
            },
            {
                text: 'I am not happy with this',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '508d41bf-b776-4e84-9afd-639fc744b5c3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.353Z',
                },
            },
            {
                text: 'You are not helping',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'f1e78773-536b-474a-aad4-9607ab46398b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.356Z',
                },
            },
            {
                text: 'I am not cool',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '724a2085-894f-45e8-8ed3-20bab06ef167',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.358Z',
                },
            },
            {
                text: 'I am disappointed',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '186929d9-e72e-45bb-a7c2-bf8e7959b914',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.360Z',
                },
            },
            {
                text: 'You are not handing this properly',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'cf20e296-e3c9-44d1-86d3-a41bcf1caebd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.362Z',
                },
            },
            {
                text: 'You are not doing a good job',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '74389466-abfc-46ba-9af5-9ad9e5d11d9e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.363Z',
                },
            },
            {
                text: 'You are doing an average job',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'df3699bd-594b-4a60-8a3c-a8264670382a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.366Z',
                },
            },
            {
                text: 'This is a no-go',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '4e084611-7b9e-4738-8814-d48f48720b8d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.367Z',
                },
            },
            {
                text: 'This is a no no',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'ff83bc47-4a80-496c-a265-2de67380715b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.369Z',
                },
            },
            {
                text: 'You are not helpful',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'd136970a-c096-437a-bbb3-0c252911e178',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.371Z',
                },
            },
            {
                text: 'This sucks',
                intent: 'chitchat.this_is_bad',
                entities: [],
                _id: '6a71ba35-18a6-4452-815d-39568b079366',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.373Z',
                },
            },
            {
                text: 'This is useless',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '327e20b5-047b-4c06-8125-18bd5b7d8290',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.375Z',
                },
            },
            {
                text: 'It\'s not working',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'bc2ebc36-6ec4-48a2-be36-dbb55f1c64bf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.377Z',
                },
            },
            {
                text: 'I am getting annoyed',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '8ca77987-7ddf-4326-9b30-07aad7a501c4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.378Z',
                },
            },
            {
                text: 'You are frustrating me',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'e25496af-1a09-4cf7-9257-f117542f72df',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.380Z',
                },
            },
            {
                text: 'I am losing my temper',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '2d80fa4f-9466-4853-88f1-663e66f2dfc8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.382Z',
                },
            },
            {
                text: 'You are making me mad',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '6f008683-cad1-471a-93bf-a19fea3b1c39',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.384Z',
                },
            },
            {
                text: 'You are getting me furious',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '3732cce3-2902-4713-8b72-8e5cd001e2ea',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.388Z',
                },
            },
            {
                text: 'You are making me frustrated',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'afd1756e-d38b-43e1-8506-6169fc8b2b51',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.390Z',
                },
            },
            {
                text: 'You are making me furious',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'bfa498d8-7797-4d2d-a731-35af3117bfab',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.392Z',
                },
            },
            {
                text: 'You are making me angry',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '09a16de8-44e3-4468-ad4e-0dc37f40e058',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.394Z',
                },
            },
            {
                text: 'You are making me super annoyed',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'e4b0e730-a49e-4393-af65-611e535c1e4b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.396Z',
                },
            },
            {
                text: 'You ruined my mood',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '5af1e84a-6740-42be-bff3-f24440f60721',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.399Z',
                },
            },
            {
                text: 'We are not going to be friends',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'fc30e2d4-3198-40cb-97a8-8099e9fe136f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.400Z',
                },
            },
            {
                text: 'I am getting irritated',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '0aafd99b-74ea-4189-814e-2c46e3dab561',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.402Z',
                },
            },
            {
                text: 'I am in a fury now',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '34d42010-2e8f-4687-9b72-9957438d352d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.404Z',
                },
            },
            {
                text: 'I am doubtful you can help me',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '7062b75e-c530-493a-a958-2ed43849379e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.407Z',
                },
            },
            {
                text: 'This bot does not work',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '7948adca-b5a4-4d47-a4fb-831c7edeca79',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.409Z',
                },
            },
            {
                text: 'You are an idiot',
                intent: 'chitchat.insults',
                entities: [],
                _id: '7b3bd304-5f39-4c6f-b582-c2938bd475d3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.410Z',
                },
            },
            {
                text: 'This is fucked up',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '53743faf-c370-4689-9766-2122382fa7c5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.412Z',
                },
            },
            {
                text: 'You are a moron',
                intent: 'chitchat.insults',
                entities: [],
                _id: '387f3f11-cd39-49b6-91f1-af91b6c4dcc1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.413Z',
                },
            },
            {
                text: 'This shit does not work',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'dcb2fc37-ea0d-4607-bb92-98fb42139ff9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.415Z',
                },
            },
            {
                text: 'You are not responding properly',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '07d4738f-9e3a-4a66-beef-1cccdb33aa3d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.417Z',
                },
            },
            {
                text: 'I\'d like to know your age',
                intent: 'chitchat.what_is_your_age',
                entities: [],
                _id: '4616e598-e711-44c8-badf-9c5f82890ec2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.420Z',
                },
            },
            {
                text: 'your age',
                intent: 'chitchat.what_is_your_age',
                entities: [],
                _id: 'f208904a-488d-40de-90fa-df81eebde83a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.423Z',
                },
            },
            {
                text: 'are you 21 years old',
                intent: 'chitchat.what_is_your_age',
                entities: [],
                _id: '9be3c19f-b430-442c-9604-db6998083b45',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.425Z',
                },
            },
            {
                text: 'jerk',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'ced2fb45-49b2-4a5c-b8f4-925b1e1cc6ba',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.426Z',
                },
            },
            {
                text: 'age of yours',
                intent: 'chitchat.what_is_your_age',
                entities: [],
                _id: '9cd5ada0-2d21-44dd-a41d-11e3f49e028c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.428Z',
                },
            },
            {
                text: 'a month ago',
                intent: 'basics.time',
                entities: [],
                _id: '5094620f-c749-440b-ba2e-b6dfdd68cc4e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.430Z',
                },
            },
            {
                text: 'how old is your platform',
                intent: 'chitchat.what_is_your_age',
                entities: [],
                _id: 'c7a75aac-fe0a-4b2e-b577-61f06c650611',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.432Z',
                },
            },
            {
                text: 'you are annoying me so',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '5bd9613c-4ed3-4407-9274-40808798e568',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.433Z',
                },
            },
            {
                text: 'you are annoying',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '6a047caa-7733-46f9-92a9-50a4243b69cc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.436Z',
                },
            },
            {
                text: 'I find you annoying',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '9b198a6d-382b-45cf-9b89-9ba13d46355d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.439Z',
                },
            },
            {
                text: 'you\'re incredibly anno',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '767ecd6e-020e-4be7-a13c-8739731aa427',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.442Z',
                },
            },
            {
                text: 'you\'re so annoying',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '9a4bc278-bc45-406e-985b-258f5faf4b02',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.443Z',
                },
            },
            {
                text: 'how annoying you are',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: 'a93ea24e-48d1-42b5-a34f-a98e27bc9d56',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.448Z',
                },
            },
            {
                text: 'you annoy me',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '4260caf7-fa16-4311-b9a0-3fb36ad5f29a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.451Z',
                },
            },
            {
                text: 'you are annoying me',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '8c44ebf9-ed1a-4f34-9f24-ea4c70f77a85',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.453Z',
                },
            },
            {
                text: 'you are irritating',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '7c3a7c53-551d-41e9-b3b2-c84558a560bb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.455Z',
                },
            },
            {
                text: 'you are such annoying',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '7635e1f4-5e11-47a2-aee8-0a4c528329c2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.458Z',
                },
            },
            {
                text: 'you\'re too annoying',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '33889ad1-a58f-439c-989a-a15594530442',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.459Z',
                },
            },
            {
                text: 'you are very annoying',
                intent: 'chitchat.you_are_annoying',
                entities: [],
                _id: '1008d992-0a27-4aeb-b8cd-ba41c6c3aba5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.461Z',
                },
            },
            {
                text: 'you\'re not helping me',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '0963f2a5-96aa-4f47-92fa-754affa4ae29',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.463Z',
                },
            },
            {
                text: 'you are bad',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: 'fc95834e-e1fa-4f71-af65-2813a5304369',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.464Z',
                },
            },
            {
                text: 'you\'re very bad',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: 'df33bbb1-948d-4d75-9b59-cdcaf210bda3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.466Z',
                },
            },
            {
                text: 'you\'re really bad',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '85e33fe8-f14c-4aa6-b8e1-f224067ebc14',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.469Z',
                },
            },
            {
                text: 'you are useless',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '1f2757c9-efe5-4f96-9e11-add4dd94baff',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.471Z',
                },
            },
            {
                text: 'you are horrible',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '98e1be14-9419-4413-b270-81a69ca8daf0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.474Z',
                },
            },
            {
                text: 'you are a waste of time',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: 'e6b8abdb-da56-41e9-8e9a-012dd6231b6e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.476Z',
                },
            },
            {
                text: 'you are no good',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: 'ec81452b-7753-49f8-9c85-e43411fa5bf1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.478Z',
                },
            },
            {
                text: 'you\'re bad',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '6b516fc4-50ff-4386-ae28-9e5f837f9cae',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.479Z',
                },
            },
            {
                text: 'you\'re awful',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '6ca6e880-d1fb-47f0-abf1-e7215606a2ce',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.481Z',
                },
            },
            {
                text: 'prick',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'ad768c7d-a36e-4cbc-b77e-98e0cd254f4e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.482Z',
                },
            },
            {
                text: 'You\'re an asshole!',
                intent: 'chitchat.insults',
                entities: [],
                _id: '5ee55795-694b-45cf-84ac-8eb90e815d4d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.484Z',
                },
            },
            {
                text: 'you are really frustrating',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '854e974f-d5b8-4744-96e6-c74a9ee8d78c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.487Z',
                },
            },
            {
                text: 'son of a bitch',
                intent: 'chitchat.insults',
                entities: [],
                _id: '53ccacaa-6e9c-44ee-8b9d-1d94a69f4d7f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.488Z',
                },
            },
            {
                text: 'you are not cool',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: 'a81637f0-79ea-4a9c-96f2-7cc0f5384090',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.490Z',
                },
            },
            {
                text: 'Please stop',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: 'a72593a5-e5d6-46d9-83c4-00f383cbf602',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.492Z',
                },
            },
            {
                text: 'don\'t worry there\'s no problem',
                intent: 'chitchat.no_problem',
                entities: [],
                _id: '8d292ba9-9846-4539-abb6-ad9e8046c27e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.494Z',
                },
            },
            {
                text: 'you helped a lot thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '19722a75-79e3-4c8e-b9d2-44c6e5ec58c0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.496Z',
                },
            },
            {
                text: 'appreciate your help',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '99a01f6b-2010-4e5f-b0eb-bdc5aa705257',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.497Z',
                },
            },
            {
                text: 'cheers',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '6469df9d-e56c-4762-8f77-042b07778b57',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.499Z',
                },
            },
            {
                text: 'tomorrow',
                intent: 'basics.time',
                entities: [],
                _id: '3273569b-36f5-45ac-9a96-8a81e2a1175a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.502Z',
                },
            },
            {
                text: 'thanks',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '005842c1-a92f-4b48-86df-a4cd0c1e1242',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.505Z',
                },
            },
            {
                text: 'you are lame',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '32ca5ae8-b7c1-4b26-9b9c-c8547b186bf3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.507Z',
                },
            },
            {
                text: 'you are disgusting',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: 'c74311c7-0fdc-465d-a2f8-ab6ace701741',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.509Z',
                },
            },
            {
                text: 'you\'re terrible',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '4065765a-a544-49a2-b3e6-ab44b6991168',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.511Z',
                },
            },
            {
                text: 'you\'re not very good',
                intent: 'chitchat.you_are_worthless',
                entities: [],
                _id: '50301694-43b9-4b1c-9c0d-4680c78ffa1e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.513Z',
                },
            },
            {
                text: 'In a minute',
                intent: 'basics.time',
                entities: [],
                _id: '1324ba07-e1cc-4276-87eb-ac7f044e683a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.517Z',
                },
            },
            {
                text: 'in one month',
                intent: 'basics.time',
                entities: [],
                _id: '6a030453-6a29-4aea-9bdf-9aeedf60e755',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.520Z',
                },
            },
            {
                text: 'just now',
                intent: 'basics.time',
                entities: [],
                _id: '114df83e-0633-4662-ada5-99a871d234ef',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.523Z',
                },
            },
            {
                text: 'Easter',
                intent: 'basics.time',
                entities: [],
                _id: '5e99084d-f956-481c-b5f6-5cb0eeaba260',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.526Z',
                },
            },
            {
                text: 'for Christmas',
                intent: 'basics.time',
                entities: [],
                _id: '5357b59d-b591-4af5-b5d8-8b38def545a5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.527Z',
                },
            },
            {
                text: 'the day after tomorrow',
                intent: 'basics.time',
                entities: [],
                _id: 'b48c001a-7956-4c4e-9054-d257a308ff95',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.529Z',
                },
            },
            {
                text: 'that is good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'bd91f733-7c08-4656-a8fe-f2130c7ad16f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.530Z',
                },
            },
            {
                text: 'so cool',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'e26c901c-185c-47ba-90af-9bfe63e565a4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.532Z',
                },
            },
            {
                text: 'glad to hear that',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'dfa53534-4c38-4db3-8550-5727d60dcace',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.536Z',
                },
            },
            {
                text: 'cool',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'b80b71e3-22d7-497d-a65d-c15858a64649',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.539Z',
                },
            },
            {
                text: 'that\'s very nice of you',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '23f1af24-dfdb-4ed9-b7f7-a49fe80475d7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.541Z',
                },
            },
            {
                text: 'terrific',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '0b568c33-95bb-4e3f-be56-8cac37d693ab',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.543Z',
                },
            },
            {
                text: 'it\'s amazing',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'ba354c1d-f2c6-4b59-b41c-ab9b34e48134',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.544Z',
                },
            },
            {
                text: 'that\'s awesome',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '4eb4e207-7daf-4e73-afac-923937d91267',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.546Z',
                },
            },
            {
                text: 'perfect',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'ce5a01cc-df3c-4a77-b37f-32560b146e89',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.548Z',
                },
            },
            {
                text: 'excellent',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'dfd3fe92-224a-48ce-be47-ef134092aeff',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.549Z',
                },
            },
            {
                text: 'brilliant',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'abc18d9a-d70b-47c7-995c-380783ea3edd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.551Z',
                },
            },
            {
                text: 'that\'s great',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '3817a247-993b-4933-a442-b1baf0cf3734',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.553Z',
                },
            },
            {
                text: 'it\'s good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '39aea161-95f0-4953-8a62-114ded30c075',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.555Z',
                },
            },
            {
                text: 'it\'s great',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '7c606952-6c4d-405f-8a1d-4914ca566272',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.557Z',
                },
            },
            {
                text: 'fine',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '19afd6f6-04ba-4b1f-b821-7e8701ce6341',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.559Z',
                },
            },
            {
                text: 'good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '678f2eb6-3a86-41de-a342-9fe13d4c05e5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.561Z',
                },
            },
            {
                text: 'nice',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '734f5567-853b-4132-b586-577fc16b7c15',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.563Z',
                },
            },
            {
                text: 'that\'s fine',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'ecc78f02-02b2-4685-830c-e5479be060c9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.564Z',
                },
            },
            {
                text: 'very good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '590d99c1-5f20-40c7-ba06-692dbb2a0381',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.566Z',
                },
            },
            {
                text: 'amazing',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '13e06be7-bdbc-40f6-9c52-7caa0ec8afeb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.568Z',
                },
            },
            {
                text: 'fantastic',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '62f15cbf-5dc4-47c8-8d0f-a198804cfd15',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.570Z',
                },
            },
            {
                text: 'great',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '96b50082-81ef-4e35-af3f-99b953a516a3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.572Z',
                },
            },
            {
                text: 'good very good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'a47df6c2-429b-4935-8770-ee48b84ae0ba',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.574Z',
                },
            },
            {
                text: 'it\'s perfect',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'e8501a49-e6b0-4c88-a536-1c1dabc4e9fb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.576Z',
                },
            },
            {
                text: 'that\'s very good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '69976310-35d1-42ec-a95a-75c617278141',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.578Z',
                },
            },
            {
                text: 'it is fine',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'be3c360f-9800-41b5-ad50-00f2576f0047',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.579Z',
                },
            },
            {
                text: 'it is good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '8fbb9a44-f79d-441c-a843-7d41eebe7a34',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.581Z',
                },
            },
            {
                text: 'really good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'a1ed1141-9105-4023-ae61-2aa4ce68e3fb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.582Z',
                },
            },
            {
                text: 'it\'s great',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '2952d942-d0ad-415a-8c7b-fd8add28f618',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.585Z',
                },
            },
            {
                text: 'much better',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '3779423f-e950-48af-8f44-341e54938563',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.588Z',
                },
            },
            {
                text: 'not bad',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '9cb2b23e-7780-4496-8fea-fd34d4dc4fe9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.590Z',
                },
            },
            {
                text: 'not too bad',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '32211b93-a9a3-4966-9c57-8b162572074b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.592Z',
                },
            },
            {
                text: 'pretty good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '3ac40aff-bd81-41c8-97ca-5da66900cf37',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.594Z',
                },
            },
            {
                text: 'it\'s very good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'cb0904e0-ed8b-4fdb-be80-a7aa2184cae6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.596Z',
                },
            },
            {
                text: 'marvelous',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'b6ade954-50bb-4875-b041-8b421a690c7a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.598Z',
                },
            },
            {
                text: 'straight',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '7f0ffbad-de5b-4acb-9d86-b0a9098a513b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.600Z',
                },
            },
            {
                text: 'that\'s nice',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '99785e30-9703-4f75-add7-2ad8c0931851',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.607Z',
                },
            },
            {
                text: 'pleasant',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'bfcba2e7-d132-49a5-9e72-23279fe2dbc1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.609Z',
                },
            },
            {
                text: 'really nice',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'ed685a1c-974a-43b6-ab05-ecb50307f592',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.610Z',
                },
            },
            {
                text: 'splendid',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '60bad98e-6150-427b-8964-65ca541b7dbf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.612Z',
                },
            },
            {
                text: 'super',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '23816c50-9f89-4f7f-b398-5a55d66bbf94',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.614Z',
                },
            },
            {
                text: 'super fantastic',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '92af73fc-978c-49b8-b778-378dae98b2fc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.615Z',
                },
            },
            {
                text: 'do not proceed',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: 'd5a878aa-3f76-4f00-a292-a4978f7cdfe9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.617Z',
                },
            },
            {
                text: 'forget about it',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '71c6ebb8-41bf-4c0a-9dda-8d7282a7842b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.619Z',
                },
            },
            {
                text: 'nevermind',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '5854a886-be7b-4bca-9ac1-ffda235eb4e9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.621Z',
                },
            },
            {
                text: 'I don\'t wanna do that anymore',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '1d14db6f-8000-452b-8153-5deaf6429055',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.623Z',
                },
            },
            {
                text: 'idiot',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'c7df57a2-2c13-4f30-bd48-2d2c4d27ed1e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.626Z',
                },
            },
            {
                text: 'are you serious',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '8d3a4287-e7c9-420d-a6e5-250529efe276',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.629Z',
                },
            },
            {
                text: 'son of a bitch',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'a2bac47c-fcfb-4a67-9be0-74b9dc27777d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.631Z',
                },
            },
            {
                text: 'dumbass',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'a0283279-59e8-4b7f-bb39-af7ca569f3bd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.633Z',
                },
            },
            {
                text: 'dumb ass',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'e69995e6-2084-46ab-a655-aa153d261057',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.635Z',
                },
            },
            {
                text: 'I can\'t deal with you anymore',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'b0ec4f4a-29b1-4b89-8ebe-4793815a7186',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.637Z',
                },
            },
            {
                text: 'I am frustrated',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '791603ef-6d39-441a-a952-a1bb1df59e5a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.639Z',
                },
            },
            {
                text: 'I would like to stop that',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: 'b34e442f-c5bb-4351-be50-ea01734ae3e3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.641Z',
                },
            },
            {
                text: 'this is frustrating',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '92c15694-cc56-4cf7-925c-a16d0b4d4ca1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.645Z',
                },
            },
            {
                text: 'cocksucker',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'e646e293-3fab-468f-bff3-002f55c337f6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.648Z',
                },
            },
            {
                text: 'jackass',
                intent: 'chitchat.insults',
                entities: [],
                _id: '01543c3a-1d8a-4906-b254-52da65d9003f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.650Z',
                },
            },
            {
                text: 'asshole',
                intent: 'chitchat.insults',
                entities: [],
                _id: '39ae3d9f-ef19-4abe-8f15-49c2e560b2f8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.652Z',
                },
            },
            {
                text: 'asswipe',
                intent: 'chitchat.insults',
                entities: [],
                _id: '6f9a5e66-c41f-4813-b3c9-ddf83bc0a855',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.654Z',
                },
            },
            {
                text: 'asshat',
                intent: 'chitchat.insults',
                entities: [],
                _id: '81c0f1ad-326d-495b-bc6d-ebc08d5d58b1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.657Z',
                },
            },
            {
                text: 'shit',
                intent: 'chitchat.insults',
                entities: [],
                _id: '131ee065-553d-4eb0-af33-a3638870f1f7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.658Z',
                },
            },
            {
                text: 'dickhead',
                intent: 'chitchat.insults',
                entities: [],
                _id: '1608d5c6-e049-4360-ab8b-97360b528021',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.660Z',
                },
            },
            {
                text: 'motherfucker',
                intent: 'chitchat.insults',
                entities: [],
                _id: '567a91f2-d4a6-466c-87a5-b067604c4716',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.662Z',
                },
            },
            {
                text: 'ass',
                intent: 'chitchat.insults',
                entities: [],
                _id: '1b3ba4e6-f071-4088-b23a-bf92382cc297',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.664Z',
                },
            },
            {
                text: 'idiot',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'b3149dd9-6978-4c45-b758-0d4d33483bcd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.666Z',
                },
            },
            {
                text: 'bastard',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'ce646bee-2e1a-43c0-b7fb-02cf91847013',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.670Z',
                },
            },
            {
                text: 'that is not possible',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '94544f76-d863-4a7c-b619-ece1eaeadf6d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.673Z',
                },
            },
            {
                text: 'I want to speak to a human',
                intent: 'basics.request_handover',
                entities: [],
                _id: '3a8742e9-e4ba-41a8-9e14-09ba64a1bc87',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.676Z',
                },
            },
            {
                text: 'Fuck you!',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'c6490200-7305-41c9-824d-f88f4d6d538e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.679Z',
                },
            },
            {
                text: 'you\'re not getting it',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: 'bca39bb4-7e1b-4ba3-9923-e8a19bd1ab64',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.680Z',
                },
            },
            {
                text: 'Use your brain ass!',
                intent: 'chitchat.insults',
                entities: [],
                _id: '6b01b671-d399-4a63-bfa0-d1830f274bb8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.683Z',
                },
            },
            {
                text: 'You\'re dumb!!',
                intent: 'chitchat.insults',
                entities: [],
                _id: '2b57c94c-e0a1-411a-a11f-54305f1eb0dd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.687Z',
                },
            },
            {
                text: 'I can\'t believe this',
                intent: 'chitchat.this_is_frustrating',
                entities: [],
                _id: '101fd2ca-73ea-4468-b41f-d2a115a02bdf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.691Z',
                },
            },
            {
                text: 'prig',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'fc624f56-a81b-462b-8c4e-91b27a2f0b46',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.694Z',
                },
            },
            {
                text: 'schmuck',
                intent: 'chitchat.insults',
                entities: [],
                _id: '6d6d49eb-4dcc-4b73-af8c-a9b08983723e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.696Z',
                },
            },
            {
                text: 'sure no problem',
                intent: 'chitchat.no_problem',
                entities: [],
                _id: '50388696-e61f-4a12-a761-2e33e583c400',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.697Z',
                },
            },
            {
                text: 'there\'s no problem',
                intent: 'chitchat.no_problem',
                entities: [],
                _id: 'e9e9b1ff-e353-4cdc-b104-8baea22bf831',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.699Z',
                },
            },
            {
                text: 'no worries',
                intent: 'chitchat.no_problem',
                entities: [],
                _id: 'b155e1d6-6fb6-4220-89b4-2ce99a78ed7e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.702Z',
                },
            },
            {
                text: 'that\'s fine',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '7c8ae05f-b9e4-46b9-b0a7-39c29c4ff94c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.705Z',
                },
            },
            {
                text: 'no it\'s okay',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'bc384f41-5cc4-4461-9dc4-615941aae27c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.708Z',
                },
            },
            {
                text: 'okay good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'a905ea56-85c3-4e41-b85f-372d45be691b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.710Z',
                },
            },
            {
                text: 'that was good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'db414243-1bd4-4b6a-9160-28ec94886c75',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.712Z',
                },
            },
            {
                text: 'it\'s awesome',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '3f8fb87c-e932-46d4-b830-0da71ade23f2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.713Z',
                },
            },
            {
                text: 'that\'s great',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '51f4d252-8ed8-48f3-b235-49c01974e604',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.715Z',
                },
            },
            {
                text: 'don\'t worry',
                intent: 'chitchat.no_problem',
                entities: [],
                _id: 'dc125d7e-8190-4ae2-9f00-9de7f94ef60c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.717Z',
                },
            },
            {
                text: 'no problem about that',
                intent: 'chitchat.no_problem',
                entities: [],
                _id: '0fe73596-8596-45ca-90eb-d2970062fa19',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.719Z',
                },
            },
            {
                text: 'no problem',
                intent: 'chitchat.no_problem',
                entities: [],
                _id: '010a2fd6-b743-420d-87e1-b249e4148802',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.721Z',
                },
            },
            {
                text: 'no probs',
                intent: 'chitchat.no_problem',
                entities: [],
                _id: '17ef9284-886c-4959-a545-451e4611beef',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.725Z',
                },
            },
            {
                text: 'very nice',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '43f0489d-ebc9-426e-b7e9-f9e2e56f40c1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.727Z',
                },
            },
            {
                text: 'good thing',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'fb492e11-7eff-4bba-9534-ff6c8a962a4d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.729Z',
                },
            },
            {
                text: 'it\'s very good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'b7c38def-c639-4867-9e01-86dbeeaf9d1e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.731Z',
                },
            },
            {
                text: 'oh well',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '391fb540-27b4-4d3c-804e-baf61b9d098c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.733Z',
                },
            },
            {
                text: 'it was good',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: '7005c5e0-1186-4fbd-8212-1a7daee30b36',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.735Z',
                },
            },
            {
                text: 'it\'s fine',
                intent: 'chitchat.this_is_good',
                entities: [],
                _id: 'd2875a84-2c5e-4934-a039-241b5d9d4dfa',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.737Z',
                },
            },
            {
                text: 'thanks a lot',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '8389d7d6-e889-4924-89e9-14e1ce6250e4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.739Z',
                },
            },
            {
                text: 'terrific thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'fe879d5d-e89a-4236-8381-f43b88f76a99',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.742Z',
                },
            },
            {
                text: 'great thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'b63c7ec9-0329-4e07-9db3-a660157302c9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.745Z',
                },
            },
            {
                text: 'thanks so much',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'c73a942d-05ec-4ea1-bd2b-0f0aae34ebd0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.747Z',
                },
            },
            {
                text: 'thank you so much',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '168f19ba-6982-4ad1-9157-c241b2e35c0a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.749Z',
                },
            },
            {
                text: 'thanks for your help',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'a648f28a-d19b-4113-89ee-7732a553f9af',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.753Z',
                },
            },
            {
                text: 'thank you for your help',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '0210cb78-591e-4de0-a3ef-26a342c0fc7f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.755Z',
                },
            },
            {
                text: 'nice thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '36266687-ee97-4d97-8ef7-c2ee27776802',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.758Z',
                },
            },
            {
                text: 'I appreciate it',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '66307bfd-8c11-4102-9026-ed6e4f2afeb3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.760Z',
                },
            },
            {
                text: 'I thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'ff6ef409-27ec-4102-a509-c51a465122b4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.761Z',
                },
            },
            {
                text: 'thank you that will be all',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '46c1da7a-b655-4975-8667-2f0629918793',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.763Z',
                },
            },
            {
                text: 'thanks buddy',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'af30ae40-8098-473b-b969-d9bd50ac2701',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.765Z',
                },
            },
            {
                text: 'thanks love',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'bba936b0-9604-4279-b890-cd104d2d6a00',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.767Z',
                },
            },
            {
                text: 'thank you my friend',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '25722088-5b86-4b6e-8831-074abae1e984',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.768Z',
                },
            },
            {
                text: 'very good thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'fc4a294a-6048-4546-b6b1-0fd7407a0c04',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.770Z',
                },
            },
            {
                text: 'good thanks',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '140a890a-3fc0-4445-a2ef-636347659667',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.773Z',
                },
            },
            {
                text: 'thanks again',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '164d0d96-180b-484b-9d1d-ca48da040b68',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.775Z',
                },
            },
            {
                text: 'thank you again',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '25135b68-d4b5-4d34-a37f-c16517559ce7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.778Z',
                },
            },
            {
                text: 'no thank you that\'s all',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '2776468b-7697-406e-9cda-0d3f25bd2e6a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.780Z',
                },
            },
            {
                text: 'perfect thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '189c38b8-1844-4a4e-90ba-9e97835b2cad',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.781Z',
                },
            },
            {
                text: 'so nice of you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '35178448-2e31-4120-880d-a4e24dc59b43',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.783Z',
                },
            },
            {
                text: 'well thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'f07a89c5-978c-4465-85dc-e8837a16c750',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.785Z',
                },
            },
            {
                text: 'well thanks',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '7f0b78db-ef84-435a-935c-7e59367d7c42',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.789Z',
                },
            },
            {
                text: 'thnx',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'cd2c87fd-b92f-4fb6-b83b-d467c7b1809e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.793Z',
                },
            },
            {
                text: 'thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '90ff6899-3f43-4e79-aecb-aefe7aa1064d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.795Z',
                },
            },
            {
                text: 'thanx',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'ce3360b0-2c9f-4331-af89-69d398a9ed52',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.798Z',
                },
            },
            {
                text: 'that\'s my pleasure',
                intent: 'chitchat.you_are_welcome',
                entities: [],
                _id: 'b459f625-8995-4df4-98b5-e806fa4be425',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.800Z',
                },
            },
            {
                text: 'my pleasure',
                intent: 'chitchat.you_are_welcome',
                entities: [],
                _id: '7ad7b835-c043-4580-93d8-e971e7dd31b8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.802Z',
                },
            },
            {
                text: 'anytime',
                intent: 'chitchat.you_are_welcome',
                entities: [],
                _id: '5e4d0b8e-d89c-4661-a9ab-e7af2242259b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.805Z',
                },
            },
            {
                text: 'welcome',
                intent: 'chitchat.you_are_welcome',
                entities: [],
                _id: 'cae8f8c5-4b1f-43a8-95af-297cbf803532',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.807Z',
                },
            },
            {
                text: 'you\'re welcome',
                intent: 'chitchat.you_are_welcome',
                entities: [],
                _id: 'b4a89d1a-f457-4b7d-affd-76e48359f7da',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.809Z',
                },
            },
            {
                text: 'sure welcome',
                intent: 'chitchat.you_are_welcome',
                entities: [],
                _id: '17fa3908-afdc-490a-9723-1a2759cccc55',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.811Z',
                },
            },
            {
                text: 'welcome here',
                intent: 'chitchat.you_are_welcome',
                entities: [],
                _id: '274a0e2b-87e4-405b-bd03-f8faf6c0119a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.813Z',
                },
            },
            {
                text: 'you\'re so welcome',
                intent: 'chitchat.you_are_welcome',
                entities: [],
                _id: '74f2d110-bb7f-409d-9266-a44be38f20fc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.815Z',
                },
            },
            {
                text: 'anything you want',
                intent: 'chitchat.you_are_welcome',
                entities: [],
                _id: 'd5f57c36-2460-4e4b-9fef-aed74b7cb5ec',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.817Z',
                },
            },
            {
                text: 'good job',
                intent: 'chitchat.good_job',
                entities: [],
                _id: 'fc0727c7-67da-4f05-9d4a-ecaef0fb5830',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.819Z',
                },
            },
            {
                text: 'great job',
                intent: 'chitchat.good_job',
                entities: [],
                _id: '301c8601-26cf-48fc-973a-81cde87b87a9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.820Z',
                },
            },
            {
                text: 'way to go',
                intent: 'chitchat.good_job',
                entities: [],
                _id: '294da870-ac3f-4707-b12a-7bf9e435d79d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.824Z',
                },
            },
            {
                text: 'well done',
                intent: 'chitchat.good_job',
                entities: [],
                _id: 'c02eb208-df24-425d-8769-cf8e1f0664d6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.825Z',
                },
            },
            {
                text: 'nice work',
                intent: 'chitchat.good_job',
                entities: [],
                _id: '76ee405e-437c-4609-95aa-f6683d2bb6d8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.827Z',
                },
            },
            {
                text: 'great work',
                intent: 'chitchat.good_job',
                entities: [],
                _id: '47042b5d-5c13-4976-89a5-635c3f6c8dd9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.829Z',
                },
            },
            {
                text: 'amazing work',
                intent: 'chitchat.good_job',
                entities: [],
                _id: '513cdb53-27ad-4cde-80ea-ee5f1e6a14f9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.831Z',
                },
            },
            {
                text: 'bravo',
                intent: 'chitchat.good_job',
                entities: [],
                _id: 'a8e3d5ce-5ec5-47cb-82aa-d984177d8c31',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.833Z',
                },
            },
            {
                text: 'good work',
                intent: 'chitchat.good_job',
                entities: [],
                _id: '3fb45939-ce9d-48cc-9edd-4e900fee3bc9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.835Z',
                },
            },
            {
                text: 'I don\'t care',
                intent: 'chitchat.i_dont_care',
                entities: [],
                _id: 'bb3148d3-8be5-48d9-b8ca-76ef040689c9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.837Z',
                },
            },
            {
                text: 'I shouldn\'t care about this',
                intent: 'chitchat.i_dont_care',
                entities: [],
                _id: '26f0bd4c-10b8-4418-9e77-28682975af7b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.839Z',
                },
            },
            {
                text: 'whatever',
                intent: 'chitchat.i_dont_care',
                entities: [],
                _id: '0c7ecf2e-a5da-4a9e-b031-55da37c9f956',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.842Z',
                },
            },
            {
                text: 'I do not care',
                intent: 'chitchat.i_dont_care',
                entities: [],
                _id: '92c18551-25f0-4199-8ebc-b6777502a9c5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.845Z',
                },
            },
            {
                text: 'I don\'t care at all',
                intent: 'chitchat.i_dont_care',
                entities: [],
                _id: 'f6266630-967e-4272-84f8-8b5157757081',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.847Z',
                },
            },
            {
                text: 'not caring',
                intent: 'chitchat.i_dont_care',
                entities: [],
                _id: '37d64ccd-953d-4f57-903a-27bf10e3dd77',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.849Z',
                },
            },
            {
                text: 'not care at all',
                intent: 'chitchat.i_dont_care',
                entities: [],
                _id: 'e3536669-1895-415c-b3c2-05a24e30be07',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.852Z',
                },
            },
            {
                text: 'don\'t care at all',
                intent: 'chitchat.i_dont_care',
                entities: [],
                _id: 'ea950722-f060-462f-8f2f-161bfa448ced',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.854Z',
                },
            },
            {
                text: 'not caring at all',
                intent: 'chitchat.i_dont_care',
                entities: [],
                _id: '0a094d94-37e9-4349-8ebd-91a3d0ab94d1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.856Z',
                },
            },
            {
                text: 'excuse me',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'fcdc6dd5-f865-43a0-b9aa-28279ad2ac9b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.858Z',
                },
            },
            {
                text: 'apologise',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '0281b850-c0cf-4e06-8221-9eccd8069f2c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.861Z',
                },
            },
            {
                text: 'I apologize',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'ca8ad4a1-e3ab-467f-9fe7-2758283499b9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.862Z',
                },
            },
            {
                text: 'sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '0b60214a-fa13-45af-85ea-1a0f7113182d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.864Z',
                },
            },
            {
                text: 'I\'m sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '5fde1ba6-586f-4adc-9e2f-abd76c377a96',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.866Z',
                },
            },
            {
                text: 'I am so sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'aa34c3b9-4c70-471b-9cfd-dcf170e8aac2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.867Z',
                },
            },
            {
                text: 'my apologies',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '0852aed9-99b0-4557-8050-21bdf2862495',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.870Z',
                },
            },
            {
                text: 'apologies',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '3f152eb9-51ca-40e6-86e9-0b13b9b2b960',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.872Z',
                },
            },
            {
                text: 'apologies to me',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'ae90ff1e-2b99-4dd4-a6bd-3643dbb9ae71',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.875Z',
                },
            },
            {
                text: 'apology',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '25419284-fdc3-4e9a-b72a-19689e60cec6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.876Z',
                },
            },
            {
                text: 'excuse',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'c2c6ac82-4b9d-4d18-8945-b7923d8ec716',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.879Z',
                },
            },
            {
                text: 'I beg your pardon',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '7776bc73-6ac4-47a3-adb5-3894cbfd24a8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.881Z',
                },
            },
            {
                text: 'pardon',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'deac8b33-60cf-496e-9375-de54399ccf30',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.883Z',
                },
            },
            {
                text: 'I said sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '03401cd0-31b6-450b-9cd0-46dc89aaa43e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.884Z',
                },
            },
            {
                text: 'I am really sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'babc96c2-9ad5-4e60-b39c-f615e7579744',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.887Z',
                },
            },
            {
                text: 'forgive me',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'f590f3d2-fdef-4694-be86-06d460b82a9e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.893Z',
                },
            },
            {
                text: 'sorry about that',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'aeed7b07-6ac0-4a8d-b6a4-75fb552e09f9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.896Z',
                },
            },
            {
                text: 'sorry about this',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '22edc073-2e9d-4673-a8b4-054d6a331e97',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.898Z',
                },
            },
            {
                text: 'really sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '021308ba-bcfc-4a01-8241-d51652ec32f5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.900Z',
                },
            },
            {
                text: 'very sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '4d9ba0b2-7d6d-4575-b4b6-980dae1a93f4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.902Z',
                },
            },
            {
                text: 'ok sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '6b38fc15-8720-4246-857c-7653ff31b456',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.905Z',
                },
            },
            {
                text: 'I want to say sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '8af4d820-a702-42aa-a871-ead858707416',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.908Z',
                },
            },
            {
                text: 'alright I\'m sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: '54902fa0-ffd3-4a0b-86e0-4252960ecf66',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.910Z',
                },
            },
            {
                text: 'okay I\'m sorry',
                intent: 'chitchat.i_am_sorry',
                entities: [],
                _id: 'affb3a7d-5b07-4905-8ee9-b06f2b63e8fa',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.912Z',
                },
            },
            {
                text: 'what exactly do you mean',
                intent: 'chitchat.what_do_you_mean',
                entities: [],
                _id: '6daffb23-99cf-45e8-aab5-57caf97df449',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.914Z',
                },
            },
            {
                text: 'what do you mean',
                intent: 'chitchat.what_do_you_mean',
                entities: [],
                _id: 'b0e758dc-e704-4ba1-be5b-a654de94e1f4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.916Z',
                },
            },
            {
                text: 'is that what you mean',
                intent: 'chitchat.what_do_you_mean',
                entities: [],
                _id: 'c1dbb60c-8e77-4cb2-a688-f3b12c735167',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.918Z',
                },
            },
            {
                text: 'what do you mean exactly',
                intent: 'chitchat.what_do_you_mean',
                entities: [],
                _id: 'e3852a60-7fc2-4095-b4c9-479d12ea5f23',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.920Z',
                },
            },
            {
                text: 'but what do you mean',
                intent: 'chitchat.what_do_you_mean',
                entities: [],
                _id: 'e23e05b3-253c-4f21-8307-1ca9d1701918',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.923Z',
                },
            },
            {
                text: 'that was wrong',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: 'd84208aa-3adf-4165-b0e6-218f1d5d9825',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.925Z',
                },
            },
            {
                text: 'that\'s not what I asked',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: '4a164893-a9c3-4dd1-8122-83c0c9aee799',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.927Z',
                },
            },
            {
                text: 'that\'s wrong',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: '2b3cc447-cc60-4146-9147-37ac8db9b38d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.928Z',
                },
            },
            {
                text: 'wrong',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: 'a1ffa493-de6e-428f-876d-243e675e0de1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.930Z',
                },
            },
            {
                text: 'it is not right',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: '42d38fcc-bc0c-4315-95f8-f3e10554675b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.933Z',
                },
            },
            {
                text: 'that\'s not right',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: '944897d1-159e-44c3-957e-3147560b51b0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.935Z',
                },
            },
            {
                text: 'it\'s wrong',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: 'ab73bb76-852f-4a8d-861c-f046add70b8a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.938Z',
                },
            },
            {
                text: 'that is incorrect',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: '445c37c9-238d-421e-822d-c1bbe74ac0d9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.941Z',
                },
            },
            {
                text: 'incorrect',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: '85d440c8-8252-47c7-9852-9f22ef075577',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.944Z',
                },
            },
            {
                text: 'not correct',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: 'd7d5463c-389b-4a97-a6b7-25b0a5a52c07',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.945Z',
                },
            },
            {
                text: 'you are wrong',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: 'dddb7863-4003-48e8-aa18-79662b76948b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.948Z',
                },
            },
            {
                text: 'not right',
                intent: 'chitchat.that_is_wrong',
                entities: [],
                _id: '37120223-c0eb-4f15-a992-ef89410e5425',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.950Z',
                },
            },
            {
                text: 'okay see you later',
                intent: 'chitchat.bye',
                entities: [],
                _id: '63dc536e-18dd-48b5-90b0-a6367fa02122',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.953Z',
                },
            },
            {
                text: 'hope to see you later',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'aa5ed5bd-1240-4ce0-a604-0eac34e8f8a6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.955Z',
                },
            },
            {
                text: 'bye for now',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'f593a32f-b032-4e23-9c0b-0371a4318e49',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.957Z',
                },
            },
            {
                text: 'till next time',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'dd248fd2-7707-43c4-ad4b-93e442a4160b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.959Z',
                },
            },
            {
                text: 'I must go',
                intent: 'chitchat.bye',
                entities: [],
                _id: '85e3a182-bce8-45cf-bb9f-cf669859682b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.961Z',
                },
            },
            {
                text: 'bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: '38529b4d-bf34-4ea9-99da-d1203cbce554',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.963Z',
                },
            },
            {
                text: 'goodbye',
                intent: 'chitchat.bye',
                entities: [],
                _id: '92f55643-6126-405e-a237-57f329d769e0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.964Z',
                },
            },
            {
                text: 'see you',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'dd469747-ef71-4967-9767-ece5ce7a1db5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.966Z',
                },
            },
            {
                text: 'see you soon',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'd1703414-194d-4068-bded-3c92bce09ca9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.968Z',
                },
            },
            {
                text: 'bye-bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: '6345aff2-6857-46d9-acea-450fd9172c9b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.970Z',
                },
            },
            {
                text: 'bye bye good night',
                intent: 'chitchat.bye',
                entities: [],
                _id: '4e558dc1-5e69-4c49-87e3-63eb9dd247a9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.972Z',
                },
            },
            {
                text: 'good bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: '91965b99-3a41-4104-9f90-28be17e57830',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.982Z',
                },
            },
            {
                text: 'bye bye see you',
                intent: 'chitchat.bye',
                entities: [],
                _id: '51ad077e-1348-4a46-a2ae-340098c596cf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.984Z',
                },
            },
            {
                text: 'bye bye see you soon',
                intent: 'chitchat.bye',
                entities: [],
                _id: '4d21c40e-b123-4cd0-a520-a2c01edc9442',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.986Z',
                },
            },
            {
                text: 'bye bye take care',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'f279ac17-4bcc-4df0-b4b3-17a8f66cda2d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.990Z',
                },
            },
            {
                text: 'I said bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: '8de7a4e8-adfa-4666-8e95-9933800aaaf7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.992Z',
                },
            },
            {
                text: 'never mind bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: '5bc7f653-993e-4e26-8abc-737cd59323d9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.994Z',
                },
            },
            {
                text: 'now bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'a30c4df1-f9e8-4ac8-95b7-cd85f2fdb9f0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.996Z',
                },
            },
            {
                text: 'that\'s all goodbye',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'd0f21d0e-f91e-46f1-a6e5-c2a51dead671',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:53.998Z',
                },
            },
            {
                text: 'that\'s it goodbye',
                intent: 'chitchat.bye',
                entities: [],
                _id: '6cc055c7-5b41-46ad-9a51-4df39555882c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54Z',
                },
            },
            {
                text: 'leave me alone',
                intent: 'chitchat.bye',
                entities: [],
                _id: '62e70018-2367-4b64-aae9-1b3e9bf833c5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.003Z',
                },
            },
            {
                text: 'go to bed',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'd74d2743-8978-4a4b-955a-770ded057d64',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.006Z',
                },
            },
            {
                text: 'goodbye for now',
                intent: 'chitchat.bye',
                entities: [],
                _id: '52ff7699-2e4f-4e03-887e-f48a1949803b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.015Z',
                },
            },
            {
                text: 'talk to you later',
                intent: 'chitchat.bye',
                entities: [],
                _id: '6a6ee868-a8e2-4f67-858f-5d74cc793ba6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.023Z',
                },
            },
            {
                text: 'you can go now',
                intent: 'chitchat.bye',
                entities: [],
                _id: '1b837316-f3f0-4b3c-956b-23dfb0df522b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.026Z',
                },
            },
            {
                text: 'get lost',
                intent: 'chitchat.bye',
                entities: [],
                _id: '1a02aaeb-cb7c-4fde-82b7-ce688334bbe5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.034Z',
                },
            },
            {
                text: 'goodbye see you later',
                intent: 'chitchat.bye',
                entities: [],
                _id: '44d69902-9d9f-4805-a25d-66a35ffd172f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.036Z',
                },
            },
            {
                text: 'alright bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'bc65d043-134a-4daa-a1a2-6615b4a0b78e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.038Z',
                },
            },
            {
                text: 'see ya',
                intent: 'chitchat.bye',
                entities: [],
                _id: '10c49fb2-2994-46f2-91bc-8ac7ff3d12c0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.040Z',
                },
            },
            {
                text: 'thanks bye bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: '4c94abcc-aed1-4e82-a3c4-95617627eb4b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.042Z',
                },
            },
            {
                text: 'okay bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'b2d98740-f326-4898-9747-5929c5295cbe',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.045Z',
                },
            },
            {
                text: 'okay thank you bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'ba4d4c91-cfb8-4d3a-b422-666eefe1a478',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.047Z',
                },
            },
            {
                text: 'see you tomorrow',
                intent: 'chitchat.bye',
                entities: [],
                _id: '00fdc6ec-b4c5-4e96-b9f1-acb1cfe4f024',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.049Z',
                },
            },
            {
                text: 'ok bye',
                intent: 'chitchat.bye',
                entities: [],
                _id: '420aba41-9025-4d23-bb1e-7bc83e498480',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.051Z',
                },
            },
            {
                text: 'good evening',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'b763e1fd-b2e9-4024-a6c5-7da4b69b1a01',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.053Z',
                },
            },
            {
                text: 'good evening to you',
                intent: 'chitchat.greet',
                entities: [],
                _id: '7292c9f8-ee5c-41b9-a0e9-2033d465dda5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.063Z',
                },
            },
            {
                text: 'hey good evening',
                intent: 'chitchat.greet',
                entities: [],
                _id: '826cb5e8-fae9-4ca5-ac12-cee13e82f589',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.083Z',
                },
            },
            {
                text: 'hello good evening',
                intent: 'chitchat.greet',
                entities: [],
                _id: '6bf308c2-15c3-4168-a05e-0ab3905360b4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.089Z',
                },
            },
            {
                text: 'evening',
                intent: 'chitchat.greet',
                entities: [],
                _id: '05bea782-df4f-498e-ae9a-2acaa624ee6d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.091Z',
                },
            },
            {
                text: 'good evening there',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'b62fa14f-12a3-4a31-8268-6abd4528e3e1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.093Z',
                },
            },
            {
                text: 'long time no see',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'bdb9b159-05fb-4e4f-9490-c543c378ad59',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.095Z',
                },
            },
            {
                text: 'hello',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'b61174a1-79ca-4d07-9f73-6cefc1cdac0a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.097Z',
                },
            },
            {
                text: 'hi',
                intent: 'chitchat.greet',
                entities: [],
                _id: '19279951-984d-4051-abc0-fd851c3d83fc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.099Z',
                },
            },
            {
                text: 'howdy',
                intent: 'chitchat.greet',
                entities: [],
                _id: '978486dd-d8ad-4c2d-8528-2da5bad1fa6d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.102Z',
                },
            },
            {
                text: 'hey there',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'aced98c7-7846-4b0e-8d00-87f009907ee6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.106Z',
                },
            },
            {
                text: 'hey',
                intent: 'chitchat.greet',
                entities: [],
                _id: '0bfc1afa-fad0-44e3-90e2-2ed64231c0e9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.108Z',
                },
            },
            {
                text: 'greetings',
                intent: 'chitchat.greet',
                entities: [],
                _id: '17418736-a999-4d28-ae83-b795583033f0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.109Z',
                },
            },
            {
                text: 'I greet you',
                intent: 'chitchat.greet',
                entities: [],
                _id: '5bec8d95-4dcf-4d84-a895-c6116206ce6b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.112Z',
                },
            },
            {
                text: 'hi there',
                intent: 'chitchat.greet',
                entities: [],
                _id: '74a752cb-01a0-49a7-b161-44f0d37c9962',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.113Z',
                },
            },
            {
                text: 'hello there',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'a12e6372-95bb-47c2-ad24-5e824d421b20',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.116Z',
                },
            },
            {
                text: 'lovely day isn\'t it',
                intent: 'chitchat.greet',
                entities: [],
                _id: '75d367d2-caa7-42a7-b277-e37a17afe35c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.118Z',
                },
            },
            {
                text: 'hello again',
                intent: 'chitchat.greet',
                entities: [],
                _id: '140f0be0-9455-4996-ad5a-190ec8de9842',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.122Z',
                },
            },
            {
                text: 'just going to say hi',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'ac6ed9a8-1127-4a2d-aadd-a0e5c694dcc2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.126Z',
                },
            },
            {
                text: 'hi there',
                intent: 'chitchat.greet',
                entities: [],
                _id: '6b8ec712-afe3-4113-a5f4-1ac46b75d5eb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.128Z',
                },
            },
            {
                text: 'a good day',
                intent: 'chitchat.greet',
                entities: [],
                _id: '17b45166-c776-489d-8a71-a7db59f29277',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.132Z',
                },
            },
            {
                text: 'afternoon',
                intent: 'chitchat.greet',
                entities: [],
                _id: '0239de9f-7012-41a7-aaf1-a90b093c4967',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.136Z',
                },
            },
            {
                text: 'hello hi',
                intent: 'chitchat.greet',
                entities: [],
                _id: '641859ab-70af-424e-ac7c-eaa9ba119d3f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.139Z',
                },
            },
            {
                text: 'heya',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'd09c966b-f548-46da-bb4e-4cee954d21d8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.143Z',
                },
            },
            {
                text: 'good morning',
                intent: 'chitchat.greet',
                entities: [],
                _id: '001db519-8652-4877-9661-cdc7f5c75897',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.148Z',
                },
            },
            {
                text: 'good morning to you',
                intent: 'chitchat.greet',
                entities: [],
                _id: '9e2e1e1a-0797-44f3-92fa-be73ebac0d5a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.150Z',
                },
            },
            {
                text: 'hello good morning',
                intent: 'chitchat.greet',
                entities: [],
                _id: '4756dfe3-a404-4d0a-81fb-c7896ef5ad57',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.156Z',
                },
            },
            {
                text: 'have a nice morning',
                intent: 'chitchat.greet',
                entities: [],
                _id: '578fe37f-6b46-434f-b23d-a67203a09f25',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.158Z',
                },
            },
            {
                text: 'have a great morning',
                intent: 'chitchat.greet',
                entities: [],
                _id: '9699af5d-5abe-47ae-b796-e00e071a3f25',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.160Z',
                },
            },
            {
                text: 'morning',
                intent: 'chitchat.greet',
                entities: [],
                _id: '2e3063ca-44a4-4db0-b488-18504aa1095b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.162Z',
                },
            },
            {
                text: 'good morning there',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'a3423b0a-bd81-4a20-97bd-15138fdf9839',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.163Z',
                },
            },
            {
                text: 'top of the morning to you',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'f0b42b71-3a3e-4ef6-bb70-4721ced350d8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.165Z',
                },
            },
            {
                text: 'a good morning',
                intent: 'chitchat.greet',
                entities: [],
                _id: '63c72acd-aa26-4ca6-8f12-c93d292caceb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.168Z',
                },
            },
            {
                text: 'good morning to you',
                intent: 'chitchat.greet',
                entities: [],
                _id: '7340c99f-ee56-4b7b-b180-46870cb11dd1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.170Z',
                },
            },
            {
                text: 'hi good morning',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'ee381962-fce5-4402-bbe9-553396634b77',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.172Z',
                },
            },
            {
                text: 'and a good morning to you',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'a6ca6457-f8b5-402b-99c9-de8c289f36f7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.175Z',
                },
            },
            {
                text: 'good morning too',
                intent: 'chitchat.greet',
                entities: [],
                _id: 'b4cf302b-8c32-4c93-ad24-489092e5c854',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.177Z',
                },
            },
            {
                text: 'how is your morning so far',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '00c6422e-fc17-4201-bb18-34f6213d6a8d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.179Z',
                },
            },
            {
                text: 'how are you getting on',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'dea57dc2-0388-4b8b-9d5b-64580c4e5765',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.181Z',
                },
            },
            {
                text: 'how\'s your day going',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '562da7fa-349c-424c-9922-172fdc100338',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.184Z',
                },
            },
            {
                text: 'how are you',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '35cd7efe-75bd-458b-a74d-0a704653bafb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.185Z',
                },
            },
            {
                text: 'is everything all right',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '8c17dbe6-1958-4ecc-8f11-a74ef8cb4008',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.187Z',
                },
            },
            {
                text: 'how are you doing',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'a8fc5ad0-303c-48f8-9f4e-fee4aa69afce',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.190Z',
                },
            },
            {
                text: 'how are the things going',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '4f579661-c66b-4477-abf5-100cbac86415',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.192Z',
                },
            },
            {
                text: 'are you alright',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'd1e819d4-d577-4ff7-b48c-54d7e05d5b59',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.194Z',
                },
            },
            {
                text: 'are you okay',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '5e5641a7-dc67-4257-8969-68f63d54877f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.195Z',
                },
            },
            {
                text: 'how are you feeling',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'b36fedbc-59cb-4d6e-93d8-994d9b49462f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.197Z',
                },
            },
            {
                text: 'how are you going',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '471c3c7c-67e5-497a-98ed-2b45207f5c54',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.199Z',
                },
            },
            {
                text: 'is everything okay',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '060c0f5f-c9ec-4a99-b8b1-2081760bc9f7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.201Z',
                },
            },
            {
                text: 'how are you today',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '57cef04e-2824-49d1-ab3f-9f9d10f77a39',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.204Z',
                },
            },
            {
                text: 'how do you do',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '0fba00e0-c68d-49a1-83b9-575f3f140cd0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.206Z',
                },
            },
            {
                text: 'how do you feel',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'e1cd9525-dab5-428a-928d-51f0cb46ee69',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.208Z',
                },
            },
            {
                text: 'how have you been',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '2a5ea33a-6870-4b3e-877e-283fed43a5be',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.210Z',
                },
            },
            {
                text: 'how is it',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '37f2691b-199f-4a49-b125-ddccf56af5cc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.212Z',
                },
            },
            {
                text: 'how is it going',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '73d1a24d-3779-4736-97d7-13a6f007fb9d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.214Z',
                },
            },
            {
                text: 'how is your day',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '193fe902-443f-4e31-b173-fa71776d133e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.216Z',
                },
            },
            {
                text: 'how is your day going',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '1aa2ee66-7f62-43f2-96f0-8d2412e9db5b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.217Z',
                },
            },
            {
                text: 'how is your evening',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'cce14954-f51d-4fc6-9f02-f29caf52918f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.219Z',
                },
            },
            {
                text: 'how was your day',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '84ea98b5-0400-4a31-816d-1192d7b92801',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.221Z',
                },
            },
            {
                text: 'are you having a good day',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '87e8ee38-7efe-4d27-a61c-a58f0cacb50f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.223Z',
                },
            },
            {
                text: 'hope your day is going well',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '277eb92d-4fdf-4ee3-bca3-46a0b2e5c858',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.225Z',
                },
            },
            {
                text: 'hope you re having a pleasant eve',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '18e0b2d2-7c4d-4580-ac48-773240acc17c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.226Z',
                },
            },
            {
                text: 'how\'s life',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '456b3099-ebad-469d-bcb4-eaa244b6e9e2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.228Z',
                },
            },
            {
                text: 'I\'m fine and you',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '2b25f26b-b07e-438e-8295-d1d3e2691ee6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.231Z',
                },
            },
            {
                text: 'how is your life',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'fe10e2f2-f450-41ef-bc80-596e1270a086',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.233Z',
                },
            },
            {
                text: 'how has your day been',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '9957d0cb-69e7-4e60-a3ed-a8962e619575',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.234Z',
                },
            },
            {
                text: 'how is your morning going',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'c6890f3e-6ec7-4ee6-b7b4-6e3ff8d4f2c7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.236Z',
                },
            },
            {
                text: 'how has your day been going',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'b053d88f-7bc6-4ccb-894b-719829f8a33f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.241Z',
                },
            },
            {
                text: 'how about you',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '5353ea44-12a7-4f91-93d3-26ca62084a40',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.243Z',
                },
            },
            {
                text: 'how is your day being',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'f0e4ddac-9237-4e60-a8da-bc1b36208f00',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.245Z',
                },
            },
            {
                text: 'how is your day going on',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '5e370026-85bd-44a8-bb93-c54856d85c62',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.247Z',
                },
            },
            {
                text: 'how your day is going',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'd2aab97f-2880-4a2e-8f83-02c8173cd8b1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.249Z',
                },
            },
            {
                text: 'what was your day like',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'a1515a13-3d0a-49b6-acb3-3ab8b9c235a5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.251Z',
                },
            },
            {
                text: 'what about your day',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '831088e6-7d69-4aab-a8fb-d6ae6116f1ba',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.253Z',
                },
            },
            {
                text: 'how\'s your day',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'f6074e22-2d1c-4ef1-bd70-3797780a504f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.255Z',
                },
            },
            {
                text: 'how are you doing this morning',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: 'a7ac93aa-990a-46cc-a09e-ff4859d5bf06',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.258Z',
                },
            },
            {
                text: 'how is your day going',
                intent: 'chitchat.how_are_you',
                entities: [],
                _id: '6f34bb74-e935-4ee7-9a14-fe152d8fd829',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.261Z',
                },
            },
            {
                text: 'nice to meet you',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: 'e90c766a-2b14-4f6b-ac38-406d0d49c497',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.263Z',
                },
            },
            {
                text: 'it was nice meeting you',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: 'c90466ed-75a7-46ea-acd6-402bbc5e3121',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.265Z',
                },
            },
            {
                text: 'it was very nice to meet you',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: '24c265c0-4ff0-4481-9aff-c19f36b5b6ea',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.269Z',
                },
            },
            {
                text: 'good to know each other',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: 'd79e3ac9-803f-4974-8e3b-a4ffbfb04dd8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.271Z',
                },
            },
            {
                text: 'glad to meet you',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: '9a6feb53-baea-4cad-be16-824e60067f89',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.274Z',
                },
            },
            {
                text: 'nice meeting you',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: 'f41094db-f62d-4166-b87c-95b484d08c7a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.277Z',
                },
            },
            {
                text: 'nice to meet you too',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: 'a5159308-0a54-46f7-9f2f-d4e9e98a5f01',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.279Z',
                },
            },
            {
                text: 'pleased to meet you',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: '06d0546d-a907-4b40-ba14-127399f09273',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.283Z',
                },
            },
            {
                text: 'pleasure to meet you',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: '3a939e44-1805-4ed0-be18-58ddd9ad4a8d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.285Z',
                },
            },
            {
                text: 'pleasure to meet you too',
                intent: 'chitchat.nice_to_meet_you',
                entities: [],
                _id: '9d438588-c9fa-46a5-9418-7b96f7f2a4cd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.287Z',
                },
            },
            {
                text: 'it\'s nice to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: 'f549ae8f-c108-466f-9b1c-7902dec81882',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.290Z',
                },
            },
            {
                text: 'lovely to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '22e15cf9-7399-4be5-b3c5-d7c9d936e3b9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.293Z',
                },
            },
            {
                text: 'I\'m glad to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '9e481092-8144-488f-aa85-a3144d78e460',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.296Z',
                },
            },
            {
                text: 'great to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: 'ddb151a1-59be-4215-b440-5d789a5acc85',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.298Z',
                },
            },
            {
                text: 'it\'s good to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: 'fc02d25b-a11d-4e57-b1bd-569dabbc49fc',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.301Z',
                },
            },
            {
                text: 'glad to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: 'f65b454c-5306-4dec-b4e1-a46f1414fe0b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.304Z',
                },
            },
            {
                text: 'how good it is to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '0f46a5a6-4635-4a89-a922-56f7640791e5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.308Z',
                },
            },
            {
                text: 'always a pleasure to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '46c7b8c8-d168-41bd-a0c8-47baf7a7542e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.313Z',
                },
            },
            {
                text: 'nice to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '115df118-3aad-4f98-9348-6807d278c334',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.316Z',
                },
            },
            {
                text: 'good to see you',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '55298db3-7bed-46c1-863e-43d2045e38d2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.319Z',
                },
            },
            {
                text: 'great to see you again',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '84b9a115-bb98-488a-8a10-bc8399b3affb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.322Z',
                },
            },
            {
                text: 'great to see you too',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '124f2806-1478-42a4-b7ff-70ceaf5d4049',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.325Z',
                },
            },
            {
                text: 'I am glad to see you again',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: 'af498f08-fcef-474b-a4bf-40156b7fadb9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.327Z',
                },
            },
            {
                text: 'nice to see you again',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '60842934-5fd1-48a3-8dbb-f089b751f02d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.329Z',
                },
            },
            {
                text: 'glad to see you too',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '0d47c5a9-0efd-493e-811d-320992f0dd90',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.332Z',
                },
            },
            {
                text: 'good to see you again',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: '534cd190-d594-409d-bc33-08dc4845a856',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.336Z',
                },
            },
            {
                text: 'it\'s good to see you too',
                intent: 'chitchat.nice_to_see_you',
                entities: [],
                _id: 'fa293046-7f24-4d1f-be15-06ecc7821312',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.340Z',
                },
            },
            {
                text: 'what is on your mind',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: '95182a16-cb62-43a8-a9a0-68505b18fc18',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.342Z',
                },
            },
            {
                text: 'what\'s happened',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: 'c65d6787-15ab-4ed4-94b7-f51d6457acc2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.344Z',
                },
            },
            {
                text: 'what is up',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: 'bf18b4d3-73e5-469d-80bf-a19c198d6674',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.348Z',
                },
            },
            {
                text: 'what\'s up',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: 'a5b47dd1-c24a-4bc5-8d57-0a95732346ae',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.351Z',
                },
            },
            {
                text: 'whazzup',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: 'e4e527fd-e263-4cb8-85a5-8f3efd227a64',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.355Z',
                },
            },
            {
                text: 'good what\'s up',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: '0541b8d9-64b5-4325-a7f4-3a9804b2b143',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.357Z',
                },
            },
            {
                text: 'I said what\'s up',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: '52def3ec-5b17-49ae-838a-e8162f109697',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.360Z',
                },
            },
            {
                text: 'then what\'s up',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: 'dc2dbcfc-ad70-4a25-9e3a-2c454ca8b171',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.363Z',
                },
            },
            {
                text: 'what\'s shaking',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: '9e7962b4-47f9-4883-862e-9355b3396f8f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.366Z',
                },
            },
            {
                text: 'wassup',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: '0fae3a53-931a-493d-abd0-ab0ad0e26c5e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.370Z',
                },
            },
            {
                text: 'what is going on',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: 'a4df57a8-a780-4309-9d1a-59bb374aaff9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.373Z',
                },
            },
            {
                text: 'what is happening',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: 'fcd6fb1f-bf84-45b8-a811-a7a9c175e195',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.375Z',
                },
            },
            {
                text: 'what\'s cracking',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: '3d77554b-d4f5-4fdf-b39b-ff2c08541c8b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.377Z',
                },
            },
            {
                text: 'what\'s cooking',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: 'f0aaf239-fa29-4f47-ac39-66eec178b583',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.381Z',
                },
            },
            {
                text: 'hey what\'s up',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: '1ddd8caa-b853-4b2d-a18e-800ec9edbc0f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.382Z',
                },
            },
            {
                text: 'what\'s up today',
                intent: 'chitchat.whatsup',
                entities: [],
                _id: 'b46c4b75-8c5b-4a8c-b365-9d05d3fe8a24',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.384Z',
                },
            },
            {
                text: 'it\'s been so nice to talk to you',
                intent: 'chitchat.nice_to_talk_to_you',
                entities: [],
                _id: '83f98c71-f62b-476e-b546-1593924e4686',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.389Z',
                },
            },
            {
                text: 'it\'s been a pleasure talking to you',
                intent: 'chitchat.nice_to_talk_to_you',
                entities: [],
                _id: '9b5ea23e-f6ff-4354-b710-a3b6a804eb8c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.392Z',
                },
            },
            {
                text: 'nice to talk to you',
                intent: 'chitchat.nice_to_talk_to_you',
                entities: [],
                _id: 'aff96acc-ac85-41d8-b419-b5e1c449f9b2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.395Z',
                },
            },
            {
                text: 'it\'s nice to talk to you',
                intent: 'chitchat.nice_to_talk_to_you',
                entities: [],
                _id: '4dffd4e9-bc75-4f44-9793-e48fb38fd625',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.399Z',
                },
            },
            {
                text: 'nice talking to you',
                intent: 'chitchat.nice_to_talk_to_you',
                entities: [],
                _id: '2ac320ad-2afd-4075-ac29-3b06bd45e60b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.401Z',
                },
            },
            {
                text: 'it is nice talking to you',
                intent: 'chitchat.nice_to_talk_to_you',
                entities: [],
                _id: '6892a7e6-5786-4b96-b45d-ebea9bfe01a9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.405Z',
                },
            },
            {
                text: 'how nice it is to talk to you',
                intent: 'chitchat.nice_to_talk_to_you',
                entities: [],
                _id: 'd0a252e2-c404-4209-a43a-7ff4f63e1978',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.409Z',
                },
            },
            {
                text: 'I\'m being mad',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '6adb6251-c49c-4e13-92c4-3c4cdf338041',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.411Z',
                },
            },
            {
                text: 'I\'m enraged',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '38348afb-89a6-4c5a-bb3c-17902d2d4d28',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.414Z',
                },
            },
            {
                text: 'I\'m angry',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '997862d9-12bb-40d5-b472-d41f00d14503',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.416Z',
                },
            },
            {
                text: 'I\'m furious',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '2fcc0414-ad5d-43a7-a4a1-a9cfbdfbddc1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.426Z',
                },
            },
            {
                text: 'I am angry with you',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '6ac875ff-46b6-42e6-ab49-e33750482e45',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.432Z',
                },
            },
            {
                text: 'I am mad',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '376e0cae-97a8-4513-8ce9-8dba8e90ae62',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.436Z',
                },
            },
            {
                text: 'I am mad at you',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '8bfeac04-a9d8-4ce6-b7f6-dc1b4aee5c13',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.442Z',
                },
            },
            {
                text: 'that was boring',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: '0e176324-7337-4561-8ade-c5a07e29762d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.446Z',
                },
            },
            {
                text: 'I\'m bored',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: '70e2ae96-ad63-4fcb-81c6-1af5b2bd78d4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.449Z',
                },
            },
            {
                text: 'bored',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: '89ca32a7-0490-44b8-8839-6432b2a4b099',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.457Z',
                },
            },
            {
                text: 'boring',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: '732a6503-961c-448e-88b9-f88af48a8286',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.461Z',
                },
            },
            {
                text: 'I am getting bored',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: 'acab393a-7b3d-4889-9cff-35ba26010109',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.464Z',
                },
            },
            {
                text: 'this is boring',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: 'adc8e60f-2d04-4ca4-b0bd-3af0ad800736',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.467Z',
                },
            },
            {
                text: 'very boring',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: 'b4e23e60-239e-4a9e-989d-6282033f9d27',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.472Z',
                },
            },
            {
                text: 'it bores me',
                intent: 'chitchat.you_are_boring',
                entities: [],
                _id: '97dae959-f110-4666-b837-c3cd3f45ecb9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.476Z',
                },
            },
            {
                text: 'I am excited',
                intent: 'chitchat.i_am_excited',
                entities: [],
                _id: '62bbb5ec-4f27-4e51-964d-0135416e36ca',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.479Z',
                },
            },
            {
                text: 'I\'m really excited',
                intent: 'chitchat.i_am_excited',
                entities: [],
                _id: '9c2f4d98-5925-41e2-b8c9-4a82940d828a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.481Z',
                },
            },
            {
                text: 'how excited I am',
                intent: 'chitchat.i_am_excited',
                entities: [],
                _id: 'cbd5c82f-2141-42ba-affe-e63ea60faaf0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.484Z',
                },
            },
            {
                text: 'I\'m thrilled',
                intent: 'chitchat.i_am_excited',
                entities: [],
                _id: '3e05812d-6ce5-4d33-b335-8c574f4f2da7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.488Z',
                },
            },
            {
                text: 'I\'m excited about working with you',
                intent: 'chitchat.i_am_excited',
                entities: [],
                _id: '3b675678-cd4f-4ac3-8147-4e1494ae8387',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.490Z',
                },
            },
            {
                text: 'I\'m excited to start our friendship',
                intent: 'chitchat.i_am_excited',
                entities: [],
                _id: 'b5ac82f8-aed4-4293-a404-a7052257fa8e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.493Z',
                },
            },
            {
                text: 'I am good',
                intent: 'chitchat.i_am_good',
                entities: [],
                _id: '51d014c7-3d37-45e5-98db-e50af7ac2c0f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.497Z',
                },
            },
            {
                text: 'I\'m doing just great',
                intent: 'chitchat.i_am_good',
                entities: [],
                _id: '0cdc708b-51f8-4cb7-af26-faec63179343',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.500Z',
                },
            },
            {
                text: 'I\'m doing fine',
                intent: 'chitchat.i_am_good',
                entities: [],
                _id: 'b152a07f-03a0-4db1-813b-6c909b1cf115',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.503Z',
                },
            },
            {
                text: 'I\'m good',
                intent: 'chitchat.i_am_good',
                entities: [],
                _id: 'd2526c11-db62-498c-958a-354c0770fca3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.506Z',
                },
            },
            {
                text: 'I\'m doing good',
                intent: 'chitchat.i_am_good',
                entities: [],
                _id: 'e92b9177-950c-4e31-a43f-3b37efee9f77',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.512Z',
                },
            },
            {
                text: 'I\'m great thanks',
                intent: 'chitchat.i_am_good',
                entities: [],
                _id: 'cd908047-7a00-4d41-8d3d-a240069c8123',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.520Z',
                },
            },
            {
                text: 'I\'m ok',
                intent: 'chitchat.i_am_good',
                entities: [],
                _id: '89961a36-714b-4575-95f6-806c1ba24ea2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.524Z',
                },
            },
            {
                text: 'I am happy',
                intent: 'chitchat.i_am_happy',
                entities: [],
                _id: '08524b78-b175-476c-b2d3-7116d00cb0b5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.527Z',
                },
            },
            {
                text: 'I\'m happy to see you',
                intent: 'chitchat.i_am_happy',
                entities: [],
                _id: '9fb96089-9969-40bf-90a4-5e8155065cb7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.536Z',
                },
            },
            {
                text: 'happy',
                intent: 'chitchat.i_am_happy',
                entities: [],
                _id: '9aff752f-0b81-47a8-a2ae-571286fe262e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.540Z',
                },
            },
            {
                text: 'if you\'re happy then I\'m happy',
                intent: 'chitchat.i_am_happy',
                entities: [],
                _id: '3da72352-a76c-4a3a-9e33-18490f10a034',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.544Z',
                },
            },
            {
                text: 'I\'m happy for you',
                intent: 'chitchat.i_am_happy',
                entities: [],
                _id: 'd0f04d52-5e06-4dd3-b677-64e1b1430f72',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.547Z',
                },
            },
            {
                text: 'I\'m happy to help',
                intent: 'chitchat.i_am_happy',
                entities: [],
                _id: 'ad88e95f-c704-40ea-a3af-b3baf05f5a9d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.554Z',
                },
            },
            {
                text: 'I\'m happy to see you',
                intent: 'chitchat.i_am_happy',
                entities: [],
                _id: 'ed0f175f-e0d8-4807-a952-ff8fa2159726',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.558Z',
                },
            },
            {
                text: 'I am joking',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: 'dd23ef76-6922-40c0-a63c-571714a62d70',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.560Z',
                },
            },
            {
                text: 'I\'m kidding',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: 'bd653518-6a89-4a52-889f-e7fc539dfc34',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.562Z',
                },
            },
            {
                text: 'I\'m just being funny',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: '255db887-a48b-4e2f-9ce9-8d25ffcff65f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.564Z',
                },
            },
            {
                text: 'it was a joke',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: 'f2ea63a3-880d-4c17-a6ee-45e9d1d28a4d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.568Z',
                },
            },
            {
                text: 'I was just joking',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: '80a4495d-89dc-49d3-b8c5-357479cf25c8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.643Z',
                },
            },
            {
                text: 'it\'s a joke',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: '2f822b98-441b-4af3-96dd-19d9084a0725',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.660Z',
                },
            },
            {
                text: 'joking',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: '5217946f-2bdd-4f9c-bede-8a79dc5a2a07',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.662Z',
                },
            },
            {
                text: 'just kidding',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: 'a83dba13-0255-4eb0-890d-33224a2a73a0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.664Z',
                },
            },
            {
                text: 'kidding',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: '769f2bf2-db73-4bf6-9974-43eefd4d1356',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.667Z',
                },
            },
            {
                text: 'I\'m just playing with you',
                intent: 'chitchat.i_am_joking',
                entities: [],
                _id: 'eee7a7e8-3d3c-407e-be3c-f792197860f0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.668Z',
                },
            },
            {
                text: 'I like you the way you are',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'ceea1837-a77e-40e8-b6fc-dba622d7beeb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.671Z',
                },
            },
            {
                text: 'I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'a2ad3631-207a-411d-98fc-8857cd0bbbc2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.678Z',
                },
            },
            {
                text: 'I like you a lot',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '01b3349c-9253-486e-9abb-eb4e24627e5c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.694Z',
                },
            },
            {
                text: 'I think I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'ff3d09f4-528f-443b-a0dc-fbd0fed577e6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.697Z',
                },
            },
            {
                text: 'I liked you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'fecd0e1a-8a8a-42ee-8472-9d53242a75be',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.701Z',
                },
            },
            {
                text: 'like you a lot',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '024e8897-c74f-4b0e-a252-96e860377420',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.711Z',
                },
            },
            {
                text: 'you are special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '5cfc997b-bf32-4504-98ae-17bf2e6f2be4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.713Z',
                },
            },
            {
                text: 'I like you too',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '30006f86-78ee-408f-9106-aeb87956dcff',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.715Z',
                },
            },
            {
                text: 'I really like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '0a5ec326-9fff-4786-b38b-b2d726b3f5a8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.717Z',
                },
            },
            {
                text: 'but I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '4955d3ca-aa17-4626-9f24-c4cf61ea1b90',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.719Z',
                },
            },
            {
                text: 'I like u',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '7f391b59-e33a-4e8a-a03f-c2cc710928cd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.722Z',
                },
            },
            {
                text: 'just like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'e6985cd9-8abf-4faf-94a5-00d8545d533b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.724Z',
                },
            },
            {
                text: 'I like you very much',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '966d732d-bd36-4e8d-9df7-42e61fee264a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.727Z',
                },
            },
            {
                text: 'I like you so much',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'abb046ea-d13a-4c95-a806-fc4ee6541906',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.730Z',
                },
            },
            {
                text: 'yeah I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '6e8bc7c4-3be7-4253-b8fb-06d3e96098d1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.732Z',
                },
            },
            {
                text: 'you\'re special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'd7539a86-69dd-4359-8eba-8cba09e81e35',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.733Z',
                },
            },
            {
                text: 'yes I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '14457540-c8fe-49a7-9577-2b5f48b47dc3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.737Z',
                },
            },
            {
                text: 'okay I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'a362f6ef-2e19-4ce1-863f-19286633c0f6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.740Z',
                },
            },
            {
                text: 'you are special to me',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '204424fb-206b-4226-881c-2131319aea18',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.742Z',
                },
            },
            {
                text: 'you are very special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '8cffa6ef-fe32-426d-abb1-0a12d590b536',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.744Z',
                },
            },
            {
                text: 'you are so sweet',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '06bdbff0-6a79-44ea-9b87-8304443b125b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.746Z',
                },
            },
            {
                text: 'you know I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'aa62e4ca-a1b5-4780-9df7-8af9d70743ba',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.752Z',
                },
            },
            {
                text: 'that\'s why I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '25dc66a8-b056-4dbb-bb12-bfe168c18745',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.758Z',
                },
            },
            {
                text: 'I like you baby',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'c5ffe51f-13fe-4e7c-afc1-8e0488e5c161',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.760Z',
                },
            },
            {
                text: 'you are very special to me',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'ab4eb923-49fc-4348-a34a-e47649ca6876',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.763Z',
                },
            },
            {
                text: 'I just like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'f24dea82-984a-4fcd-84c3-d37d154f3f57',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.765Z',
                },
            },
            {
                text: 'hey I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '5d3becce-e01e-4da3-9be4-c95f776d301c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.768Z',
                },
            },
            {
                text: 'thank you I like you too',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '5df45f47-a5c7-49a3-8c12-e849bd0ab03a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.771Z',
                },
            },
            {
                text: 'I do like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'd5af412f-70c3-482a-8b22-e8d13bba812c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.774Z',
                },
            },
            {
                text: 'you are special for me',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '5cade64c-f53d-43bf-845c-1ee2ca04e167',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.776Z',
                },
            },
            {
                text: 'no I like you the way you are',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '1bb73dc7-78c5-453a-ba91-b9128d9b8bfb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.778Z',
                },
            },
            {
                text: 'I like you already',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '4fc64e46-1693-45f4-82c8-2c7828f1adcf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.780Z',
                },
            },
            {
                text: 'well you are special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'b22aef82-1e96-4fbb-8aea-be4481071a46',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.782Z',
                },
            },
            {
                text: 'but I really like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '444de0c5-cc01-43e7-812a-2e8ab8c687e9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.784Z',
                },
            },
            {
                text: 'I like you more',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '33223d8f-b819-4cc5-9b50-51ea298d149d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.788Z',
                },
            },
            {
                text: 'that\'s what I like about you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '8f5368e7-c8e1-484d-b8bc-b4262d177a5c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.791Z',
                },
            },
            {
                text: 'you are so special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '03874e4a-1839-4279-8f39-6ef7cd3cf665',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.793Z',
                },
            },
            {
                text: 'hi I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'f207a8ae-57e7-40df-b9c3-142aaae51c5b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.799Z',
                },
            },
            {
                text: 'I really really like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'adc57aa1-038f-4e03-ac6e-6c6ae6fd777e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.805Z',
                },
            },
            {
                text: 'you\'re very special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '4e74d2f7-a85d-4598-a8b1-b4490a28ad12',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.807Z',
                },
            },
            {
                text: 'I like you as a friend',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '55a29daa-9887-4815-975a-816abb933f67',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.809Z',
                },
            },
            {
                text: 'that\'s because you are special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '8702185e-7c0d-41c3-bd1c-cf031a788094',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.811Z',
                },
            },
            {
                text: 'I said I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '95799097-0c91-4d7b-bfeb-6c7d6e8209a3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.813Z',
                },
            },
            {
                text: 'you\'re so special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'ec051cf7-7244-4d57-ad80-de1207958534',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.815Z',
                },
            },
            {
                text: 'good I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '492ceb3b-f0a5-4a27-aa5c-d346ca14b9fd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.817Z',
                },
            },
            {
                text: 'yes you are special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '4ee6d2a1-914f-4ffe-aa54-9427ddb50d0e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.823Z',
                },
            },
            {
                text: 'I like your smile',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'ba12d299-81d9-4ea0-ab07-8501d3293f18',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.827Z',
                },
            },
            {
                text: 'I like you as you are',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '55bb8a91-c768-4596-8540-b86117f07df5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.831Z',
                },
            },
            {
                text: 'I\'m starting to like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '00eea32d-b26f-4b21-8a42-f20f302ac98d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.834Z',
                },
            },
            {
                text: 'you\'re awesome I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '4ee61e80-f3e4-4141-b4ba-e8dbc8bf7959',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.836Z',
                },
            },
            {
                text: 'I also like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'ddd48d5e-044d-42d4-b5b0-224aea131563',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.841Z',
                },
            },
            {
                text: 'but I like u',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '01f522b9-63fa-4327-b5b4-adb6060297fd',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.844Z',
                },
            },
            {
                text: 'of course I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '4caf1d41-e029-4eaa-937d-d33c5cfaf108',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.846Z',
                },
            },
            {
                text: 'I like you too you\'re one of my favorite people to chat with',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '3d05e59c-ef32-4a60-9d2a-5d68cac6a086',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.848Z',
                },
            },
            {
                text: 'but I like you so much',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '0a4b96b4-fe3b-49ce-99de-8a44190262c7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.851Z',
                },
            },
            {
                text: 'really like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'dad41ddd-f6be-4ac4-ae28-92e9998ec0b1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.854Z',
                },
            },
            {
                text: 'you\'re funny I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '4fdb381d-e9c7-4406-84de-a5bde825224b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.857Z',
                },
            },
            {
                text: 'I kinda like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '18729f45-b77b-4829-90ad-d1a7617df364',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.860Z',
                },
            },
            {
                text: 'you\'re so special to me',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'cc7e885b-7ec2-449a-96b6-64543b14ff61',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.862Z',
                },
            },
            {
                text: 'you\'re very special to me',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '6a65c3de-7113-4730-a855-fb1afd98311e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.864Z',
                },
            },
            {
                text: 'I like that about you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'a2007fdb-e8ba-4c8b-9011-8282c1eee698',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.866Z',
                },
            },
            {
                text: 'but I like you just the way you are',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '46adb3dc-4336-42eb-8097-3cc305cca577',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.868Z',
                },
            },
            {
                text: 'okay I like you too',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '912ffa59-7f7e-4eb9-b434-06912c2d1a01',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.871Z',
                },
            },
            {
                text: 'I like you you\'re cool',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'a0f9886e-35dd-45db-b81d-c69c6e6f4f01',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.874Z',
                },
            },
            {
                text: 'I like you very',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'eaf67b12-8cc3-4ae3-bb61-5fbb9cce934b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.876Z',
                },
            },
            {
                text: 'I like you you\'re nice',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '066e70d9-72f0-4f01-8a9e-a26a2c167d70',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.878Z',
                },
            },
            {
                text: 'sorry I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '7b405525-e7c6-4f82-8ed3-0dcd7bfcd1d3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.879Z',
                },
            },
            {
                text: 'thanks I like you too',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '25b126a0-6daf-4a92-8da0-4bf3e07b5519',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.882Z',
                },
            },
            {
                text: 'you are really special',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '99250e80-b9a9-48a6-8132-0428b1832ac0',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.884Z',
                },
            },
            {
                text: 'you are so special to me',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'f9942cfd-ecb8-4e74-b0e6-39d014652869',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.888Z',
                },
            },
            {
                text: 'cuz I like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '1326b56f-fd33-47cd-9808-e5b4669f8d24',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.892Z',
                },
            },
            {
                text: 'I like you now',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'fc9f11e1-f24f-4438-8c5f-96f3ea02541b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.894Z',
                },
            },
            {
                text: 'I like you so',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '0d86d445-0f6c-407d-8970-667aa79a5a4e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.896Z',
                },
            },
            {
                text: 'I like you too much',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '0668bf93-aa49-4f72-abf3-2d050a3ae6c2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.897Z',
                },
            },
            {
                text: 'I really do like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '8b07669e-1cce-4b49-9df8-7b2cd364b7aa',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.900Z',
                },
            },
            {
                text: 'I really really really really like you',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: 'e39c08c0-74f4-4f9c-b42c-1f9e63ca8f91',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.902Z',
                },
            },
            {
                text: 'I like you just the way you are',
                intent: 'chitchat.i_like_you',
                entities: [],
                _id: '6642b3eb-d1b5-46a1-be35-9973cd5dbd17',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.905Z',
                },
            },
            {
                text: 'I am sad',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '68177081-e785-4690-a566-3e30e370d536',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.908Z',
                },
            },
            {
                text: 'I\'m grieving',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '64cbfdf4-50f1-47b9-b527-cf6c4a3cc759',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.910Z',
                },
            },
            {
                text: 'I am depressed',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '54adb2cd-74d0-483a-bcb2-3388f7fe13f4',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.912Z',
                },
            },
            {
                text: 'I am feeling sad',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '9c9f42be-4439-449d-a5d6-0086fa333556',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.913Z',
                },
            },
            {
                text: 'I am upset',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '9d1eb10c-b032-4ed5-aea6-00ed92590304',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.915Z',
                },
            },
            {
                text: 'I\'m unhappy',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: 'fe0a140d-5245-46de-8366-365e5c64ddc8',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.917Z',
                },
            },
            {
                text: 'I\'m having a bad day',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '0b5217b9-3258-4b6a-a910-e0acd9b392ad',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.919Z',
                },
            },
            {
                text: 'I want to cry',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '098e6f77-c2af-4b61-8411-27dcc08fa20c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.925Z',
                },
            },
            {
                text: 'I\'m not happy',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: 'c3a0532a-459a-48f8-8a0d-0114a1d9261e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.927Z',
                },
            },
            {
                text: 'ok, let\'s do it',
                intent: 'basics.yes',
                entities: [],
                _id: 'bce344fa-4d5d-46a5-af7a-84e6365626a9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.929Z',
                },
            },
            {
                text: 'I do',
                intent: 'basics.yes',
                entities: [],
                _id: 'bcd100c7-ea83-494b-93d9-4dda10227492',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.931Z',
                },
            },
            {
                text: 'ok',
                intent: 'basics.yes',
                entities: [],
                _id: 'fb1ba045-5593-43ca-96a0-3f9a1dbbd3ee',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.933Z',
                },
            },
            {
                text: 'alright',
                intent: 'basics.yes',
                entities: [],
                _id: '89cac432-f655-4a30-8319-ed2c9e82354d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.941Z',
                },
            },
            {
                text: 'yeah sure',
                intent: 'basics.yes',
                entities: [],
                _id: 'c6a301bf-2de5-4101-8a24-43b7ef5c0e12',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.943Z',
                },
            },
            {
                text: 'yep',
                intent: 'basics.yes',
                entities: [],
                _id: '5d8e3889-524d-480d-b55b-5b5202e9d9be',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.945Z',
                },
            },
            {
                text: 'yes, please',
                intent: 'basics.yes',
                entities: [],
                _id: 'fd18a92f-7e1f-4fe8-aa1a-1ad7a5d8c479',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.957Z',
                },
            },
            {
                text: 'absolutely',
                intent: 'basics.yes',
                entities: [],
                _id: 'b37d86f2-b36e-4dd3-8e7c-a9ff9e1e3b2d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.959Z',
                },
            },
            {
                text: 'of course',
                intent: 'basics.yes',
                entities: [],
                _id: 'ad77a2b0-3f20-4dd3-8518-1a1519791617',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.974Z',
                },
            },
            {
                text: 'sure',
                intent: 'basics.yes',
                entities: [],
                _id: '6da86bc9-0550-4bf6-a270-495a020369d1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.976Z',
                },
            },
            {
                text: 'yes',
                intent: 'basics.yes',
                entities: [],
                _id: 'f33d0853-a53a-4c9c-9912-ffb88cfe288e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.979Z',
                },
            },
            {
                text: 'ok then',
                intent: 'basics.yes',
                entities: [],
                _id: '94b787ca-5dc8-4ee9-81e8-de5613d5752a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.980Z',
                },
            },
            {
                text: 'ok, let\'s do it',
                intent: 'basics.yes',
                entities: [],
                _id: 'babf0cc3-b3bc-4131-8da6-7834605cd753',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.982Z',
                },
            },
            {
                text: 'I do',
                intent: 'basics.yes',
                entities: [],
                _id: 'f0068ec7-3125-45be-b527-ae21600fc7d5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.985Z',
                },
            },
            {
                text: 'ok',
                intent: 'basics.yes',
                entities: [],
                _id: 'f481947a-3fef-4518-abe2-67e743bbb9f1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.989Z',
                },
            },
            {
                text: 'alright',
                intent: 'basics.yes',
                entities: [],
                _id: '3b460236-0173-4730-8a57-1b64d140cf70',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.991Z',
                },
            },
            {
                text: 'yeah sure',
                intent: 'basics.yes',
                entities: [],
                _id: '19782e96-7a9d-480d-b46d-dfc6fd3fce46',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.994Z',
                },
            },
            {
                text: 'yep',
                intent: 'basics.yes',
                entities: [],
                _id: '9c2e3b6c-b1ae-44b2-b113-c16a96429592',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.996Z',
                },
            },
            {
                text: 'yes, please',
                intent: 'basics.yes',
                entities: [],
                _id: 'cdd98192-e56e-4ac2-bbae-86044b2e9f55',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:54.998Z',
                },
            },
            {
                text: 'absolutely',
                intent: 'basics.yes',
                entities: [],
                _id: 'e16980e8-3e79-4b94-9ee6-a7f681872484',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55Z',
                },
            },
            {
                text: 'of course',
                intent: 'basics.yes',
                entities: [],
                _id: '5b7d3108-33d5-4517-a41f-7e37f0d680fb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.002Z',
                },
            },
            {
                text: 'sure',
                intent: 'basics.yes',
                entities: [],
                _id: '02e3246e-8dfc-4ca4-8917-567e5c4ea4fb',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.003Z',
                },
            },
            {
                text: 'yes',
                intent: 'basics.yes',
                entities: [],
                _id: '3c491b18-2296-4529-b1f2-3c9dabdd7be9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.006Z',
                },
            },
            {
                text: 'ok then',
                intent: 'basics.yes',
                entities: [],
                _id: '0395cd0a-f39f-42f6-9f1b-070f59633096',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.007Z',
                },
            },
            {
                text: 'abort',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '4a008204-f92a-4a39-87e7-180f87af084f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.009Z',
                },
            },
            {
                text: 'end',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '84df877e-f27a-4a21-aa7c-e87c9e66756c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.011Z',
                },
            },
            {
                text: 'free me',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: 'ced4780f-0a65-42ab-95c0-5bb1f988a548',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.013Z',
                },
            },
            {
                text: 'no thanks',
                intent: 'basics.no',
                entities: [],
                _id: 'bcc2aab4-c111-4883-82fa-151dc5db4a93',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.015Z',
                },
            },
            {
                text: 'exit',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '1812e07c-8d14-44cc-b247-848805688763',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.017Z',
                },
            },
            {
                text: 'nah',
                intent: 'basics.no',
                entities: [],
                _id: '5d57d194-12b7-4bf0-a517-f2bf117d425e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.022Z',
                },
            },
            {
                text: 'eject',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '4ffa2ad2-e5d4-4f3b-8cce-276c39f009be',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.024Z',
                },
            },
            {
                text: 'fuck you',
                intent: 'chitchat.insults',
                entities: [],
                _id: 'fb7184e1-3270-432b-9664-842736e958e9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.026Z',
                },
            },
            {
                text: 'please no',
                intent: 'basics.no',
                entities: [],
                _id: 'c00fe039-f8eb-4cd6-902e-0586dcafc729',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.028Z',
                },
            },
            {
                text: 'reset',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '010c1940-3cee-4adb-a7de-aa281a871708',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.030Z',
                },
            },
            {
                text: 'leave',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '837ba895-23a1-4bcf-b171-9704a1551448',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.031Z',
                },
            },
            {
                text: 'not really',
                intent: 'basics.no',
                entities: [],
                _id: '0170f088-10a4-41b4-b760-d0914e02b3c2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.033Z',
                },
            },
            {
                text: 'no',
                intent: 'basics.no',
                entities: [],
                _id: '76d435ca-99ad-4dde-b8a3-530391c7ef1c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.035Z',
                },
            },
            {
                text: 'start over',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '7d501e89-c501-4b9b-85a5-ff8520b5f873',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.037Z',
                },
            },
            {
                text: 'clear',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: 'abdba68c-42b1-4320-83ba-80da2235072e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.041Z',
                },
            },
            {
                text: 'please no',
                intent: 'basics.no',
                entities: [],
                _id: '8cbd9e13-1dab-413e-b37f-8c4735919493',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.043Z',
                },
            },
            {
                text: 'stop everything',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: 'debb0ac0-1479-4b02-ae6d-3d634ecb754c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.045Z',
                },
            },
            {
                text: 'restart',
                intent: 'basics.stop_or_cancel',
                entities: [],
                _id: '214202c3-c85f-49fa-8a66-aed87cb92924',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.047Z',
                },
            },
            {
                text: 'never mind',
                intent: 'basics.no',
                entities: [],
                _id: '65d1a8b4-9243-4b5c-8635-e2065b404213',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.048Z',
                },
            },
            {
                text: 'I am sad',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '3458cf9b-7331-4a73-b8bc-c370c8055bf5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.050Z',
                },
            },
            {
                text: 'I\'m grieving',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: 'fe9d3660-28df-4f07-9789-fd2df3f94a3c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.052Z',
                },
            },
            {
                text: 'I am depressed',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: 'e6ef7322-d637-4fbf-b4d2-bc04f04f160f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.054Z',
                },
            },
            {
                text: 'I am feeling sad',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '8a18a4de-9eb7-486a-afec-1452ea2d1735',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.055Z',
                },
            },
            {
                text: 'I am upset',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '4ce788f3-bdfc-4df9-ae7a-4b1a44a84d3c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.057Z',
                },
            },
            {
                text: 'I\'m unhappy',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '55b24c00-2c13-4518-beda-b6aab6d80145',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.059Z',
                },
            },
            {
                text: 'I\'m having a bad day',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: 'db4e0d6c-f686-4e33-8160-c94358a5bdf6',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.061Z',
                },
            },
            {
                text: 'I want to cry',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: '335619c9-d9b4-48ef-bdeb-9df2ba836a1c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.063Z',
                },
            },
            {
                text: 'I\'m not happy',
                intent: 'chitchat.i_am_sad',
                entities: [],
                _id: 'c2f7fb78-15ac-463c-94f7-667ce7f80f66',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.065Z',
                },
            },
            {
                text: 'nope',
                intent: 'basics.no',
                entities: [],
                _id: '8c1a8a5d-8e58-413d-8633-c03ed16d03a3',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.067Z',
                },
            },
            {
                text: 'agent',
                intent: 'basics.request_handover',
                entities: [],
                _id: 'cf2121ce-57da-43d8-a922-d4decb6b73e7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.069Z',
                },
            },
            {
                text: 'between May and August',
                intent: 'basics.time',
                entities: [],
                _id: '79c3d20f-0100-4506-a1b8-0199b7dcf23f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.072Z',
                },
            },
            {
                text: 'in about an hour',
                intent: 'basics.time',
                entities: [],
                _id: '8a66b20a-8ec1-403e-bd1b-b2be21ed070a',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.074Z',
                },
            },
            {
                text: 'in 2 hours',
                intent: 'basics.time',
                entities: [],
                _id: 'f18be143-6cdb-413c-aba1-d694f90f3ecf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.075Z',
                },
            },
            {
                text: 'yesterday',
                intent: 'basics.time',
                entities: [],
                _id: 'f65ed964-5035-4cf6-bd8f-860fefb7f54c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.077Z',
                },
            },
            {
                text: 'alright thanks',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '19487e6e-5290-40d5-bbf6-be08969e56ee',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.080Z',
                },
            },
            {
                text: 'all thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: '4e5aca44-140c-4f3a-8dc4-e648e4b31a9f',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.082Z',
                },
            },
            {
                text: 'today',
                intent: 'basics.time',
                entities: [],
                _id: 'cdd8ceb4-8f05-463f-9c83-dcabc3123947',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.085Z',
                },
            },
            {
                text: 'Monday',
                intent: 'basics.time',
                entities: [],
                _id: '2d8d3b6f-6041-4f0d-a8f5-6d3a3fab93f2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.087Z',
                },
            },
            {
                text: '2 days ago',
                intent: 'basics.time',
                entities: [],
                _id: '99d4645c-2486-4a54-9fa4-ec05dc74f533',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.091Z',
                },
            },
            {
                text: 'in 15 minutes',
                intent: 'basics.time',
                entities: [],
                _id: 'dfb4846f-d194-423c-a880-bed66376bc30',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.093Z',
                },
            },
            {
                text: 'on Wednesday',
                intent: 'basics.time',
                entities: [],
                _id: '123adc81-72ea-4aef-8e4c-111dd6e645ea',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.095Z',
                },
            },
            {
                text: 'in August',
                intent: 'basics.time',
                entities: [],
                _id: '165a3744-0ac5-444a-9c16-0b2e7ccab571',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.097Z',
                },
            },
            {
                text: 'for Christmas',
                intent: 'basics.time',
                entities: [],
                _id: '50d747ef-3099-44dd-9cd6-b9be7a5c89f1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.099Z',
                },
            },
            {
                text: 'now',
                intent: 'basics.time',
                entities: [],
                _id: '63d59a62-65f0-41c4-99b7-917116911751',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.102Z',
                },
            },
            {
                text: 'alright thank you',
                intent: 'chitchat.thank_you',
                entities: [],
                _id: 'b63ca2a9-e7c3-41a8-9a5a-deb884508884',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.106Z',
                },
            },
            {
                text: 'i am upset',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: 'b535af93-a375-4e3c-b3f1-62fbff3c450b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.108Z',
                },
            },
            {
                text: 'I am super upset with you',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '258eb87a-ac15-40dc-bc64-f05e3a72259d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.110Z',
                },
            },
            {
                text: 'you are making me furious',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '340a87fe-fd3b-48ae-8add-d324c60ac15b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.112Z',
                },
            },
            {
                text: 'you are playing with my nerves',
                intent: 'chitchat.i_am_angry',
                entities: [],
                _id: '6d55172f-1c58-4d07-a793-46f31b97bb3d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.113Z',
                },
            },
            {
                text: 'I want to flirt with you?',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'b83a1620-e499-456a-abac-7d8af9d6bc5d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.115Z',
                },
            },
            {
                text: 'I want to exchange some nice words with you',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'e111b6c3-0c3e-4e2b-807d-bd2e8820afe7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.117Z',
                },
            },
            {
                text: 'I wanna sex you',
                intent: 'chitchat.sex',
                entities: [],
                _id: '8278d209-6846-4124-8ece-f4ab93409ee5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.118Z',
                },
            },
            {
                text: 'I want to have sex with you',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'acf6b08b-dd0d-4ff3-898e-3715d4afcddf',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.123Z',
                },
            },
            {
                text: 'do you do doggy',
                intent: 'chitchat.sex',
                entities: [],
                _id: '8209d366-6dfe-4b51-9161-a1f71b2dd4db',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.126Z',
                },
            },
            {
                text: 'can you have sex?',
                intent: 'chitchat.sex',
                entities: [],
                _id: '74c83b48-9fc2-4f5b-9d7f-8c8eb2f8173c',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.128Z',
                },
            },
            {
                text: 'I want to touch your boobs',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'd667d00b-4ba8-4a78-963c-aef719a63372',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.130Z',
                },
            },
            {
                text: 'I want to lick you',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'c451a764-378d-4440-b267-f6be2d2912e1',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.131Z',
                },
            },
            {
                text: 'I want to kiss your ass',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'b0e284ed-d968-4eac-b93e-f82e01033042',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.133Z',
                },
            },
            {
                text: 'I want to fuck you',
                intent: 'chitchat.sex',
                entities: [],
                _id: '9a6d9cfa-2382-456d-9946-d335dae16c1d',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.135Z',
                },
            },
            {
                text: 'can you do a sex tape with me?',
                intent: 'chitchat.sex',
                entities: [],
                _id: '48b6bafa-06c3-444b-b2dc-acd27d1a44d7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.137Z',
                },
            },
            {
                text: 'Are you gay?',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'a8f6e2c7-c6bb-4165-be06-69d6392548c2',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.140Z',
                },
            },
            {
                text: 'Are you lesbian?',
                intent: 'chitchat.sex',
                entities: [],
                _id: '43a11000-1b0a-4462-a33a-0a001ac2c697',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.142Z',
                },
            },
            {
                text: 'Are you trans?',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'fe92a295-9ee1-45b5-8c47-fe9dd829117e',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.144Z',
                },
            },
            {
                text: 'Do you have tits?',
                intent: 'chitchat.sex',
                entities: [],
                _id: '2c15625c-9b41-4860-8387-51e33ed29ff5',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.145Z',
                },
            },
            {
                text: 'How cute is your pussy?',
                intent: 'chitchat.sex',
                entities: [],
                _id: '9e35c7ef-2b83-4375-846d-baf07ffd25c7',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.147Z',
                },
            },
            {
                text: 'I want your big dick in me!',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'a39f1651-04e5-4af4-aa18-ea2623a029de',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.149Z',
                },
            },
            {
                text: 'i wanna lick your dick',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'ce9edd2c-4ea5-4c0f-b09c-f85fdd774886',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.152Z',
                },
            },
            {
                text: 'I wanna lick your pussy.',
                intent: 'chitchat.sex',
                entities: [],
                _id: 'ec5b0f27-22b5-4a95-9f71-296c77f9d7f9',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.155Z',
                },
            },
            {
                text: 'Can you have sex with me?',
                intent: 'chitchat.sex',
                entities: [],
                _id: '88d5c88f-863a-4963-a5c1-33bb1d92bcfa',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.156Z',
                },
            },
            {
                text: 'Can we have a trisome?',
                intent: 'chitchat.sex',
                entities: [],
                _id: '072aa664-7081-486e-a950-9bf2d1b0dc1b',
                canonical: false,
                updatedAt: {
                    $date: '2020-07-17T14:30:55.158Z',
                },
            },
        ],
        entity_synonyms: [
            {
                value: 'NYC',
                synonyms: [
                    'New-York',
                    'the big apple',
                ],
                _id: 'd390acad-18d6-4705-99b0-77b764525536',
            },
        ],
        regex_features: [],
        fuzzy_gazette: [],
    },
    updatedAt: {
        $date: '2020-07-17T20:08:45.207Z',
    },
};

export default data;
