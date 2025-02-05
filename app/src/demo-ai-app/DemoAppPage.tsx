import {
  generateGptResponse,
  deleteCampaign,
  updateCampaign,
  createCampaign,
  useQuery,
  getAllCampaignsByUser,
} from 'wasp/client/operations';

import { useState } from 'react';

type GeneratedSchedule = {
  id: string;
  productName: string;
  targetAudience: string;
  tone: string;
  status: 'draft' | 'active' | 'paused';
  adCopies?: AdCopy[];
};

type GptPayload = {
  productName: string;
  targetAudience: string;
  tone: string;
  hours: string;
};
import { CgSpinner } from 'react-icons/cg';
import { JsonValue } from 'type-fest';
import { TiDelete } from 'react-icons/ti';
import { cn } from '../client/cn';

type Campaign = {
  id: string;
  productName: string;
  targetAudience: string;
  tone: string;
  status: 'draft' | 'active' | 'paused';
  adCopies?: AdCopy[]; // Marked optional to prevent errors
};

type AdCopy = {
  id: string;
  headline: string;
  body: string;
  cta: string;
  variations: JsonValue;
};

export default function AdStreamDashboard() {
  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            <span className='text-blue-600'>AdStream</span> AI Campaign Manager
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
          Generate and optimize AI-powered marketing campaigns in minutes. Enter your product details and let our AI create high-performing ads!
        </p>

        <div className='my-8 border rounded-3xl border-gray-900/10 dark:border-gray-100/10'>
          <div className='sm:w-[90%] md:w-[70%] lg:w-[50%] py-10 px-6 mx-auto my-8 space-y-10'>
            <CampaignForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignForm(): JSX.Element {
  const [productName, setProductName] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('18-35 year olds');
  const [tone, setTone] = useState<string>('professional');
  const [response, setResponse] = useState<GeneratedSchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const { data: campaigns, isLoading } = useQuery(getAllCampaignsByUser);

  const handleSubmit = async () => {
    try {
      await createCampaign({ productName, targetAudience, tone });
      setProductName('');
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Something went wrong'));
    }
  };

  const handleGenerateCampaign = async () => {
      const payload: GptPayload = { productName, targetAudience, tone, hours: '24' };
      try {
        setIsGenerating(true);
        const response = await generateGptResponse(payload) as unknown as GeneratedSchedule;
        setResponse(response || null);
      } catch (err: any) {
        alert('Error: ' + (err.message || 'Something went wrong'));
      } finally {
        setIsGenerating(false);
      }
    };

  return (
    <div className='flex flex-col justify-center gap-10'>
      <div className='flex flex-col gap-3'>
        <input
          type='text'
          className='text-sm text-gray-600 w-full rounded-md border bg-[#f5f0ff] shadow-md'
          placeholder='Product/Service Name'
          value={productName}
          onChange={(e) => setProductName(e.currentTarget.value)}
        />

        <div className='flex gap-4'>
          <select
            className='w-full text-sm text-gray-600 rounded-md border bg-[#f5f0ff] shadow-md'
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          >
            <option value='18-35 year olds'>18-35 Year Olds</option>
            <option value='business professionals'>Business Professionals</option>
            <option value='parents'>Parents</option>
            <option value='students'>Students</option>
          </select>

          <select
            className='w-full text-sm text-gray-600 rounded-md border bg-[#f5f0ff] shadow-md'
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value='professional'>Professional</option>
            <option value='friendly'>Friendly</option>
            <option value='casual'>Casual</option>
            <option value='persuasive'>Persuasive</option>
          </select>
        </div>

        <button type='button' onClick={handleSubmit} disabled={!productName} className='bg-blue-50 shadow-md py-2 px-4 rounded-md'>
          Create Campaign Draft
        </button>
      </div>

      <div className='space-y-10 col-span-full'>
        {isLoading && <div>Loading Campaigns...</div>}
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign: Campaign) => <CampaignItem key={campaign.id} campaign={campaign} />)
        ) : (
          <div className='text-gray-600 text-center'>No active campaigns - create one to get started</div>
        )}
      </div>

      <button type='button' disabled={isGenerating || !productName} onClick={handleGenerateCampaign} className='bg-blue-50 shadow-md py-2 px-4 rounded-md'>
        {isGenerating ? <CgSpinner className='animate-spin' /> : 'Generate Full Campaign'}
      </button>

      {response?.adCopies && (
        <div className='flex flex-col gap-4 p-4 bg-blue-50 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900'>AI-Generated Campaign</h3>
          {response.adCopies.map((adCopy) => (
            <AdCopyPreview key={adCopy.id} adCopy={adCopy} />
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className='flex items-center justify-between bg-white rounded-lg border p-4 w-full'>
      <h3 className='font-semibold text-lg text-gray-800'>{campaign.productName}</h3>
      <select value={campaign.status} onChange={(e) => handleStatusChange(e.target.value as Campaign['status'])} className='rounded-md border px-2 py-1'>
        <option value='draft'>Draft</option>
        <option value='active'>Active</option>
        <option value='paused'>Paused</option>
      </select>
      <button onClick={handleDelete} className='text-red-600 hover:text-red-700'>
        <TiDelete size='20' />
      </button>
    </div>
  );
}

function AdCopyPreview({ adCopy }: { adCopy: AdCopy }) {
  const [selectedVariation, setSelectedVariation] = useState(0);

  return (
    <div className='bg-white p-4 rounded-lg border border-gray-200'>
      <div className='flex flex-col gap-3'>
        <h4 className='font-medium text-gray-800'>{adCopy.headline}</h4>
        <p className='text-gray-600'>{adCopy.body}</p>
        <div className='flex items-center gap-2'>
          <button className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
            {adCopy.cta}
          </button>
          
          <select 
            className='text-sm rounded-md border border-gray-200 px-2 py-1'
            value={selectedVariation}
            onChange={(e) => setSelectedVariation(Number(e.target.value))}
          >
            {Array.isArray(adCopy.variations) && adCopy.variations.map((_, index) => (
              <option key={index} value={index}>
                Variation {index + 1}
              </option>
            ))}
          </select>
        </div>
        {Array.isArray(adCopy.variations) && adCopy.variations[selectedVariation] && (
          <p className='text-sm text-gray-500 italic'>
            {adCopy.variations[selectedVariation] as string}
          </p>
        )}
      </div>
    </div>
  );
}