// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../contracts/access/AccessManage.sol";
import "./History.sol";
contract NftMarket is ERC721URIStorage, Ownable, AccessManage {
    using Counters for Counters.Counter;
    using StatusLib for StatusLib.StatusHistory[];
    using StatusLib for StatusLib.TransferHistory[];
    Counters.Counter private _listedItems;
    Counters.Counter private _tokenIds;
    uint256[] private _allNfts;

    mapping(string => bool) private _usedTokenURIs;
    mapping(uint => NftItem) private _idToNftItem;
    mapping(uint => uint) private _idToNftIndex;
    mapping(address => mapping(uint => uint)) private _ownedTokens;
    mapping(uint => uint) private _idToOwnedIndex;
    mapping(uint => StatusLib.StatusHistory[]) private _statusHistory;
    mapping(uint => bool) private _isFirstTransferDone;
    mapping(uint => StatusLib.TransferHistory[]) private _transferHistories;

    struct NftItem {
        uint tokenId;
        address creator;
        bool isListed;
        uint status;
        uint copyrightType;
        uint256 startTime;
        uint256 endTime;
    }

    event NftItemCreated(
        uint tokenId,
        string uri,
        address creator,
        bool isListed,
        uint copyrightType,
        uint256 startTime,
        uint256 endTime
    );
    event NftItemUpdated(uint tokenId);
    uint public listingPrice = 0.025 ether;

    constructor() ERC721("CreaturesNFT", "CNFT") {}

    function getNftItem(uint tokenId) public view returns (NftItem memory) {
        return _idToNftItem[tokenId];
    }

    function listedItemsCount() public view returns (uint) {
        return _listedItems.current();
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

    function mintToken(
        string memory tokenURI,
        uint copyrightType,
        uint256 startTime,
        uint256 endTime
    ) public payable returns (uint) {
        require(!tokenURIExists(tokenURI), "Token URI already exists");
        _tokenIds.increment();
        _listedItems.increment();

        uint newTokenId = _tokenIds.current();
        _addTokenToOwnerEnumaration(msg.sender, newTokenId);
        _addTokenToAllTokensEnumaration(newTokenId);
        _safeMint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        _createNftItem(newTokenId, tokenURI, copyrightType, startTime, endTime);
        updateStatus(newTokenId, 1);
        _usedTokenURIs[tokenURI] = true;
        return newTokenId;
    }

    function updateUri(uint tokenId, string memory uri) public {
        _setTokenURI(tokenId, uri);
    }

    function updateStatus(uint tokenId, uint status) public {
        NftItem storage item = _idToNftItem[tokenId];
        item.status = status;
        _statusHistory[tokenId].addStatus(status);
        emit NftItemUpdated(tokenId);
    }

    function getStatusHistory(
        uint tokenId
    ) public view returns (StatusLib.StatusHistory[] memory) {
        return _statusHistory[tokenId];
    }

    function getStatusHistoryTransfer(
        uint tokenId
    ) public view returns (StatusLib.TransferHistory[] memory) {
        return _transferHistories[tokenId];
    }

    function getAllNftsOnSale() public view returns (NftItem[] memory) {
        uint totalNfts = totalSupply();
        uint listedNftsCount = 0;

        for (uint i = 0; i < totalNfts; i++) {
            uint tokenId = tokenByIndex(i);
            if (_idToNftItem[tokenId].isListed == true) {
                listedNftsCount++;
            }
        }

        NftItem[] memory listedNfts = new NftItem[](listedNftsCount);
        uint currentIndex = 0;

        for (uint i = 0; i < totalNfts; i++) {
            uint tokenId = tokenByIndex(i);
            if (_idToNftItem[tokenId].isListed == true) {
                listedNfts[currentIndex] = _idToNftItem[tokenId];
                currentIndex++;
            }
        }

        return listedNfts;
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
        string memory uri,
        uint copyrightType,
        uint256 startTime,
        uint256 endTime
    ) private {
        _idToNftItem[tokenId] = NftItem(
            tokenId,
            msg.sender,
            false,
            1,
            copyrightType,
            startTime,
            endTime
        );

        emit NftItemCreated(
            tokenId,
            uri,
            msg.sender,
            false,
            copyrightType,
            startTime,
            endTime
        );
    }

    function transferTo(uint tokenId, address from, address to) public {
        require(_exists(tokenId), "Token does not exist");

        // Đảm bảo `from` là chủ sở hữu thực sự của token
        require(from == ERC721.ownerOf(tokenId), "Incorrect owner");

        _idToNftItem[tokenId].isListed = true;

        if (_isFirstTransferDone[tokenId]) {
            _transferHistories[tokenId].addTransfer(from, to);
        } else {
            _isFirstTransferDone[tokenId] = true;
        }

        _transfer(from, to, tokenId);
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

    function tokenOfOwnerByIndex(
        address owner,
        uint index
    ) public view returns (uint) {
        require(index < ERC721.balanceOf(owner), "Index out of bounds");
        return _ownedTokens[owner][index];
    }

    function _removeTokenFromOwnerEnumeration(
        address from,
        uint tokenId
    ) private {
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

    function placeNftOnSale(uint tokenId) public payable {
        require(
            ERC721.ownerOf(tokenId) == msg.sender,
            "You are not owner of this nft"
        );
        require(
            _idToNftItem[tokenId].isListed == false,
            "Item is already on sale"
        );

        _idToNftItem[tokenId].isListed = true;
        _listedItems.increment();
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
        } else if (from != to) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }
        if (to == address(0)) {
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if (to != from) {
            _addTokenToOwnerEnumaration(to, tokenId);
        }
    }
}
