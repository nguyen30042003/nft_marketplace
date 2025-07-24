import { User } from "components/fectData/fetch_user";

// Enum for different states of a copyright registration
export enum Status {
  UPLOADED = "UPLOADED",
  PENDING = "PENDING",
  INCOMPLETE = "INCOMPLETE",
  REJECTED = "REJECTED",
  APPROVED = "APPROVED",
  PUBLISHED = "PUBLISHED",
  PAID = "PAID",
  EXPIRED = "EXPIRED",
  REQUEST_RENEW = "REQUEST_RENEW",
}
export enum CopyrightType {
  BUSINESS = "BUSINESS",
  SOFTWARE = "SOFTWARE",
  ART = "ART",
  MUSIC = "MUSIC",
  VIDEO = "VIDEO"
}

export type Trait = "attack" | "health" | "speed";

export type NftAttribute = {
  trait_type: Trait;
  value: string;
};

export type NftMeta = {
  uri: string;
  name: string;
  description: string;  
  samples: string;
  applicationForm: string;
  createAt: string,
  updateAt: string,
  activeAt: string,
  expiredAt: string
};

export type NftCore = {
  tokenId: number;
  creator: string;
  isListed: boolean;
  copyrightType: number;
  activeAt: number;
  expiredAt: number;
};

export type Nft = {
  meta: NftMeta;
} & NftCore;

export type FileReq = {
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
};

export type PinataRes = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate: boolean;
};




// CopyRight entity
export interface CopyRight {
  id: string;
  status: Status; // Sử dụng enum Status
  user: User;
  metaData: NftMeta; // Sử dụng lại NftMeta để tránh trùng lặp
  tokenId: string,
  verifierAddress: string,
  isTransfer: Boolean,
  gasFee: number,
  copyrightType: CopyrightType,
}

export interface CopyRightRequest {
  status: Status; 
  userAddress: String;
  metaData: NftMeta;
  tokenId: String,
  verifierAddress: String,
  copyrightType: CopyrightType,
}


// Array of CopyRight entities
export type CopyRights = CopyRight[];

export enum TransactionStatus {
  REQUESTED = "REQUESTED",
  PENDING = "PENDING",
  PAYMENT_REQUIRED = "PAYMENT_REQUIRED",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  CANCELLED_REQUIRED = "CANCELLED_REQUIRED",
}


export interface TransferCopyRight {
  id: number,
  fromUserId: number;
  toUserId: number;
  orderId: number;
  verifyAddress: string;
  price: number;
  status: TransactionStatus;
}

export interface TransferCopyRightRequest {
  fromUserId: number;
  toUserId: number;
  orderId: number;
  verifyAddress: string;
  price: number;
  status: TransactionStatus;
}

export interface TransferCopyRightResponse {
  id: number,
  orderId: number,
  fromUserAddress: string;
  toUserAddress: string;
  verifierAddress: string;
  title: string;
  price: number;
  status: TransactionStatus;
  createAt: string;
  updateAt: string;
}


export interface BrandResponse {
  brand: string,
  score: string,
  id: number
}

export interface MostSimilar {
  id: number,
  logo: string,
  rate: string
}

export interface Member {
  username: string;
  address: string;
  email: string;
  role: string;
  isApprove: boolean;
  isStaff: boolean;
  idVerifier: number;
};


export interface CopyRightPaginationResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  sort: any[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any[]; 
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  content: CopyRight[]; 
}


export interface UserPaginationResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  sort: any[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any[]; 
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  content: User[]; 
}

export interface CopyRightTransferPaginationResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  sort: any[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any[]; 
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  content: TransferCopyRightResponse[]; 
}

export interface CheckBranchResponse {
  potentiallySimilarBrands: String[];
  riskAssessment: String;
  explanation: String;
}

export interface LogoBranchResponse {
  url: string;
  b64Json: string;
}