import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Period = 'today' | 'week' | 'month' | 'year';
type GroupBy = 'day' | 'week' | 'month';

interface AdminState {
  period: Period;
  revenueChartGroupBy: GroupBy;
  sidebarCollapsed: boolean;
  notificationCount: number;
}

const initialState: AdminState = {
  period: 'month',
  revenueChartGroupBy: 'day',
  sidebarCollapsed: false,
  notificationCount: 0,
};

const slice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setPeriod: (state, action: PayloadAction<Period>) => {
      state.period = action.payload;
    },
    setRevenueChartGroupBy: (state, action: PayloadAction<GroupBy>) => {
      state.revenueChartGroupBy = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setNotificationCount: (state, action: PayloadAction<number>) => {
      state.notificationCount = action.payload;
    },
  },
});

export const { setPeriod, setRevenueChartGroupBy, toggleSidebar, setNotificationCount } = slice.actions;
export default slice.reducer;
