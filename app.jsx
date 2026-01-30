import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Edit2, Check, X, Coins, Award, Sparkles } from 'lucide-react';

const ADHDTimeBlindnessKiller = () => {
  // State for routines
  const [routines, setRoutines] = useState(() => {
    const saved = localStorage.getItem('adhd-routines');
    return saved ? JSON.parse(saved) : [
      { id: 1, emoji: '🌅', name: '刷牙', duration: 120, completed: false },
      { id: 2, emoji: '🍳', name: '食早餐', duration: 900, completed: false },
      { id: 3, emoji: '👔', name: '換衫', duration: 300, completed: false },
    ];
  });

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('adhd-coins');
    return saved ? parseInt(saved) : 0;
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ emoji: '⭐', name: '', duration: 300 });

  // Lucky Draw Wheels State
  const [wheels, setWheels] = useState(() => {
    const saved = localStorage.getItem('adhd-wheels');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Wheel A', items: ['做功課\n溫書\n休息下'] },
      { id: 2, name: 'Wheel B', items: [''] },
      { id: 3, name: 'Wheel C', items: [''] }
    ];
  });
  const [activeWheelId, setActiveWheelId] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('');
  const [showWheels, setShowWheels] = useState(false);

  const intervalRef = useRef(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('adhd-routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('adhd-coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('adhd-wheels', JSON.stringify(wheels));
  }, [wheels]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTaskComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // Voice notification
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-HK';
      speechSynthesis.speak(utterance);
    }
  };

  const startTask = (index) => {
    setCurrentTaskIndex(index);
    setTimeLeft(routines[index].duration);
    setIsRunning(true);
    speak(`開始${routines[index].name}`);
  };

  const handleTaskComplete = () => {
    const updatedRoutines = [...routines];
    updatedRoutines[currentTaskIndex].completed = true;
    setRoutines(updatedRoutines);
    setCoins(prev => prev + 10);
    setIsRunning(false);
    
    speak('完成喇！攞咗10個金幣');
    
    if (currentTaskIndex < routines.length - 1) {
      setTimeout(() => startTask(currentTaskIndex + 1), 2000);
    } else {
      speak('全部完成！你好勁呀');
    }
  };

  const togglePause = () => setIsRunning(!isRunning);

  const resetRoutine = () => {
    setRoutines(routines.map(r => ({ ...r, completed: false })));
    setCurrentTaskIndex(0);
    setTimeLeft(0);
    setIsRunning(false);
  };

  const addTask = () => {
    if (newTask.name.trim()) {
      setRoutines([...routines, { ...newTask, id: Date.now(), completed: false }]);
      setNewTask({ emoji: '⭐', name: '', duration: 300 });
      setShowAddTask(false);
    }
  };

  const deleteTask = (id) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  const getTimerColor = () => {
    if (!routines[currentTaskIndex]) return 'bg-gray-300';
    const percentage = (timeLeft / routines[currentTaskIndex].duration) * 100;
    if (percentage > 50) return 'bg-green-400';
    if (percentage > 20) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Lucky Draw Functions
  const getActiveWheel = () => wheels.find(w => w.id === activeWheelId);

  const spinWheel = () => {
    const wheel = getActiveWheel();
    const items = wheel.items[0].split('\n').filter(i => i.trim());
    if (items.length === 0) return;

    setSpinning(true);
    setResult('');
    
    setTimeout(() => {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setResult(randomItem);
      setSpinning(false);
      speak(`抽到${randomItem}`);
    }, 2000);
  };

  const updateWheelItems = (wheelId, text) => {
    setWheels(wheels.map(w => 
      w.id === wheelId ? { ...w, items: [text] } : w
    ));
  };

  const addWheel = () => {
    const newId = Math.max(...wheels.map(w => w.id)) + 1;
    setWheels([...wheels, { id: newId, name: `Wheel ${String.fromCharCode(64 + newId)}`, items: [''] }]);
  };

  const deleteWheel = (id) => {
    if (wheels.length > 1) {
      setWheels(wheels.filter(w => w.id !== id));
      if (activeWheelId === id) setActiveWheelId(wheels[0].id);
    }
  };

  const renameWheel = (id, newName) => {
    setWheels(wheels.map(w => w.id === id ? { ...w, name: newName } : w));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            ⏰ ADHD Time Blindness Killer
          </h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold text-xl flex items-center gap-2 shadow-lg">
              <Coins className="w-6 h-6" />
              {coins} 金幣
            </div>
            <button
              onClick={() => setShowWheels(!showWheels)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
            >
              🎰 Lucky Draw
            </button>
          </div>
        </div>

        {/* Main Content */}
        {!showWheels ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Task Display */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">而家做緊</h2>
              
              {routines[currentTaskIndex] ? (
                <div className="text-center">
                  <div className="text-9xl mb-4">{routines[currentTaskIndex].emoji}</div>
                  <h3 className="text-4xl font-bold text-gray-800 mb-6">
                    {routines[currentTaskIndex].name}
                  </h3>
                  
                  {/* Visual Timer */}
                  <div className="mb-6">
                    <div className={`text-7xl font-black ${getTimerColor().replace('bg-', 'text-')} mb-4`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div 
                        className={`h-full ${getTimerColor()} transition-all duration-1000`}
                        style={{ width: `${(timeLeft / routines[currentTaskIndex].duration) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-4 justify-center">
                    {!isRunning && timeLeft === 0 && (
                      <button
                        onClick={() => startTask(currentTaskIndex)}
                        className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-xl flex items-center gap-2 hover:bg-green-600 shadow-lg"
                      >
                        <Play className="w-6 h-6" /> 開始
                      </button>
                    )}
                    
                    {timeLeft > 0 && (
                      <>
                        <button
                          onClick={togglePause}
                          className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl flex items-center gap-2 hover:bg-blue-600 shadow-lg"
                        >
                          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                          {isRunning ? '暫停' : '繼續'}
                        </button>
                        
                        <button
                          onClick={handleTaskComplete}
                          className="bg-purple-500 text-white px-8 py-4 rounded-full font-bold text-xl flex items-center gap-2 hover:bg-purple-600 shadow-lg"
                        >
                          <Check className="w-6 h-6" /> 完成
                        </button>
                      </>
                    )}
                  </div>

                  {/* Next Task Preview */}
                  {currentTaskIndex < routines.length - 1 && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-2xl">
                      <p className="text-gray-600 font-semibold mb-2">下一個係</p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl">{routines[currentTaskIndex + 1].emoji}</span>
                        <span className="text-xl font-bold text-gray-800">
                          {routines[currentTaskIndex + 1].name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-xl">加啲task先啦！</p>
                </div>
              )}
            </div>

            {/* Routine List */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">今日Routine</h2>
                <div className="flex gap-2">
                  <button
                    onClick={resetRoutine}
                    className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-orange-600"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4" /> 加Task
                  </button>
                </div>
              </div>

              {/* Add Task Form */}
              {showAddTask && (
                <div className="mb-4 p-4 bg-green-50 rounded-2xl">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Emoji"
                      value={newTask.emoji}
                      onChange={(e) => setNewTask({ ...newTask, emoji: e.target.value })}
                      className="w-20 px-3 py-2 rounded-lg border-2 border-green-300 text-center text-2xl"
                      maxLength={2}
                    />
                    <input
                      type="text"
                      placeholder="Task名"
                      value={newTask.name}
                      onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-green-300"
                    />
                    <input
                      type="number"
                      placeholder="秒"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 0 })}
                      className="w-24 px-3 py-2 rounded-lg border-2 border-green-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addTask}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600"
                    >
                      加
                    </button>
                    <button
                      onClick={() => setShowAddTask(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-400"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* Task List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {routines.map((task, index) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${
                      index === currentTaskIndex 
                        ? 'bg-gradient-to-r from-purple-200 to-pink-200 shadow-lg scale-105' 
                        : task.completed 
                        ? 'bg-green-100 opacity-60' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-4xl">{task.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{task.name}</h3>
                      <p className="text-sm text-gray-600">{formatTime(task.duration)}</p>
                    </div>
                    {task.completed && (
                      <div className="text-green-600">
                        <Check className="w-6 h-6" />
                      </div>
                    )}
                    {!isRunning && (
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {routines.every(r => r.completed) && routines.length > 0 && (
                <div className="mt-6 p-6 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-2xl text-center">
                  <div className="text-6xl mb-3">🎉</div>
                  <h3 className="text-2xl font-black text-gray-800">全部搞掂！</h3>
                  <p className="text-lg text-gray-700">攞咗 {routines.length * 10} 金幣！</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Lucky Draw Wheels */
          <div className="grid md:grid-cols-3 gap-6">
            {/* Wheels List */}
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Wheels清單</h2>
                <button
                  onClick={addWheel}
                  className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {wheels.map(wheel => (
                  <div
                    key={wheel.id}
                    className={`p-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                      activeWheelId === wheel.id 
                        ? 'bg-purple-200 shadow-md' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveWheelId(wheel.id)}
                  >
                    <input
                      type="text"
                      value={wheel.name}
                      onChange={(e) => renameWheel(wheel.id, e.target.value)}
                      className="flex-1 bg-transparent font-semibold outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {wheels.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWheel(wheel.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Wheel */}
            <div className="md:col-span-2 bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{getActiveWheel()?.name}</h2>
              
              {/* Input Area */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  選項（一行一個）
                </label>
                <textarea
                  value={getActiveWheel()?.items[0] || ''}
                  onChange={(e) => updateWheelItems(activeWheelId, e.target.value)}
                  className="w-full h-40 p-4 border-2 border-purple-300 rounded-xl resize-none font-mono"
                  placeholder="做功課&#10;溫書&#10;休息下&#10;打機"
                />
              </div>

              {/* Spin Button */}
              <button
                onClick={spinWheel}
                disabled={spinning}
                className={`w-full py-6 rounded-2xl font-black text-2xl transition-all ${
                  spinning
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105'
                }`}
              >
                {spinning ? (
                  <span className="animate-pulse">🎰 抽緊...</span>
                ) : (
                  '🎲 抽一個！'
                )}
              </button>

              {/* Result Display */}
              {result && (
                <div className="mt-6 p-8 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-2xl text-center animate-bounce">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-3xl font-black text-gray-800 mb-2">抽到：</h3>
                  <p className="text-4xl font-black text-purple-600">{result}</p>
                  <p className="mt-4 text-lg text-gray-700 font-semibold">而家去做啦！💪</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 font-semibold pb-6">
          By Acry CEO | Made with 🔥 without Caffeine
        </div>
      </div>
    </div>
  );
};

