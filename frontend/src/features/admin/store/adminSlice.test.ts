import { describe, it, expect } from 'vitest';
import adminReducer, { setPeriod, setRevenueChartGroupBy, toggleSidebar, setNotificationCount } from './adminSlice';

describe('adminSlice', () => {
  it('returns initial state', () => {
    const state = adminReducer(undefined, { type: 'unknown' });
    expect(state.period).toBe('month');
    expect(state.revenueChartGroupBy).toBe('day');
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.notificationCount).toBe(0);
  });

  describe('setPeriod', () => {
    it('changes period', () => {
      const state = adminReducer(undefined, setPeriod('week'));
      expect(state.period).toBe('week');
    });

    it('supports all period values', () => {
      const periods = ['today', 'week', 'month', 'year'] as const;
      periods.forEach(period => {
        const state = adminReducer(undefined, setPeriod(period));
        expect(state.period).toBe(period);
      });
    });
  });

  describe('setRevenueChartGroupBy', () => {
    it('changes group by', () => {
      const state = adminReducer(undefined, setRevenueChartGroupBy('month'));
      expect(state.revenueChartGroupBy).toBe('month');
    });
  });

  describe('toggleSidebar', () => {
    it('toggles from collapsed to expanded', () => {
      let state = adminReducer(undefined, toggleSidebar());
      expect(state.sidebarCollapsed).toBe(true);
      state = adminReducer(state, toggleSidebar());
      expect(state.sidebarCollapsed).toBe(false);
    });
  });

  describe('setNotificationCount', () => {
    it('sets count', () => {
      const state = adminReducer(undefined, setNotificationCount(5));
      expect(state.notificationCount).toBe(5);
    });

    it('can set to zero', () => {
      let state = adminReducer(undefined, setNotificationCount(5));
      state = adminReducer(state, setNotificationCount(0));
      expect(state.notificationCount).toBe(0);
    });
  });
});
