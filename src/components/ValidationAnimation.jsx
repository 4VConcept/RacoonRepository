// src/components/ValidationAnimation.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import { useEffect } from 'react';

export default function ValidationAnimation({ visible, onFinish, numeroCommande, texte }) {
  useEffect(() => {
    if (visible) {
      // ✅ Appel de onFinish rapide après un court délai visuel
      const timeout = setTimeout(onFinish, 0); // délai court : 0.8s
      return () => clearTimeout(timeout);
    }
  }, [visible, onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.1 }}
            transition={{ duration: 0 }}
            className="text-center text-white"
          >
            <FiCheckCircle className="text-green-400 text-5xl mx-auto mb-3 animate-bounce" />
            <h1 className="text-2xl font-bold mb-1">Commande enregistrée ✅</h1>
            {texte && <p className="text-sm text-gray-300">{texte}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
