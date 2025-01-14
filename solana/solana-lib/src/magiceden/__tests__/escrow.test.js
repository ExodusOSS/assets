import { BN } from 'bn.js'

import { PublicKey } from '../../vendor/index.js'
import { MagicEdenEscrowProgram } from '../escrow-program.js'
import fixtures from './fixtures.js'

const serializeTx = (tx) => {
  return tx.instructions.map((instruction) => ({
    instructions: instruction.keys.map((k) => ({ ...k, pubkey: k.pubkey.toBase58() })),
    programId: instruction.programId.toBase58(),
    data: instruction.data.toString('hex'),
  }))
}

test('MagicEden: initializeEscrow', () => {
  const escrowPda = '3FLp3gYkXfh7ZjB7PPoidfSdzHWxqfG1mYH1BkzAfwMe'
  const escrowBump = 253

  const tx = MagicEdenEscrowProgram.initializeEscrow({
    initializerPubkey: new PublicKey('EpGkR4PcMYHLwZJn7rnxmmLihaZkaAeQLsw4ao3nUUmC'),
    initializerDepositTokenPubkey: new PublicKey('38y2gagfKoVVmLXxqESXWkBLHarzEq6f6cmA1DoAqRnB'),
    escrowPubkey: new PublicKey(escrowPda),
    escrowBump,
    takerAmount: new BN(1e10),
  })

  expect(serializeTx(tx)).toEqual(fixtures.initializeEscrow)
})

test('MagicEden: cancelEscrow', () => {
  const tx = MagicEdenEscrowProgram.cancelEscrow({
    initializerPubkey: new PublicKey('EpGkR4PcMYHLwZJn7rnxmmLihaZkaAeQLsw4ao3nUUmC'),
    initializerDepositTokenPubkey: new PublicKey('38y2gagfKoVVmLXxqESXWkBLHarzEq6f6cmA1DoAqRnB'),
    pdaPubkey: new PublicKey('GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp'),
    escrowPubkey: new PublicKey('AicHKDZR5jLfozYcek5ZHw5mJfxBNFbUwHF2nM4qF8oN'),
  })

  expect(serializeTx(tx)).toEqual(fixtures.cancelEscrow)
})

test('MagicEden: exchange', () => {
  const expectedTakerAmount = new BN(5 * 10e6)
  const mintAddress = '6eGfgGuxA1pBtTX4k2oubpa6m1Z3eaJUBxgtZFB7sjZA'

  const tx = MagicEdenEscrowProgram.exchange({
    expectedTakerAmount,
    expectedMintPubkey: new PublicKey(mintAddress),
    takerPubkey: new PublicKey('FuDxYSDtRAG4P65wxAmUZShBSGtn79o2yJpPF13LQB87'),
    initializerDepositTokenPubkey: new PublicKey('38y2gagfKoVVmLXxqESXWkBLHarzEq6f6cmA1DoAqRnB'),
    initializerPubkey: new PublicKey('EpGkR4PcMYHLwZJn7rnxmmLihaZkaAeQLsw4ao3nUUmC'),
    escrowPubkey: new PublicKey('DvijtTLQGCmmFMPpthitkpP35hGHxdJRxAERjtN13mPg'),
    pdaPubkey: new PublicKey('GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp'),
    metadataPubkey: new PublicKey('4ysTyhoHDAv28dGUD2ASS9zmAHi3QZyXVQW25f6QwWN'),
    creators: [
      {
        address: 'D6ZQMLTJAa14XhzCFBJ2uuPjYDbYfewrVDVSyFZSuBYe',
        verified: 1,
        share: 100,
      },
    ],
  })

  expect(serializeTx(tx)).toEqual(fixtures.exchange)
})
