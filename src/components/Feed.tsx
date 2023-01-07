import { StylesContext } from "@material-ui/styles";
import styles from "./Feed.module.css";
import React, { useState, useEffect } from "react";
import { db } from "../FirebaseConfig";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { TweetInput } from "./TweetInput";
import {Post} from "./Post"

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      avatar: "",
      id: "",
      image: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);
  useEffect(() => {
    //Firebase ver9 compliant (modular)
    // orderBy箇所の記述は、timestampで降順に並び替える(新しい投稿が上に来る)
    // descは降順で大きいもの順。ascは昇順で小さいもの順。
    // queryはfirebaseに送るリクエスト
    // queryを実行すると、Reference or Snapshotをレスポンスとして返す
    // ※ Reference→　オブジェクトが存在する「現在の場所」を示す
    // ※ Snapshot→　オブジェクト（のデータ）のこと
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    // onSnapshotでデータベース(store)に変化があるたびにリアルタイムに実行する
    const unSub = onSnapshot(q, (snapshot) => {
      setPosts(
        // snapshot.docsで、postsの中にあるドキュメントをすべて取得
        snapshot.docs.map((doc) => ({
          avatar: doc.data().avatar,
          id: doc.id,
          image: doc.data().image,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
          username: doc.data().username,
        }))
      );
    });
    // クリーンアップ関数
    return () => {
      unSub();
    };
  }, []);
  return (
    <div className={styles.feed}>
      <TweetInput />
      {/* TweetInputコンポーネントでデータベースのpostsに登録したツイートを、以下のPostコンポーネントで表示させる。 */}
      {/* Postコンポーネントをmapで囲っているので、ツイートの数だけPostコンポーネントが表示される */}
      {/* postsの配列0番目に要素がある場合はidを判定する。さらにidが存在する場合だけ
      posts.map((post) =>を実行する */}
      {posts[0]?.id && (
        <>
          {posts.map((post) => (
            <Post
            // 以下をPostコンポーネントにpropsとして渡す
              key={post.id}
              postId={post.id}
              avatar={post.avatar}
              image={post.image}
              text={post.text}
              timestamp={post.timestamp}
              username={post.username}
            />
          ))}
        </>
      )}
    </div>
  );
};
