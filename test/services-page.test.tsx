// @ts-nocheck
import React from 'react';
// @ts-ignore: testing deps may not be installed in this environment
import { render, screen, fireEvent } from '@testing-library/react';
// @ts-ignore: vitest may not be installed; vi will exist when running tests locally after npm install
import { vi } from 'vitest';
import ServicesPage from '../pages/ServicesPage';
import { RouterContext } from '../routing/RouterContext';

describe('Services Page', () => {
  it('navigates when clicking a service card', () => {
    const navigate = vi.fn();
    render(
      <RouterContext.Provider value={{ navigate }}>
        <ServicesPage />
      </RouterContext.Provider>
    );

    const buttons = screen.getAllByRole('button');
    // click the first 'Learn More' button
    fireEvent.click(buttons[0]);
    expect(navigate).toHaveBeenCalled();
  });
});
