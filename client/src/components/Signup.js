import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as yup from "yup";

function Signup({setUser}) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  function handleLogin(){
    navigate('/login')
  }

  const formSchema = yup.object().shape({
    email: yup.string().email('Must be a valid email').required('Email is required'),
    username: yup.string().required('Username is required').max(10, "Username can't exceed 10 characters"),
    password: yup.string().required('Password is required'),
      // .min(5, 'Your password is too short.')
      // .matches(/[a-zA-Z]/, 'Password can only contain letters.'),
    passwordconfirm: yup
      .string()
      .required("Must confirm password.")
      .oneOf([yup.ref('password'), null], 'Passwords must match')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: '',
      passwordconfirm: ''
    },
    validationSchema: formSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      fetch('/signupdb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      .then(res => {
        if (res.ok) {
          res.json().then(user => {
            setUser(user)
            navigate('/')
          })
        } else {
          res.json().then(error => {
            if (error.error.includes('users_email_key')) {
              formik.setErrors({ email: 'An account with this email already exists' });
            }
            if (error.error.includes('users_username_key')) {
              formik.setErrors({ username: 'Username is taken' });
            }                  
            setError(error.message)
          })
        };
      })
    }
  })

  return (
    <div className='signup-login'>
      <h2>Create an Account</h2>
      <form onSubmit={formik.handleSubmit}>
        <label >Username</label><br></br>
        <input type="text"  name="username" value={formik.values.username} onChange={formik.handleChange} /><br></br>
        <h3 style={{color:'#4FC9C2'}}> {formik.errors.username}</h3>
        <label >Email</label><br></br>
        <input type="text"  name="email" value={formik.values.email} onChange={formik.handleChange} /><br></br>
        <h3 style={{color:'#4FC9C2'}}> {formik.errors.email}</h3>
        <label >Password</label><br></br>
        <input type="password"  name="password" value={formik.values.password} onChange={formik.handleChange} /><br></br>
        <h3 style={{color:'#4FC9C2'}}> {formik.errors.password}</h3>
        <label >Confirm Password</label><br></br>
        <input type="password"  name="passwordconfirm" value={formik.values.passwordconfirm} onChange={formik.handleChange} /><br></br>
        <h3 style={{color:'#4FC9C2'}}> {formik.errors.passwordconfirm}</h3>
        <input type='submit' value='Create Account!' />
        {error&& <h3 style={{color:'#4FC9C2'}}> {error}</h3>}
      </form>
      <br/>
      {Object.keys(formik.errors).length>2?null:<><p>Already have an account?</p>
      <button className='loginsignupbtn' onClick={handleLogin}>Login Instead</button></>}
    </div>
  );
}

export default Signup;