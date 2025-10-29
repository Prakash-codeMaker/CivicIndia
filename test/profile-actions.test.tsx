import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProfilePage from '../pages/ProfilePage';
import { RouterContext } from '../routing/RouterContext';

// Mock Clerk useUser
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ user: { id: 'user1', fullName: 'Test User', imageUrl: '' } })
}));

// Mock reportStore
vi.mock('../lib/reportStore', () => ({
  getReportsForUser: async () => [],
  subscribe: () => () => {},
}));

describe('Profile actions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves display name to localStorage', async () => {
    render(
      <RouterContext.Provider value={{ navigate: (p: string) => {} }}>
        <ProfilePage />
      </RouterContext.Provider>
    );
    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Name' } });
    const save = screen.getByText('Save');
    fireEvent.click(save);
    expect(localStorage.getItem('profile:displayName')).toBe('New Name');
  });
});
