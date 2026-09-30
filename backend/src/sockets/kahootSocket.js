const { kahootRooms } = require('../controllers/kahootController');

module.exports = function registerKahootSocket(io, socket) {
  // 1. Join Game Room (Student or Host)
  socket.on('kahoot:join_room', ({ pin, nickname, usn, student_id, isHost }) => {
    const room = kahootRooms[pin];
    if (!room) {
      return socket.emit('kahoot:error', { message: 'Game room not found or PIN expired.' });
    }

    const roomName = `kahoot_room_${pin}`;
    socket.join(roomName);

    if (isHost) {
      room.hostSocketId = socket.id;
    }

    // Save player profile if joining as player
    const playerName = (nickname || socket.user?.name || `Player_${socket.id.slice(0, 4)}`).trim();
    
    // Don't list host as a player unless explicitly desired
    if (!isHost && !room.players[socket.id]) {
      room.players[socket.id] = {
        socketId: socket.id,
        studentId: student_id || socket.user?.id,
        usn: usn || socket.user?.usn || '',
        nickname: playerName,
        score: 0,
        streak: 0,
        lastPoints: 0
      };
      console.log(`🎮 Player ${playerName} joined Kahoot Room #${pin}`);
    }

    // Broadcast updated player list to room
    const playerList = Object.values(room.players).map(p => ({
      socketId: p.socketId,
      nickname: p.nickname,
      usn: p.usn,
      score: p.score
    }));

    io.to(roomName).emit('kahoot:player_joined', {
      players: playerList,
      count: playerList.length,
      joinedPlayer: isHost ? null : playerName
    });

    socket.emit('kahoot:joined_success', {
      pin,
      subject: room.subject,
      hostName: room.hostName,
      status: room.status,
      questionCount: room.questions.length,
      currentQuestion: room.currentQuestion
    });
  });

  // Host Kicks a player
  socket.on('kahoot:kick_player', ({ pin, targetSocketId }) => {
    const room = kahootRooms[pin];
    if (!room) return;

    const kickedPlayer = room.players[targetSocketId];
    if (kickedPlayer) {
      delete room.players[targetSocketId];
      io.to(targetSocketId).emit('kahoot:kicked', { message: 'You were removed from the room by host.' });

      const playerList = Object.values(room.players).map(p => ({
        socketId: p.socketId,
        nickname: p.nickname,
        usn: p.usn,
        score: p.score
      }));

      io.to(`kahoot_room_${pin}`).emit('kahoot:player_left', {
        players: playerList,
        count: playerList.length
      });
    }
  });

  // 2. Start Game (Host)
  socket.on('kahoot:start_game', ({ pin }) => {
    const room = kahootRooms[pin];
    if (!room || room.questions.length === 0) return;

    room.status = 'question';
    room.currentQuestion = 0;
    room.responses[0] = {};

    const q = room.questions[0];
    const roomName = `kahoot_room_${pin}`;

    console.log(`🚀 Kahoot Game #${pin} STARTED by host!`);

    // Broadcast question to students (answerIndex excluded)
    io.to(roomName).emit('kahoot:question_start', {
      questionIndex: 0,
      totalQuestions: room.questions.length,
      question: q.question,
      options: q.options,
      timeLimit: q.timeLimit || 20
    });

    // Send answerIndex privately to host socket
    if (room.hostSocketId) {
      io.to(room.hostSocketId).emit('kahoot:host_question_info', {
        questionIndex: 0,
        answerIndex: q.answerIndex
      });
    }
  });

  // 3. Submit Answer (Student)
  socket.on('kahoot:submit_answer', ({ pin, questionIndex, optionIndex, timeRemainingRatio }) => {
    const room = kahootRooms[pin];
    if (!room || room.currentQuestion !== questionIndex) return;

    const player = room.players[socket.id];
    if (!player) return;

    const currentQ = room.questions[questionIndex];
    if (!currentQ) return;

    const qResponses = room.responses[questionIndex] || {};
    if (qResponses[socket.id]) return; // prevent duplicate answer

    const isCorrect = Number(optionIndex) === Number(currentQ.answerIndex);
    let points = 0;

    if (isCorrect) {
      player.streak = (player.streak || 0) + 1;
      const ratio = typeof timeRemainingRatio === 'number' ? Math.max(0, Math.min(1, timeRemainingRatio)) : 0.5;
      // Speed bonus (max 1000) + Streak bonus (50 pts per streak step)
      points = Math.round(1000 * (0.5 + 0.5 * ratio)) + (player.streak * 50);
      player.score += points;
      player.lastPoints = points;
    } else {
      player.streak = 0;
      player.lastPoints = 0;
    }

    qResponses[socket.id] = {
      optionIndex: Number(optionIndex),
      isCorrect,
      points
    };
    room.responses[questionIndex] = qResponses;

    // Send instant individual result feedback to the student
    socket.emit('kahoot:answer_result', {
      isCorrect,
      correctIndex: currentQ.answerIndex,
      pointsEarned: points,
      totalScore: player.score,
      streak: player.streak
    });

    // Aggregate response counts
    const totalResponses = Object.keys(qResponses).length;
    const totalPlayers = Object.keys(room.players).length;
    const optionCounts = [0, 0, 0, 0];

    Object.values(qResponses).forEach(r => {
      if (r.optionIndex >= 0 && r.optionIndex <= 3) {
        optionCounts[r.optionIndex]++;
      }
    });

    io.to(`kahoot_room_${pin}`).emit('kahoot:host_response_update', {
      totalResponses,
      totalPlayers,
      optionCounts
    });

    // If all players responded, inform host
    if (totalResponses === totalPlayers && totalPlayers > 0) {
      io.to(`kahoot_room_${pin}`).emit('kahoot:all_players_answered', {
        totalResponses
      });
    }
  });

  // 4. Show Question Answer & Leaderboard (Host)
  socket.on('kahoot:show_leaderboard', ({ pin }) => {
    const room = kahootRooms[pin];
    if (!room) return;

    room.status = 'leaderboard';
    const currentQIndex = room.currentQuestion;
    const currentQ = room.questions[currentQIndex];
    const qResponses = room.responses[currentQIndex] || {};

    // Reset streak for players who didn't submit an answer
    Object.values(room.players).forEach(p => {
      if (!qResponses[p.socketId]) {
        p.streak = 0;
        p.lastPoints = 0;
      }
    });

    // Option response stats
    const optionCounts = [0, 0, 0, 0];
    Object.values(qResponses).forEach(r => {
      if (r.optionIndex >= 0 && r.optionIndex <= 3) {
        optionCounts[r.optionIndex]++;
      }
    });

    // Top 5 Players
    const leaderboard = Object.values(room.players)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((p, idx) => ({
        rank: idx + 1,
        nickname: p.nickname,
        score: p.score,
        streak: p.streak,
        lastPoints: p.lastPoints
      }));

    io.to(`kahoot_room_${pin}`).emit('kahoot:leaderboard_data', {
      questionIndex: currentQIndex,
      totalQuestions: room.questions.length,
      questionText: currentQ ? currentQ.question : '',
      correctIndex: currentQ ? currentQ.answerIndex : 0,
      correctOptionText: currentQ && currentQ.options ? currentQ.options[currentQ.answerIndex] : '',
      optionCounts,
      leaderboard
    });
  });

  // 5. Next Question (Host)
  socket.on('kahoot:next_question', ({ pin }) => {
    const room = kahootRooms[pin];
    if (!room) return;

    room.currentQuestion++;
    if (room.currentQuestion < room.questions.length) {
      room.status = 'question';
      const qIndex = room.currentQuestion;
      const q = room.questions[qIndex];
      room.responses[qIndex] = {};

      io.to(`kahoot_room_${pin}`).emit('kahoot:question_start', {
        questionIndex: qIndex,
        totalQuestions: room.questions.length,
        question: q.question,
        options: q.options,
        timeLimit: q.timeLimit || 20
      });

      if (room.hostSocketId) {
        io.to(room.hostSocketId).emit('kahoot:host_question_info', {
          questionIndex: qIndex,
          answerIndex: q.answerIndex
        });
      }
    } else {
      // Game Over -> Broadcast Podium
      room.status = 'ended';
      const finalRankings = Object.values(room.players)
        .sort((a, b) => b.score - a.score)
        .map((p, idx) => ({
          rank: idx + 1,
          nickname: p.nickname,
          score: p.score,
          usn: p.usn
        }));

      io.to(`kahoot_room_${pin}`).emit('kahoot:game_ended', {
        podium: finalRankings.slice(0, 3),
        fullRankings: finalRankings
      });
    }
  });

  // 6. Restart Game with same players in lobby
  socket.on('kahoot:restart_game', ({ pin }) => {
    const room = kahootRooms[pin];
    if (!room) return;

    room.status = 'lobby';
    room.currentQuestion = -1;
    room.responses = {};

    Object.values(room.players).forEach(p => {
      p.score = 0;
      p.streak = 0;
      p.lastPoints = 0;
    });

    const playerList = Object.values(room.players).map(p => ({
      socketId: p.socketId,
      nickname: p.nickname,
      usn: p.usn,
      score: 0
    }));

    io.to(`kahoot_room_${pin}`).emit('kahoot:game_restarted', {
      players: playerList,
      count: playerList.length
    });
  });

  // Handle player disconnect from room
  socket.on('disconnect', () => {
    for (const pin in kahootRooms) {
      const room = kahootRooms[pin];
      if (room && room.players[socket.id]) {
        delete room.players[socket.id];
        const playerList = Object.values(room.players).map(p => ({
          socketId: p.socketId,
          nickname: p.nickname,
          usn: p.usn,
          score: p.score
        }));

        io.to(`kahoot_room_${pin}`).emit('kahoot:player_left', {
          players: playerList,
          count: playerList.length
        });
      }
    }
  });
};
