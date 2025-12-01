
import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  speed = 15, // ms per char
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  
  // Use a ref for the callback so changes to the function identity don't restart the effect
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Reset animation logic
    indexRef.current = 0;
    setDisplayedText('');
    
    const animate = () => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
        timerRef.current = window.setTimeout(animate, speed);
      } else {
        // Animation finished
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    timerRef.current = window.setTimeout(animate, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed]); // Removed onComplete from dependencies to prevent restarts

  return <span>{displayedText}</span>;
};
