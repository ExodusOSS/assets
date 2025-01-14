import { AccountState, UtxoCollection } from '@exodus/models'

export function createAccountState({ asset, ordinalsEnabled = false, brc20Enabled = false }) {
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

  if (brc20Enabled) {
    defaults.brc20Balances = {}
  }

  return class BitcoinAccountState extends AccountState {
    static defaults = defaults
  }
}
