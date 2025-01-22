import {
  ContractTransaction,
  ContractInterface,
  BytesLike as Arrayish,
  BigNumber,
  BigNumberish,
} from 'ethers';
import { EthersContractContextV5 } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContextV5<
  AccessManageContract,
  AccessManageContractMethodNames,
  AccessManageContractEventsContext,
  AccessManageContractEvents
>;

export declare type EventFilter = {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
};

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>;
  /**
   * The nonce to use in the transaction
   */
  nonce?: number;
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>;
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number;
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string;
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
}
export type AccessManageContractEvents =
  | 'RoleAssigned'
  | 'RoleRemoved'
  | 'UserAdded';
export interface AccessManageContractEventsContext {
  RoleAssigned(...parameters: any): EventFilter;
  RoleRemoved(...parameters: any): EventFilter;
  UserAdded(...parameters: any): EventFilter;
}
export type AccessManageContractMethodNames =
  | 'new'
  | 'addUser'
  | 'assignRole'
  | 'removeRole'
  | 'getUserInfo'
  | 'isAdmin'
  | 'isVerifier'
  | 'isUser';
export interface RoleAssignedEventEmittedResponse {
  account: string;
  role: string;
}
export interface RoleRemovedEventEmittedResponse {
  account: string;
  role: string;
}
export interface UserAddedEventEmittedResponse {
  account: string;
  name: string;
  email: string;
}
export interface GetUserInfoResponse {
  name: string;
  0: string;
  email: string;
  1: string;
  tokenURI: string;
  2: string;
  length: 3;
}
export interface AccessManageContract {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   */
  'new'(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param account Type: address, Indexed: false
   * @param name Type: string, Indexed: false
   * @param email Type: string, Indexed: false
   * @param tokenURI Type: string, Indexed: false
   */
  addUser(
    account: string,
    name: string,
    email: string,
    tokenURI: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param account Type: address, Indexed: false
   * @param role Type: string, Indexed: false
   */
  assignRole(
    account: string,
    role: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param account Type: address, Indexed: false
   * @param role Type: string, Indexed: false
   */
  removeRole(
    account: string,
    role: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  getUserInfo(
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<GetUserInfoResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  isAdmin(account: string, overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  isVerifier(
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  isUser(account: string, overrides?: ContractCallOverrides): Promise<boolean>;
}
