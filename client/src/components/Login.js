import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import {useSelector, useDispatch} from 'react-redux';
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
    <div className="play-area">
      <div className="signup-login">
        <h2>Login</h2>
        {error && <h3 style={{ color: "#4FC9C2" }}> {error}</h3>}
        <form onSubmit={formik.handleSubmit}>
          <label>Username</label>
          <br></br>
          <input
            type="text"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
          />
          <br></br>
          <br></br>
          <label>Password</label>
          <br></br>
          <input
            type="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
          <br></br>
          <br></br>
          <input type="submit" value="Log In!" />
        </form>
        <br />
        <br />
        <br />
        <p>New to Stop at the Top?</p>
        <button className="loginsignupbtn" onClick={handleSignup}>
          Signup Instead
        </button>
      </div>
    </div>
  );
}

export default Login;
