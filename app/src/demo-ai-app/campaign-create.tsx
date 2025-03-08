import {
  generateGptResponse,
  deleteCampaign,
  updateCampaign,
  createCampaign,
  useQuery,
  getAllCampaignsByUser,
} from 'wasp/client/operations';
import { useState, useEffect } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { TiDelete } from 'react-icons/ti';
import { cn } from '../client/cn';

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
  variations: Record<string, any>;
};

export type GptPayload = {
  productName: string;
  targetAudience: string;
  tone: string;
  hours: string;
};

export default function AdStreamDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await useQuery(getAllCampaignsByUser);
        if (data) {
          setCampaigns(data);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AdStream AI</h1>
      <CampaignForm />
      <div className="mt-12">
        <h2 className="text-2xl mb-4">Your Campaigns</h2>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-12 w-32 rounded"></div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <p>No active campaigns - create one to get started</p>
        )}
      </div>
    </div>
  );
}

const CampaignForm = () => {
  const [brandName, setBrandName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [generatedCampaign, setGeneratedCampaign] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [targetAudience, setTargetAudience] = useState('18-35 year olds');
  const [tone, setTone] = useState('Professional');
  const [hours, setHours] = useState('24');

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const payload: GptPayload = {
        productName: `${brandName} - ${shortDescription}`,
        targetAudience,
        tone,
        hours,
      };
      const response = await generateGptResponse(payload);
      setGeneratedCampaign(response);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error generating campaign: ${error.message}`);
      } else {
        alert('Error generating campaign');
      }
    } finally {
      setGenerating(false);
    }
  };

  const saveDraft = async () => {
    try {
      const productName = combineProductName(brandName, shortDescription);
      await createCampaign({ productName, targetAudience, tone });
      alert('Draft campaign created!');
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error saving draft: ${error.message}`);
      } else {
        alert('Error saving draft');
      }
    }
  };
  
const handleCreateDraft = async () => {
  try {
    const productName = combineProductName(brandName, shortDescription);
    // Remove status from payload (server initializes it)
    await createCampaign({ productName, targetAudience, tone });
    alert('Draft campaign created!');
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error saving draft: ${error.message}`);
      } else {
        alert('Error saving draft');
      }
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded">
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Brand Name</label>
        <input
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Short Description</label>
        <input
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Target Audience</label>
        <select
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option>18-35 year olds</option>
          <option>36-55 year olds</option>
          <option>55+ year olds</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Tone</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option>Professional</option>
          <option>Casual</option>
          <option>Humorous</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Campaign Duration (hours)</label>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {generating ? <CgSpinner className="animate-spin" /> : 'Generate Campaign'}
      </button>
      {generatedCampaign && (
        <div className="mt-6 bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium mb-2">Generated Campaign</h3>
          <p className="mb-2 font-bold">Headline:</p>
          <p>{generatedCampaign.headline}</p>
          <p className="mb-2 font-bold mt-2">Body:</p>
          <p>{generatedCampaign.body}</p>
          <p className="mb-2 font-bold mt-2">CTA:</p>
          <p>{generatedCampaign.cta}</p>
          <button
            onClick={saveDraft}
            className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Save as Draft
          </button>
        </div>
      )}
    </div>
  );
};

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const [status, setStatus] = useState(campaign.status);
  const [deleting, setDeleting] = useState(false);

  const updateStatus = async (newStatus: Campaign['status']) => {
    try {
      await updateCampaign({ id: campaign.id, status: newStatus });
      setStatus(newStatus);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error updating status: ${error.message}`);
      } else {
        alert('Error updating status');
      }
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCampaign({ id: campaign.id });
      setDeleting(false);
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error deleting campaign: ${error.message}`);
      } else {
        alert('Error deleting campaign');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white shadow p-4 rounded">
      <h3 className="text-lg font-medium mb-2">{campaign.productName}</h3>
      <p>Status: {status}</p>
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value as Campaign['status'])}
        className="mt-2 border p-2 rounded w-full"
      >
        <option>Draft</option>
        <option>Active</option>
        <option>Paused</option>
      </select>
      <button
        onClick={handleDelete}
        className="mt-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
};

function combineProductName(brandName: string, shortDescription: string): string {
  return `${brandName} - ${shortDescription}`;
}
