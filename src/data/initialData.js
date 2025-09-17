// Initial data for database migration and seeding
// This data is used by dataMigration.js to populate the database

const Risk = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  NOTSET: 'notset',
};

export const initNodes = [
  {
    id: '1',
    type: 'custom',
    data: { 
      type: 'Opportunity',
      name: 'Enhance Customer Experience',
      description: 'Drive satisfaction and loyalty by leveraging comprehensive data insights to deliver personalized experiences and support, ensuring each interaction resonates with customers on a deeper level and strengthens their connection to the brand.',
      potential: 72,
      totalContribution: 45,
      risk: Risk.MEDIUM, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-05-01',
      updatedby: 'Marius Försch',
      updatedat: '2024-06-12'
    },
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    type: 'custom',
    data: {
      type: 'Product', 
      name: 'Customer Engagement Platform',
      description: 'Empower businesses to foster meaningful interactions and support through tailored messaging, proactive engagement strategies, and personalized assistance, ultimately enhancing customer satisfaction and loyalty.',
      potential: 88,
      totalContribution: 45,
      risk: Risk.LOW, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-05-01',
      updatedby: 'Marius Försch',
      updatedat: '2024-06-12'
    },
    position: { x: -350, y: 450 },
  },
  {
    id: '3',
    type: 'custom',
    data: { 
      type: 'Product', 
      name: 'Personalized Recommendation System',
      description: 'Enhance user satisfaction and retention by providing highly relevant product recommendations based on individual preferences, past behavior, and demographic information, delivering a more personalized and engaging shopping experience.',
      potential: 66,
      totalContribution: 78,
      risk: Risk.MEDIUM, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-05-01',
      updatedby: 'Marius Försch',
      updatedat: '2024-06-12'
    },
    position: { x: 350, y: 450 },
  },
  {
    id: '4',
    type: 'custom',
    data: { 
      type: 'Data Asset', 
      name: 'Interaction History',
      description: 'Track and analyze customer engagement patterns across various touchpoints to optimize communication strategies, improve response times, and enhance overall customer satisfaction.',
      potential: 88,
      totalContribution: 98,
      risk: Risk.MEDIUM, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-05-01',
      updatedby: '',
      updatedat: ''
    },
    position: { x: -240, y: 720 },
  },
  {
    id: '5',
    type: 'custom',
    data: { 
      type: 'Data Asset', 
      name: 'Demographic Data',
      description: 'Gain valuable insights into customer demographics, such as age, gender, location, and income level, to tailor marketing campaigns, promotions, and product offerings to specific audience segments.',
      potential: 59,
      totalContribution: 87,
      risk: Risk.LOW, 
      successPotential: 92,
      createdby: 'Marcus Schwimmer',
      createdat: '2024-08-12',
      updatedby: '',
      updatedat: ''
    },
    position: { x: -245, y: 1000 },
  },
  {
    id: '6',
    type: 'custom',
    data: { 
      type: 'Data Source', 
      name: 'User Profile Data',
      description: 'Gain valuable insights into customer demographics, such as age, gender, location, and income level, to tailor marketing campaigns, promotions, and product offerings to specific audience segments.',
      potential: 32,
      totalContribution: 69,
      risk: Risk.LOW, 
      successPotential: 92,
      createdby: 'Alicia Vikander',
      createdat: '2024-06-22',
      updatedby: '',
      updatedat: ''
    },
    position: { x: -450, y: 1350 },
  },
  {
    id: '7',
    type: 'custom',
    data: { 
      type: 'Data Source', 
      name: 'User Transaction Logs',
      description: 'Gain valuable insights into customer demographics, such as age, gender, location, and income level, to tailor marketing campaigns, promotions, and product offerings to specific audience segments.',
      potential: 76,
      totalContribution: 42,
      risk: Risk.LOW, 
      successPotential: 92,
      createdby: 'Henry Cavill',
      createdat: '2024-05-01',
      updatedby: 'Genny Zöd',
      updatedat: '2024-07-05'
    },
    position: { x: 80, y: 1350 },
  },
  {
    id: '8',
    type: 'custom',
    data: { 
      type: 'Data Asset', 
      name: 'Platform Inventory',
      description: 'Gain valuable insights into customer demographics, such as age, gender, location, and income level, to tailor marketing campaigns, promotions, and product offerings to specific audience segments.',
      potential: 34,
      totalContribution: 56,
      risk: Risk.HIGH, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-06-12',
      updatedby: 'Marius Försch',
      updatedat: '2024-06-12'
    },
    position: { x: 510, y: 850 },
  },
];

export const initEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom' },
  { id: 'e1-3', source: '1', target: '3', type: 'custom' },
  { id: 'e1-4', source: '2', target: '4', type: 'custom' },
  { id: 'e1-5', source: '4', target: '5', type: 'custom' },
  { id: 'e1-6', source: '5', target: '6', type: 'custom' },
  { id: 'e1-7', source: '5', target: '7', type: 'custom' },
  { id: 'e1-8', source: '3', target: '8', type: 'custom' },
];
