import { useEffect, useState } from "react";
import "./Interface.css";
import { socket } from "../../Socket";
import { useParams } from "react-router-dom";
import { capitalize } from "lodash";
import Button from "../components/Button/Button";

function Interface() {
  const [role, setRole] = useState("unknown");
  const { roomId } = useParams();
  const [statusText, setStatusText] = useState("Process is yet to start...");
  const [pollingActive, setPollingActive] = useState(false);
  const [pollingStarted, setPollingStarted] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [commitCount, setCommitCount] = useState(0);
  const [abortCount, setAbortCount] = useState(0);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    socket.once("load:user", (userType) => {
      setRole(userType);
      console.log(userType);
    });
    socket.emit("load:user", roomId);
  }, []);

  useEffect(() => {
    socket.on("load:polling", () => {
      setPollingActive(true);
      setStatusText("Voting started! please vote Commit or Abort...");
    });
  }, []);

  useEffect(() => {
    socket.on("vote:client-count", (count) => {
      setClientCount(count);
    });
  }, []);

  useEffect(() => {
    socket.on("vote:commit", () => {
      setCommitCount((prev) => prev + 1);
    });
  }, []);

  useEffect(() => {
    socket.on("vote:abort", () => {
      setAbortCount((prev) => prev + 1);
      socket.emit("decision:abort", roomId);
      setStatusText("Process aborted due to one or more client aborted...");
      socket.disconnect();
    });
  }, []);

  useEffect(() => {
    socket.on("decision:abort", () => {
      setVoted(true);
      setStatusText("Process aborted due to one or more client aborted...");
      socket.disconnect();
    });
  }, []);

  useEffect(() => {
    socket.on("decision:commit", () => {
      setStatusText("Commit ACK success...");
      socket.disconnect();
    });
  }, []);

  useEffect(() => {
    socket.on("info:already-started", () => {
      setVoted(true);
      setStatusText("Voting is already started, cannot join...");
      setRole("unknown");
    });
  }, []);

  // useEffect(() => {
  //   socket.on("vote:commit", () => {
  //     setStatusText("Voting started! please vote Commit or Abort...");
  //   });
  // }, []);

  function startPolling() {
    socket.emit("load:polling", roomId);
    setStatusText("Waiting for clients to respond...");
    setPollingStarted(true);
    socket.emit("vote:client-count", roomId);
  }

  function voteCommit() {
    socket.emit("vote:commit", roomId);
    setStatusText("Waiting for ACK from coordinate...");
    setVoted(true);
  }

  function voteAbort() {
    socket.emit("vote:abort", roomId);
    setStatusText("Waiting for ACK from coordinate...");
    setVoted(true);
  }

  return (
    <div className="App">
      <h2>Room: {roomId}</h2>
      <div>
        <img src={`${role}.png`} className="logo" alt="Vite logo" />
      </div>
      <b>
        <h3>Role: {capitalize(role)}</h3>
      </b>
      <h4>{statusText}</h4>
      {role === "coordinator" && !pollingActive && !pollingStarted && (
        <Button onClick={startPolling} id="startButton" text={"Start"}></Button>
      )}
      {!voted && (
        <div className="card">
          {pollingActive && <Button onClick={voteCommit} text={"Commit"} />}
          {pollingActive && <Button onClick={voteAbort} text={"Abort"} />}
        </div>
      )}
      {pollingStarted && <p>Voting Clients: {clientCount}</p>}
      <div className="results">
        {pollingStarted && <h4>Commits: {commitCount}</h4>}
        {pollingStarted && <h4>Aborts: {abortCount}</h4>}
      </div>
    </div>
  );
}

export default Interface;
