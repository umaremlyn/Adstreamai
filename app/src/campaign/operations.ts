// ./src/ext-src/campaign/operations.ts
import { prisma } from 'wasp/server'
import type { Campaign, AdCopy } from 'wasp/entities'
import type { GetAllCampaignsByUser } from 'wasp/server/operations'
import type { User } from 'wasp/entities'

export const createCampaign = async (args: {
  productName: string
  targetAudience: string
  tone: string
}, context: any) => {
  const { user } = context
  return prisma.campaign.create({
    data: {
      productName: args.productName,
      targetAudience: args.targetAudience,
      tone: args.tone,
      status: 'draft',
      user: { connect: { id: user.id } }
    }
  })
}

export const getAllCampaignsByUser: GetAllCampaignsByUser<void, Campaign[]> = async (
  _args,
  context
) => {
  if (!context.user) {
    throw new Error('User must be authenticated')
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
  })
}

export const updateCampaign = async (args: {
  id: string
  status?: 'draft' | 'active' | 'paused'
  productName?: string
  targetAudience?: string
  tone?: string
}, context: any) => {
  const { user } = context
  return prisma.campaign.update({
    where: { id: args.id, userId: user.id },
    data: args
  })
}

export const deleteCampaign = async (args: { id: string }, context: any) => {
  const { user } = context
  return prisma.campaign.delete({
    where: { id: args.id, userId: user.id }
  })
}

// Removed duplicate declaration of getAllCampaignsByUser

export const getGptResponses = async (args: {}, context: any) => {
  const { user } = context
  return prisma.gptResponse.findMany({
    where: { user: { id: user.id } }
  })
}

export const createGptResponse = async (args: {
  response: string
}, context: any) => {
  const { user } = context
  return prisma.gptResponse.create({
    data: {
      content: 'default content', // replace 'default content' with the appropriate content
      response: args.response,
      user: { connect: { id: user.id } }
    }
  })
}

export const updateGptResponse = async (args: {
  id: string
  response?: string
}, context: any) => {
  const { user } = context
  return prisma.gptResponse.update({
    where: { id: args.id, userId: user.id },
    data: args
  })
}

export const deleteGptResponse = async (args: { id: string }, context: any) => {
  const { user } = context
  return prisma.gptResponse.delete({
    where: { id: args.id, userId: user.id }
  })
}

export const getPaginatedUsers = async (args: {
  first: number
  skip: number
}, context: any) => {
  return prisma.user.findMany({
    take: args.first,
    skip: args.skip
  })
}

export const getCustomerPortalUrl = async (args: {}, context: any) => {
  const { user } = context
  return prisma.user.findUnique({
    where: { id: user.id }
  }).then(user => {
    return user?.paymentProcessorUserId
  })
}

export const getAllFilesByUser = async (args: {}, context: any) => {
  const { user } = context
  return prisma.file.findMany({
    where: { user: { id: user.id } }
  })
}

export const getDownloadFileSignedURL = async (args: {
  fileId: string
}, context: any) => {
  const { user } = context
  return prisma.file.findUnique({
    where: { id: args.fileId }
  }).then(file => {
    return file?.uploadUrl
  })
}

export const updateCurrentUser = async (args: {
  name?: string
  email?: string
}, context: any) => {
  const { user } = context
  return prisma.user.update({
    where: { id: user.id },
    data: args
  })
}

export const updateUserById = async (args: {
  id: string
  name?: string
  email?: string
}, context: any) => {
  return prisma.user.update({
    where: { id: args.id },
    data: args
  })
}

export const generateCheckoutSession = async (args: {
  priceId: string
}, context: any) => {
  const { user } = context
  // Stripe implementation goes here
  return {
    sessionId: 'stripe-session-id'
  }
}

export const createFile = async (args: {
  name: string
  url: string
}, context: any) => {
  const { user } = context
  return prisma.file.create({
    data: {
      name: args.name,
      url: args.url,
      type: 'fileType', // replace 'fileType' with the appropriate type
      key: 'fileKey', // replace 'fileKey' with the appropriate key
      uploadUrl: 'uploadUrl', // replace 'uploadUrl' with the appropriate URL
      user: { connect: { id: user.id } }
    }
  })
}

export const generateGptResponse = async (args: {
  productName: string
  targetAudience: string
  tone: string
}, context: any) => {
  const { user } = context
  // AI implementation goes here
  return {
    adCopies: [
      {
        headline: "AI-generated headline",
        body: "Compelling ad copy...",
        cta: "Learn More",
        variations: ["Variation 1", "Variation 2"]
      }
    ]
  }
}