// src/components/ValidationAnimation.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function ValidationAnimation({ visible, onFinish, numeroCommande }) {
  useEffect(() => {
    if (visible) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      setTimeout(onFinish, duration + 500);
    }
  }, [visible, onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-center text-white"
          >
            <FiCheckCircle className="text-green-400 text-6xl mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold mb-2">Commande N° {numeroCommande}  ✅</h1>
            <p className="text-lg text-gray-200">Mise en préparation… Merci !</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
