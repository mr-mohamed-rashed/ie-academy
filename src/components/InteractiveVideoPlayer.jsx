import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const InteractiveVideoPlayer = ({ session, lang, onClose }) => {
  const [chatMessages, setMessages] = useState([
    { id: 1, sender: 'ai', text: lang === 'ar' ? `مرحباً بك في حصة "${session.titleAr}". أنا مساعدك الذكي، يمكنك سؤالي عن أي جزء غير واضح في الشرح.` : `Welcome to "${session.titleEn}". I am your AI assistant. Feel free to ask me anything about the lesson.` }
  ]);
  const [inputText, setInputText] = useState('');
  
  // Interactive Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const chatEndRef = useRef(null);

  const t = {
    en: {
      chatTitle: "AI Teacher Assistant",
      inputPlaceholder: "Type your question here...",
      sendBtn: "Send",
      quizTitle: "Knowledge Check!",
      quizDesc: "To ensure you understand this segment, please answer the following question before continuing.",
      quizQuestion: `Based on the current topic in ${session.titleEn}, what is the main takeaway?`,
      options: [
        "The core concept discussed by the instructor.", // correct
        "An unrelated historical fact.",
        "A mathematical formula not mentioned.",
        "None of the above."
      ],
      submitQuiz: "Submit Answer",
      quizSuccess: "Correct! You may continue watching.",
      quizFail: "Incorrect. Please re-watch this segment carefully.",
      rewatchBtn: "Re-watch Segment"
    },
    ar: {
      chatTitle: "مساعد المعلم الذكي",
      inputPlaceholder: "اكتب سؤالك هنا...",
      sendBtn: "إرسال",
      quizTitle: "اختبار الفهم السريع!",
      quizDesc: "للتأكد من استيعابك لهذا الجزء، يرجى الإجابة على السؤال التالي قبل استكمال الفيديو.",
      quizQuestion: `بناءً على الشرح الحالي في حصة "${session.titleAr}"، ما هي النقطة الأساسية؟`,
      options: [
        "المفهوم الأساسي الذي شرحه المدرس للتو.", // correct
        "حقيقة تاريخية غير متعلقة بالدرس.",
        "معادلة رياضية لم يتم ذكرها.",
        "لا شيء مما سبق."
      ],
      submitQuiz: "تأكيد الإجابة",
      quizSuccess: "إجابة صحيحة! يمكنك متابعة المشاهدة.",
      quizFail: "إجابة خاطئة. يرجى إعادة مشاهدة هذا الجزء بتركيز.",
      rewatchBtn: "إعادة مشاهدة الجزء"
    }
  }[lang];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate video pause for a pop-up quiz after a short delay (e.g. 8 seconds for demo)
  useEffect(() => {
    if (quizPassed) return;
    const timer = setTimeout(() => {
      setShowQuiz(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [quizPassed]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'student', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulate AI thinking and response
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: lang === 'ar' 
          ? `هذا سؤال ممتاز! بناءً على ما تم شرحه، الإجابة هي أن هذه النقطة تعتمد على المفاهيم الأساسية للدرس. هل هناك شيء آخر تود توضيحه؟` 
          : `Great question! Based on the lecture, the answer relies on the core principles we just discussed. Would you like me to elaborate?`
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === 0) {
      // Correct (index 0 is the correct one in our mock data)
      setQuizPassed(true);
      setQuizError(false);
    } else {
      setQuizError(true);
    }
  };

  const handleRewatch = () => {
    // In a real app, this would seek the video back X seconds.
    setShowQuiz(false);
    setQuizError(false);
    setSelectedAnswer(null);
    // Re-trigger quiz after another delay
    setTimeout(() => setShowQuiz(true), 8000);
  };

  return (
    <div className="interactive-player-container" style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 350px', 
      gap: '1.5rem', 
      marginBottom: '2rem',
      backgroundColor: 'var(--bg-glass)',
      borderRadius: '20px',
      padding: '1.5rem',
      border: '1px solid var(--border-glass)',
      animation: 'slide-in 0.3s ease-out'
    }}>
      
      {/* Video Section */}
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
        
        {/* The iFrame Video */}
        <div className="session-video-wrapper" style={{ flexGrow: 1, position: 'relative', minHeight: '400px' }}>
          <iframe 
            src={session.videoUrl} 
            title="Lecture Player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none', filter: showQuiz ? 'blur(4px) brightness(0.5)' : 'none', transition: 'all 0.3s ease' }}
          ></iframe>
        </div>

        {/* Interactive Quiz Overlay */}
        {showQuiz && !quizPassed && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 10
          }}>
            <div className="glass-card" style={{ 
              width: '90%', maxWidth: '500px', 
              padding: '2rem', 
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--accent-primary)',
              animation: 'slide-in 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                <AlertCircle size={24} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.quizTitle}</h3>
              </div>
              
              {!quizError ? (
                <>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t.quizDesc}</p>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{t.quizQuestion}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {t.options.map((opt, idx) => (
                         <label key={idx} style={{
                           display: 'flex', alignItems: 'center', gap: '0.75rem',
                           padding: '0.75rem 1rem', borderRadius: '8px',
                           backgroundColor: selectedAnswer === idx ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                           border: `1px solid ${selectedAnswer === idx ? 'var(--accent-purple)' : 'transparent'}`,
                           cursor: 'pointer', transition: 'all 0.2s'
                         }}>
                           <input 
                             type="radio" 
                             name="quizOption" 
                             checked={selectedAnswer === idx} 
                             onChange={() => setSelectedAnswer(idx)}
                             style={{ accentColor: 'var(--accent-purple)' }}
                           />
                           <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                         </label>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="btn-primary" 
                    onClick={handleQuizSubmit}
                    disabled={selectedAnswer === null}
                    style={{ width: '100%', opacity: selectedAnswer === null ? 0.5 : 1 }}
                  >
                    {t.submitQuiz}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <XCircle size={48} color="var(--accent-red)" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--accent-red)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{t.quizFail}</h4>
                  <button className="btn-primary" onClick={handleRewatch} style={{ width: '100%', marginTop: '1.5rem', backgroundColor: 'var(--accent-red)' }}>
                    {t.rewatchBtn}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Success Overlay after passing quiz briefly */}
        {quizPassed && showQuiz && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(16, 185, 129, 0.9)',
            zIndex: 10,
            animation: 'fade-out 2s forwards'
          }} onAnimationEnd={() => setShowQuiz(false)}>
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <CheckCircle size={64} style={{ margin: '0 auto 1rem' }} />
              <h2>{t.quizSuccess}</h2>
            </div>
          </div>
        )}

      </div>

      {/* AI Chat Sidebar */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid var(--border-glass)',
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'rgba(139, 92, 246, 0.1)', 
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.chatTitle}</h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>● Online</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ 
          flexGrow: 1, 
          padding: '1rem', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {chatMessages.map(msg => (
            <div key={msg.id} style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              alignItems: 'flex-start',
              flexDirection: msg.sender === 'student' ? 'row-reverse' : 'row'
            }}>
              <div style={{ 
                minWidth: '28px', height: '28px', borderRadius: '50%', 
                backgroundColor: msg.sender === 'student' ? 'var(--color-gold)' : 'var(--accent-purple)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {msg.sender === 'student' ? <User size={14} color="#fff"/> : <Bot size={14} color="#fff" />}
              </div>
              <div style={{ 
                backgroundColor: msg.sender === 'student' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                borderTopRightRadius: msg.sender === 'student' ? '2px' : '12px',
                borderTopLeftRadius: msg.sender === 'ai' ? '2px' : '12px',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                color: 'var(--text-primary)',
                maxWidth: '85%'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} style={{ 
          padding: '1rem', 
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="form-control"
            style={{ padding: '0.6rem', fontSize: '0.85rem', borderRadius: '20px' }}
          />
          <button type="submit" style={{
            background: 'var(--accent-primary)',
            border: 'none',
            borderRadius: '50%',
            width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            flexShrink: 0
          }}>
            <Send size={16} style={{ marginLeft: lang === 'en' ? '2px' : 0, marginRight: lang === 'ar' ? '2px' : 0 }} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default InteractiveVideoPlayer;
