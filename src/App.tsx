import React, { useEffect } from "react";
import styles from "./App.module.css";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Feed } from "./components/Feed";
import { Auth } from "./components/Auth";

export const App: React.FC = () => {
  // userSliceのstateにアクセスする
  // useSelectorを利用することでpropsが必要なくなる。
  const user = useSelector(selectUser);
  // userSliceのlogin,logoutにActionをdispatchする
  const dispatch = useDispatch();


  useEffect(() => {
    // onAuthStateChangedはfirebaseで用意されている。
    // firebaseのユーザーに変化があったときに呼び出される関数
    // 引数のauthUserには、変化後のユーザー情報が入る
    // authはFirebaseConfig.tsに記述されている
    // ユーザが既に認証済みならばtrueを返す
    const unSub = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        );
      } else {
        dispatch(logout());
      }
    });
    // クリーンアップ関数
    // useEffectの中にreturnを書くことでアンマウント時のstateの更新を制御してくれる。
    return () => {
      unSub();
    };
  }, [dispatch]);



  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
      {/* <div className="App"></div> */}
    </>
  );
};
