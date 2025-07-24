import {
  ContractTransaction,
  ContractInterface,
  BytesLike as Arrayish,
  BigNumber,
  BigNumberish,
} from 'ethers';
import { EthersContractContextV5 } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContextV5<
  NftMarketContract,
  NftMarketContractMethodNames,
  NftMarketContractEventsContext,
  NftMarketContractEvents
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
export type NftMarketContractEvents =
  | 'Approval'
  | 'ApprovalForAll'
  | 'BatchMetadataUpdate'
  | 'MetadataUpdate'
  | 'NftItemCreated'
  | 'NftItemUpdated'
  | 'OwnershipTransferred'
  | 'RoleAssigned'
  | 'RoleRemoved'
  | 'Transfer'
  | 'UserAdded';
export interface NftMarketContractEventsContext {
  Approval(...parameters: any): EventFilter;
  ApprovalForAll(...parameters: any): EventFilter;
  BatchMetadataUpdate(...parameters: any): EventFilter;
  MetadataUpdate(...parameters: any): EventFilter;
  NftItemCreated(...parameters: any): EventFilter;
  NftItemUpdated(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
  RoleAssigned(...parameters: any): EventFilter;
  RoleRemoved(...parameters: any): EventFilter;
  Transfer(...parameters: any): EventFilter;
  UserAdded(...parameters: any): EventFilter;
}
export type NftMarketContractMethodNames =
  | 'new'
  | 'addMember'
  | 'addUser'
  | 'approve'
  | 'assignRole'
  | 'balanceOf'
  | 'getApproved'
  | 'getMembersOfVerifier'
  | 'getUserInfo'
  | 'getVerifierOfMember'
  | 'isAdmin'
  | 'isApprovedForAll'
  | 'isMember'
  | 'isUser'
  | 'isVerifier'
  | 'listingPrice'
  | 'name'
  | 'owner'
  | 'ownerOf'
  | 'removeMember'
  | 'removeRole'
  | 'renounceOwnership'
  | 'safeTransferFrom'
  | 'safeTransferFrom'
  | 'setApprovalForAll'
  | 'supportsInterface'
  | 'symbol'
  | 'tokenURI'
  | 'transferFrom'
  | 'transferOwnership'
  | 'getNftItem'
  | 'listedItemsCount'
  | 'tokenURIExists'
  | 'totalSupply'
  | 'tokenByIndex'
  | 'mintToken'
  | 'updateUri'
  | 'updateStatus'
  | 'getStatusHistory'
  | 'getStatusHistoryTransfer'
  | 'getAllNftsOnSale'
  | 'getOwnedNfts'
  | 'transferTo'
  | 'tokenOfOwnerByIndex'
  | 'placeNftOnSale';
export interface ApprovalEventEmittedResponse {
  owner: string;
  approved: string;
  tokenId: BigNumberish;
}
export interface ApprovalForAllEventEmittedResponse {
  owner: string;
  operator: string;
  approved: boolean;
}
export interface BatchMetadataUpdateEventEmittedResponse {
  _fromTokenId: BigNumberish;
  _toTokenId: BigNumberish;
}
export interface MetadataUpdateEventEmittedResponse {
  _tokenId: BigNumberish;
}
export interface NftItemCreatedEventEmittedResponse {
  tokenId: BigNumberish;
  uri: string;
  creator: string;
  isListed: boolean;
  copyrightType: BigNumberish;
  startTime: BigNumberish;
  endTime: BigNumberish;
}
export interface NftItemUpdatedEventEmittedResponse {
  tokenId: BigNumberish;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface RoleAssignedEventEmittedResponse {
  account: string;
  role: string;
}
export interface RoleRemovedEventEmittedResponse {
  account: string;
  role: string;
}
export interface TransferEventEmittedResponse {
  from: string;
  to: string;
  tokenId: BigNumberish;
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
export interface NftitemResponse {
  tokenId: BigNumber;
  0: BigNumber;
  creator: string;
  1: string;
  isListed: boolean;
  2: boolean;
  status: BigNumber;
  3: BigNumber;
  copyrightType: BigNumber;
  4: BigNumber;
  startTime: BigNumber;
  5: BigNumber;
  endTime: BigNumber;
  6: BigNumber;
}
export interface StatushistoryResponse {
  status: BigNumber;
  0: BigNumber;
  timestamp: BigNumber;
  1: BigNumber;
}
export interface TransferhistoryResponse {
  from: string;
  0: string;
  to: string;
  1: string;
  timestamp: BigNumber;
  2: BigNumber;
}
export interface NftMarketContract {
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
   * @param memberAccount Type: address, Indexed: false
   * @param verifierAccount Type: address, Indexed: false
   * @param name Type: string, Indexed: false
   * @param email Type: string, Indexed: false
   * @param tokenURI Type: string, Indexed: false
   */
  addMember(
    memberAccount: string,
    verifierAccount: string,
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
   * @param name Type: string, Indexed: false
   * @param email Type: string, Indexed: false
   * @param tokenURI Type: string, Indexed: false
   * @param role Type: string, Indexed: false
   */
  addUser(
    account: string,
    name: string,
    email: string,
    tokenURI: string,
    role: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   */
  approve(
    to: string,
    tokenId: BigNumberish,
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
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param owner Type: address, Indexed: false
   */
  balanceOf(
    owner: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getApproved(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param verifier Type: address, Indexed: false
   */
  getMembersOfVerifier(
    verifier: string,
    overrides?: ContractCallOverrides
  ): Promise<string[]>;
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
   * @param member Type: address, Indexed: false
   */
  getVerifierOfMember(
    member: string,
    overrides?: ContractCallOverrides
  ): Promise<string>;
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
   * @param owner Type: address, Indexed: false
   * @param operator Type: address, Indexed: false
   */
  isApprovedForAll(
    owner: string,
    operator: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  isMember(
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
   */
  listingPrice(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  name(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  ownerOf(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param memberAccount Type: address, Indexed: false
   */
  removeMember(
    memberAccount: string,
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
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  renounceOwnership(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   */
  safeTransferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   * @param data Type: bytes, Indexed: false
   */
  safeTransferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    data: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param operator Type: address, Indexed: false
   * @param approved Type: bool, Indexed: false
   */
  setApprovalForAll(
    operator: string,
    approved: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param interfaceId Type: bytes4, Indexed: false
   */
  supportsInterface(
    interfaceId: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  symbol(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  tokenURI(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   */
  transferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newOwner Type: address, Indexed: false
   */
  transferOwnership(
    newOwner: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getNftItem(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<NftitemResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  listedItemsCount(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenURI Type: string, Indexed: false
   */
  tokenURIExists(
    tokenURI: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  totalSupply(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param index Type: uint256, Indexed: false
   */
  tokenByIndex(
    index: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param tokenURI Type: string, Indexed: false
   * @param copyrightType Type: uint256, Indexed: false
   * @param startTime Type: uint256, Indexed: false
   * @param endTime Type: uint256, Indexed: false
   */
  mintToken(
    tokenURI: string,
    copyrightType: BigNumberish,
    startTime: BigNumberish,
    endTime: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param uri Type: string, Indexed: false
   */
  updateUri(
    tokenId: BigNumberish,
    uri: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param status Type: uint256, Indexed: false
   */
  updateStatus(
    tokenId: BigNumberish,
    status: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getStatusHistory(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<StatushistoryResponse[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getStatusHistoryTransfer(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<TransferhistoryResponse[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getAllNftsOnSale(
    overrides?: ContractCallOverrides
  ): Promise<NftitemResponse[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getOwnedNfts(overrides?: ContractCallOverrides): Promise<NftitemResponse[]>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   */
  transferTo(
    tokenId: BigNumberish,
    from: string,
    to: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param owner Type: address, Indexed: false
   * @param index Type: uint256, Indexed: false
   */
  tokenOfOwnerByIndex(
    owner: string,
    index: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  placeNftOnSale(
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
}
