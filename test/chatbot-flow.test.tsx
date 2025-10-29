import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AiIssueBot from '../components/AiIssueBot';

// Mock RouterContext navigate
vi.mock('../routing/RouterContext', () => ({
  useRouter: () => ({ navigate: (path: string) => { /* noop */ } })
}));

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ user: { id: 'user1', fullName: 'Test User' } })
}));

vi.mock('../lib/reportStore', () => ({
  getReportsForUser: async () => [],
  getReportById: async () => null,
  subscribe: () => () => {},
}));

vi.mock('../lib/serviceStore', () => ({
  getApplicationsForUser: async () => [],
}));

describe('Chatbot flow', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('creates a draft and stores it in sessionStorage', async () => {
    render(<AiIssueBot />);
    const textarea = screen.getByPlaceholderText(/Ask about report status/i);
    fireEvent.change(textarea, { target: { value: 'Help me file a report about pothole near City Park' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      const draft = sessionStorage.getItem('report:draft');
      expect(draft).toBeTruthy();
      const parsed = JSON.parse(draft as string);
      expect(parsed.description).toContain('pothole');
      expect(parsed.location).toContain('City Park');
    });
  });
});
