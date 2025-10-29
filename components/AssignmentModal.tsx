import React, { useState } from 'react';
import { Report } from '../types/report';

interface AssignmentModalProps {
  report: Report;
  onClose: () => void;
  onAssign: (reportId: string, department: string, assignedTo: string, priority: string, dueDate: string) => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ report, onClose, onAssign }) => {
  const [department, setDepartment] = useState(report.department || '');
  const [assignedTo, setAssignedTo] = useState(report.assignedTo || '');
  const [priority, setPriority] = useState(report.priority || 'Medium');
  const [dueDate, setDueDate] = useState(report.dueDate ? new Date(report.dueDate).toISOString().split('T')[0] : '');

  // Mock field workers by department
  const fieldWorkersByDepartment: Record<string, string[]> = {
    'Water': ['Rajesh Kumar', 'Priya Singh', 'Amit Patel'],
    'Electricity': ['Neha Sharma', 'Vikram Malhotra', 'Deepak Verma'],
    'Roads': ['Ananya Gupta', 'Suresh Reddy', 'Kiran Joshi'],
    'Sanitation': ['Rahul Mehta', 'Sunita Rao', 'Manoj Tiwari'],
    'Public Safety': ['Divya Kapoor', 'Sanjay Mishra', 'Pooja Desai']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(report.id, department, assignedTo, priority, dueDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-1/2 max-w-2xl">
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold">Assign Report #{report.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select 
                className="w-full p-2 border rounded"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setAssignedTo(''); // Reset assigned person when department changes
                }}
                required
              >
                <option value="">Select Department</option>
                <option value="Water">Water</option>
                <option value="Electricity">Electricity</option>
                <option value="Roads">Roads</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Public Safety">Public Safety</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Field Worker</label>
              <select 
                className="w-full p-2 border rounded"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
                disabled={!department}
              >
                <option value="">Select Field Worker</option>
                {department && fieldWorkersByDepartment[department]?.map(worker => (
                  <option key={worker} value={worker}>{worker}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select 
                className="w-full p-2 border rounded"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Assign Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;