import React from 'react';

const ResumeScore = ({ score, suggestions = [], isLoading = false }) => {
  const getScoreColor = (score) => {
    if (score >= 71) return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' };
    if (score >= 41) return { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' };
    return { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' };
  };

  const colors = getScoreColor(score);

  const getScoreLabel = (score) => {
    if (score >= 71) return 'Excellent';
    if (score >= 41) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className={`border-2 ${colors.border} ${colors.bg} rounded-3xl p-6 mb-6 w-full`}> 
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Resume Score</h3>
        {isLoading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <span className={`text-5xl font-bold ${colors.text}`}>{score}%</span>
          <span className={`text-lg font-medium ${colors.text}`}>{getScoreLabel(score)}</span>
        </div>
        <div className="w-24 h-24 sm:w-28 sm:h-28">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${2.827 * score} 282.7`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className={colors.text}
            />
            <text x="50" y="60" textAnchor="middle" className={`${colors.text} font-bold text-2xl`}>
              {score}%
            </text>
          </svg>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-current border-opacity-20">
          <h4 className="font-semibold text-gray-700 mb-3">💡 Suggestions to Improve</h4>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="break-words">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumeScore;
