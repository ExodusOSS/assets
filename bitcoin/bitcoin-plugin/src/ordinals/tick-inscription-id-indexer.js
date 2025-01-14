import assert from 'minimalistic-assert'

export const tickInscriptionIdIndexerFactory = ({ brc20Client }) => {
  const deployInscriptionIdToBrc20Tick = new Map()
  const brc20TickToDeployInscriptionId = new Map()

  const save = ({ deployInscriptionId, brc20Tick }) => {
    deployInscriptionIdToBrc20Tick.set(deployInscriptionId, brc20Tick)
    brc20TickToDeployInscriptionId.set(brc20Tick, deployInscriptionId)
  }

  const loadDeployInscriptionId = async (brc20Tick) => {
    const response = await brc20Client.getTickerInfo({ tick: brc20Tick })
    const deployInscriptionId = response.token.id
    save({ deployInscriptionId, brc20Tick })
    return deployInscriptionId
  }

  const loadBrc20Tick = async (deployInscriptionId) => {
    const response = await brc20Client.getTickerInfoByDeployInscriptionId({ deployInscriptionId })
    const brc20Tick = response[0].brc20Tick
    save({ deployInscriptionId, brc20Tick })
    return brc20Tick
  }

  const getDeployInscriptionId = async (brc20Tick) => {
    return brc20TickToDeployInscriptionId.get(brc20Tick) || loadDeployInscriptionId(brc20Tick)
  }

  const getBrc20Tick = async (deployInscriptionId) => {
    return (
      deployInscriptionIdToBrc20Tick.get(deployInscriptionId) || loadBrc20Tick(deployInscriptionId)
    )
  }

  const getBrc20TickFromAsset = async (asset) => {
    assert(asset.assetType === 'BRC20_TOKEN', `Asset ${asset.name} is not a brc20 asset`)
    const deployInscriptionId = asset.assetId
    const brc20Tick = asset.brc20Tick // this should always be true once CTR is patched
    if (brc20Tick) {
      save({ deployInscriptionId, brc20Tick })
      return brc20Tick
    }

    return getBrc20Tick(deployInscriptionId)
  }

  return { getBrc20TickFromAsset, getDeployInscriptionId, getBrc20Tick }
}
