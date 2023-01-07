import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";
import { db } from "../FirebaseConfig";
//Firebase ver9 compliant
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";

// propsのデータ型
// propsはデータ型を指定する必要がある
interface PROPS {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

// コメントのアバター画像を小さく表示するスタイル
const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

export const Post: React.FC<PROPS> = (props) => {
  const classes = useStyles();
  const user = useSelector(selectUser);
  const [comment, setComment] = useState("");
  // interfaceで指定したCOMMENTを配列データ型に指定する
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      username: "",
      timestamp: null,
    },
  ]);
  // コメントの表示・非表示を切り替えるstate
  const [openComments, setOpenComments] = useState(false);

  useEffect(() => {
    //Firebase ver9 compliant (modular)
    const q = query(
      // データベースのpostsコレクションの中の対象投稿IDのオブジェクトにcommentsを作成する
      collection(db, "posts", props.postId, "comments"),
      orderBy("timestamp", "desc")
    );
    const unSub = onSnapshot(q, (snapshot) => {
      setComments(
        // 投稿一つ一つを格納する
        snapshot.docs.map((doc) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          text: doc.data().text,
          username: doc.data().username,
          timestamp: doc.data().timestamp,
        }))
      );
    });
    // クリーンアップ関数
    return () => {
      unSub();
    };
    // 投稿が変更されたときに実行
  }, [props.postId]);

  // コメントを投稿したときに実行される関数
  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //Firebase ver9 compliant
     // データベースのpostsコレクションの中の対象投稿IDのオブジェクトにcommentsを作成する
    addDoc(collection(db, "posts", props.postId, "comments"), {
      avatar: user.photoUrl,
      text: comment,
      timestamp: serverTimestamp(),
      username: user.displayName,
    });
    setComment("");
  };

  // ツイート表示。
  // このJSXをFeed.tsxでmapでまわしているため投稿の数だけ以下のJSXが表示される。
  // 以下で使用しているpropsはTweetInputコンポーネントで登録したツイートの情報
  return (
    <div className={styles.post}>
      {/* アバター画像 */}
      <div className={styles.post_avatar}>
        <Avatar src={props.avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          {/* ユーザーネイムと投稿時間 */}
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{props.username}</span>
              <span className={styles.post_headerTime}>
                {/* toDateでデータ型に変換 */}
                {new Date(props.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          {/* ツイート内容 */}
          <div className={styles.post_tweet}>
            <p>{props.text}</p>
          </div>
        </div>
        {/* 画像を添付してツイートしている場合は画像を表示 */}
        {props.image && (
          <div className={styles.post_tweetImage}>
            <img src={props.image} alt="tweet" />
          </div>
        )}
        {/* コメントの表示・非表示を切り替えるアイコン */}
        <MessageIcon
          className={styles.post_commentIcon}
          onClick={() => setOpenComments(!openComments)}
        />
        {/* openCommentsがtureの時だけコメントエリアを表示する */}
        {openComments && (
          <>
          {/* コメントの出力 */}
            {comments.map((com) => (
              <div key={com.id} className={styles.post_comment}>
                <Avatar src={com.avatar} className={classes.small} />

                <span className={styles.post_commentUser}>@{com.username}</span>
                <span className={styles.post_commentText}>{com.text} </span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

            {/* コメント作成エリア */}
            <form onSubmit={newComment}>
              <div className={styles.post_form}>
                <input
                  className={styles.post_input}
                  type="text"
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                <button
                  disabled={!comment}
                  className={
                    comment ? styles.post_button : styles.post_buttonDisable
                  }
                  type="submit"
                >
                  <SendIcon className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
// ※ツイートに対してcommentsがつくられ、クライアントが共有で使うので
// それぞれのユーザーのUIで変更がリアルタイムで反映される。
