import React, { useState } from "react";
import styles from "./Auth.module.css";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../features/userSlice";
import { auth, provider, storage } from "../FirebaseConfig";
//Firebase ver9 compliant
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Grid,
  Typography,
  makeStyles,
  Modal,
  IconButton,
  Box,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

function getModalStyle() {
  const top = 50;
  const left = 50;
  // モーダルを中央に表示する
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  image: {
    backgroundImage:
      "url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzR8fCVFMyU4MiVBQSVFMyU4MyU5NSVFMyU4MiVBMyVFMyU4MiVCOXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60)",
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  modal: {
    outline: "none",
    position: "absolute",
    width: 400,
    borderRadius: 10,
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10),
  },
}));

export const Auth: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  // このコンポーネントだけで使用するのでuseStateで定義している
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  // 初期値がnullで、Fileかnullのデータ型を受け取れるように指定
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // 登録情報変更の関数(forgat password)
  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
    //Firebase ver9の書き方
    await sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setOpenModal(false);
        setResetEmail("");
      })
      .catch((err) => {
        alert(err.message);
        setResetEmail("");
      });
  };

  // アバター画像登録のメソッド
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ※filesの後の！は、typescriptの記法で
    // nullまたはundefindではありませんと通知するためのもの
    // 空であるものに対して配列の番号を指定するとエラーになるためこの記述が必要
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0]);
      // 初期化
      e.target.value = "";
    }
  };

  const signInEmail = async () => {
    //Firebase ver9の書き方
    // サインイン
    // 下記メソッドでユーザー情報が登録されているか確認する
    await signInWithEmailAndPassword(auth, email, password);
  };

  // レジスター(登録)
  // つくられたユーザーのオブジェクトを返す
  const signUpEmail = async () => {
    //Firebase ver9 compliant
    const authUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // クラウド(storage)に保存された画像のurl
    let url = "";
    // avatarImageが存在する場合は、firestorageにデータを格納する
    if (avatarImage) {
      // ここからファイル名を生成する処理
      // 参考：https://chaika.hatenablog.com/entry/2022/01/30/083000
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      // 生成したい文字数
      const N = 16;
      // crypto.getRandomValues() メソッドは、暗号強度の強い乱数値を取得する。引数に与えた配列は、すべて乱数で埋められる。
      // Uint32Array→型付き配列。32ビットのうちN(16)使う
      // getRandomValuesでランダムな値を生成してくれる
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
      // JavaScript の文字列は配列のようにアクセスが可能
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + avatarImage.name;
      // ここまでファイル名を生成する処理

      //Firebase ver9の書き方
      // uploadBytesの第一引数で画像を格納する階層を指定する
      // 第2引数でデータの実体を明記する
      await uploadBytes(ref(storage, `avatars/${fileName}`), avatarImage);
      // url情報を変数に格納する
      url = await getDownloadURL(ref(storage, `avatars/${fileName}`));
    }
    if (authUser.user) {
      await updateProfile(authUser.user, {
        displayName: username,
        photoURL: url,
      });
    }

    // dispatchでstate変更
    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    );
  };

  // Googleアカウントサインイン
  const signInGoogle = async () => {
    await signInWithPopup(auth, provider).catch((err) => alert(err.message));
  };

  return (
    // ※Create new account ?をクリックしたときにisLoginが反転する
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {isLogin ? "Login" : "Register"}
          </Typography>
          <form className={classes.form} noValidate>
            {!isLogin && (
              <>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value);
                  }}
                />
                <Box textAlign="center" className={styles.textCenter}>
                  <IconButton>
                    <label>
                      <AccountCircleIcon
                        fontSize="large"
                        className={
                          // avatarImageが存在する場合としない場合でスタイルを変える
                          avatarImage
                            ? styles.login_addIconLoaded
                            : styles.login_addIcon
                        }
                      />
                      <input
                        className={styles.login_hiddenIcon}
                        type="file"
                        onChange={onChangeImageHandler}
                      />
                    </label>
                  </IconButton>
                </Box>
              </>
            )}
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
            <Button
              disabled={
                isLogin
                // ログインする場合の入力条件
                  ? !email || password.length < 6
                  // 登録する場合の入力条件
                  : !username || !email || password.length < 6 || !avatarImage
              }
              // onClickでクリックした時の挙動を指定しているので
              // type=submitは削除する
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              startIcon={<EmailIcon />}
              onClick={
                isLogin
                // 以下でサインイン、サインアップするとuser.uidに値が入り、
                // App.tsxの条件式によりFeedコンポーネントに切り替わる。
                  ? async () => {
                      try {
                        await signInEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
                  : async () => {
                      try {
                        await signUpEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
              }
            >
              {isLogin ? "Login" : "Register"}
            </Button>

            {/* パスワードを忘れた場合 */}
            <Grid container>
              <Grid item xs>
                <span
                  className={styles.login_reset}
                  onClick={() => setOpenModal(true)}
                >
                  Forgot password?
                </span>
              </Grid>
              <Grid item>
                <span
                  className={styles.login_toggleMode}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Create new account ?" : "Back to login"}
                </span>
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<CameraIcon />}
              className={classes.submit}
              onClick={signInGoogle}
            >
              SignIn with Google
            </Button>
          </form>
          {/* モーダル */}
          {/* openがtrueであればmodalがひらく */}
          {/* onCloseはモーダル以外をクリックした時の挙動を設定する。 */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <div style={getModalStyle()} className={classes.modal}>
              <div className={styles.login_modal}>
                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="email"
                  name="email"
                  label="Reset E-mail"
                  value={resetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResetEmail(e.target.value);
                  }}
                />
                <IconButton onClick={sendResetEmail}>
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </Modal>
        </div>
      </Grid>
    </Grid>
  );
};
