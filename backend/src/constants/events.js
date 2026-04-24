/**
 * Client → Server Events
 */
export const EVENTS = {
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  START_GAME: "start_game",
  GET_PUBLIC_ROOMS: "get_public_rooms",
  WORD_CHOSEN: "word_chosen",
  DRAW_START: "draw_start",
  DRAW_MOVE: "draw_move",
  DRAW_END: "draw_end",
  CANVAS_CLEAR: "canvas_clear",
  DRAW_UNDO: "draw_undo",
  REQUEST_CANVAS_SYNC: "request_canvas_sync",
  GUESS: "guess",
  DISCONNECT: "disconnect",
};

/**
 * Server → Client Events
 */
export const SERVER_EVENTS = {
  ROOM_CREATED: "room_created",
  ROOM_JOINED: "room_joined",
  ROOM_UPDATED: "room_updated",
  PLAYER_JOINED: "player_joined",
  PLAYER_LEFT: "player_left",
  ERROR: "error",
  ROUND_START: "round_start",
  DRAWING_STARTED: "drawing_started",
  HINT_UPDATE: "hint_update",
  ROUND_END: "round_end",
  GAME_OVER: "game_over",
  DRAW_DATA: "draw_data",
  CANVAS_CLEARED: "canvas_cleared",
  CANVAS_RESET: "canvas_reset",
  CORRECT_GUESS: "correct_guess",
  YOU_GUESSED: "you_guessed",
  PLAYER_GUESSED: "player_guessed",
  GUESS_RESULT: "guess_result",
  CHAT_MESSAGE: "chat_message",
};
