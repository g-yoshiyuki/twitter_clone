import React, { useState } from "react";
import styles from "./TweetInput.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { storage, db, auth } from "../FirebaseConfig";
import { Avatar, Button, IconButton } from "@material-ui/core";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
//Firebase ver9の書き方
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// firebaseで提供しているデータベース
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const TweetInput: React.FC = () => {
  const user = useSelector(selectUser);
  // 初期値がnullで、Fileかnullのデータ型を受け取れるように指定
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");
  // Authコンポーネントで使用したものと同じ
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ※filesの後の！は、typescriptの記法で
    // nullまたはundefindではありませんと通知するためのもの
    // 空であるものに対して配列の番号を指定するとエラーになるためこの記述が必要
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      // 初期化
      e.target.value = "";
    }
  };
  // Tweetボタンをクリックした時の挙動
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    // 送信時の画面リフレッシュを防ぐ
    e.preventDefault();
    // tweetImageが設定されていれば、、
    if (tweetImage) {
      // ファイル名の生成
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      //Firebase ver9 compliant
      // uploadBytesResumableはfirebase_v8で使用していた.put(追加)の代用
      // storageに、指定したパスで画像をアップロードする
      const uploadTweetImg = uploadBytesResumable(
        ref(storage, `images/${fileName}`),
        tweetImage
      );
      //Firebase ver9 compliant
      // .onメソッドは、storageのstateに変化があったときに呼び出される
      uploadTweetImg.on(
        "state_changed",
        // アップロードの進捗(特に機能を実装しない)
        () => {},
        // エラーのハンドリング
        (err) => {
          alert(err.message);
        },
        // 正常終了した場合
        async () => {
          //Firebase ver9 compliant
          // getDownloadURLでアップロードした画像のurlを取得
          await getDownloadURL(ref(storage, `images/${fileName}`)).then(
            async (url) => {
              // collectionはデータベースの構造。第2引数で名前をつけることができる。
              // addDocでドキュメントを追加することができる
              // データベース(store)のpostsコレクションにオブジェクトを追加する
              addDoc(collection(db, "posts"), {
                avatar: user.photoUrl,
                image: url,
                text: tweetMsg,
                timestamp: serverTimestamp(),
                username: user.displayName,
              });
            }
          );
        }
      );
      // ※ 画像をアップロードして、Tweetボタンを押した時の内部の動き
      // 画像をstorageに追加してパスを取得し、
      // データベース(store)に投稿のオブジェクトをaddDocする
      // その時、useSelectorで取得したuserSliceのstateからuser情報を取得して代入する
    } else {
      addDoc(collection(db, "posts"), {
        avatar: user.photoUrl,
        image: "",
        text: tweetMsg,
        timestamp: serverTimestamp(),
        username: user.displayName,
      });
      // ※画像をアップロードせずに、Tweetボタンを押した時の内部の動き
      // 投稿オブジェクトのimageプロティを空にしてaddDocする
      // その時、useSelectorで取得したuserSliceのstateからuser情報を取得して代入する
    }
    // 初期化
    setTweetImage(null);
    setTweetMsg("");
  };

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          {/* アバター画像。クリックするとログアウト */}
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          {/* ツイートインプット */}
          <input
            className={styles.tweet_input}
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={tweetMsg}
            onChange={(e) => setTweetMsg(e.target.value)}
          />
          {/* 画像アップロードボタンの設定 */}
          <IconButton>
            <label>
              <AddAPhotoIcon
                className={
                  // 設定されている場合とされていない場合でスタイルを変える
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                className={styles.tweet_hiddenIcon}
                type="file"
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          // tweetMsgが空であれば、非活性
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};
