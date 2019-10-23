import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import PieChart from '../imports/ui/components/charts/PieChart';

const data = {
    intentFrequencies: [
        {
            name: 'get_started',
            count: 6679,
            frequency: 0.5160717045278936,
        },
        {
            name: 'return_button',
            count: 548,
            frequency: 0.042342760006181424,
        },
        {
            name: 'how_to_return',
            count: 526,
            frequency: 0.040642868181115746,
        },
        {
            name: 'rate_no',
            count: 502,
            frequency: 0.038788440735589555,
        },
        {
            name: 'shipment_tracking_request',
            count: 423,
            frequency: 0.03268428372739916,
        },
        {
            name: 'chitchat_good_job',
            count: 419,
            frequency: 0.032375212486478136,
        },
        {
            name: 'contact_customerservice',
            count: 367,
            frequency: 0.028357286354504713,
        },
        {
            name: null,
            count: 306,
            frequency: 0.02364394993045897,
        },
        {
            name: 'contact_button',
            count: 292,
            frequency: 0.02256220058723536,
        },
        {
            name: 'generic_help',
            count: 267,
            frequency: 0.020630505331478907,
        },
        {
            name: 'return_status',
            count: 172,
            frequency: 0.01329006335960439,
        },
        {
            name: 'product_info',
            count: 145,
            frequency: 0.01120383248338742,
        },
        {
            name: 'missing_invoice',
            count: 140,
            frequency: 0.01081749343223613,
        },
        {
            name: 'return_label',
            count: 139,
            frequency: 0.010740225622005873,
        },
        {
            name: 'change_order',
            count: 126,
            frequency: 0.009735744089012517,
        },
        {
            name: 'ordering_problems',
            count: 108,
            frequency: 0.008344923504867872,
        },
        {
            name: 'basics.thank_you',
            count: 100,
            frequency: 0.007726781023025807,
        },
        {
            name: 'kind_of_payment',
            count: 83,
            frequency: 0.00641322824911142,
        },
        {
            name: 'english',
            count: 82,
            frequency: 0.006335960438881162,
        },
        {
            name: 'customer_account',
            count: 72,
            frequency: 0.005563282336578581,
        },
        {
            name: 'filial_retoure_button',
            count: 70,
            frequency: 0.005408746716118065,
        },
        {
            name: 'return_in_store',
            count: 69,
            frequency: 0.005331478905887807,
        },
        {
            name: 'delivery_click_and_collect',
            count: 67,
            frequency: 0.005176943285427291,
        },
        {
            name: 'invoice',
            count: 66,
            frequency: 0.005099675475197033,
        },
        {
            name: 'bank_account',
            count: 66,
            frequency: 0.005099675475197033,
        },
        {
            name: 'receipt_button',
            count: 61,
            frequency: 0.004713336424045742,
        },
        {
            name: 'add_purchase',
            count: 61,
            frequency: 0.004713336424045742,
        },
        {
            name: 'return_time',
            count: 56,
            frequency: 0.004326997372894452,
        },
        {
            name: 'process_filial_retoure',
            count: 53,
            frequency: 0.004095193942203678,
        },
        {
            name: 'order_overview',
            count: 51,
            frequency: 0.003940658321743162,
        },
        {
            name: 'fallback',
            count: 50,
            frequency: 0.0038633905115129036,
        },
        {
            name: 'store_information',
            count: 49,
            frequency: 0.0037861227012826455,
        },
        {
            name: 'return_cost',
            count: 47,
            frequency: 0.0036315870808221293,
        },
        {
            name: 'order_mistaken',
            count: 46,
            frequency: 0.0035543192705918716,
        },
        {
            name: 'buy_giftcard',
            count: 35,
            frequency: 0.0027043733580590324,
        },
        {
            name: 'payment_giftcard',
            count: 35,
            frequency: 0.0027043733580590324,
        },
        {
            name: 'item_missing',
            count: 34,
            frequency: 0.0026271055478287743,
        },
        {
            name: 'repair_service',
            count: 34,
            frequency: 0.0026271055478287743,
        },
        {
            name: 'payment_invoice_reminder',
            count: 33,
            frequency: 0.0025498377375985167,
        },
        {
            name: 'delivery_time',
            count: 33,
            frequency: 0.0025498377375985167,
        },
        {
            name: 'delivery_options',
            count: 32,
            frequency: 0.0024725699273682586,
        },
        {
            name: 'how_to_order',
            count: 31,
            frequency: 0.0023953021171380004,
        },
        {
            name: 'learning',
            count: 31,
            frequency: 0.0023953021171380004,
        },
        {
            name: 'reset_password',
            count: 28,
            frequency: 0.002163498686447226,
        },
        {
            name: 'article_available',
            count: 26,
            frequency: 0.00200896306598671,
        },
        {
            name: 'item_damage',
            count: 24,
            frequency: 0.0018544274455261937,
        },
        {
            name: 'loyalty_card',
            count: 23,
            frequency: 0.0017771596352959358,
        },
        {
            name: 'payment_invoice_notworking',
            count: 21,
            frequency: 0.0016226240148354196,
        },
        {
            name: 'giftcard_information',
            count: 19,
            frequency: 0.0014680883943749034,
        },
        {
            name: 'warranty_time',
            count: 19,
            frequency: 0.0014680883943749034,
        },
        {
            name: 'guest_account',
            count: 16,
            frequency: 0.0012362849636841293,
        },
        {
            name: 'delivery_costs',
            count: 15,
            frequency: 0.0011590171534538712,
        },
        {
            name: 'payment_in_store',
            count: 15,
            frequency: 0.0011590171534538712,
        },
        {
            name: 'store_reservation',
            count: 14,
            frequency: 0.001081749343223613,
        },
        {
            name: 'order_in_store',
            count: 14,
            frequency: 0.001081749343223613,
        },
        {
            name: 'warranty_button',
            count: 13,
            frequency: 0.001004481532993355,
        },
        {
            name: 'contac_customerservice',
            count: 12,
            frequency: 0.0009272137227630969,
        },
        {
            name: 'bulky_good_button',
            count: 11,
            frequency: 0.0008499459125328389,
        },
        {
            name: 'payment_credit_card',
            count: 11,
            frequency: 0.0008499459125328389,
        },
        {
            name: 'best_employee',
            count: 9,
            frequency: 0.0006954102920723226,
        },
        {
            name: 'cant_login',
            count: 9,
            frequency: 0.0006954102920723226,
        },
        {
            name: 'company_offer',
            count: 9,
            frequency: 0.0006954102920723226,
        },
        {
            name: 'no_receipt',
            count: 6,
            frequency: 0.0004636068613815484,
        },
        {
            name: 'automatic_return',
            count: 6,
            frequency: 0.0004636068613815484,
        },
        {
            name: 'delivery_express',
            count: 5,
            frequency: 0.00038633905115129037,
        },
        {
            name: 'cant_find_login',
            count: 4,
            frequency: 0.0003090712409210323,
        },
        {
            name: 'become_product_tester',
            count: 3,
            frequency: 0.0002318034306907742,
        },
        {
            name: 'answer_time',
            count: 3,
            frequency: 0.0002318034306907742,
        },
        {
            name: 'not_process_filial_retoure',
            count: 1,
            frequency: 0.00007726781023025808,
        },
    ],
    conversationLengths: [
        {
            length: 0,
            count: 3926,
            frequency: 0.58309817317689,
        },
        {
            length: 3,
            count: 762,
            frequency: 0.11317391950096539,
        },
        {
            length: 2,
            count: 749,
            frequency: 0.11124313084806178,
        },
        {
            length: 1,
            count: 396,
            frequency: 0.058814792811525324,
        },
        {
            length: 4,
            count: 396,
            frequency: 0.058814792811525324,
        },
        {
            length: 5,
            count: 226,
            frequency: 0.0335660181197089,
        },
        {
            length: 6,
            count: 135,
            frequency: 0.020050497549383633,
        },
        {
            length: 7,
            count: 53,
            frequency: 0.007871676815683945,
        },
        {
            length: 8,
            count: 33,
            frequency: 0.004901232734293777,
        },
        {
            length: 9,
            count: 18,
            frequency: 0.002673399673251151,
        },
        {
            length: 10,
            count: 16,
            frequency: 0.002376355265112134,
        },
        {
            length: 11,
            count: 9,
            frequency: 0.0013366998366255755,
        },
        {
            length: 12,
            count: 6,
            frequency: 0.0008911332244170504,
        },
        {
            length: 13,
            count: 3,
            frequency: 0.0004455666122085252,
        },
        {
            length: 14,
            count: 2,
            frequency: 0.0002970444081390168,
        },
        {
            length: 18,
            count: 1,
            frequency: 0.0001485222040695084,
        },
        {
            length: 28,
            count: 1,
            frequency: 0.0001485222040695084,
        },
        {
            length: 15,
            count: 1,
            frequency: 0.0001485222040695084,
        },
    ],
    conversationDurations: [
        {
            duration: '0',
            count: 4021,
            frequency: 0.5972077825634933,
        },
        {
            duration: '30',
            count: 1129,
            frequency: 0.16768156839447498,
        },
        {
            duration: '60',
            count: 571,
            frequency: 0.0848061785236893,
        },
        {
            duration: '180',
            count: 387,
            frequency: 0.057478092974899746,
        },
        {
            duration: '90',
            count: 319,
            frequency: 0.04737858309817318,
        },
        {
            duration: '120',
            count: 306,
            frequency: 0.04544779444526957,
        },
    ],
    conversationCounts: [
        {
            bucket: new Date(1564580540 * 1000).toLocaleDateString(),
            count: 1623,
            engagements: 686,
            proportion: 0.4226740603820086,
        },
        {
            bucket: new Date(1565595682 * 1000).toLocaleDateString(),
            count: 1307,
            engagements: 583,
            proportion: 0.44605967865340473,
        },
        {
            bucket: new Date(1566610823 * 1000).toLocaleDateString(),
            count: 972,
            engagements: 397,
            proportion: 0.40843621399176955,
        },
        {
            bucket: new Date(1567625965 * 1000).toLocaleDateString(),
            count: 1078,
            engagements: 456,
            proportion: 0.4230055658627087,
        },
        {
            bucket: new Date(1568641106 * 1000).toLocaleDateString(),
            count: 1123,
            engagements: 471,
            proportion: 0.41941228851291185,
        },
        {
            bucket: new Date(1569656248 * 1000).toLocaleDateString(),
            count: 633,
            engagements: 231,
            proportion: 0.36492890995260663,
        },
    ],
};

export const dataPresets = {
    intentFrequencies: {
        data: data.intentFrequencies,
        x: 'name',
        y: [{ abs: 'count', rel: 'frequency' }],
    },
    conversationLengths: {
        data: data.conversationLengths,
        x: 'length',
        y: [{ abs: 'count', rel: 'frequency' }],
    },
    conversationDurations: {
        data: data.conversationDurations,
        x: 'duration',
        y: [{ abs: 'count', rel: 'frequency' }],
    },
    conversationCounts: {
        data: data.conversationCounts,
        x: 'bucket',
        y: [{ abs: 'count' }, { abs: 'engagements', rel: 'proportion' }],
    },
};

storiesOf('PieChart', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <div style={{ height: '80vh' }}>
            <PieChart
                {...select('data', dataPresets, dataPresets.intentFrequencies)}
            />
        </div>
    ));
