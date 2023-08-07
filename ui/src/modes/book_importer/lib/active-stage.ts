import { Updater, useImmer } from 'use-immer'

export enum ActiveStages {
    INITIAL = 'initial',
    PROCESS = 'process'
}

export interface ActiveStageState {
    stage: ActiveStages
}

export class ActiveStage {
    _state: ActiveStageState
    _updater: Updater<ActiveStageState>

    constructor() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [state, updater] = useImmer<ActiveStageState>({ stage: ActiveStages.INITIAL })
        this._state = state
        this._updater = updater
    }

    get current() {
        return this._state.stage
    }

    set current(new_state: ActiveStages) {
        this._updater((draft) => {
            draft.stage = new_state
        })
    }
}
