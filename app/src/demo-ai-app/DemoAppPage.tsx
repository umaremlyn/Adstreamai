import {
  generateGptResponse,
  deleteCampaign,
  updateCampaign,
  createCampaign,
  useQuery,
  getAllCampaignsByUser,
} from 'wasp/client/operations';

import { useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { TiDelete } from 'react-icons/ti';
import { JsonValue } from 'type-fest';
import { cn } from '../client/cn';

//
// Types
//
export type Campaign = {
  id: string;
  productName: string;
  targetAudience: string;
  tone: string;
  status: 'draft' | 'active' | 'paused';
  adCopies?: AdCopy[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type AdCopy = {
  id: string;
  headline: string;
  body: string;
  cta: string;
  variations: JsonValue;
};

export type GptPayload = {
  productName: string; // combined brand + short description
  targetAudience: string;
  tone: string;
  hours: string;
};

export type GeneratedSchedule = {
  id: string;
  description: string;
  adCopies?: AdCopy[];
};

//
// Main Dashboard Component
//
export default function AdStreamDashboard() {
  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            AdStream AI
          </h2>
          <p className="text-xl text-gray-600 dark:text-white mt-2">AI-Powered Campaign Creator</p>
        </div>
        <div className="my-8 border rounded-3xl border-gray-900/10 dark:border-gray-100/10 bg-gray-50 p-8">
          <div className="max-w-3xl mx-auto">
            <CampaignForm />
          </div>
        </div>
      </div>
    </div>
  );
}

//
// CampaignForm Component
//
function CampaignForm() {
  // Fields
  const [brandName, setBrandName] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  // For optional image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // AI generation
  const [response, setResponse] = useState<GeneratedSchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // We can keep these if your backend still expects them:
  const [targetAudience, setTargetAudience] = useState('18-35 year olds');
  const [tone, setTone] = useState('professional');

  const { data: campaigns, isLoading } = useQuery(getAllCampaignsByUser);

  // Combine brandName + shortDescription for AI
  const combineProductName = () => {
    if (!brandName && !shortDescription) return '';
    if (!brandName) return shortDescription;
    if (!shortDescription) return brandName;
    return `${brandName} - ${shortDescription}`;
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const productName = combineProductName();
      const payload: GptPayload = { productName, targetAudience, tone, hours: '24' };
      const res = await generateGptResponse(payload);
      setResponse(res as unknown as GeneratedSchedule);
    } catch (err: any) {
      alert(err.message || 'Error generating campaign');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrySample = () => {
    setBrandName('Leepha Quality');
    setShortDescription('Leather Shoes, Bags, and other Leather Products');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleRegenerate = () => {
    // Re-run handleGenerate or your own logic
    handleGenerate();
  };

  const handleCopy = () => {
    if (response?.description) {
      navigator.clipboard.writeText(response.description);
      alert('Copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    // Add your "favorite" logic here
    alert('Marked as favorite (placeholder)!');
  };

  // If you still want to store the campaign in your DB as a draft
  const handleCreateDraft = async () => {
    try {
      const productName = combineProductName();
      await createCampaign({ productName, targetAudience, tone });
      alert('Draft campaign created!');
    } catch (err: any) {
      alert(err.message || 'Error creating campaign draft');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Input Fields */}
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700">
            Brand, Business, or Company Name
          </label>
          <input
            type="text"
            placeholder="e.g. Lebegha Quality"
            className="w-full rounded-md border p-2"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">
            Describe what you are Advertising
          </label>
          <input
            type="text"
            placeholder="e.g. Leather Shoes, Bags, and other Leather Products"
            className="w-full rounded-md border p-2"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleGenerate}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            disabled={isGenerating || (!brandName && !shortDescription)}
          >
            {isGenerating ? <CgSpinner className="animate-spin" /> : 'Generate'}
          </button>
          <button
            type="button"
            onClick={handleTrySample}
            className="bg-gray-200 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Try Sample
          </button>
        </div>
      </div>

      {/* Campaign Description Section */}
      <div className="bg-white rounded-md p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Campaign Description</h3>
          <span className="text-sm text-gray-500">0/1000 words</span>
        </div>
        <div className="mt-3">
          {/* If you want a text area to show the generated description */}
          <textarea
            className="w-full border rounded-md p-2"
            rows={4}
            placeholder="AI-Generated Campaign Description"
            value={response?.description || ''}
            onChange={(e) =>
              setResponse((prev) =>
                prev ? { ...prev, description: e.target.value } : null
              )
            }
          />
        </div>
        {/* Upload Image & Action Buttons */}
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Upload Image (optional)
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Product/Brand preview"
                className="mt-2 max-h-32 rounded-md"
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto sm:items-center">
            <button
              type="button"
              onClick={handleRegenerate}
              className="bg-blue-100 py-2 px-4 rounded-md hover:bg-blue-200"
              disabled={!response}
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="bg-blue-100 py-2 px-4 rounded-md hover:bg-blue-200"
              disabled={!response}
            >
              Copy
            </button>
            <button
              type="button"
              onClick={handleFavorite}
              className="bg-blue-100 py-2 px-4 rounded-md hover:bg-blue-200"
              disabled={!response}
            >
              Favorite
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Ideas Section */}
      <div className="bg-white rounded-md p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Suggested Ideas</h3>
        <p className="text-sm text-gray-600">
          (AI-generated ideas or variations can appear here)
        </p>
      </div>

      {/* (Optional) Button to create a campaign draft in DB */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleCreateDraft}
          className="bg-green-100 py-2 px-4 rounded-md hover:bg-green-200"
          disabled={!brandName && !shortDescription}
        >
          Save Draft
        </button>
      </div>

      {/* Display Existing Campaigns */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Campaigns</h2>
        {isLoading && <div>Loading Campaigns...</div>}
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign: Campaign) => (
            <CampaignItem key={campaign.id} campaign={campaign} />
          ))
        ) : (
          <div className="text-gray-600 text-center">
            No active campaigns - create one to get started
          </div>
        )}
      </div>
    </div>
  );
}

//
// Single Campaign Item
//
function CampaignItem({ campaign }: { campaign: Campaign }) {
  const handleStatusChange = async (newStatus: Campaign['status']) => {
    try {
      await updateCampaign({ id: campaign.id, status: newStatus });
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to update status'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCampaign({ id: campaign.id });
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to delete campaign'));
    }
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg border p-4 w-full mb-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-gray-800">{campaign.productName}</h3>
        <p className="text-sm text-gray-600">Status: {campaign.status}</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={campaign.status}
          onChange={(e) => handleStatusChange(e.target.value as Campaign['status'])}
          className="rounded-md border px-2 py-1"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
        <button onClick={handleDelete} className="text-red-600 hover:text-red-700">
          <TiDelete size="20" />
        </button>
      </div>
    </div>
  );
}
