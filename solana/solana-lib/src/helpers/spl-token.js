import * as BufferLayout from '@exodus/buffer-layout'
import BN from 'bn.js'
import assert from 'minimalistic-assert'

import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '../vendor/index.js'
import * as Layout from '../vendor/utils/layout.js'

// Extracted from https://github.com/ExodusMovement/solana-spl-token/blob/master/src/index.js#L263

export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
)
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

/**
 * 64-bit value
 */
export class U64 extends BN {
  /**
   * Convert to Buffer representation
   */
  toBuffer() {
    const a = super.toArray().reverse()
    const b = Buffer.from(a)
    if (b.length === 8) {
      return b
    }

    assert(b.length < 8, 'u64 too large')

    const zeroPad = Buffer.alloc(8)
    b.copy(zeroPad)
    return zeroPad
  }

  /**
   * Construct a u64 from Buffer representation
   */
  static fromBuffer(buffer) {
    assert(buffer.length === 8, `Invalid buffer length: ${buffer.length}`)
    return new U64(
      [...buffer]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(''),
      16
    )
  }
}

/**
 * Layout for a public key
 */
const publicKey = (property = 'publicKey') => {
  return BufferLayout.blob(32, property)
}

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = 'uint64') => {
  return BufferLayout.blob(8, property)
}

/**
 * Unfortunately, BufferLayout.encode uses an `instanceof` check for `Buffer`
 * which fails when using `publicKey.toBuffer()` directly because the bundled `Buffer`
 * class in `@exodus/solana-web3.js` is different from the bundled `Buffer` class in this package
 */
const pubkeyToBuffer = (publicKey) => {
  return Buffer.from(publicKey.toBuffer())
}

/**
 * An ERC20-like Token
 */
