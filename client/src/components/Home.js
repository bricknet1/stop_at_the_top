import { useFormik } from "formik";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import DesignViewport, {
  APP_VIEWPORT_DESIGN_HEIGHT,
  APP_VIEWPORT_DESIGN_WIDTH,
} from "./DesignViewport.js";
import ChatColumn from "./ChatColumn.js";
import { setUser } from "../actions";
import { MAX_USERNAME_LENGTH, STARTING_CHIPS } from "../constants.js";

const TABLE_CODE_LENGTH = 4;

function Home({ navigate, setMessages }) {
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(setUser({ username: "", chips: 0 }));
    const stored = sessionStorage.getItem("tableJoinError");
    if (stored) {
      setError(stored);
      sessionStorage.removeItem("tableJoinError");
    }
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      username: "",
      table: "",
      join: false,
      create: false,
    },
    onSubmit: (values) => {
      const username = values.username.trim();
      if (!username) {
        setError("Enter a username to play.");
        return;
      }
      if (username.length > MAX_USERNAME_LENGTH) {
        setError(`Username can't exceed ${MAX_USERNAME_LENGTH} characters.`);
        return;
      }

      const payload = {
        username,
        table: values.table.toUpperCase(),
        join: Boolean(values.join),
        create: Boolean(values.create),
      };

      fetch("/table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            dispatch(setUser({ username, chips: STARTING_CHIPS }));
            setMessages(data.messages);
            navigate(`/table/${data.table}`);
          });
        } else {
          res.json().then((body) => {
            setError(body.error || "Could not join table.");
            formik.setFieldValue("join", false);
            formik.setFieldValue("create", false);
          });
        }
      });
    },
  });

  const joinDisabled =
    formik.values.table.trim().length !== TABLE_CODE_LENGTH ||
    !formik.values.username.trim();

  const createDisabled = !formik.values.username.trim();

  const handleCreateTable = () => {
    formik
      .setValues({ ...formik.values, create: true, join: false }, false)
      .then(() => formik.submitForm());
  };

  return (
    <DesignViewport
      designWidth={APP_VIEWPORT_DESIGN_WIDTH}
      designHeight={APP_VIEWPORT_DESIGN_HEIGHT}
    >
      <div className="play-area home-lobby">
        <div className="card" id="card1"></div>
        <div className="card" id="card2"></div>
        <div className="card" id="card3"></div>
        <div className="card" id="card4"></div>
        <div className="card" id="card5"></div>
        <div className="card" id="card6"></div>
        <div className="home-lobby__panel">
          <div className="home-hero home-lobby__hero">
            <h1 className="howyouwinthegame">Stop at the Top!</h1>
            <p className="howyouwinthegame-tagline">
              The name of the game is how you win the game!
            </p>
          </div>
          <form className="home-lobby-form" onSubmit={formik.handleSubmit}>
            <input
              type="text"
              name="username"
              className="create-join__code-input home-lobby-form__input"
              placeholder="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              maxLength={MAX_USERNAME_LENGTH}
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              className="bet-controls-place home-lobby-form__btn home-lobby-form__btn--create"
              onClick={handleCreateTable}
              disabled={createDisabled}
              title={createDisabled ? "Enter a username first" : undefined}
            >
              Create Table
            </button>
            <fieldset className="home-lobby-form__join-group">
              <legend className="home-lobby-form__join-legend">
                Join an existing table
              </legend>
              <div className="home-lobby-form__join-row">
                <input
                  type="text"
                  name="table"
                  className="create-join__code-input home-lobby-form__input home-lobby-form__input--code"
                  placeholder="Code"
                  aria-label="Table code"
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
                  className="bet-controls-place home-lobby-form__btn home-lobby-form__btn--join"
                  onClick={formik.handleChange}
                  disabled={joinDisabled}
                  title={
                    joinDisabled
                      ? `Enter a username and a ${TABLE_CODE_LENGTH}-letter table code`
                      : undefined
                  }
                >
                  Join Table
                </button>
              </div>
            </fieldset>
            {error ? (
              <p className="home-lobby-form__error" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </div>
      <ChatColumn disabled />
    </DesignViewport>
  );
}

export default Home;
