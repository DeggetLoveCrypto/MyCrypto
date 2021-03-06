import { fNetwork, customNodeConfig } from '@fixtures';

import {
  NetworkId,
  LSKeys,
  LocalStorage,
  ExtendedContract,
  ExtendedAsset,
  NodeOptions
} from '@types';
import { createDefaultValues } from '@database';
import { NETWORKS_CONFIG, SCHEMA_BASE } from '@database/data';
import { generateUUID } from '@utils';

import { constructNetworkNodes, mergeConfigWithLocalStorage } from './utils';

describe('constructNetworkNodes()', () => {
  it('returns empty networkNodes object if no custom nodes present and default node is auto selected', () => {
    const networkNodes = constructNetworkNodes([fNetwork]);

    expect(networkNodes).toEqual({});
  });

  it('construct object with networkId as a key for each network with non default node selected', () => {
    const customNetwork = { ...fNetwork, id: 'customNetworkId' as NetworkId };
    const networks = [{ ...fNetwork, selectedNode: customNodeConfig.name }, customNetwork];
    const networkNodes = constructNetworkNodes(networks);

    expect(Object.keys(networkNodes).length).toEqual(1);
    expect(networkNodes[customNetwork.id]).toEqual(undefined);
    expect(networkNodes[fNetwork.id].selectedNode).toEqual(customNodeConfig.name);
  });

  it('construct object with networkId as a key for each network with custom nodes', () => {
    const customNetwork = {
      ...fNetwork,
      id: 'customNetworkId' as NetworkId,
      nodes: [customNodeConfig]
    };
    const networks = [fNetwork, customNetwork];
    const networkNodes = constructNetworkNodes(networks);

    expect(Object.keys(networkNodes).length).toEqual(1);
    expect(networkNodes[fNetwork.id]).toEqual(undefined);
    expect(networkNodes[customNetwork.id].nodes).toEqual(customNetwork.nodes);
  });
});

describe('mergeConfigWithLocalStorage()', () => {
  const defaultLs = createDefaultValues(SCHEMA_BASE, NETWORKS_CONFIG);

  it('shouldnt change LS object if there are no custom contracts/assets/network nodes', () => {
    const emptyLs = ({
      [LSKeys.CONTRACTS]: [{}],
      [LSKeys.ASSETS]: [],
      [LSKeys.NETWORKS]: {},
      [LSKeys.NETWORK_NODES]: []
    } as unknown) as LocalStorage;
    const mergedLs = mergeConfigWithLocalStorage(NETWORKS_CONFIG, emptyLs);

    expect(defaultLs).toEqual(mergedLs);
  });

  it('should add custom contracts from LS to merged object', () => {
    const customContract = {
      name: 'Custom Contract',
      isCustom: true,
      networkId: fNetwork.id,
      uuid: generateUUID()
    };
    const ls = ({
      [LSKeys.CONTRACTS]: {
        [customContract.uuid]: customContract
      },
      [LSKeys.ASSETS]: {},
      [LSKeys.NETWORKS]: {}
    } as unknown) as LocalStorage;
    const mergedLs = mergeConfigWithLocalStorage(NETWORKS_CONFIG, ls);

    const mergedLsContracts = Object.values(mergedLs[LSKeys.CONTRACTS]);
    expect(mergedLsContracts.length).toEqual(Object.values(defaultLs[LSKeys.CONTRACTS]).length + 1);
    expect(
      mergedLsContracts.find((c: ExtendedContract) => c.name === customContract.name)
    ).toBeTruthy();
  });

  it('should add custom assets from LS to merged object', () => {
    const customAsset = {
      name: 'Custom Asset',
      isCustom: true,
      networkId: fNetwork.id,
      uuid: generateUUID()
    };
    const ls = ({
      [LSKeys.CONTRACTS]: {},
      [LSKeys.NETWORKS]: {},
      [LSKeys.ASSETS]: { [customAsset.uuid]: customAsset }
    } as unknown) as LocalStorage;
    const mergedLs = mergeConfigWithLocalStorage(NETWORKS_CONFIG, ls);

    const mergedLsAssets = Object.values(mergedLs[LSKeys.ASSETS]);
    expect(mergedLsAssets.length).toEqual(Object.values(defaultLs[LSKeys.ASSETS]).length + 1);
    expect(mergedLsAssets.find((a: ExtendedAsset) => a.name === customAsset.name)).toBeTruthy();
  });

  it('should add custom network nodes from LS to merged object', () => {
    const customNetwork = {
      ...fNetwork,
      nodes: [customNodeConfig]
    };
    const ls = ({
      [LSKeys.CONTRACTS]: {},
      [LSKeys.ASSETS]: {},
      [LSKeys.NETWORKS]: {},
      [LSKeys.NETWORK_NODES]: constructNetworkNodes([customNetwork])
    } as unknown) as LocalStorage;
    const mergedLs = mergeConfigWithLocalStorage(NETWORKS_CONFIG, ls);

    const mergedNetwork = mergedLs[LSKeys.NETWORKS][customNetwork.id];
    expect(mergedNetwork.nodes.length).toEqual(
      defaultLs[LSKeys.NETWORKS][customNetwork.id].nodes.length + 1
    );
    expect(
      mergedNetwork.nodes.find((n: NodeOptions) => n.name === customNodeConfig.name)
    ).toBeTruthy();
  });

  it('should add custom network from LS to merged object', () => {
    const customNetwork = {
      ...fNetwork,
      id: 'MyCustomNetwork' as NetworkId,
      nodes: [customNodeConfig],
      selectedNode: customNodeConfig.name,
      isCustom: true
    };
    const ls = ({
      [LSKeys.CONTRACTS]: {},
      [LSKeys.ASSETS]: {},
      [LSKeys.NETWORKS]: { [customNetwork.id]: customNetwork },
      [LSKeys.NETWORK_NODES]: constructNetworkNodes([customNetwork])
    } as unknown) as LocalStorage;
    const mergedLs = mergeConfigWithLocalStorage(NETWORKS_CONFIG, ls);

    const mergedNetwork = mergedLs[LSKeys.NETWORKS][customNetwork.id];
    expect(mergedNetwork).toBeTruthy();
    expect(mergedNetwork.nodes.length).toEqual(1);
    expect(
      mergedNetwork.nodes.find((n: NodeOptions) => n.name === customNodeConfig.name)
    ).toBeTruthy();
  });
});
