/* eslint-disable @next/next/no-img-element */

import type { NextPage } from 'next'
import { BaseLayout } from '../../components/ui'
import { Nft } from '@_types/nft';
import { useOwnedNfts } from '@hooks/web3';
import { useEffect, useState } from 'react';
import router from 'next/router';
import { a } from 'framer-motion/client';
import { fetch_copyright_by_tokenId } from 'components/fectData/fetch_copyright';
import useSWR from 'swr';

const tabs = [
  { name: 'Your Collection', href: '#', current: true },
]
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
const Profile: NextPage = () => {

  const { nfts }  = useOwnedNfts();
  const [activeNft, setActiveNft] = useState<Nft>();

  useEffect(() => {
    if (nfts.data && nfts.data.length > 0) {
      setActiveNft(nfts.data[0]);
    }
    return () => setActiveNft(undefined)
  }, [nfts.data])


  const [tokenId, setTokenId] = useState<string | undefined>();
  
  useEffect(() => {
    if (activeNft) {
      setTokenId(activeNft.tokenId.toString());
    }
  }, [activeNft]);
  
  const { data: copyright, error: copyrightError, isLoading: isCopyrightLoading } = useSWR(
    tokenId ? ["fetch_copyright_by_tokenId", tokenId] : null,
    () => fetch_copyright_by_tokenId(tokenId as string)
  );


  console.log(nfts)
  return (
    <BaseLayout>
      <div className="h-full flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-stretch overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex">
                  <h1 className="flex-1 text-2xl font-bold text-gray-900">Your NFTs</h1>
                </div>
                <div className="mt-3 sm:mt-2">
                  <div className="hidden sm:block">
                    <div className="flex items-center border-b border-gray-200">
                      <nav className="flex-1 -mb-px flex space-x-6 xl:space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                          <a
                            key={tab.name}
                            href={tab.href}
                            aria-current={tab.current ? 'page' : undefined}
                            className={classNames(
                              tab.current
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                            )}
                          >
                            {tab.name}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>

                <section className="mt-8 pb-16" aria-labelledby="gallery-heading">
                  <ul
                    role="list"
                    className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
                  >
                    {(nfts.data as Nft[]).map((nft) => (
                      <li
                        key={nft.tokenId}
                        onClick={() => setActiveNft(nft)}
                        className="relative">
                        <div
                          className={classNames(
                            nft.tokenId === activeNft?.tokenId 
                              ? 'ring-2 ring-offset-2 ring-indigo-500'
                              : 'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500',
                            'group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden'
                          )}
                        >
                          <img
                            src={nft.meta.samples}
                            alt=""
                            className={classNames(
                              nft.tokenId === activeNft?.tokenId  ? '' : 'group-hover:opacity-75',
                              'object-cover pointer-events-none'
                            )}
                          />
                          <button type="button" className="absolute inset-0 focus:outline-none">
                            <span className="sr-only">View details for {nft.meta.name}</span>
                          </button>
                        </div>
                        <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
                          {nft.meta.name}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </main>

            {/* Details sidebar */}
            <aside className="hidden w-96 bg-white p-8 border-l border-gray-200 overflow-y-auto lg:block">
            { activeNft  &&
              <div className="pb-16 space-y-6">
                <div>
                  <div className="block w-full aspect-w-10 aspect-h-7 rounded-lg overflow-hidden">
                  <img src={activeNft.meta.samples} alt="" className="object-cover" />
                  </div>
                  <div className="mt-4 flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        <span className="sr-only">Details for </span>
                        {activeNft.meta.name}
                      </h2>
                      <p className="text-sm font-medium text-gray-500">{activeNft.meta.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <button
                    type="button"
                    className="flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View detail
                  </button>
                    {!copyright?.isTransfer && (
                      <button
                        type="button"
                        onClick={() => router.push(`/transfer/${activeNft.tokenId}`)}
                        className="disabled:text-gray-400 disabled:cursor-not-allowed flex-1 ml-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Transfer
                      </button>
                    )}
                </div>
              </div>
            }
            </aside>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default Profile;