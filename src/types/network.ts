import { Subtract, Omit, Overwrite } from 'utility-types';

import { NodeOptions } from './node';
import { BlockExplorer } from './blockExplorer';
import { GasPrice } from './gas';
import { DPathFormats } from './dPath';
import { NetworkId } from './networkId';
import { TUuid } from './uuid';
import { Contract } from './contract';
import { Asset, TTicker } from './asset';
import { TAddress } from './address';

type AssetPropsMissingInLegacy = Pick<Asset, 'networkId'> | Pick<Asset, 'contractAddress'>;
interface AssetPropsInLegacy {
  address: TAddress;
}
export type AssetLegacy = Subtract<Asset, AssetPropsMissingInLegacy> & AssetPropsInLegacy;
export type ContractLegacy = Omit<Contract, 'networkId'> & { uuid?: TUuid };

export interface Network {
  id: NetworkId;
  name: string;
  baseAsset: TUuid;
  baseUnit: TTicker;
  chainId: number;
  isCustom: boolean;
  isTestnet?: boolean;
  color: string | undefined;
  blockExplorer?: BlockExplorer;
  tokenExplorer?: {
    name: string;
    address(address: string): string;
  };
  assets: TUuid[];
  contracts: TUuid[];
  dPaths: DPathFormats;
  gasPriceSettings: GasPrice;
  shouldEstimateGasPrice?: boolean;
  nodes: NodeOptions[];
  selectedNode?: string;
  autoNode?: string;
}

interface NetworkPropsMissingInLegacy {
  nodes: NodeOptions[];
  assets: string[];
  baseAsset: TUuid;
  baseUnit: TTicker;
}

interface NetworkUnusedLegacyProps {
  tokens: AssetLegacy[];
  isTestnet?: boolean;
  unsupportedTabs?: any[];
  hideEquivalentValues?: boolean;
  unit: TTicker;
  nodes?: NodeOptions[];
}

export type NetworkLegacy = Subtract<
  Overwrite<Network, { contracts: ContractLegacy[] }>,
  NetworkPropsMissingInLegacy
> &
  NetworkUnusedLegacyProps;

export interface NetworkNodes {
  nodes?: NodeOptions[];
  selectedNode?: string;
}
