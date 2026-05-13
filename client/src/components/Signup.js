import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DesignViewport, {
  APP_VIEWPORT_DESIGN_HEIGHT,
  APP_VIEWPORT_DESIGN_WIDTH,
} from "./DesignViewport.js";
import ChatColumn from "./ChatColumn.js";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { setUser } from "../actions";

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  function handleLogin() {
    navigate("/login");
  }

  const formSchema = yup.object().shape({
    email: yup
      .string()
      .email("Must be a valid email")
      .required("Email is required"),
    username: yup
      .string()
      .required("Username is required")
      .max(10, "Username can't exceed 10 characters"),
    password: yup.string().required("Password is required"),
    passwordconfirm: yup
      .string()
      .required("Must confirm password.")
      .oneOf([yup.ref("password"), null], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
      passwordconfirm: "",
    },
    validationSchema: formSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      fetch("/signupdb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((res) => {
        if (res.ok) {
          res.json().then((user) => {
            dispatch(setUser(user));
            navigate("/");
          });
        } else {
          res.json().then((err) => {
            const fieldErrors = {};
            if (
              err.error.includes("users_email_key") ||
              err.error.includes("UNIQUE constraint failed: users.email")
            ) {
              fieldErrors.email = "An account with this email already exists";
            }
            if (
              err.error.includes("users_username_key") ||
              err.error.includes("UNIQUE constraint failed: users.username")
            ) {
              fieldErrors.username = "Username is taken";
            }
            if (Object.keys(fieldErrors).length > 0) {
              formik.setErrors(fieldErrors);
            }
            setError(err.message);
          });
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
            className="create-join-form login-form login-form--signup"
            onSubmit={formik.handleSubmit}
          >
            <div className="login-form__row">
              <div className="login-form__column login-form__column--primary">
                {error ? (
                  <p className="login-form__error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="signup-form__grid">
                  <div className="signup-form__column">
                    <div className="signup-form__field">
                      <input
                        type="text"
                        name="username"
                        className="create-join__code-input"
                        placeholder="Username"
                        autoComplete="username"
                        maxLength={10}
                        value={formik.values.username}
                        onChange={formik.handleChange}
                      />
                      {formik.errors.username ? (
                        <p className="login-form__error">
                          {formik.errors.username}
                        </p>
                      ) : null}
                    </div>
                    <div className="signup-form__field">
                      <input
                        type="email"
                        name="email"
                        className="create-join__code-input"
                        placeholder="Email"
                        autoComplete="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                      />
                      {formik.errors.email ? (
                        <p className="login-form__error">{formik.errors.email}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="signup-form__column">
                    <div className="signup-form__field">
                      <input
                        type="password"
                        name="password"
                        className="create-join__code-input"
                        placeholder="Password"
                        autoComplete="new-password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                      />
                      {formik.errors.password ? (
                        <p className="login-form__error">
                          {formik.errors.password}
                        </p>
                      ) : null}
                    </div>
                    <div className="signup-form__field">
                      <input
                        type="password"
                        name="passwordconfirm"
                        className="create-join__code-input"
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        value={formik.values.passwordconfirm}
                        onChange={formik.handleChange}
                      />
                      {formik.errors.passwordconfirm ? (
                        <p className="login-form__error">
                          {formik.errors.passwordconfirm}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bet-controls-place create-join__btn signup-form__submit"
                >
                  Create account
                </button>
              </div>
              <div className="login-form__column login-form__column--secondary">
                <p className="login-form__hint">Already have an account?</p>
                <button
                  type="button"
                  className="bet-controls-place create-join__btn"
                  onClick={handleLogin}
                >
                  Log in instead
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

export default Signup;
