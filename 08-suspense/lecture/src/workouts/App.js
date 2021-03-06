import { createElement } from "glamor/react"; // eslint-disable-line
/* @jsx createElement */
import "./index.css";
import Spinner from "react-svg-spinner";
import ManageScroll from "../components/ManageScroll";
import React, { Placeholder, lazy } from "react";
import { Router, Link, redirectTo } from "@reach/router";
import Component from "@reach/component-component";
import {
  fetchWorkouts,
  fetchWorkout,
  fetchExercises,
  fetchNextWorkout,
  WorkoutsResource,
  WorkoutResource,
  ExercisesResource,
  NextWorkoutResource,
  network
} from "./utils";
import { cache } from "../cache";

const Competitions = React.lazy(() =>
  import("./Competitions")
);

// Chantastic said this is okay to do.
console.warn = () => {};

let qpatience = [5000, 5000, 1, 1, 2000, 2000, 2000];
let search = window.location.search.substr(1);
let patience = qpatience[search] || 10000;

const link = {
  display: "inline-block",
  width: "200px",
  height: "200px",
  lineHeight: "200px",
  background: "#fff",
  textAlign: "center",
  margin: "20px",
  ":hover": {
    background: "#ddd"
  },
  position: "relative"
};

const LoadingLink = ({ children, ...props }) => (
  <Component initialState={{ isLoading: false }}>
    {({ state, setState }) => (
      <Link
        {...props}
        onClick={() => {
          setState({ isLoading: true });
        }}
      >
        {children}
        <div
          css={{
            transition: "opacity 200ms ease",
            transitionDelay: "500ms",
            position: "absolute",
            left: 0,
            top: 25,
            right: 0,
            bottom: 0,
            opacity: state.isLoading ? "1" : "0"
          }}
        >
          <LoadingSpinner />
        </div>
      </Link>
    )}
  </Component>
);

const Home = () => (
  <div>
    <h1 css={{ textAlign: "center" }}>Workout App!</h1>
    <div
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Link to="/workouts" css={link}>
        Workouts
      </Link>
      <Link to="/competitions" css={link}>
        Competitions
      </Link>
    </div>
  </div>
);

const Workouts = () => {
  const workouts = WorkoutsResource.read(cache, 10);
  return (
    <div>
      <Link to="..">Home</Link>
      <h1>Workouts</h1>
      {workouts.map(workout => (
        <Link key={workout.id} to={workout.id} css={link}>
          {workout.name}
        </Link>
      ))}
    </div>
  );
};

const Exercises = ({ workoutId }) => {
  const exercises = ExercisesResource.read(
    cache,
    workoutId
  );
  return (
    <ul>
      {exercises.map((exercise, i) => (
        <li key={i}>{exercise}</li>
      ))}
    </ul>
  );
};

class Workout extends React.Component {
  state = {
    workout: null,
    exercises: null,
    nextWorkout: null
  };

  componentDidMount() {
    this.fetch();
  }

  fetch() {
    const { workoutId } = this.props;
    fetchWorkout(workoutId).then(workout => {
      this.setState({ workout });
    });
    fetchExercises(workoutId).then(exercises => {
      this.setState({ exercises });
    });
    fetchNextWorkout(workoutId).then(nextWorkout => {
      console.log(nextWorkout);
      this.setState({ nextWorkout });
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.workoutId !== this.props.workoutId) {
      this.setState({
        exercises: null,
        workout: null,
        nextWorkout: null
      });
      this.fetch();
    }
  }

  render() {
    const { workoutId } = this.props;
    const { workout, exercises, nextWorkout } = this.state;

    WorkoutResource.read(cache, workoutId);

    return workout ? (
      <div>
        <Link to="../..">Home</Link> /{" "}
        <Link to="..">Workouts</Link>
        <h1>{workout.name}</h1>
        {exercises ? (
          <Exercises exercises={exercises} />
        ) : (
          <Spinner />
        )}
        {workout.completed &&
          (nextWorkout ? (
            <NextWorkout nextWorkout={nextWorkout} />
          ) : (
            <h2>
              Up Next! <Spinner size="0.75em" />
            </h2>
          ))}
      </div>
    ) : (
      <Spinner size="100" />
    );
  }
}

// class Workout extends React.Component {
//   render() {
//     const { workoutId } = this.props;

//     const workout = WorkoutResource.read(cache, workoutId);

//     return (
//       <div>
//         <Link to="../..">Home</Link> /{" "}
//         <Link to="..">Workouts</Link>
//         <h1>{workout.name}</h1>
//         <Placeholder
//           delayMs={patience}
//           fallback={<Spinner size="150" />}
//         >
//           <Exercises workoutId={workoutId} />
//         </Placeholder>
//         {workout.completed && (
//           <Placeholder
//             delayMs={patience}
//             fallback={
//               <h2>
//                 Up Next! <Spinner size="0.75em" />
//               </h2>
//             }
//           >
//             <NextWorkout workoutId={workoutId} />
//           </Placeholder>
//         )}
//       </div>
//     );
//   }
// }

const NextWorkout = ({ workoutId }) => {
  const nextWorkout = NextWorkoutResource.read(
    cache,
    workoutId
  );
  return (
    <div>
      <h2>
        Up Next!{" "}
        <Link to={`../${nextWorkout.id}`}>
          {nextWorkout.name}
        </Link>
      </h2>
    </div>
  );
};

const LoadingSpinner = () => (
  <div css={{ textAlign: "center", padding: 20 }}>
    <Spinner size="100" />
  </div>
);

const Network = () => (
  <div
    style={{
      fontWeight: "bold",
      fontSize: 30,
      position: "fixed",
      bottom: 20,
      right: 20
    }}
  >
    Network: {network}
  </div>
);

const App = () => {
  return (
    <React.Fragment>
      <Placeholder
        delayMs={patience}
        fallback={<Spinner size="100" />}
      >
        <ManageScroll />
        <Router style={{ padding: 20 }}>
          <Home path="/" />
          <Workouts path="workouts" />
          <Workout path="workouts/:workoutId" />
          <Competitions path="competitions" />
        </Router>
      </Placeholder>
      <Network />
    </React.Fragment>
  );
};

export default App;
