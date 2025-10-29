import { Report } from '../types/report';

export const mockReports: Report[] = [
  {
    id: 'R-2023-001',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    status: 'assigned',
    priority: 'high',
    department: 'Public Works Department',
    location: 'Main Street, near City Hall',
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2023, 5, 16),
    dueDate: new Date(2023, 5, 20),
    assignedTo: 'John Worker',
    images: ['pothole1.jpg', 'pothole2.jpg'],
    comments: [
      {
        id: 'c1',
        text: 'This needs immediate attention',
        author: 'Traffic Department',
        timestamp: new Date(2023, 5, 15, 10, 30)
      }
    ],
    history: [
      {
        id: 'h1',
        action: 'Report Created',
        timestamp: new Date(2023, 5, 15, 9, 0),
        user: 'Citizen App'
      },
      {
        id: 'h2',
        action: 'Assigned to PWD',
        timestamp: new Date(2023, 5, 15, 11, 0),
        user: 'System'
      }
    ]
  },
  {
    id: 'R-2023-002',
    title: 'Streetlight not working',
    description: 'Streetlight at junction is not working for past 3 days',
    status: 'pending',
    priority: 'medium',
    department: 'Electricity Department',
    location: 'Junction of Park Road and Hill Avenue',
    createdAt: new Date(2023, 5, 14),
    updatedAt: new Date(2023, 5, 14),
    images: ['streetlight.jpg']
  },
  {
    id: 'R-2023-003',
    title: 'Garbage not collected',
    description: 'Garbage has not been collected for a week',
    status: 'resolved',
    priority: 'medium',
    department: 'Municipal Corporation',
    location: 'Green Park Colony',
    createdAt: new Date(2023, 5, 10),
    updatedAt: new Date(2023, 5, 13),
    assignedTo: 'Sanitation Team B',
    history: [
      {
        id: 'h1',
        action: 'Report Created',
        timestamp: new Date(2023, 5, 10, 8, 0),
        user: 'Citizen App'
      },
      {
        id: 'h2',
        action: 'Resolved',
        timestamp: new Date(2023, 5, 13, 14, 0),
        user: 'Sanitation Team B',
        details: 'Garbage collected and area cleaned'
      }
    ]
  },
  {
    id: 'R-2023-004',
    title: 'Water leakage from main pipe',
    description: 'Water leaking from main supply pipe causing water logging',
    status: 'in-progress',
    priority: 'critical',
    department: 'Water Department',
    location: 'Near Central Market',
    createdAt: new Date(2023, 5, 16),
    updatedAt: new Date(2023, 5, 16),
    dueDate: new Date(2023, 5, 17),
    assignedTo: 'Emergency Response Team',
    images: ['leak1.jpg', 'leak2.jpg', 'leak3.jpg']
  },
  {
    id: 'R-2023-005',
    title: 'Park maintenance required',
    description: 'Children\'s play area needs maintenance, some equipment is broken',
    status: 'pending',
    priority: 'low',
    department: 'Parks & Recreation',
    location: 'City Central Park',
    createdAt: new Date(2023, 5, 12),
    updatedAt: new Date(2023, 5, 12),
    images: ['park.jpg']
  }
];