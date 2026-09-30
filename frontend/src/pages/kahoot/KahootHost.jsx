import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getSocket } from '../../services/socket';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Play, Users, Trophy, ArrowRight, BarChart2, Radio, Volume2, VolumeX, Maximize, Minimize, UserX, CheckCircle, RefreshCw, Sparkles, Flame } from 'lucide-react';
import { sounds } from '../../utils/sound';

export default function KahootHost() {
  const [searchParams] = useSearchParams();
  const pin = searchParams.get('pin');
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'question', 'leaderboard', 'ended'
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [responseCounts, setResponseCounts] = useState([0, 0, 0, 0]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [podium, setPodium] = useState([]);
  const [hostAnswerIndex, setHostAnswerIndex] = useState(null);
  const [allAnswered, setAllAnswered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!pin) {
      toast.error('No Game PIN provided');
      navigate('/kahoot');
      return;
    }

    api.get(`/kahoot/room/${pin}`)
      .then(r => setRoom(r.data))
      .catch(() => {
        toast.error('Room not found or expired');
        navigate('/kahoot');
      });

    const socket = getSocket();

    // Join room as host
    socket.emit('kahoot:join_room', { pin, nickname: 'Faculty Host', isHost: true });

    socket.on('kahoot:player_joined', (data) => {
      setPlayers(data.players || []);
      if (data.joinedPlayer) {
        sounds.playJoin();
        toast.success(`🎉 ${data.joinedPlayer} joined!`, { icon: '👤' });
      }
    });

    socket.on('kahoot:player_left', (data) => {
      setPlayers(data.players || []);
    });

    socket.on('kahoot:question_start', (data) => {
      setGameState('question');
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setCurrentQuestion({
        text: data.question,
        options: data.options
      });
      setTimeLeft(data.timeLimit || 20);
      setResponseCounts([0, 0, 0, 0]);
      setTotalResponses(0);
      setHostAnswerIndex(null);
      setAllAnswered(false);
    });

    socket.on('kahoot:host_question_info', (data) => {
      setHostAnswerIndex(data.answerIndex);
    });

    socket.on('kahoot:host_response_update', (data) => {
      setResponseCounts(data.optionCounts || [0, 0, 0, 0]);
      setTotalResponses(data.totalResponses || 0);
    });

    socket.on('kahoot:all_players_answered', () => {
      setAllAnswered(true);
      toast.success('⚡ All players submitted their answers!', { icon: '✅' });
    });

    socket.on('kahoot:leaderboard_data', (data) => {
      setGameState('leaderboard');
      setLeaderboard(data.leaderboard || []);
      if (data.correctIndex !== undefined) {
        setHostAnswerIndex(data.correctIndex);
      }
    });

    socket.on('kahoot:game_ended', (data) => {
      setGameState('ended');
      setPodium(data.podium || []);
      sounds.playFanfare();
    });

    socket.on('kahoot:game_restarted', (data) => {
      setGameState('lobby');
      setPlayers(data.players || []);
      toast.success('🔄 Game restarted for lobby players!');
    });

    return () => {
      socket.off('kahoot:player_joined');
      socket.off('kahoot:player_left');
      socket.off('kahoot:question_start');
      socket.off('kahoot:host_question_info');
      socket.off('kahoot:host_response_update');
      socket.off('kahoot:all_players_answered');
      socket.off('kahoot:leaderboard_data');
      socket.off('kahoot:game_ended');
      socket.off('kahoot:game_restarted');
    };
  }, [pin, navigate]);

  // Host Countdown Timer Ticker during Question screen
  useEffect(() => {
    if (gameState !== 'question' || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 5 && t > 0) sounds.playTick();
        return Math.max(0, t - 1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit('kahoot:start_game', { pin });
  };

  const handleShowLeaderboard = () => {
    const socket = getSocket();
    socket.emit('kahoot:show_leaderboard', { pin });
  };

  const handleNextQuestion = () => {
    const socket = getSocket();
    socket.emit('kahoot:next_question', { pin });
  };

  const handleRestartGame = () => {
    const socket = getSocket();
    socket.emit('kahoot:restart_game', { pin });
  };

  const handleKickPlayer = (socketId) => {
    const socket = getSocket();
    socket.emit('kahoot:kick_player', { pin, targetSocketId: socketId });
  };

  const toggleMute = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    sounds.setMuted(nextMute);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const optionColors = [
    { bg: 'bg-rose-600', border: 'border-rose-500', shape: '▲', label: 'Option A' },
    { bg: 'bg-blue-600', border: 'border-blue-500', shape: '◆', label: 'Option B' },
    { bg: 'bg-amber-500', border: 'border-amber-500', shape: '●', label: 'Option C' },
    { bg: 'bg-emerald-600', border: 'border-emerald-500', shape: '■', label: 'Option D' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Host Top Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 px-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-black font-mono">
            GAME PIN: #{pin}
          </span>
          <span className="text-sm font-bold text-slate-300 hidden md:inline">
            {room?.subject || 'Live Quiz'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs flex items-center gap-1"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs flex items-center gap-1"
            title="Toggle Projector Fullscreen Mode"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button
            onClick={() => navigate('/kahoot')}
            className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition font-bold"
          >
            Exit Arena
          </button>
        </div>
      </div>

      {/* 1. LOBBY SCREEN */}
      {gameState === 'lobby' && (
        <div className="card bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-8 md:p-12 rounded-3xl border border-purple-500/30 shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider">
              <Radio size={14} className="animate-pulse" /> LIVE LOBBY — WAITING FOR PLAYERS
            </span>
            <h1 className="text-5xl md:text-7xl font-black font-mono tracking-[0.2em] text-amber-400 my-2 shadow-sm">
              {pin}
            </h1>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              Students go to <strong>/kahoot</strong> on their phones or laptops and enter Game PIN above to join!
            </p>
          </div>

          {/* Joined Players Grid */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5"><Users size={16} /> Joined Players ({players.length})</span>
              <span className="text-emerald-400 font-mono">Real-Time Sync</span>
            </div>

            {players.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-3 py-4 max-h-64 overflow-y-auto">
                {players.map((p, idx) => (
                  <div
                    key={p.socketId || idx}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-sm font-extrabold text-white shadow-lg flex items-center gap-2 group"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>{p.nickname} {p.usn ? `(${p.usn})` : ''}</span>
                    <button
                      onClick={() => handleKickPlayer(p.socketId)}
                      className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-200 transition ml-1"
                      title="Remove Player"
                    >
                      <UserX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-slate-400 text-xs italic">
                Waiting for students to enter PIN {pin} on their screen...
              </div>
            )}
          </div>

          <button
            onClick={handleStartGame}
            disabled={players.length === 0}
            className="px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-40 text-slate-950 font-black text-base rounded-2xl shadow-2xl hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-3"
          >
            <Play size={22} fill="currentColor" /> START GAME NOW ({players.length} Joined)
          </button>
        </div>
      )}

      {/* 2. QUESTION & LIVE ANSWERS SCREEN */}
      {gameState === 'question' && currentQuestion && (
        <div className="space-y-6">
          <div className="card bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="text-xs font-bold text-slate-400">
                Question <span className="text-amber-400 font-mono text-sm">{questionIndex + 1}</span> of {totalQuestions}
              </div>

              {/* Countdown ring timer */}
              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-black font-mono text-xl shadow-inner ${
                timeLeft <= 5 ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-ping' : 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse'
              }`}>
                {timeLeft}
              </div>

              <div className="text-xs font-bold text-emerald-400 font-mono">
                Responses: {totalResponses} / {players.length}
                {allAnswered && <span className="ml-1 text-emerald-300 font-black">(100%)</span>}
              </div>
            </div>

            {/* Host Correct Answer Badge */}
            {hostAnswerIndex !== null && hostAnswerIndex !== undefined && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
                <CheckCircle size={16} /> Host Key: Correct Answer is <strong>{optionColors[hostAnswerIndex]?.label} ({currentQuestion.options[hostAnswerIndex]})</strong>
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-black text-center text-slate-100 py-4">
              {currentQuestion.text}
            </h2>

            {/* Live Response Distribution Bars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {currentQuestion.options.map((opt, idx) => {
                const count = responseCounts[idx] || 0;
                const col = optionColors[idx];
                const pct = totalResponses > 0 ? Math.round((count * 100) / totalResponses) : 0;
                const isCorrectOpt = hostAnswerIndex === idx;

                return (
                  <div key={idx} className={`${col.bg} p-4 rounded-2xl text-white shadow-lg space-y-2 flex flex-col justify-between min-h-[130px] relative overflow-hidden ${isCorrectOpt ? 'ring-4 ring-emerald-400' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider opacity-90">{col.shape} {col.label}</span>
                      {isCorrectOpt && <CheckCircle size={16} className="text-emerald-300" />}
                    </div>
                    <div className="text-sm font-semibold line-clamp-2">{opt}</div>
                    <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-mono font-black">
                      <span>{count} Answers</span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                {timeLeft === 0 ? '⏰ Time is up!' : allAnswered ? '✅ Everyone answered!' : 'Waiting for responses...'}
              </span>

              <button
                onClick={handleShowLeaderboard}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                Reveal Answer & Show Leaderboard <BarChart2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. LIVE LEADERBOARD SCREEN */}
      {gameState === 'leaderboard' && (
        <div className="card bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2">
                <Trophy size={28} className="text-amber-400" /> Leaderboard — Round #{questionIndex + 1}
              </h2>
              <p className="text-xs text-slate-400">Current top ranking players based on speed and accuracy</p>
            </div>

            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
            >
              {questionIndex + 1 < totalQuestions ? 'Next Question' : 'View Final Podium'} <ArrowRight size={16} />
            </button>
          </div>

          {/* Question Summary & Correct Answer */}
          {hostAnswerIndex !== null && currentQuestion && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-bold uppercase">Question #{questionIndex + 1}: </span>
                <span className="font-semibold">{currentQuestion.text}</span>
              </div>
              <div className="font-bold font-mono text-emerald-400 shrink-0 ml-4">
                Correct: {optionColors[hostAnswerIndex]?.label} ({currentQuestion.options[hostAnswerIndex]})
              </div>
            </div>
          )}

          <div className="space-y-3">
            {leaderboard.map((p, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                  idx === 0
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-300 font-extrabold'
                    : 'bg-slate-800/60 border-slate-700/60 text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-700 font-black font-mono flex items-center justify-center text-sm">
                    #{p.rank}
                  </div>
                  <div>
                    <div className="font-extrabold text-base">{p.nickname}</div>
                    {p.streak > 1 && (
                      <div className="text-[10px] text-amber-400 font-bold font-mono flex items-center gap-1">
                        <Flame size={12} /> {p.streak} Answer Streak!
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-lg font-black text-emerald-400">{p.score} pts</div>
                  {p.lastPoints > 0 && (
                    <div className="text-[10px] text-emerald-500 font-bold">+{p.lastPoints}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FINAL PODIUM SCREEN */}
      {gameState === 'ended' && (
        <div className="card bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-8 rounded-3xl border border-amber-500/40 shadow-2xl text-center space-y-8">
          <div className="space-y-2">
            <span className="text-4xl">👑</span>
            <h1 className="text-3xl md:text-5xl font-black text-amber-400">
              GAME OVER — PODIUM CHAMPIONS!
            </h1>
            <p className="text-xs text-slate-300">Congratulations to today's live quiz winners!</p>
          </div>

          {/* 3D Podium Layout */}
          <div className="grid grid-cols-3 gap-4 items-end max-w-3xl mx-auto pt-8">
            {/* 2nd Place */}
            {podium[1] ? (
              <div className="p-4 bg-slate-800/80 border border-slate-600 rounded-t-3xl shadow-xl text-center space-y-2">
                <div className="text-3xl">🥈</div>
                <div className="font-extrabold text-sm text-slate-200">{podium[1].nickname}</div>
                <div className="font-mono text-xs text-emerald-400 font-bold">{podium[1].score} pts</div>
                <div className="h-28 bg-slate-700/80 rounded-t-xl flex items-center justify-center font-black font-mono text-slate-400">
                  2nd Place
                </div>
              </div>
            ) : <div />}

            {/* 1st Place */}
            {podium[0] ? (
              <div className="p-5 bg-gradient-to-b from-amber-500/30 to-yellow-600/20 border-2 border-amber-400 rounded-t-3xl shadow-2xl text-center space-y-2 relative -top-4">
                <div className="text-4xl animate-bounce">🥇</div>
                <div className="font-black text-lg text-amber-300">{podium[0].nickname}</div>
                <div className="font-mono text-sm text-emerald-300 font-black">{podium[0].score} pts</div>
                <div className="h-36 bg-amber-500/20 rounded-t-xl flex items-center justify-center font-black font-mono text-amber-400 text-xl">
                  1st CHAMPION
                </div>
              </div>
            ) : <div />}

            {/* 3rd Place */}
            {podium[2] ? (
              <div className="p-4 bg-slate-800/80 border border-amber-800 rounded-t-3xl shadow-xl text-center space-y-2">
                <div className="text-3xl">🥉</div>
                <div className="font-extrabold text-sm text-slate-200">{podium[2].nickname}</div>
                <div className="font-mono text-xs text-emerald-400 font-bold">{podium[2].score} pts</div>
                <div className="h-20 bg-slate-700/80 rounded-t-xl flex items-center justify-center font-black font-mono text-slate-400">
                  3rd Place
                </div>
              </div>
            ) : <div />}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRestartGame}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
            >
              <RefreshCw size={16} /> Replay Game with Same Players
            </button>
            <button
              onClick={() => navigate('/kahoot')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Back to Kahoot Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
