import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGame from "../hooks/useGame";
import useTimer from "../hooks/useTimer";
import { useCanvas } from "../hooks/useCanvas";
import { useSocketContext } from "../context/SocketContext";

// Components
import Lobby from "../components/lobby/Lobby";
import GameCanvas from "../components/game/GameCanvas";
import Scoreboard from "../components/game/Scoreboard";
import ChatBox from "../components/game/ChatBox";
import WordSelector from "../components/game/WordSelector";
import FinalLeaderboard from "../components/game/FinalLeaderboard";
import Countdown from "../components/game/Countdown";
import WordReveal from "../components/game/WordReveal";
import HintDisplay from "../components/game/HintDisplay";
import DrawingTools from "../components/game/DrawingTools";
import RoundBanner from "../components/game/RoundBanner";

import "./RoomPage.css";

const RoomPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const socket = useSocketContext();
  const { state, tick, startGame, sendGuess, joinRoom, chooseWord, reset } = useGame();
  const [localName, setLocalName] = React.useState(localStorage.getItem("scribble_player_name") || "");
  const [isJoining, setIsJoining] = React.useState(false);

  const isDrawer = socket?.id === state.drawerId;

  // Auto-join if arriving via link and we have a name
  useEffect(() => {
    if (code && !state.room && localName && !isJoining) {
      setIsJoining(true);
      joinRoom(code, localName);
    }
  }, [code, state.room, localName, joinRoom, isJoining]);

  // Sync local timer
  useTimer(state.phase, state.timeLeft, tick);

  // Canvas hook lifted to page level to share controls between Canvas and Tools
  const canvasControls = useCanvas({
    roomCode: state.room,
    isDrawer,
    phase: state.phase
  });

  // Redirect if room not found/lost - increased timeout to 5s
  useEffect(() => {
    if (!state.room && !localName) return; // Don't redirect if we need a name

    const timeout = setTimeout(() => {
      if (!state.room) navigate("/");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [state.room, navigate, localName]);

  const handleManualJoin = (e) => {
    e.preventDefault();
    if (!localName.trim()) return;
    localStorage.setItem("scribble_player_name", localName.trim());
    setIsJoining(true);
    joinRoom(code, localName.trim());
  };

  if (!state.room) {
    if (!localName) {
      return (
        <div className="room-loading">
          <div className="glass-card name-prompt-card">
            <h2>Welcome to Room {code}</h2>
            <p>Please enter a nickname to join the game</p>
            <form onSubmit={handleManualJoin}>
              <input 
                type="text" 
                placeholder="Your Nickname" 
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                maxLength={15}
                required
                autoFocus
              />
              <button type="submit" className="btn btn-primary">Join Room</button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="room-loading">
        <div className="loader"></div>
        <h2>Entering Room {code}...</h2>
        {state.error && <p className="error-text">{state.error}</p>}
      </div>
    );
  }

  const renderPhase = () => {
    switch (state.phase) {
      case "lobby":
        return (
          <>
            {state.error && (
              <div className="error-toast" style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#ff4444', color: 'white', padding: '10px 20px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                {state.error}
              </div>
            )}
            <Lobby 
              room={{ roomCode: state.room, settings: state.roomSettings, hostId: state.players.find(p => p.isHost)?.playerId }} 
              players={state.players} 
              socketId={socket?.id}
              onStart={() => startGame(state.room)} 
            />
          </>
        );

      case "word_selection":
        return (
          <WordSelector 
            isDrawer={isDrawer} 
            wordOptions={state.wordOptions || []} 
            onChoose={(word) => chooseWord(state.room, word)} 
            drawerName={state.players.find(p => p.playerId === state.drawerId)?.name || "Someone"} 
          />
        );

      case "drawing":
      case "round_end":
        return (
          <div className="game-grid">
            <aside className="game-aside-left">
              <Scoreboard 
                players={state.players} 
                socketId={socket?.id}
                drawerId={state.drawerId}
              />
              {isDrawer && state.phase === "drawing" && (
                <div className="artist-controls-sidebar">
                  <DrawingTools {...canvasControls} />
                </div>
              )}
            </aside>

            <main className="game-main">
              <header className="game-top-bar">
                <Countdown timeLeft={state.timeLeft} />
                <div className="round-status">
                  <span className="label">Round</span>
                  <span className="value">{state.round} / {state.totalRounds}</span>
                </div>
                <HintDisplay hint={state.hint} myWord={state.myWord} isDrawer={isDrawer} />
              </header>

              <div className="canvas-wrapper">
                <GameCanvas 
                  canvasRef={canvasControls.canvasRef}
                  isDrawer={isDrawer} 
                  phase={state.phase} 
                />
              </div>

              {state.phase === "drawing" && (
                <RoundBanner 
                  round={state.round} 
                  totalRounds={state.totalRounds} 
                  drawerName={state.players.find(p => p.playerId === state.drawerId)?.name} 
                />
              )}

              {state.phase === "round_end" && (
                <WordReveal 
                  word={state.messages.filter(m => m.type === "system").pop()?.text.split(": ").pop()} 
                  scores={state.scores}
                />
              )}
            </main>

            <aside className="game-aside-right">
              <ChatBox 
                messages={state.messages} 
                roomCode={state.room} 
                sendGuess={sendGuess}
                phase={state.phase}
                socketId={socket?.id}
                players={state.players}
              />
            </aside>
          </div>
        );

      case "game_over":
        return (
          <FinalLeaderboard 
            leaderboard={state.leaderboard} 
            winner={state.winner} 
            onPlayAgain={() => { const roomCode = state.room; reset(); startGame(roomCode); }}
            onHome={() => { reset(); navigate("/"); }}
            isHost={state.players.find(p => p.playerId === socket?.id)?.isHost}
          />
        );

      default:
        return <div className="error-phase">Unknown Game Phase: {state.phase}</div>;
    }
  };

  return <div className="room-layout">{renderPhase()}</div>;
};

export default RoomPage;