export const Token = {
  /**
   * Construct an Approve instruction
   *
   * @param programId SPL Token program account
   * @param account Public key of the account
   * @param delegate Account authorized to perform a transfer of tokens from the source account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Maximum number of tokens the delegate may transfer
   */
  createApproveInstruction(programId, account, delegate, owner, multiSigners, amount) {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction'), uint64('amount')])
    const data = Buffer.alloc(dataLayout.span)

    dataLayout.encode(
      {
        instruction: 4, // Approve instruction
        amount: new U64(amount).toBuffer(),
      },
      data
    )

    const keys = [
      {
        pubkey: account,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: delegate,
        isSigner: false,
        isWritable: false,
      },
    ]

    if (multiSigners.length === 0) {
      keys.push({
        pubkey: owner,
        isSigner: true,
        isWritable: false,
      })
    } else {
      keys.push({
        pubkey: owner,
        isSigner: false,
        isWritable: false,
      })

      multiSigners.forEach((signer) =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        })
      )
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    })
  },

  /**
   * Construct the AssociatedTokenProgram instruction to create the associated
   * token account
   *
   * @param associatedProgramId SPL Associated Token program account
   * @param programId SPL Token program account
   * @param mint Token mint account
   * @param associatedAccount New associated account
   * @param owner Owner of the new account
   * @param payer Payer of fees
   */
  createAssociatedTokenAccountInstruction(
    associatedProgramId,
    programId,
    mint,
    associatedAccount,
    owner,
    payer
  ) {
    const data = Buffer.alloc(0)

    const keys = [
      {
        pubkey: payer,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: associatedAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: owner,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: mint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ]

    return new TransactionInstruction({
      keys,
      programId: associatedProgramId,
      data,
    })
  },

  /**
   * Construct a Close instruction
   *
   * @param programId SPL Token program account
   * @param account Account to close
   * @param dest Account to receive the remaining balance of the closed account
   * @param authority Account Close authority
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  createCloseAccountInstruction(programId, account, dest, owner, multiSigners) {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')])
    const data = Buffer.alloc(dataLayout.span)

    dataLayout.encode(
      {
        instruction: 9, // CloseAccount instruction
      },
      data
    )

    const keys = [
      {
        pubkey: account,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: dest,
        isSigner: false,
        isWritable: true,
      },
    ]

    if (multiSigners.length === 0) {
      keys.push({
        pubkey: owner,
        isSigner: true,
        isWritable: false,
      })
    } else {
      keys.push({
        pubkey: owner,
        isSigner: false,
        isWritable: false,
      })
      multiSigners.forEach((signer) =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        })
      )
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    })
  },

  /**
   * Construct an InitializeAccount instruction
   *
   * @param programId SPL Token program account
   * @param mint Token mint account
   * @param account New account
   * @param owner Owner of the new account
   */
  createInitAccountInstruction(programId, mint, account, owner) {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')])
    const data = Buffer.alloc(dataLayout.span)

    dataLayout.encode(
      {
        instruction: 1, // InitializeAccount instruction
      },
      data
    )

    const keys = [
      {
        pubkey: account,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: owner,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ]

    return new TransactionInstruction({
      keys,
      programId,
      data,
    })
  },

  /**
   * Construct an InitializeMint instruction
   *
   * @param programId SPL Token program account
   * @param mint Token mint account
   * @param decimals Number of decimals in token account amounts
   * @param mintAuthority Minting authority
   * @param freezeAuthority Optional authority that can freeze token accounts
   */
  createInitMintInstruction(programId, mint, decimals, mintAuthority, freezeAuthority) {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('decimals'),
      publicKey('mintAuthority'),
      BufferLayout.u8('option'),
      publicKey('freezeAuthority'),
    ])

    let data = Buffer.alloc(1024)
    const encodeLength = dataLayout.encode(
      {
        instruction: 0, // InitializeMint instruction
        decimals,
        mintAuthority: pubkeyToBuffer(mintAuthority),
        option: freezeAuthority === null ? 0 : 1,
        freezeAuthority: pubkeyToBuffer(freezeAuthority || new PublicKey(0)),
      },
      data
    )
    data = data.slice(0, encodeLength)

    const keys = [
      {
        pubkey: mint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ]

    return new TransactionInstruction({
      keys,
      programId,
      data,
    })
  },

  /**
   * Construct a MintTo instruction
   *
   * @param programId SPL Token program account
   * @param mint Public key of the mint
   * @param dest Public key of the account to mint to
   * @param authority The mint authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Amount to mint
   */
  createMintToInstruction(programId, mint, dest, authority, multiSigners, amount) {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction'), uint64('amount')])
    const data = Buffer.alloc(dataLayout.span)

    dataLayout.encode(
      {
        instruction: 7, // MintTo instruction
        amount: new U64(amount).toBuffer(),
      },
      data
    )

    const keys = [
      {
        pubkey: mint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: dest,
        isSigner: false,
        isWritable: true,
      },
    ]

    if (multiSigners.length === 0) {
      keys.push({
        pubkey: authority,
        isSigner: true,
        isWritable: false,
      })
    } else {
      keys.push({
        pubkey: authority,
        isSigner: false,
        isWritable: false,
      })

      multiSigners.forEach((signer) =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        })
      )
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    })
  },

  /**
   * Construct a SyncNative instruction
   *
   * @param programId SPL Token program account
   * @param nativeAccount Account to sync lamports from
   */
  createSyncNativeInstruction(programId, nativeAccount) {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')])
    const data = Buffer.alloc(dataLayout.span)

    dataLayout.encode(
      {
        instruction: 17, // SyncNative instruction
      },
      data
    )

    const keys = [
      {
        pubkey: nativeAccount,
        isSigner: false,
        isWritable: true,
      },
    ]

    return new TransactionInstruction({
      keys,
      programId,
      data,
    })
  },

  /**
   * Construct a Transfer instruction
   *
   * @param programId SPL Token program account
   * @param source Source account
   * @param destination Destination account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Number of tokens to transfer
   */
  createTransferInstruction(programId, source, destination, owner, multiSigners, amount) {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
    ])

    const data = Buffer.alloc(dataLayout.span)
    dataLayout.encode(
      {
        instruction: 3, // Transfer instruction
        amount: new U64(amount).toBuffer(),
      },
      data
    )

    const keys = [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
    ]
    if (multiSigners.length === 0) {
      keys.push({
        pubkey: owner,
        isSigner: true,
        isWritable: false,
      })
    } else {
      keys.push({ pubkey: owner, isSigner: false, isWritable: false })
      multiSigners.forEach((signer) =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        })
      )
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    })
  },

  decode(data) {
    return BufferLayout.struct([
      publicKey('mint'),
      publicKey('owner'),
      uint64('amount'),
      BufferLayout.u32('delegateOption'),
      publicKey('delegate'),
      BufferLayout.u8('state'),
      BufferLayout.u32('isNativeOption'),
      uint64('isNative'),
      uint64('delegatedAmount'),
      BufferLayout.u32('closeAuthorityOption'),
      publicKey('closeAuthority'),
    ]).decode(data)
  },
}
