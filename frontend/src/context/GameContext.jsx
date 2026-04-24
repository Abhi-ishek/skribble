import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";
import { useSocketContext } from "./SocketContext";
import useSocket from "../hooks/useSocket";
import { EVENTS, SERVER_EVENTS } from "../constants/events";

const GameContext = createContext();

const initialState = {
  room: null,
  players: [],
  phase: "lobby", // lobby, word_selection, drawing, round_end, game_over
  round: 0,
  totalRounds: 0,
  drawerId: null,
  drawerName: "",
  wordOptions: [],
  hint: "",
  drawTime: 0,
  timeLeft: 0,
  messages: [],
  scores: [],
  winner: null,
  leaderboard: [],
  error: null,
  myWord: "", // The word if I am the drawer
  roomSettings: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "ROOM_CREATED":
    case "ROOM_JOINED":
      return {
        ...state,
        room: action.payload.roomCode,
        players: action.payload.players || [],
        totalRounds: action.payload.settings?.rounds || 0,
        roomSettings: action.payload.settings || {},
        phase: action.payload.phase || "lobby",
        error: null,
      };

    case "PLAYER_JOINED":
      return {
        ...state,
        players: action.payload.players,
      };

    case "PLAYER_LEFT":
      return {
        ...state,
        players: state.players.filter((p) => p.playerId !== action.payload.playerId),
      };

    case "ROOM_UPDATED":
        return {
          ...state,
          players: action.payload.players,
          phase: action.payload.phase || state.phase,
          drawerId: action.payload.drawerId || state.drawerId,
          roomSettings: action.payload.settings || state.roomSettings,
        };

    case "ROUND_START":
      return {
        ...state,
        phase: "word_selection",
        round: action.payload.round,
        drawerId: action.payload.drawerId,
        wordOptions: action.payload.wordOptions || [],
        hint: "",
        myWord: "",
        timeLeft: 0,
      };

    case "DRAWING_STARTED":
      return {
        ...state,
        phase: "drawing",
        hint: action.payload.hint || "",
        myWord: action.payload.word || "",
        drawTime: action.payload.drawTime,
        timeLeft: action.payload.drawTime,
      };

    case "HINT_UPDATE":
      return {
        ...state,
        hint: action.payload.hint,
      };

    case "TIMER_TICK":
      return {
        ...state,
        timeLeft: Math.max(0, state.timeLeft - 1),
      };

    case "ROUND_END":
      return {
        ...state,
        phase: "round_end",
        players: action.payload.scores,
        messages: [
          ...state.messages,
          { type: "system", text: `Round ended! The word was: ${action.payload.word}` },
        ],
      };

    case "GAME_OVER":
      return {
        ...state,
        phase: "game_over",
        winner: action.payload.winner,
        leaderboard: action.payload.leaderboard,
      };

    case "CHAT_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, { 
          type: action.payload.type || "chat", 
          text: action.payload.text, 
          playerName: action.payload.playerName || action.payload.sender, 
          senderId: action.payload.playerId || action.payload.senderId 
        }],
      };

    case "GUESS_RESULT":
      return {
        ...state,
        players: action.payload.players,
        messages: [
          ...state.messages,
          { type: "correct", text: `guessed the word!`, playerName: action.payload.playerName },
        ],
      };

    case "YOU_GUESSED":
      return {
        ...state,
        messages: [
          ...state.messages,
          { type: "system", text: `You guessed correctly! Word: ${action.payload.word} (+${action.payload.points} pts)` },
        ],
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socket = useSocketContext();

  const handlers = useMemo(() => ({
    [SERVER_EVENTS.ROOM_CREATED]: (data) => dispatch({ type: "ROOM_CREATED", payload: data }),
    [SERVER_EVENTS.ROOM_JOINED]: (data) => dispatch({ type: "ROOM_JOINED", payload: data }),
    [SERVER_EVENTS.ROOM_UPDATED]: (data) => dispatch({ type: "ROOM_UPDATED", payload: data }),
    [SERVER_EVENTS.PLAYER_JOINED]: (data) => dispatch({ type: "PLAYER_JOINED", payload: data }),
    [SERVER_EVENTS.PLAYER_LEFT]: (data) => dispatch({ type: "PLAYER_LEFT", payload: data }),
    [SERVER_EVENTS.ROUND_START]: (data) => dispatch({ type: "ROUND_START", payload: data }),
    [SERVER_EVENTS.DRAWING_STARTED]: (data) => dispatch({ type: "DRAWING_STARTED", payload: data }),
    [SERVER_EVENTS.HINT_UPDATE]: (data) => dispatch({ type: "HINT_UPDATE", payload: data }),
    [SERVER_EVENTS.ROUND_END]: (data) => dispatch({ type: "ROUND_END", payload: data }),
    [SERVER_EVENTS.GAME_OVER]: (data) => dispatch({ type: "GAME_OVER", payload: data }),
    [SERVER_EVENTS.CHAT_MESSAGE]: (data) => dispatch({ type: "CHAT_MESSAGE", payload: data }),
    [SERVER_EVENTS.GUESS_RESULT]: (data) => dispatch({ type: "GUESS_RESULT", payload: data }),
    [SERVER_EVENTS.YOU_GUESSED]: (data) => dispatch({ type: "YOU_GUESSED", payload: data }),
    [SERVER_EVENTS.ERROR]: (data) => dispatch({ type: "SET_ERROR", payload: data }),
  }), []);

  useSocket(handlers);

  // Emitters
  const createRoom = useCallback((playerName, settings, isPrivate) => {
    socket?.emit(EVENTS.CREATE_ROOM, { playerName, settings, isPrivate });
  }, [socket]);

  const joinRoom = useCallback((roomCode, playerName) => {
    socket?.emit(EVENTS.JOIN_ROOM, { roomCode, playerName });
  }, [socket]);

  const startGame = useCallback((roomCode) => {
    socket?.emit(EVENTS.START_GAME, { roomCode });
  }, [socket]);

  const chooseWord = useCallback((roomCode, word) => {
    socket?.emit(EVENTS.WORD_CHOSEN, { roomCode, word });
  }, [socket]);

  const sendGuess = useCallback((roomCode, text) => {
    socket?.emit(EVENTS.GUESS, { roomCode, text });
  }, [socket]);

  const tick = useCallback(() => {
    dispatch({ type: "TIMER_TICK" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value = {
    state,
    createRoom,
    joinRoom,
    startGame,
    chooseWord,
    sendGuess,
    tick,
    reset,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
