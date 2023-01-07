import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';

export const store = configureStore({
  reducer: {
    // createSliceで生成したuserSliceを
    // 上記のimportで、userReducerという名称に変更している。
    // userは定義した名前
    user: userReducer,
  },
});
// stateの状態を確認するためにgetStateを利用することができる
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
