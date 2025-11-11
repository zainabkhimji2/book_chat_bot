import React from 'react';

interface QuizSimulatorProps {
  chapterId: string; // e.g., 'chapter1', 'chapter2'
  onQuizComplete: (chapterId: string, score: number) => void;
}

const QuizSimulator: React.FC<QuizSimulatorProps> = ({ chapterId, onQuizComplete }) => {
  const simulateQuiz = () => {
    const score = Math.floor(Math.random() * (100 - 70 + 1)) + 70; // Simulate score between 70 and 100
    onQuizComplete(chapterId, score);
    alert(`Simulated quiz for ${chapterId} with score: ${score}%`);
  };

  return (
    <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h4>Simulate Quiz for {chapterId.replace('-', ' ').toUpperCase()}</h4>
      <p>Click the button below to simulate completing a quiz for this chapter.</p>
      <button onClick={simulateQuiz} style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        Simulate Quiz
      </button>
    </div>
  );
};

export default QuizSimulator;
