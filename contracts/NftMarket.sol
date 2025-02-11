// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../contracts/access/AccessManage.sol";

contract NftMarket is ERC721URIStorage, Ownable, AccessManage {
  using Counters for Counters.Counter;

  Counters.Counter private _listedItems;
  Counters.Counter private _tokenIds;
  uint256[] private _allNfts;

  mapping(string => bool) private _usedTokenURIs;
  mapping(uint => NftItem) private _idToNftItem;
  mapping(uint => uint) private _idToNftIndex;
  mapping(address => mapping(uint => uint)) private _ownedTokens;
  mapping(uint => uint) private _idToOwnedIndex;

  struct NftItem {
    uint tokenId;
    uint price;
    address creator;
    bool isListed;
    uint status;
  }

  event NftItemCreated (
    uint tokenId,
    uint price,
    address creator,
    bool isListed
  );
  uint public listingPrice = 0.025 ether;

  constructor() ERC721("CreaturesNFT", "CNFT") {}
  
  function getNftItem(uint tokenId) public view returns (NftItem memory) {
    return _idToNftItem[tokenId];
  }

  function listedItemsCount() public view returns (uint) {
    return _listedItems.current();
  }

  function setListingPrice(uint newPrice) external onlyOwner {
    require(newPrice > 0, "Price must be at least 1 wei");
    listingPrice = newPrice;
  }
  function tokenURIExists(string memory tokenURI) public view returns (bool) {
    return _usedTokenURIs[tokenURI] == true;
  }

  function totalSupply() public view returns (uint) {
    return _allNfts.length;
  }

  function tokenByIndex(uint index) public view returns (uint) {
    require(index < totalSupply(), "Index out of bounds");
    return _allNfts[index];
  }
  
  function mintToken(string memory tokenURI, uint price) public payable returns (uint) {
    //require(isVerifier(msg.sender), "Only verifiers can access this");    
    require(!tokenURIExists(tokenURI), "Token URI already exists");
   // require(msg.value == listingPrice, "Price must be equal to listing price");
    _tokenIds.increment();
    _listedItems.increment();

    uint newTokenId = _tokenIds.current();

    _safeMint(msg.sender, newTokenId);

    _setTokenURI(newTokenId, tokenURI);

    _createNftItem(newTokenId, price);
    _usedTokenURIs[tokenURI] = true;
    return newTokenId;
  }


  function updateUri(uint tokenId, string memory uri) public {
    _setTokenURI(tokenId, uri);
  }

  function updateStatus(uint tokenId, uint status) public {
    NftItem storage item = _idToNftItem[tokenId];
    item.status = status;
  }



  function getAllNftsOnSale() public view returns (NftItem[] memory) {
    uint allItemsCounts = totalSupply();
    uint currentIndex = 0;
    NftItem[] memory items = new NftItem[](_listedItems.current());

    for (uint i = 0; i < allItemsCounts; i++) {
      uint tokenId = tokenByIndex(i);
      NftItem storage item = _idToNftItem[tokenId];

      if (item.isListed == true) {
        items[currentIndex] = item;
        currentIndex += 1;
      }
    }

    return items;
  }


  function getOwnedNfts() public view returns (NftItem[] memory) {
    uint ownedItemsCount = ERC721.balanceOf(msg.sender);
    NftItem[] memory items = new NftItem[](ownedItemsCount);

    for (uint i = 0; i < ownedItemsCount; i++) {
      uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
      NftItem storage item = _idToNftItem[tokenId];
      items[i] = item;
    }

    return items;
  }

  
  function _createNftItem(
    uint tokenId,
    uint price
  ) private {
    require(price > 0, "Price must be at least 1 wei");

    _idToNftItem[tokenId] = NftItem(
      tokenId,
      price,
      msg.sender,
      true,
      1
    );

    emit NftItemCreated(tokenId, price, msg.sender, true);
  }


  function transferTo(uint tokenId, address user) public {
      address owner = ERC721.ownerOf(tokenId);
      _transfer(owner, user, tokenId);
  }

  function buyNft(
    uint tokenId
  ) public payable {
    uint price = _idToNftItem[tokenId].price;
    address owner = ERC721.ownerOf(tokenId);

    require(msg.sender != owner, "You already own this NFT");
    require(msg.value == price, "Please submit the asking price");

    _idToNftItem[tokenId].isListed = false;
    _listedItems.decrement();

    _transfer(owner, msg.sender, tokenId);
    payable(owner).transfer(msg.value);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint tokenId,
    uint256 batchSize
  ) internal virtual override {
    super._beforeTokenTransfer(from, to, tokenId, batchSize);

    if (from == address(0)) {
      _addTokenToAllTokensEnumaration(tokenId);
    }else if (from != to) {
      _removeTokenFromOwnerEnumeration(from, tokenId);
    }
     if (to == address(0)) {
      _removeTokenFromAllTokensEnumeration(tokenId);
    } else if (to != from) {
      _addTokenToOwnerEnumaration(to, tokenId);
    }
  } 


  function _addTokenToAllTokensEnumaration(uint tokenId) private {
    _idToNftIndex[tokenId] = _allNfts.length;
    _allNfts.push(tokenId);
  }
  function _addTokenToOwnerEnumaration(address to, uint tokenId) private {
    uint length = ERC721.balanceOf(to);
    _ownedTokens[to][length] = tokenId;
    _idToOwnedIndex[tokenId] = length;
  }

  function tokenOfOwnerByIndex(address owner, uint index) public view returns (uint) {
    require(index < ERC721.balanceOf(owner), "Index out of bounds");
    return _ownedTokens[owner][index];
  }

   function _removeTokenFromOwnerEnumeration(address from, uint tokenId) private {
    uint lastTokenIndex = ERC721.balanceOf(from) - 1;
    uint tokenIndex = _idToOwnedIndex[tokenId];

    if (tokenIndex != lastTokenIndex) {
      uint lastTokenId = _ownedTokens[from][lastTokenIndex];

      _ownedTokens[from][tokenIndex] = lastTokenId;
      _idToOwnedIndex[lastTokenId] = tokenIndex;
    }

    delete _idToOwnedIndex[tokenId];
    delete _ownedTokens[from][lastTokenIndex];
  }


  function _removeTokenFromAllTokensEnumeration(uint tokenId) private {
    uint lastTokenIndex = _allNfts.length - 1;
    uint tokenIndex = _idToNftIndex[tokenId];
    uint lastTokenId = _allNfts[lastTokenIndex];

    _allNfts[tokenIndex] = lastTokenId;
    _idToNftIndex[lastTokenId] = tokenIndex;

    delete _idToNftIndex[tokenId];
    _allNfts.pop();
  }

  function placeNftOnSale(uint tokenId, uint newPrice) public payable {
    require(ERC721.ownerOf(tokenId) == msg.sender, "You are not owner of this nft");
    require(_idToNftItem[tokenId].isListed == false, "Item is already on sale");
    require(msg.value == listingPrice, "Price must be equal to listing price");

    _idToNftItem[tokenId].isListed = true;
    _idToNftItem[tokenId].price = newPrice;
    _listedItems.increment();
  }
}

