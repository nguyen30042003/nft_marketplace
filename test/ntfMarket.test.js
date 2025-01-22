const NftMarket = artifacts.require("NftMarket");
const { ethers } = require("ethers");
const AccessManage = artifacts.require("AccessManage");
const { expectRevert } = require('@openzeppelin/test-helpers');


contract("NftMarket", (accounts) => {
  const [admin, verifier, nonVerifier, anotherAccount] = accounts;

  let nftMarketInstance;

  beforeEach(async () => {
    // Deploy the contracts
    nftMarketInstance = await NftMarket.new();

    // Assign the verifier role to the verifier account
    await nftMarketInstance.assignRole(verifier, "Verifier", { from: admin });
  });

  it("should allow a verifier to create an NFT with copyright", async () => {
    const tokenURI = "https://example.com/nft-metadata";
    const price = web3.utils.toWei("0.1", "ether");
    const listingPrice = await nftMarketInstance.listingPrice();

    // Verifier mints a new NFT
    const tx = await nftMarketInstance.mintToken(tokenURI, price, {
      from: verifier,
      value: listingPrice,
    });

    // Check that the NFT was created
    const tokenId = tx.logs[0].args.tokenId.toString();
    const nftItem = await nftMarketInstance.getNftItem(tokenId);

    assert.equal(nftItem.creator, verifier, "NFT creator should be the verifier");
    assert.equal(nftItem.price, price, "NFT price should match the input price");
    assert.equal(nftItem.isListed, true, "NFT should be listed");
  });

  it("should not allow a non-verifier to create an NFT with copyright", async () => {
    const tokenURI = "https://example.com/nft-metadata";
    const price = web3.utils.toWei("0.1", "ether");
    const listingPrice = await nftMarketInstance.listingPrice();

    // Non-verifier tries to mint a new NFT
    await expectRevert(
      nftMarketInstance.mintToken(tokenURI, price, {
        from: nonVerifier,
        value: listingPrice,
      }),
      "Only verifiers can access this"
    );
  });

  it("should allow admin to assign verifier role and allow them to create NFT", async () => {
    const tokenURI = "https://example.com/nft-metadata";
    const price = web3.utils.toWei("0.1", "ether");
    const listingPrice = await nftMarketInstance.listingPrice();

    // Admin assigns verifier role to another account
    await nftMarketInstance.assignRole(anotherAccount, "Verifier", { from: admin });

    // New verifier mints a new NFT
    const tx = await nftMarketInstance.mintToken(tokenURI, price, {
      from: anotherAccount,
      value: listingPrice,
    });

    // Check that the NFT was created
    const tokenId = tx.logs[0].args.tokenId.toString();
    const nftItem = await nftMarketInstance.getNftItem(tokenId);

    assert.equal(nftItem.creator, anotherAccount, "NFT creator should be the new verifier");
  });

  it("should not allow a verifier to mint NFT without listing price", async () => {
    const tokenURI = "https://example.com/nft-metadata";
    const price = web3.utils.toWei("0.1", "ether");

    // Verifier tries to mint NFT without sending the listing price
    await expectRevert(
      nftMarketInstance.mintToken(tokenURI, price, {
        from: verifier,
      }),
      "Price must be equal to listing price"
    );
  });
});



// const NftMarket = artifacts.require("NftMarket");
// const { ethers } = require("ethers");

// contract("NftMarket", accounts => {
//   let _contract = null;
//   let _nftPrice = ethers.utils.parseEther("1").toString();
//   let _listingPrice = ethers.utils.parseEther("0.025").toString();
//   before(async () => {
//     _contract = await NftMarket.deployed();
//   })

//   describe("Mint token", () => {

//     const tokenURI = "https://test.com";
//     before(async () => {
//       await _contract.mintToken(tokenURI, _nftPrice,  {
//         from: accounts[0],
//         value: _listingPrice
//       })
//     })
//     it("owner of the first token should be address[0]", async () => {
//       const owner = await _contract.ownerOf(1);
//       assert.equal(owner, accounts[0], "Owner of token is not matching address[0]");
//     })
//     it("first token should point to the correct tokenURI", async () => {
//       const actualTokenURI = await _contract.tokenURI(1);

//       assert.equal(actualTokenURI, tokenURI, "tokenURI is not correctly set");
//     })
//     it("should not be possible to create a NFT with used tokenURI", async () => {
//       try {
//         await _contract.mintToken(tokenURI, _nftPrice, {
//           from: accounts[0]
//         })
//       } catch(error) {
//         assert(error, "NFT was minted with previously used tokenURI");
//       }
//     })

