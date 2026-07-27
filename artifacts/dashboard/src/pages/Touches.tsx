import React, { useState } from 'react';
import { useGetDashboardTouches } from '@workspace/api-client-react';
import { getAuthHeaders } from '../lib/api';
import { Skeleton } from '../components/ui';
import { Image as ImageIcon, X, MapPin } from 'lucide-react';
import { safeFormat } from '../lib/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Touches() {
  const { data: touches, isLoading } = useGetDashboardTouches({
    request: { headers: getAuthHeaders() }
  });
  
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Delivery Proofs</h1>
        <p className="text-muted-foreground text-sm mt-1">Vouches and drops uploaded by members.</p>
      </div>

      {isLoading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <Skeleton className={`w-full rounded-lg ${i % 2 === 0 ? 'h-64' : 'h-48'}`} />
            </div>
          ))}
        </div>
      ) : !touches || touches.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center text-center bg-card/20">
          <ImageIcon className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">No vouches yet</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm">
            When members upload photos of their deliveries, they will appear here in the gallery.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {touches.map((touch) => (
            <div 
              key={touch.id} 
              className="break-inside-avoid relative group rounded-lg overflow-hidden border border-border/50 bg-card cursor-pointer"
              onClick={() => setSelectedPhoto(touch.photoUrl)}
            >
              <img 
                src={touch.photoUrl} 
                alt={`Delivery by ${touch.discordUsername}`}
                className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="flex items-center gap-2 text-white font-medium">
                  <span>{touch.discordUsername}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-white/70">
                  <span>{safeFormat(touch.createdAt, "MMM d, yyyy")}</span>
                  {touch.note && (
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">
                      <MapPin className="w-3 h-3" /> Note
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setSelectedPhoto(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedPhoto} 
              alt="Full size delivery proof" 
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
