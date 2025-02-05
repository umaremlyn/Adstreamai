import type { GptResponse } from 'wasp/entities';
import type { Campaign, AdCopy } from 'wasp/entities';
import type {
  GenerateGptResponse,
  CreateCampaign,
  UpdateCampaign,
  DeleteCampaign,
  GetAllCampaignsByUser,
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import OpenAI from 'openai';

const openai = setupOpenAI();
function setupOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return new HttpError(500, 'OpenAI API key is not set');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

//#region Actions
type GptPayload = {
  productName: string;
  targetAudience: string;
  tone: string;
};

type GeneratedAdCopies = {
  adCopies: AdCopy[];
};

export const generateGptResponse: GenerateGptResponse<GptPayload, GeneratedAdCopies> = async (
  { productName, targetAudience, tone },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  try {
    // Check if OpenAI is initialized correctly
    if (openai instanceof Error) {
      throw openai;
    }

    // Validate user credits/subscription
    const hasCredits = context.user.credits > 0;
    const hasValidSubscription =
      !!context.user.subscriptionStatus &&
      context.user.subscriptionStatus !== 'deleted' &&
      context.user.subscriptionStatus !== 'past_due';
    const canUserContinue = hasCredits || hasValidSubscription;

    if (!canUserContinue) {
      throw new HttpError(402, 'User has not paid or is out of credits');
    } else {
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });
    }

    // Generate ad copies using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // Use GPT-4 for better marketing content
      messages: [
        {
          role: 'system',
          content: `You are an expert marketing copywriter. Generate compelling ad copies based on the product details provided. 
          Each campaign should include:
          - A catchy headline
          - Engaging body text
          - A strong call-to-action
          - 3 variations for A/B testing`,
        },
        {
          role: 'user',
          content: `Create marketing content for:
          Product: ${productName}
          Target Audience: ${targetAudience}
          Tone: ${tone}`,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'generateAdCopies',
            description: 'Generates marketing ad copies',
            parameters: {
              type: 'object',
              properties: {
                adCopies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      headline: { type: 'string' },
                      body: { type: 'string' },
                      cta: { type: 'string' },
                      variations: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: {
          name: 'generateAdCopies',
        },
      },
      temperature: 0.7,
    });

    const gptArgs = completion?.choices[0]?.message?.tool_calls?.[0]?.function.arguments;

    if (!gptArgs) {
      throw new HttpError(500, 'Bad response from OpenAI');
    }

    return JSON.parse(gptArgs);
  } catch (error: any) {
    // Refund credits if error occurred
    if (!context.user.subscriptionStatus && error?.statusCode != 402) {
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            increment: 1,
          },
        },
      });
    }
    console.error(error);
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Internal server error';
    throw new HttpError(statusCode, errorMessage);
  }
};

export const createCampaign: CreateCampaign<Omit<Campaign, 'id' | 'status'>, Campaign> = async (
  { productName, targetAudience, tone },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.Campaign.create({
    data: {
      productName,
      targetAudience,
      tone,
      status: 'draft',
      user: { connect: { id: context.user.id } },
    },
  });
};

export const updateCampaign: UpdateCampaign<Partial<Campaign>, Campaign> = async (
  { id, ...updateData },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.Campaign.update({
    where: { id },
    data: updateData,
  });
};

export const deleteCampaign: DeleteCampaign<Pick<Campaign, 'id'>, Campaign> = async (
  { id },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.Campaign.delete({
    where: { id },
  });
};
//#endregion

//#region Queries
export const getAllCampaignsByUser: GetAllCampaignsByUser<void, Campaign[]> = async (
  _args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.Campaign.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
    include: {
      adCopies: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
//#endregion