import { createGlobalStyle } from '@emotion/styled';

export const GlobalStyles = createGlobalStyle`
   *{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Roboto', 'Arial', sans-serif;
    line-height: 1.6;
    color: #003049;
    background-color: #FDFOD5;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #780000;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #A52A2A;
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid #780000;
    outline-offset: 2px;
  }

  /* Link styles */
  a {
    color: #780000;
    text-decoration: none;
    transition: color 0.2s ease-in-out;
  }

  a:hover {
    color: #A52A2A;
    text-decoration: underline;
  }

  /* Button focus styles */
  button:focus {
    outline: 2px solid #780000;
    outline-offset: 2px;
  }

  /* Custom animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -10px, 0);
    }
    70% {
      transform: translate3d(0, -5px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }

  .fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }

  .slideIn {
    animation: slideIn 0.3s ease-in-out;
  }

  .bounce {
    animation: bounce 1s ease-in-out;
  }

  /* Print styles */
  @media print {
    body {
      background: white !important;
      color: black !important;
    }
    
    .no-print {
      display: none !important;
    }
    
    .print-break {
      page-break-after: always;
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    body {
      background: white;
      color: black;
    }
    
    a {
      color: #0000EE;
    }
    
    a:visited {
      color: #551A8B;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default GlobalStyles;
