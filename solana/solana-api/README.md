# @exodus/solana-api

Transaction monitors, fee monitors, RPC with the blockchain node, and other networking code for Solana. See [Asset Packages](../../docs/asset-packages.md) for more detail on this package's role.

## Known Issues

- To get all transactions data from an address we gotta call 3 rpcs `getSignaturesForAddress` (get txIds) -> `getTransaction` (get tx details) -> `getBlockTime` (get tx timestamp). Pretty annoying and resource-consuming backend-side. (https://github.com/solana-labs/solana/issues/12411)
- calling `getBlockTime` might results in an error if the slot/block requested is too old (https://github.com/solana-labs/solana/issues/12413), looks like some Solana validators can choose to not keep all the ledger blocks (fix in progress by solana team).
