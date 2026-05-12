import { useFormik } from "formik";
import { useState } from 'react';
import DesignViewport from './DesignViewport.js';
// import {useDispatch} from 'react-redux';

const TABLE_CODE_LENGTH = 4;

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

  const joinDisabled = formik.values.table.trim().length !== TABLE_CODE_LENGTH;

  return (
    <DesignViewport designWidth={810} designHeight={560}>
    <div className="play-area">
      <div className="card" id="card1"></div>
      <div className="card" id="card2"></div>
      <div className="card" id="card3"></div>
      <div className="card" id="card4"></div>
      <div className="card" id="card5"></div>
      <div className="card" id="card6"></div>
      <div className="home-hero">
        <h1 className='howyouwinthegame'>Stop at the Top!</h1>
        <p className="howyouwinthegame-tagline">
          The name of the game is how you win the game!
        </p>
      </div>
      <div className="create-join">
        <form className="create-join-form" onSubmit={formik.handleSubmit}>
          {/* <label>Join a Table</label> */}
          <button
            type="submit"
            name="create"
            value={Boolean(true)}
            className="bet-controls-place create-join__btn"
            onClick={formik.handleChange}
          >
            Create a New Table
          </button>
          <div className="create-join__join-section">
            <input
              type="text"
              name="table"
              className="create-join__code-input"
              placeholder="Enter Table Code Here"
              value={formik.values.table}
              onChange={formik.handleChange}
              maxLength={TABLE_CODE_LENGTH}
              autoCapitalize="characters"
              spellCheck="false"
            />
            <button
              type="submit"
              name="join"
              value={Boolean(true)}
              className="bet-controls-place create-join__btn"
              onClick={formik.handleChange}
              disabled={joinDisabled}
              title={
                joinDisabled
                  ? `Enter exactly ${TABLE_CODE_LENGTH} characters to join`
                  : undefined
              }
            >
              Enter Table Code to Join a Table
            </button>
          </div>
        </form><br/>
        {/* <button name="createtable">Create a New Table</button> */}
        <p>{error?error:""}</p>
      </div>
    </div>
    </DesignViewport>
  );
}

export default Home