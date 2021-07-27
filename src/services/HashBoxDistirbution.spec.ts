import { IHashBoxConfig, IProfile } from "../@types/Config"
import HashBox from "./HashBox"

describe("HashBox", () => {
  const expectedMinifference = 0.1

  let profile: IProfile

  beforeEach(() => {
    profile = {
      // assumption: we only test the math. calcuation within one char group. Each char group is used equally.
      charGroups: [
        "abcdefghijklmnopqrstuvwxyzäöüABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ1234567890",
      ],
      name: "test",
    }
  })

  let evaluateHasdistirbution = (hashes, hashBoxConfig) => {
    let charsTotal = profile.charGroups[0].length
    let percentAvgDistribution = (1 * 100) / charsTotal

    let distribution : {[key:string]: {char: string, count:number, percentAvg: number, percentDiff: number}} = {}
    let charsCountTotal = 0

    expect(hashBoxConfig.outputColumns.length).toBe(1)

    hashes.forEach((hashList) => {
      let hash = hashList[0] // assumption: hashBoxConfig.outputColumns.length = 1
      hash.split("").forEach((c) => {
        if (!distribution[c]) {
          distribution[c] = { char: c, count: 1, percentAvg: 0.0, percentDiff: 0.0}
        } else {
          distribution[c].count++
        }
        charsCountTotal++
      })
    })

    Object.keys(distribution).forEach(key => {
      let value = distribution[key]
      value.percentAvg = (value.count * 100) / charsCountTotal
      value.percentDiff = value.percentAvg - percentAvgDistribution
      expect(Math.abs(value.percentDiff)).toBeLessThan(expectedMinifference)
    })

    // let distributionSorted = Object.values(distribution).sort((v1, v2) => Math.abs(v1.count - v2.count))
    // distributionSorted.forEach(e => console.log(`char: ${e.char} => ${e.percentAvg.toFixed(3)}% (${e.count} of ${charsCountTotal}), avg ${percentAvgDistribution.toFixed(3)}% (1 of ${charsTotal}), diff ${e.percentDiff.toFixed(3)}% from avg`))
  }

  it("calculates char distribution", async () => {
    let hashBoxConfig = {
      hashResultLengthInBytes: 64,
      keySalt: "123",
      outputColumns: [-1],
      outputRows: 10000,
      rowHashIterations: 2,
      tokenHashingIterations: 64,
      tokenSalt: "456",
    }

    evaluateHasdistirbution(await HashBox.run(hashBoxConfig, profile, "123"), hashBoxConfig)
    evaluateHasdistirbution(await HashBox.run(hashBoxConfig, profile, "567"), hashBoxConfig)
  })

})