//     it("should have one listed item", async () => {
//       const listedItemCount = await _contract.listedItemsCount();
//       assert.equal(listedItemCount.toNumber(), 1, "Listed items count is not 1");
//     })

//     it("should have create NFT item", async () => {
//       const nftItem = await _contract.getNftItem(1);

//       assert.equal(nftItem.tokenId, 1, "Token id is not 1");
//       assert.equal(nftItem.price, _nftPrice, "Nft price is not correct");
//       assert.equal(nftItem.creator, accounts[0], "Creator is not account[0]");
//       assert.equal(nftItem.isListed, true, "Token is not listed");
//     })
//   })
  

//   describe("Buy NFT", () => {
//     before(async () => {
//       await _contract.buyNft(1, {
//         from: accounts[1],
//         value: _nftPrice
//       })
//     })

//     it("should unlist the item", async () => {
//       const listedItem = await _contract.getNftItem(1);
//       assert.equal(listedItem.isListed, false, "Item is still listed");
//     })

//     it("should decrease listed items count", async () => {
//       const listedItemsCount = await _contract.listedItemsCount();
//       assert.equal(listedItemsCount.toNumber(), 0, "Count has not been decrement");
//     })

//     it("should change the owner", async () => {
//       const currentOwner = await _contract.ownerOf(1);
//       assert.equal(currentOwner, accounts[1], "Item is still listed");
//     })
//   })


//   describe("Token transfers", () => {
//     const tokenURI = "https://test-json-2.com";
//     before(async () => {
//       await _contract.mintToken(tokenURI, _nftPrice, {
//         from: accounts[0],
//         value: _listingPrice
//       })
//     })

//     it("should have two NFTs created", async () => {
//       const totalSupply = await _contract.totalSupply();
//       assert.equal(totalSupply.toNumber(), 2, "Total supply of token is not correct");
//     })

//     it("should be able to retreive nft by index", async () => {
//       const nftId1 = await _contract.tokenByIndex(0);
//       const nftId2 = await _contract.tokenByIndex(1);


//       assert.equal(nftId1.toNumber(), 1, "Nft id is wrong");
//       assert.equal(nftId2.toNumber(), 2, "Nft id is wrong");
//     })

//     it("should have one listed NFT", async () => {
//       const allNfts = await _contract.getAllNftsOnSale();
//       assert.equal(allNfts[0].tokenId, 2, "Nft has a wrong id");
//     })

//     it("account[1] should have one owned NFT", async () => {
//       const ownedNfts = await _contract.getOwnedNfts({from: accounts[1]});
//       assert.equal(ownedNfts[0].tokenId, 1, "Nft has a wrong id");
//     })

//     it("account[0] should have one owned NFT", async () => {
//       const ownedNfts = await _contract.getOwnedNfts({from: accounts[0]});
//       assert.equal(ownedNfts[0].tokenId, 2, "Nft has a wrong id");
//     })
//   })


//   describe("Token transfer to new owner", () => {
//     before(async () => {
//       await _contract.transferFrom(
//         accounts[0],
//         accounts[1],
//         2
//       )
//     })

//     it("accounts[0] should own 0 tokens", async () => {
//       const ownedNfts = await _contract.getOwnedNfts({from: accounts[0]});
//       assert.equal(ownedNfts.length, 0, "Invalid length of tokens");
//     })

//     it("accounts[1] should own 2 tokens", async () => {
//       const ownedNfts = await _contract.getOwnedNfts({from: accounts[1]});
//       assert.equal(ownedNfts.length, 2, "Invalid length of tokens");
//     })
//   })

//   describe("List an Nft", () => {
//     before(async () => {
//       await _contract.placeNftOnSale(
//         1,
//         _nftPrice, { from: accounts[1], value: _listingPrice}
//       )
//     })

//     it("should have two listed items", async () => {
//       const listedNfts = await _contract.getAllNftsOnSale();

//       assert.equal(listedNfts.length, 2, "Invalid length of Nfts");
//     })

//     it("should set new listing price", async () => {
//       await _contract
//         .setListingPrice(_listingPrice, {from: accounts[0]});
//       const listingPrice = await _contract.listingPrice();

//       assert.equal(listingPrice.toString(), _listingPrice, "Invalid Price");
//     })

//   })
// })