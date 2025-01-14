BIP-0125 describes the opt-in full Replace-by-Fee (opt-in full-RBF) signaling policy according to which spenders can add a signal to a transaction indicating that they want to be able to replace that transaction in the future.

This policy specifies two ways a transaction can signal that it is replaceable.

- '''Explicit signaling:''' A transaction is considered to have opted in to allowing replacement of itself if any of its inputs have an nSequence number less than (0xffffffff - 1).

- '''Inherited signaling:''' Transactions that don't explicitly signal replaceability are replaceable under this policy for as long as any one of their ancestors signals replaceability and remains unconfirmed.

For more information look at [BIP-0125](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki)
