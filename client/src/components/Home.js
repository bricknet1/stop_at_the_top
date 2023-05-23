import { useFormik } from "formik";
import { useState } from 'react';
// import {useDispatch} from 'react-redux';

function Home ({user, navigate, setMessages}){

  // const dispatch = useDispatch();

  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      table: "",
      join: false,
      create: false
    },
    onSubmit: (values) => {
      values.join = Boolean(values.join)
      values.create = Boolean(values.create)
      values.table = values.table.toUpperCase()
      console.log(values);
      fetch("/table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            console.log(data);
            setMessages(data.messages)
            navigate(`/table/${data.table}`);
          });
        } else {
          res.json().then((error) => {
            setError(error.error)
            formik.values.join=false
            formik.values.create=false
          });
        }
      });
    },
  });

  return (
    <div className="play-area">
      <div className="card" id="card1"></div>
      <div className="card" id="card2"></div>
      <div className="card" id="card3"></div>
      <div className="card" id="card4"></div>
      <div className="card" id="card5"></div>
      <div className="card" id="card6"></div>
      <h1 className='howyouwinthegame'>Stop at the Top!</h1>
      <div className="create-join">
        <form onSubmit={formik.handleSubmit}>
          {/* <label>Join a Table</label> */}
          <br></br>
          <input
            type="text"
            name="table"
            placeholder="Enter Table Code Here"
            value={formik.values.table}
            onChange={formik.handleChange}
          />
          <button type="submit" name='join' value={Boolean(true)} onClick={formik.handleChange}>Join a Room</button>
          <button type="submit" name='create' value={Boolean(true)} onClick={formik.handleChange}>Create a new table</button>
        </form><br/>
        {/* <button name="createtable">Create a New Table</button> */}
        <p>{error?error:""}</p>
      </div>
    </div>
  );
}

export default Home