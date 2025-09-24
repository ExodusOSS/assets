const hundredLamports = '100 Lamports'
const tenUsdcSol = '10 USDCSOL'

export const fixtureLegacy1 = {
  balance: hundredLamports,
  cursor: '',
  tokenBalances: { usdcoin_solana: tenUsdcSol },
}

export const fixtureLegacy2 = {
  balance: hundredLamports,
  cursor: '',
  tokenBalances: { usdcoin_solana: tenUsdcSol, '7dbh_solana_c9e04412': '1 7DHBsolanaC9E04412' },
}

export const fixture3 = {
  t: 'object',
  v: {
    balance: {
      t: 'numberunit',
      v: {
        v: '100 Lamports',
        u: {
          Lamports: 0,
          SOL: 9,
        },
      },
    },
    rentExemptAmount: {
      t: 'numberunit',
      v: {
        v: '0 SOL',
        u: {
          Lamports: 0,
          SOL: 9,
        },
      },
    },
    accountSize: 0,
    ownerChanged: false,
    cursor: '',
    stakingInfo: {
      t: 'object',
      v: {
        accounts: {
          t: 'object',
          v: {},
        },
        activating: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
        earned: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
        isDelegating: false,
        loaded: false,
        locked: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
        pending: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
        staking: {
          t: 'object',
          v: {
            enabled: true,
            pool: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
          },
        },
        withdrawable: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
      },
    },
    tokenBalances: {
      t: 'object',
      v: {
        usdcoin_solana: {
          t: 'numberunit',
          v: {
            v: '10 USDCSOL',
            u: {
              base: 0,
              USDCSOL: 6,
            },
          },
        },
      },
    },
    _version: 1,
  },
}

export const fixture4 = {
  t: 'object',
  v: {
    balance: {
      t: 'numberunit',
      v: {
        v: '100 Lamports',
        u: {
          Lamports: 0,
          SOL: 9,
        },
      },
    },
    rentExemptAmount: {
      t: 'numberunit',
      v: {
        v: '0 Lamports',
        u: {
          Lamports: 0,
          SOL: 9,
        },
      },
    },
    accountSize: 0,
    ownerChanged: false,
    cursor: '',
    stakingInfo: {
      t: 'object',
      v: {
        accounts: {
          t: 'object',
          v: {},
        },
        activating: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
        earned: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
        isDelegating: false,
        loaded: false,
        locked: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
        pending: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
        staking: {
          t: 'object',
          v: {
            enabled: true,
            pool: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
          },
        },
        withdrawable: {
          t: 'numberunit',
          v: {
            u: {
              Lamports: 0,
              SOL: 9,
            },
            v: '0 SOL',
          },
        },
      },
    },
    tokenBalances: {
      t: 'object',
      v: {
        usdcoin_solana: {
          t: 'numberunit',
          v: {
            v: '10 USDCSOL',
            u: {
              base: 0,
              USDCSOL: 6,
            },
          },
        },
        '7dbh_solana_c9e04412': {
          t: 'numberunit',
          v: {
            v: '1 7DHBsolanaC9E04412',
            u: {
              base: 0,
              '7DHBsolanaC9E04412': 6,
            },
          },
        },
      },
    },
    _version: 1,
  },
}
