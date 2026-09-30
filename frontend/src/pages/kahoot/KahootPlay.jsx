import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Gamepad2, CheckCircle2, XCircle, Flame, Trophy, Clock, Volume2, VolumeX, ShieldAlert, ArrowRight, Hourglass } from 'lucide-react';
import { sounds } from '../../utils/sound';

export default function KahootPlay() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const pin = searchParams.get('pin');
  const navigate = useNavigate();

  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'question', 'answered', 'leaderboard', 'ended', 'kicked'
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [totalTime, setTotalTime] = useState(20);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [roundAnswerInfo, setRoundAnswerInfo] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [finalRankings, setFinalRankings] = useState([]);
  const [myFinalRank, setMyFinalRank] = useState(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!pin) {
      toast.error('No Game PIN provided');
      navigate('/kahoot');
      return;
    }

    const socket = getSocket();
    const nickname = user?.name || `Student_${Math.floor(100 + Math.random() * 900)}`;

    socket.emit('kahoot:join_room', {
      pin,
      nickname,
      usn: user?.usn || '',
      student_id: user?.id
    });

    socket.on('kahoot:joined_success', (data) => {
      setGameState('lobby');
      toast.success(`🎉 Joined ${data.subject} Quiz Arena!`, { icon: '🎮' });
    });

    socket.on('kahoot:error', (data) => {
      toast.error(data.message || 'Error joining room');
      navigate('/kahoot');
    });

    socket.on('kahoot:kicked', (data) => {
      toast.error(data.message || 'Removed from room');
      navigate('/kahoot');
    });

    socket.on('kahoot:question_start', (data) => {
      setGameState('question');
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setQuestion({
        text: data.question,
        options: data.options
      });
      setTimeLeft(data.timeLimit || 20);
      setTotalTime(data.timeLimit || 20);
      setSelectedOption(null);
      setAnswerResult(null);
      setRoundAnswerInfo(null);
    });

    socket.on('kahoot:answer_result', (data) => {
      setGameState('answered');
      setAnswerResult(data);
      setTotalScore(data.totalScore);
      setStreak(data.streak);

      if (data.isCorrect) {
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }
    });

    socket.on('kahoot:leaderboard_data', (data) => {
      setGameState('leaderboard');
      setRoundAnswerInfo({
        correctIndex: data.correctIndex,
        correctOptionText: data.correctOptionText
      });
    });

    socket.on('kahoot:game_ended', (data) => {
      setGameState('ended');
      setFinalRankings(data.fullRankings || []);
      const myRankObj = (data.fullRankings || []).find(p => p.usn === user?.usn || p.nickname === nickname);
      if (myRankObj) {
        setMyFinalRank(myRankObj.rank);
      }
      sounds.playFanfare();
    });

    socket.on('kahoot:game_restarted', () => {
      setGameState('lobby');
      setTotalScore(0);
      setStreak(0);
      setSelectedOption(null);
      setAnswerResult(null);
      toast.success('🔄 Host restarted the game! Get ready!');
    });

    return () => {
      socket.off('kahoot:joined_success');
      socket.off('kahoot:error');
      socket.off('kahoot:kicked');
      socket.off('kahoot:question_start');
      socket.off('kahoot:answer_result');
      socket.off('kahoot:leaderboard_data');
      socket.off('kahoot:game_ended');
      socket.off('kahoot:game_restarted');
    };
  }, [pin, user, navigate]);

  // Student Countdown Timer ticker
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

  const handleSubmitOption = (optionIndex) => {
    if (selectedOption !== null || gameState !== 'question') return;

    setSelectedOption(optionIndex);
    const timeRemainingRatio = totalTime > 0 ? (timeLeft / totalTime) : 0.5;

    const socket = getSocket();
    socket.emit('kahoot:submit_answer', {
      pin,
      questionIndex,
      optionIndex,
      timeRemainingRatio
    });
  };

  const toggleMute = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    sounds.setMuted(nextMute);
  };

  const optionCards = [
    { bg: 'bg-rose-600', hover: 'hover:bg-rose-700', active: 'ring-4 ring-white', shape: '▲', label: 'Option A' },
    { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', active: 'ring-4 ring-white', shape: '◆', label: 'Option B' },
    { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', active: 'ring-4 ring-white', shape: '●', label: 'Option C' },
    { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', active: 'ring-4 ring-white', shape: '■', label: 'Option D' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 px-6 rounded-2xl border border-slate-800 shadow-md font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-amber-400">PIN: #{pin}</span>
          <span>Score: <strong className="text-emerald-400 text-sm">{totalScore} pts</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 text-amber-400 font-bold animate-pulse">
              <Flame size={16} /> {streak} Streak!
            </div>
          )}

          <button
            onClick={toggleMute}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* 1. LOBBY SCREEN FOR STUDENT */}
      {gameState === 'lobby' && (
        <div className="card bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-8 md:p-12 rounded-3xl border border-purple-500/30 shadow-2xl text-center space-y-6 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center text-4xl mx-auto animate-bounce">
            🎮
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">YOU ARE IN THE GAME ARENA!</h1>
            <p className="text-sm text-purple-200">
              See your nickname <span className="font-black text-amber-400">"{user?.name || 'Player'}"</span> on the host's main screen?
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl max-w-sm mx-auto text-xs text-slate-300 space-y-1 font-mono">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
              <Hourglass size={16} className="animate-spin" /> Waiting for host to start...
            </div>
            <div>Select options as fast as possible for maximum speed bonus!</div>
          </div>
        </div>
      )}

      {/* 2. LIVE QUESTION & OPTION BUTTONS SCREEN */}
      {gameState === 'question' && question && (
        <div className="space-y-6 animate-fade-in">
          <div className="card bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <span className="font-mono text-slate-400">Question {questionIndex + 1} of {totalQuestions}</span>
              <div className={`flex items-center gap-1.5 font-mono font-bold ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-amber-400'}`}>
                <Clock size={16} /> {timeLeft}s
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-center text-slate-100 py-2">
              {question.text}
            </h2>
          </div>

          {/* Submission status bar if student clicked */}
          {selectedOption !== null && (
            <div className="p-3 bg-purple-950/60 border border-purple-500/40 rounded-2xl text-xs text-purple-300 text-center font-bold font-mono animate-pulse">
              ✅ Option {['A', 'B', 'C', 'D'][selectedOption]} Selected! Answer locked in — waiting for round to complete...
            </div>
          )}

          {/* 4 Interactive Kahoot Option Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((opt, idx) => {
              const card = optionCards[idx];
              const isSelected = selectedOption === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleSubmitOption(idx)}
                  disabled={selectedOption !== null}
                  className={`${card.bg} ${card.hover} text-white p-6 rounded-3xl font-extrabold shadow-xl transition-all cursor-pointer flex items-center gap-4 text-left ${
                    isSelected ? card.active + ' scale-105' : 'hover:scale-102'
                  } ${selectedOption !== null && !isSelected ? 'opacity-40' : ''}`}
                >
                  <span className="text-3xl shrink-0 font-mono opacity-80">{card.shape}</span>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase opacity-75 font-mono">{card.label}</div>
                    <div className="text-base md:text-lg line-clamp-2">{opt}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ANSWER RESULT FEEDBACK SCREEN */}
      {gameState === 'answered' && answerResult && (
        <div className={`card p-8 md:p-12 rounded-3xl text-white text-center space-y-6 shadow-2xl animate-scale-in ${
          answerResult.isCorrect 
            ? 'bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 border border-emerald-500/50'
            : 'bg-gradient-to-br from-rose-950 via-red-900 to-slate-950 border border-rose-500/50'
        }`}>
          {answerResult.isCorrect ? (
            <div className="space-y-3">
              <CheckCircle2 size={64} className="text-emerald-400 mx-auto animate-bounce" />
              <h1 className="text-3xl md:text-4xl font-black text-emerald-300">CORRECT ANSWER!</h1>
              <div className="text-2xl font-mono font-black text-amber-400">
                +{answerResult.pointsEarned} Points!
              </div>
              {streak > 1 && (
                <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1">
                  <Flame size={16} /> Answer Streak: {streak} in a row!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <XCircle size={64} className="text-rose-400 mx-auto" />
              <h1 className="text-3xl md:text-4xl font-black text-rose-300">INCORRECT!</h1>
              <p className="text-xs text-slate-300">Keep your focus for the next question!</p>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 text-xs font-mono text-slate-300">
            Total Score: <strong className="text-white text-base">{totalScore} pts</strong>
          </div>
        </div>
      )}

      {/* 4. LEADERBOARD / QUESTION REVIEW SCREEN */}
      {gameState === 'leaderboard' && (
        <div className="card bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 text-center space-y-4">
          <Trophy size={48} className="text-amber-400 mx-auto animate-pulse" />
          <h2 className="text-2xl font-black text-white">Look at the Main Screen!</h2>
          <p className="text-xs text-slate-400">Checking round standings and overall ranking...</p>

          {roundAnswerInfo && (
            <div className="p-4 bg-slate-800/80 rounded-2xl max-w-md mx-auto text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-400">Round Correct Answer:</div>
              <div className="font-extrabold text-white text-sm">
                {['Option A 🔴', 'Option B 🔷', 'Option C 🟡', 'Option D 🟢'][roundAnswerInfo.correctIndex]}: {roundAnswerInfo.correctOptionText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. GAME OVER ENDED SCREEN */}
      {gameState === 'ended' && (
        <div className="card bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-8 rounded-3xl border border-purple-500/40 text-center space-y-6">
          <Trophy size={64} className="text-amber-400 mx-auto animate-bounce" />
          <h1 className="text-3xl font-black text-amber-400">QUIZ FINISHED!</h1>

          {myFinalRank ? (
            <div className="p-5 bg-white/10 rounded-2xl max-w-sm mx-auto space-y-1">
              <div className="text-xs text-slate-300 uppercase font-mono">Your Final Ranking</div>
              <div className="text-4xl font-black text-emerald-400 font-mono">Rank #{myFinalRank}</div>
              <div className="text-xs text-slate-300 font-mono">Final Score: {totalScore} pts</div>
            </div>
          ) : (
            <div className="text-sm text-slate-300 font-mono">
              Final Score: <strong className="text-emerald-400">{totalScore} pts</strong>
            </div>
          )}

          <button
            onClick={() => navigate('/kahoot')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            Back to Kahoot Lobby
          </button>
        </div>
      )}
    </div>
  );
}
