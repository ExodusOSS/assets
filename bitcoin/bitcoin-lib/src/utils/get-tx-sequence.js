import { FINAL_SEQUENCE, RBF_SEQUENCE } from '../constants/bip125/index.js'

const getTxSequence = (rbfEnabled) => (rbfEnabled ? RBF_SEQUENCE : FINAL_SEQUENCE)
export default getTxSequence
