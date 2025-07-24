/* eslint-disable @next/next/no-img-element */
import { BaseLayout } from '@ui'
import type { NextPage } from 'next'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { fetchLogoBranchByAi } from 'components/fectData/fetch_ai'

const GenerateLogo: NextPage = () => {
  const [logoType, setLogoType] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('')
  const [accentColors, setAccentColors] = useState('')
  const [suggestedSymbols, setSuggestedSymbols] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setImageUrl(null)
    try {
      const res = await fetchLogoBranchByAi(
        logoType,
        companyName,
        primaryColor,
        accentColors,
        suggestedSymbols
      )
      if (res?.url) {
        setImageUrl(res.url)
      } else {
        setError('No image URL returned.')
      }
    } catch (err) {
      setError('Something went wrong while generating. Please try again.')
    } finally {
      setLoading(false)
    }
  }

const handleDownload = async () => {
  if (!imageUrl) return;

  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${companyName.trim().replace(/\s+/g, "_") || 'logo'}.png`;
    document.body.appendChild(link); // cần append mới click được trong vài trình duyệt
    link.click();
    document.body.removeChild(link); // cleanup
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download failed:', err);
    alert('Failed to download image.');
  }
};


  return (
    <BaseLayout>
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        {/* PHẦN 1 - Tiêu đề */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Generate Logo by AI</h1>
        </div>

        {/* PHẦN 2 - Mô tả tính năng */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-gray-600 text-lg">
            Create unique and professional logos for your brand with just a few inputs.
            Our AI model generates high-quality logos based on your preferences, colors, and ideas — instantly.
          </p>
        </div>

        {/* PHẦN 3 - Form */}
        <div className="bg-white shadow-xl rounded-2xl p-8 grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Logo Type</label>
            <Input
              placeholder="e.g., minimalist, vintage..."
              value={logoType}
              onChange={e => setLogoType(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <Input
              placeholder="Your company name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
          </div>

          <label className="text-sm font-medium text-gray-700">Primary Color</label>
          <Input
            placeholder="Enter colors (e.g., blue, red, orange)"
            value={primaryColor}
            onChange={e => setPrimaryColor(e.target.value)}
          />


          <label className="text-sm font-medium text-gray-700">Accent Colors</label>
          <Input
            placeholder="Enter colors (e.g., yellow, green, purple)"
            value={accentColors}
            onChange={e => setAccentColors(e.target.value)}
          />


          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Suggested Symbols</label>
            <Input
              placeholder="e.g., car, tree, crown..."
              value={suggestedSymbols}
              onChange={e => setSuggestedSymbols(e.target.value)}
            />
          </div>

          <Button className="mt-4" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Logo'}
          </Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {imageUrl && (
            <div className="text-center mt-6">
              <img
                src={imageUrl}
                alt="Generated Logo"
                className="mx-auto max-w-xs h-auto rounded-md shadow-md"
              />
              {/* <Button className="mt-4" onClick={handleDownload}>
                Download PNG
              </Button> */}
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  )
}

export default GenerateLogo
