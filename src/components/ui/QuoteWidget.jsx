import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
  { text: "The obstacle is the way.", author: "Marcus Aurelius" },
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Your only limit is you.", author: "Unknown" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius" },
  { text: "Self-discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Pain is temporary. Quitting lasts forever.", author: "Lance Armstrong" },
  { text: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius" },
  { text: "Amor Fati: Love your fate, which is in fact your life.", author: "Friedrich Nietzsche" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" }
];

const QuoteWidget = () => {
  const [quote, setQuote] = useState(QUOTES[0]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Select a random quote on mount
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
    setIndex(randomIndex);

    // Optional: Rotate every 30 seconds
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % QUOTES.length;
        setQuote(QUOTES[next]);
        return next;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="quote-widget">
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.text}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.5 }}
          className="quote-widget__content"
        >
          <Quote size={14} className="quote-widget__icon" />
          <div className="quote-widget__text-group">
            <p className="quote-widget__text">"{quote.text}"</p>
            <span className="quote-widget__author">— {quote.author}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuoteWidget;
