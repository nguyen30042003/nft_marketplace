/* eslint-disable @next/next/no-img-element */
import { FunctionComponent, useState, useEffect } from "react";
import NftItem from "../item";

import { useListedNfts } from "@hooks/web3";
import { Nft } from "@_types/nft";

const NftList: FunctionComponent = () => {
  const { nfts } = useListedNfts();

  const [searchTemp, setSearchTemp] = useState("");
  const [priceRangeTemp, setPriceRangeTemp] = useState<[number, number]>([0, 0]); // Giá thấp nhất và cao nhất tạm thời
  const [sortOrderTemp, setSortOrderTemp] = useState<"asc" | "desc" | null>(null);

  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const [activeNft, setActiveNft] = useState<Nft | null>(null);

  const handleCloseModal = () => setActiveNft(null);
  // Cập nhật giá trị priceRangeTemp khi danh sách NFT thay đổi
  useEffect(() => {
    if (nfts.data?.length) {
      const maxPrice = Math.max(...nfts.data.map((nft) => nft.price));
      setPriceRangeTemp([0, maxPrice]);
      setPriceRange([0, maxPrice]);
    }
  }, [nfts.data]);

  const applyFilters = () => {
    setSearch(searchTemp);
    setPriceRange(priceRangeTemp);
    setSortOrder(sortOrderTemp);
  };

  const filteredNfts = nfts.data
    ?.filter((nft) => {
      const matchesSearch = nft.meta.name.toLowerCase().includes(search.toLowerCase());
      const matchesPrice = nft.price >= priceRange[0] && nft.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (!sortOrder) return 0;
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    });

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 p-4 bg-gray-100">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search NFTs"
            className="w-full p-2 border rounded"
            value={searchTemp}
            onChange={(e) => setSearchTemp(e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">Price Range</h3>
          <div className="flex items-center">
            <input
              type="number"
              className="w-1/2 p-2 border rounded mr-2"
              placeholder="Min"
              value={priceRangeTemp[0]}
              onChange={(e) =>
                setPriceRangeTemp([Math.max(0, Number(e.target.value)), priceRangeTemp[1]])
              }
            />
            <input
              type="number"
              className="w-1/2 p-2 border rounded"
              placeholder="Max"
              value={priceRangeTemp[1]}
              onChange={(e) =>
                setPriceRangeTemp([priceRangeTemp[0], Math.max(0, Number(e.target.value))])
              }
            />
          </div>
        </div>

        {/* Sort Order */}
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">Sort By</h3>
          <div>
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                className="mr-2"
                checked={sortOrderTemp === "asc"}
                onChange={() => setSortOrderTemp("asc")}
              />
              Price: Low to High
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                className="mr-2"
                checked={sortOrderTemp === "desc"}
                onChange={() => setSortOrderTemp("desc")}
              />
              Price: High to Low
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                className="mr-2"
                checked={sortOrderTemp === null}
                onChange={() => setSortOrderTemp(null)}
              />
              No Sorting
            </label>
          </div>
        </div>

        {/* Apply Filters Button */}
        <button
          className="w-full p-2 bg-blue-500 text-white rounded"
          onClick={applyFilters}
        >
          Apply Filters
        </button>
      </div>

      <div className="h-screen w-4/5 pl-6 overflow-y-auto hide-scrollbar">
  {/* Grid layout với 4 item mỗi hàng */}
  <div className="grid gap-6 grid-cols-4">
    {filteredNfts?.map((nft) => (
      <div
        key={nft.tokenId}
        onClick={() => setActiveNft(nft)}
        className="group block w-full rounded-lg bg-gray-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-indigo-500"
      >
        {/* Hình ảnh */}
        <div className="aspect-w-1 aspect-h-1">
          <img
            src={nft.meta.image}
            alt=""
            className="object-cover w-full h-full pointer-events-none group-hover:opacity-75"
          />
        </div>
        {/* Tên NFT */}
        <p className="mt-2 text-lg font-bold text-gray-900 truncate text-center">
          {nft.meta.name}
        </p>
        {/* Giá NFT */}
        <p className="text-md font-medium text-blue-500 text-center">
          {nft.price} ETH
        </p>
      </div>
    ))}
  </div>
</div>





      {/* Modal Overlay */}
      {activeNft && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg relative max-w-lg w-full">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>
            <div key={activeNft.meta.image} className="flex flex-col rounded-lg shadow-lg overflow-hidden"> <NftItem item={activeNft} buyNft={nfts.buyNft} /> </div>
          </div>
        </div>
      )}
    </div>


  );
};

export default NftList;
