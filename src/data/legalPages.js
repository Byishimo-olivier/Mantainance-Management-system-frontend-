export const legalDocuments = {
  cookieSettings: {
    title: 'Cookie Settings',
    updatedAt: 'April 24, 2026',
    intro: 'This page explains how FixNest uses cookies and similar technologies to keep the site secure, improve performance, and personalize the experience.',
    sections: [
      {
        heading: 'Essential Cookies',
        paragraphs: [
          'Essential cookies help core site functions work correctly, including login sessions, security checks, navigation state, and page preferences.',
          'Without these cookies, core workflows such as authentication and protected-page access may not function properly.',
        ],
      },
      {
        heading: 'Performance Cookies',
        paragraphs: [
          'Performance cookies help us understand how visitors use public pages so we can improve site speed, layout, and content quality.',
          'These cookies are used in aggregate form and are not intended to identify individual visitors.',
        ],
      },
      {
        heading: 'Preference Controls',
        paragraphs: [
          'Where applicable, browser settings can be used to block or remove cookies. Some features may behave differently if cookies are disabled.',
          'You can also contact FixNest support if you need help understanding which cookies apply to your experience.',
        ],
      },
    ],
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    updatedAt: 'April 24, 2026',
    intro: 'FixNest respects privacy and handles personal information with care. This summary explains what information we collect, how we use it, and how we protect it.',
    sections: [
      {
        heading: 'Information We Collect',
        paragraphs: [
          'We may collect account details, company details, contact information, support messages, and operational data required to provide the platform.',
          'We also collect technical information such as browser type, device type, and usage patterns for security and service improvement.',
        ],
      },
      {
        heading: 'How We Use Information',
        paragraphs: [
          'We use information to provide the service, secure accounts, process support requests, improve functionality, and communicate service updates.',
          'We do not sell personal information. Access is limited to authorized staff and providers who support platform delivery.',
        ],
      },
      {
        heading: 'Data Protection',
        paragraphs: [
          'FixNest uses reasonable administrative and technical safeguards to protect customer and visitor data.',
          'If you have privacy questions or need help with a request related to your data, contact the FixNest team through the support channels listed in the footer.',
        ],
      },
    ],
  },
  termsOfUse: {
    title: 'Terms of Use',
    updatedAt: 'April 24, 2026',
    intro: 'These terms describe the basic rules for using FixNest websites, tools, and services. By using the service, you agree to act responsibly and lawfully.',
    sections: [
      {
        heading: 'Use of the Service',
        paragraphs: [
          'Users are responsible for maintaining the confidentiality of their accounts and for ensuring that information submitted to the platform is accurate.',
          'The service may not be used for unlawful, abusive, fraudulent, or harmful activity.',
        ],
      },
      {
        heading: 'Customer Responsibilities',
        paragraphs: [
          'Customers are responsible for user access, internal approval processes, and the content they upload or manage through the platform.',
          'Organizations should ensure their teams use the service in line with internal policies and applicable legal requirements.',
        ],
      },
      {
        heading: 'Service Changes',
        paragraphs: [
          'FixNest may improve, update, or change parts of the service over time to support reliability, security, and product development.',
          'Continued use of the service after updates means the revised terms apply going forward.',
        ],
      },
    ],
  },
};

export const sitemapSections = [
  {
    title: 'Public Pages',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Subscribe', to: '/subscribe' },
      { label: 'Resources Hub', to: '/resources' },
      { label: 'Learning Center', to: '/resource/learning-center' },
    ],
  },
  {
    title: 'Products',
    links: [
      { label: 'CMMS', to: '/product/cmms' },
      { label: 'Safety', to: '/product/safety' },
      { label: 'Fleet', to: '/product/fleet' },
      { label: 'Nova', to: '/product/nova' },
      { label: 'Intelligence', to: '/product/intelligence' },
    ],
  },
  {
    title: 'Capabilities',
    links: [
      { label: 'Work Orders', to: '/feature/work-orders' },
      { label: 'Preventive Maintenance', to: '/feature/preventive-maintenance' },
      { label: 'Asset Management', to: '/feature/asset-management' },
      { label: 'Analytics & Reporting', to: '/feature/analytics-reporting' },
      { label: 'Request Management', to: '/feature/request-management' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Cookie Settings', to: '/cookie-settings' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Use', to: '/terms-of-use' },
      { label: 'Sitemap', to: '/sitemap' },
    ],
  },
];
