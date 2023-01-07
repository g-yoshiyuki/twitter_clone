import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

interface USER {
  displayName: string;
  photoUrl: string;
}
// userSliceではユーザー情報に関するstateを管理している
export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: { uid: "", photoUrl: "", displayName: "" },
  },
  // stateを生成するメソッド
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    // 初期化するために空にする
    logout: (state) => {
      state.user = { uid: "", photoUrl: "", displayName: "" };
    },
    // payloadはおそらくユーザーが入力した値
    updateUserProfile: (state, action: PayloadAction<USER>) => {
      state.user.displayName = action.payload.displayName;
      state.user.photoUrl = action.payload.photoUrl;
    },
  },
});

// export const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     user: { uid: "", photoUrl: "", displayName: "" },
//   },
//   reducers: {
//     login: (state, action) => {
//       state.user = action.payload;
//     },
//     logout: (state) => {
//       state.user = { uid: "", photoUrl: "", displayName: "" };
//     },
//     updateUserProfile: (state, action: PayloadAction<USER>) => {
//       state.user.displayName = action.payload.displayName;
//       state.user.photoUrl = action.payload.photoUrl;
//     },
//   },
// });

export const { login, logout,updateUserProfile } = userSlice.actions;

// useSelectorでstateにアクセスされたときに、
// userのstateを返す関数
// ※state.user.userの、
// 1つ目のuserは、store.tsで定義したreducer名と紐付いている
// 2つ目は、userSliceのinitialStateであるuserオブジェクトと紐付いている
// つまり、store.tsのuserリデューサーのuserオブジェクトstateと紐付けるということ
export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;
// ※RootStateとは
// 各sliceが持っているredux stateをひとまとめにしたもののデータ型
