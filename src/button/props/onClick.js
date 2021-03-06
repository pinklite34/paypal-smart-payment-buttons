/* @flow */

import { ZalgoPromise } from 'zalgo-promise/src';
import { FUNDING } from '@paypal/sdk-constants';
import { FPTI_KEY } from '@paypal/sdk-constants/src';

import { promiseNoop, getLogger } from '../../lib';
import { FPTI_STATE, FPTI_TRANSITION } from '../../constants';

import type { XProps } from './types';

export type XOnClickDataType = {|
    fundingSource : $Values<typeof FUNDING>
|};

export type XOnClickActionsType = {|
    resolve : () => ZalgoPromise<boolean>,
    reject : () => ZalgoPromise<boolean>
|};

export type XOnClick = (XOnClickDataType, XOnClickActionsType) => ZalgoPromise<boolean | void>;

export function buildXOnClickData({ fundingSource } : { fundingSource : $Values<typeof FUNDING> }) : XOnClickDataType {
    return { fundingSource };
}

export function buildXOnClickActions() : XOnClickActionsType {
    return {
        resolve: () => ZalgoPromise.try(() => true),
        reject:  () => ZalgoPromise.try(() => false)
    };
}

export type OnClickDataType = {|
    fundingSource : $Values<typeof FUNDING>
|};

export type OnClick = (OnClickDataType) => ZalgoPromise<boolean>;

export function getOnClick(xprops : XProps) : OnClick {
    const { onClick = promiseNoop, buttonSessionID } = xprops;

    return ({ fundingSource } : { fundingSource : $Values<typeof FUNDING> }) => {
        getLogger().info('button_click').track({
            [FPTI_KEY.STATE]:              FPTI_STATE.BUTTON,
            [FPTI_KEY.TRANSITION]:         FPTI_TRANSITION.BUTTON_CLICK,
            [FPTI_KEY.BUTTON_SESSION_UID]: buttonSessionID,
            [FPTI_KEY.CHOSEN_FUNDING]:     fundingSource
        }).flush();
        
        return onClick(buildXOnClickData({ fundingSource }), buildXOnClickActions()).then(valid => {
            return (valid !== false);
        });
    };
}
