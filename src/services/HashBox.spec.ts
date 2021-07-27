import fill from 'lodash/fill'
import { IHashBoxConfig, IProfile } from '../@types/Config'
import HashBox from './HashBox'

describe('HashBox', () => {

  let hashBoxConfig: IHashBoxConfig
  let profile: IProfile

  beforeEach(() => {
    hashBoxConfig = {
      hashResultLengthInBytes: 64,
      keySalt: '123',
      outputColumns: [3, 6, 9, 12, -1],
      outputRows: 3,
      rowHashIterations: 2,
      tokenHashingIterations: 64,
      tokenSalt: '456',
    }

    profile = {
      charGroups: ['abcdefghijklmnopqrstuvwxyzäöü', 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ', '1234567890', '!$%(){}[]-_.:,;+*@~'],
      name: 'test',
    }
  })

  it('calculates passwords happy path', async () => {
    const hashes = await HashBox.run(hashBoxConfig, profile, '123')

    const actualRowCount = hashes.length
    const actualColumnsCount = hashes.map(h => h.length)

    expect(actualRowCount).toEqual(hashBoxConfig.outputRows)
    expect(actualColumnsCount).toEqual(fill(Array(actualRowCount), hashBoxConfig.outputColumns.length))

    expect(hashes).toEqual([
      ["kZ8", "kZ8.rV", "kZ8.rV8]l", "kZ8.rV8]lN8%", "kZ8.rV8]lN8%fÜ8%yF1}vY4[oR7$tÜ1,"],
      ["öA0", "öA0@xN", "öA0@xN8{i", "öA0@xN8{iW8!", "öA0@xN8{iW8!fH1}oO2%lZ9_nE9}eW9@"],
      ["cM1", "cM1:hX", "cM1:hX9@v", "cM1:hX9@vH0[", "cM1:hX9@vH0[sÖ5~aQ9$zZ3@zU6*pÜ7_"],
    ])
  })

  it('runs self test', () => {
    HashBox.selfTest()
  })

  it('assert config with positive output rows', () => {
    hashBoxConfig.outputRows = -1
    expect(HashBox.run(hashBoxConfig, profile, '123')).rejects.toEqual(Error('Output rows must be greater 0'))
  })

  it('assert config with key salt', () => {
    hashBoxConfig.keySalt = ''
    expect(HashBox.run(hashBoxConfig, profile, '123')).rejects.toEqual(Error('Key salt must be given'))
  })

  it('assert config with positive output columns', () => {
    hashBoxConfig.outputColumns = []
    expect(HashBox.run(hashBoxConfig, profile, '123')).rejects.toEqual(Error('Output columns must be given'))
  })


  it('has expected implementation of calculateHash', async () => {
    expect(await HashBox.calculateHash('123', '123', 1, 1)).toEqual(Buffer.from([19]))
    expect(await HashBox.calculateHash('123', '123', 1, 2)).toEqual(Buffer.from([19, 62]))
    expect(await HashBox.calculateHash('123', '123', 1, 3)).toEqual(Buffer.from([19, 62, 7]))
    expect(await HashBox.calculateHash('123', '123', 1, 1024)).toEqual((await HashBox.calculateHash('123', '123', 1, 1025)).slice(0, 1024))

    expect(await HashBox.calculateHash('123', '123', 10, 3)).toEqual(Buffer.from([231, 249, 190]))
    expect(await HashBox.calculateHash('123', '123', 10, 3)).not.toEqual(await HashBox.calculateHash('123', '123', 11, 3))
    expect(await HashBox.calculateHash('123', '123', 10, 3)).not.toEqual(await HashBox.calculateHash('123', '123', 9, 3))

    expect(await HashBox.calculateHash('123', '123', 2, 3)).not.toEqual(await HashBox.calculateHash('123', '321', 2, 3))
    expect(await HashBox.calculateHash('123', '123', 2, 3)).not.toEqual(await HashBox.calculateHash('321', '123', 2, 3))

    expect(await HashBox.calculateHash('', '', 1, 0)).toEqual(Buffer.from([]))
    expect(await HashBox.calculateHash('', '', 1, 1)).toEqual(Buffer.from([109]))
    expect(await HashBox.calculateHash('', '', 1, 2)).toEqual(Buffer.from([109, 46]))

    expect(HashBox.calculateHash('', '', 1, -1)).rejects.toEqual(TypeError('Bad key length'))
    expect(HashBox.calculateHash('', '', -1, 0)).rejects.toEqual(TypeError('Bad iterations'))
    expect(HashBox.calculateHash([] as unknown as string, '', 0, 0)).rejects.toEqual(TypeError('Password must be a string, a Buffer, a typed array or a DataView'))
    expect(HashBox.calculateHash('', [] as unknown as string, 0, 0)).rejects.toEqual(TypeError('Salt must be a string, a Buffer, a typed array or a DataView'))
  })

  it('has expected implementation of translateBufferToReadableString', () => {
    expect(HashBox.translateBufferToReadableString(Buffer.from([1, 2]), ['AB'])).toEqual('B')
    expect(HashBox.translateBufferToReadableString(Buffer.from([1, 2]), ['BA'])).toEqual('A')
    expect(HashBox.translateBufferToReadableString(Buffer.from([1, 2, 3, 4]), ['AB'])).toEqual('BA')
    expect(HashBox.translateBufferToReadableString(Buffer.from([1, 2, 3, 4]), ['BA'])).toEqual('AB')
    expect(HashBox.translateBufferToReadableString(Buffer.from([1, 2, 3, 4]), ['ABCD'])).toEqual('DA')

    expect(HashBox.translateBufferToReadableString(Buffer.from([1, 2, 3, 4]), ['AB', '01'])).toEqual('B0')
    expect(HashBox.translateBufferToReadableString(Buffer.from([1, 2, 3, 4, 5, 6]), ['AB', '01', '+='])).toEqual('B0=')

    expect(HashBox.translateBufferToReadableString(Buffer.from([]), ['ABC'])).toEqual('')
    expect(() => HashBox.translateBufferToReadableString(Buffer.from([1]), ['ABC'])).toThrowError('Buffer length must be even')
    expect(() => HashBox.translateBufferToReadableString(Buffer.from([]), [])).toThrowError('Characters must not be empty')
    expect(() => HashBox.translateBufferToReadableString(Buffer.from([]), [''])).toThrowError('Characters must not be empty')
    expect(() => HashBox.translateBufferToReadableString(Buffer.from([]), ['abcd', ''])).toThrowError('Characters must not be empty')
  })

  it('has expected implementation of createColumnsMatchingSize', () => {
    expect(HashBox.createColumnsMatchingSize('123abc', [-1])).toEqual(['123abc'])
    expect(HashBox.createColumnsMatchingSize('123abc', [0])).toEqual([''])
    expect(HashBox.createColumnsMatchingSize('123abc', [1])).toEqual(['1'])
    expect(HashBox.createColumnsMatchingSize('123abc', [2])).toEqual(['12'])
    expect(HashBox.createColumnsMatchingSize('123abc', [1, 2, 3, -1])).toEqual(['1', '12', '123', '123abc'])
    expect(HashBox.createColumnsMatchingSize('123abc', [])).toEqual([])

    expect(HashBox.createColumnsMatchingSize('12 ', [3])).toEqual(['12'])
    expect(HashBox.createColumnsMatchingSize(' 12 ', [3])).toEqual(['12'])
    expect(HashBox.createColumnsMatchingSize(' 12', [3])).toEqual(['12'])
    expect(HashBox.createColumnsMatchingSize(' 12 ', [4])).toEqual(['12'])
  })
})
