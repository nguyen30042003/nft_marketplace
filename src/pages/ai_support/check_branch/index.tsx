/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BaseLayout from '@ui/layout/BaseLayout'
import type { NextPage } from 'next'
import { fetchCheckBranchByAi } from 'components/fectData/fetch_ai'
import { CheckBranchResponse } from '@_types/nft'

type ResultType = {
  potentiallySimilarBrands: string[]
  riskAssessment: string
  explanation: string
}


const NftCreate: NextPage = () => {
  const [brandName, setBrandName] = useState('')
  const [result, setResult] = useState<CheckBranchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submitFunction = async () => {
    if (!brandName.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await fetchCheckBranchByAi(brandName)
      setResult(res)
    } catch (err) {
      setError('Something went wrong while checking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseLayout>
      <div className="pt-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Introduction */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-blue-700">AI Brand Checker</h1>
            <p className="text-gray-700 text-lg">
              This AI tool helps you search and check if your brand name already exists on the
              internet. Just enter the name you want to check (max 100 characters), and we&apos;ll give
              you a risk assessment.
            </p>
          </div>

          {/* Right: Input */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter brand name"
                maxLength={100}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
              <Button onClick={submitFunction} disabled={loading}>
                {loading ? 'Checking...' : 'Send'}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>

        {/* Bottom: Result */}
        {result && (
          <div className="mt-10 bg-white p-6 rounded-xl shadow-md space-y-4 border">
            <h2 className="text-xl font-semibold text-gray-800">Analysis Result</h2>

            <div>
              <h3 className="font-medium text-gray-600">Potentially Similar Brands:</h3>
              <ul className="list-disc list-inside text-gray-800">
                {result.potentiallySimilarBrands.map((brand, idx) => (
                  <li key={idx}>{brand}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-600">Risk Assessment:</h3>
              <p className="text-yellow-700 font-semibold">{result.riskAssessment}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-600">Explanation:</h3>
              <p className="text-gray-700">{result.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  )
}

export default NftCreate
