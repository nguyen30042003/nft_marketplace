const instance = await NftMarket.deployed();
const list = await instance.getAllNftsOnSale();
//const list = await instance.getOwnedNfts();
instance.mintToken("https://apricot-additional-sheep-711.mypinata.cloud/ipfs/QmQjcm6WTKvX1Zc6u59Cc8D7pWCpq7Rfqw6JCPUDWv1n3X","500000000000000000", {value: "25000000000000000",from: accounts[0]})
instance.mintToken("https://apricot-additional-sheep-711.mypinata.cloud/ipfs/QmZfkh9qxzbLYh5B3SMDUe9PGKxkYoSUAVfDkPjnqpr6QF","300000000000000000", {value: "25000000000000000",from: accounts[0]})
