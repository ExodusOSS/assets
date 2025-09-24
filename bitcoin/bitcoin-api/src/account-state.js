import { AccountState, UtxoCollection } from '@exodus/models'

export function createAccountState({ asset, ordinalsEnabled = false }) {
  const empty = UtxoCollection.createEmpty({
    currency: asset.currency,
  })
  const defaults = {
    utxos: empty,
    mem: {
      unconfirmedTxAncestor: {},
    },
  }

  if (ordinalsEnabled) {
    defaults.ordinalsUtxos = empty
    defaults.knownBalanceUtxoIds = []
    defaults.mustAvoidUtxoIds = []
    defaults.additionalInscriptions = []
  }

  return class BitcoinAccountState extends AccountState {
    static defaults = defaults
  }
}
