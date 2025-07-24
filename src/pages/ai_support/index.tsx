/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { BaseLayout } from '../../../components/ui'

const NftCreate: NextPage = () => {
  const router = useRouter()

  return (
    <BaseLayout>
      <div className="pt-12 flex flex-col items-center w-full">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-4">AI Support</h1>
          <p className="text-lg text-gray-600">
            Explore our AI tools to enhance your experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Box 1 */}
          <div
            onClick={() => router.push('/ai_support/check_branch')}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-6 flex flex-col items-center"
          >
            <img
              src="/images/icon/check_branch_name.png"
              alt="Check branch"
              className="w-40 h-40 object-contain mb-4"
            />
            <h2 className="text-xl font-semibold text-center text-blue-400">
              Using AI to check branch name on the Internet
            </h2>
          </div>

          {/* Box 2 */}
          <div
            onClick={() => router.push('/ai_support/generate_logo')}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-6 flex flex-col items-center"
          >
            <img
              src="/images/icon/generate_logo.png"
              alt="Generate logo"
              className="w-40 h-40 object-contain mb-4"
            />
            <h2 className="text-xl font-semibold text-center text-blue-400">
              Using AI to generate logo
            </h2>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default NftCreate
