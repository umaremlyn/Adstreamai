import type { NavigationItem } from '../client/components/NavBar/NavBar';
import { routes } from 'wasp/client/router';
import { DocsUrl, BlogUrl } from '../shared/common';
import daBoiAvatar from '../client/static/da-boi.webp';
import avatarPlaceholder from '../client/static/avatar-placeholder.webp';

export const landingPageNavigationItems: NavigationItem[] = [
  { name: 'Features', to: '#features' },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  { name: 'Documentation', to: DocsUrl },
  { name: 'Blog', to: BlogUrl },
];
export const features = [
  {
    name: "AI-Powered Campaigns",
    description: "Leverage AI to create and manage marketing campaigns effortlessly.",
    icon: "🤖",
    href: "/ai-campaigns",
  },
  {
    name: "Real-Time Analytics",
    description: "Monitor your campaign performance with real-time dashboards.",
    icon: "📊",
    href: "/analytics",
  },
  {
    name: 'Multi-Platform Support',
    description: 'Launch campaigns across multiple platforms effortlessly.',
    icon: "🔗",
    href: DocsUrl,
  },
  {
    name: "User-Friendly Interface",
    description: "Navigate easily with our intuitive design.",
    icon: "🎨",
    href: DocsUrl,
  },
];

export const testimonials = [
  {
    name: 'Mahir Maina',
    role: 'Marketing Manager, Main Land Corp',
    avatarSrc: daBoiAvatar,
    socialUrl: 'https://twitter.com/umaremlyn04',
    quote: "AdStream AI transformed how we create ad campaigns. It's a game changer!.",
  },
  {
    name: 'Mr. Foobar',
    role: 'Founder @ Cool Starpets',
    avatarSrc: avatarPlaceholder,
    socialUrl: '',
    quote: 'Our ROI improved significantly thanks to AdStream AI’s insights.',
  },
  {
    name: 'Jamilah Smith',
    role: 'CTO @ Lighthouse',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote: 'This is a game changer!',
  },
];

export const faqs = [
  {
    id: 1,
    question: "What is AdStream AI?",
    answer: "AdStream AI is an AI-powered tool to create, optimize, and manage marketing campaigns across multiple platforms.",
    href: 'https://en.wikipedia.org/wiki/42_(number)',
  },
  {
    id: 2,
    question: "How much does it cost?",
    answer: "We offer flexible pricing plans starting from $27/month. Contact us for enterprise pricing.",
    href: 'https://en.wikipedia.org/wiki/42_',
  },
  {
    id: 2,
    question: "Can I try it for free?",
    answer: "Yes, we offer a 14-day free trial for all new users.",
    href: 'https://',
  },
];
export const footerNavigation = {
  app: [
    { name: 'Documentation', href: DocsUrl },
    { name: 'Blog', href: BlogUrl },
  ],
  company: [
    { name: 'About', href: 'https://Leencotech.dev' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms of Service', href: '#' },
  ],
};
