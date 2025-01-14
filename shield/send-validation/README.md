# @exodus/send-validation

Send token screen validation library

## Install

```
yarn add @exodus/send-validation
```

## Usage

```javascript
import { createValidationHook } from '@exodus/send-validation'
import INSUFFICIENT_FUNDS from '@exodus/send-validation/validations/INSUFFICIENT_FUNDS'

// generate hook with custom list from validators folder
// it needs to add getMessage or getTopComponent or getComponent function to render description content
const useSendFormValidation = createValidationHook({
  validations: [
    {
      ...INSUFFICIENT_FUNDS,
      getMessage: ({ asset }) =>
        `Your wallet doesn't have enough ${asset.displayName} to start this transfer.`,
      getTopComponent: ({ asset }) => <Top>{asset.name}</Top>,
      getComponent: ({ asset }) => <Bottom>{asset.name}</Bottom>,
    },
  ],
})

const Component = () => {
  // arguments list should satisfy all used validators methods
  const { hasError, failedValidation } = useSendFormValidation({
    asset,
    availableBalance,
    sendAmount,
  })

  // failedValidation.id === 'INSUFFICIENT_FUNDS'
  // failedValidation.topValidationComponent === <Top>...
  // failedValidation.message === 'Your wallet doesn't...'
  // failedValidation.bottomValidationComponent === <Bottom>...
}
```

## Validator format

```
{
   id: String,
   type: VALIDATION_TYPES,
   shouldValidate: () => Boolean,
   isValid: async () => Boolean
   getTopComponent?: () => <Component>
   getMessage: () => String
   getComponent?: () => <Component>
 }

```
