import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DesignViewport, {
  APP_VIEWPORT_DESIGN_HEIGHT,
  APP_VIEWPORT_DESIGN_WIDTH,
} from "./DesignViewport.js";
import ChatColumn from "./ChatColumn.js";
import { useFormik } from "formik";
import {useDispatch} from 'react-redux';
import {setUser} from '../actions';


function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  
  function handleSignup() {
    navigate("/signup");
  }

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: (values) => {
      fetch("/logindb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((res) => {
        if (res.ok) {
          console.log(res);
          res.json().then((user) => {
            dispatch(setUser(user));
            navigate("/");
          });
        } else {
          res.json().then((error) => setError(error.message));
        }
      });
    },
  });


  return (
    <DesignViewport
      designWidth={APP_VIEWPORT_DESIGN_WIDTH}
      designHeight={APP_VIEWPORT_DESIGN_HEIGHT}
    >
      <div className="play-area">
        <div className="card" id="card1"></div>
        <div className="card" id="card2"></div>
        <div className="card" id="card3"></div>
        <div className="card" id="card4"></div>
        <div className="card" id="card5"></div>
        <div className="card" id="card6"></div>
        <div className="home-hero">
          <h1 className="howyouwinthegame">Stop at the Top!</h1>
          <p className="howyouwinthegame-tagline">
            The name of the game is how you win the game!
          </p>
        </div>
        <div className="create-join login-panel">
          <form
            className="create-join-form login-form"
            onSubmit={formik.handleSubmit}
          >
            <div className="login-form__row">
              <div className="login-form__column login-form__column--primary">
                {error ? (
                  <p className="login-form__error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="create-join__join-section login-form__fields">
                  <input
                    type="text"
                    name="username"
                    className="create-join__code-input"
                    placeholder="Username"
                    autoComplete="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                  />
                  <input
                    type="password"
                    name="password"
                    className="create-join__code-input"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                  />
                  <button
                    type="submit"
                    className="bet-controls-place create-join__btn"
                  >
                    Log in
                  </button>
                </div>
              </div>
              <div className="login-form__column login-form__column--secondary">
                <p className="login-form__hint">New to Stop at the Top?</p>
                <button
                  type="button"
                  className="bet-controls-place create-join__btn"
                  onClick={handleSignup}
                >
                  Sign up instead
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <ChatColumn disabled />
    </DesignViewport>
  );
}

export default Login;
