import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Flame, ShieldCheck, AlertTriangle, Loader, RotateCcw } from 'lucide-react';

/**
 * FirePhotoCapture — Camera/upload component for fire emergency verification.
 * 
 * Flow:
 *  1. Citizen opens camera or picks a file
 *  2. Image preview is shown
 *  3. On "Analyze" → image sent to AI → result displayed
 *  4. If fire detected → callback triggers auto-dispatch
 *  5. If not detected → warning shown with manual submit option
 */
export default function FirePhotoCapture({ onFireDetected, onManualSubmit, onCancel, analyzing, setAnalyzing }) {
  const [image, setImage] = useState(null);         // { file: File, preview: string }
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState(null);        // AI analysis result
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      // Fallback to file picker
      fileInputRef.current?.click();
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'fire-photo.jpg', { type: 'image/jpeg' });
      const preview = canvas.toDataURL('image/jpeg');
      setImage({ file, preview });
      stopCamera();
    }, 'image/jpeg', 0.85);
  }, [stopCamera]);

  // Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setImage({ file, preview });
    setResult(null);
  };

  // Send image for AI analysis
  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', image.file);

      // onFireDetected will handle sending to backend and getting result
      const aiResult = await onFireDetected(formData);
      setResult(aiResult);
    } catch (err) {
      setResult({
        fire_detected: false,
        confidence: 0,
        details: 'Analysis failed: ' + (err.message || 'Unknown error'),
        error: true,
      });
    }
    setAnalyzing(false);
  };

  // Reset to take another photo
  const handleRetake = () => {
    setImage(null);
    setResult(null);
    if (image?.preview) URL.revokeObjectURL(image.preview);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(244,42,65,0.04), rgba(255,140,0,0.04))',
        border: '1px solid rgba(244,42,65,0.15)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,100,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={18} color="#FF6400" />
          </div>
          <div>
            <h3 style={{
              fontSize: '15px', fontWeight: 700, color: '#f1f5f9', margin: 0,
              fontFamily: "'Poppins', sans-serif",
            }}>
              Fire Verification
            </h3>
            <span style={{ fontSize: '11px', color: '#8899AA' }}>
              Upload a photo to verify fire
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
            fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          <X size={12} /> Back
        </motion.button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <AnimatePresence mode="wait">
        {/* Camera view */}
        {cameraActive && !image && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{
              position: 'relative', borderRadius: '12px', overflow: 'hidden',
              marginBottom: '12px', background: '#000',
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', borderRadius: '12px', display: 'block' }}
              />
              {/* Scanning overlay */}
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', left: 0, right: 0, height: '2px',
                  background: 'linear-gradient(90deg, transparent, #FF6400, transparent)',
                  boxShadow: '0 0 15px rgba(255,100,0,0.5)',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={capturePhoto}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #FF6400, #F42A41)',
                  border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <Camera size={16} /> Capture Photo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={stopCamera}
                style={{
                  padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontSize: '13px', fontWeight: 600,
                }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* No image yet — show capture/upload buttons */}
        {!cameraActive && !image && (
          <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{
              padding: '30px 20px', borderRadius: '12px', textAlign: 'center',
              background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,100,0,0.2)',
              marginBottom: '12px',
            }}>
              <Flame size={36} color="rgba(255,100,0,0.4)" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '13px', color: '#8899AA', margin: '0 0 16px', lineHeight: 1.5 }}>
                Take a photo or upload an image of the fire to verify and get instant dispatch
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={startCamera}
                  style={{
                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #FF6400, #F42A41)',
                    border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <Camera size={14} /> Camera
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,100,0,0.25)',
                    color: '#FF6400', fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <Upload size={14} /> Upload
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Image preview + analysis */}
        {image && (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {/* Image preview */}
            <div style={{
              position: 'relative', borderRadius: '12px', overflow: 'hidden',
              marginBottom: '12px',
            }}>
              <img
                src={image.preview}
                alt="Fire verification"
                style={{
                  width: '100%', borderRadius: '12px', display: 'block',
                  maxHeight: '200px', objectFit: 'cover',
                }}
              />

              {/* Analyzing overlay */}
              {analyzing && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '12px',
                    background: 'rgba(0,0,0,0.7)', display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader size={32} color="#FF6400" />
                  </motion.div>
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                      color: '#FF6400', fontSize: '13px', fontWeight: 700, marginTop: '10px',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Analyzing for fire...
                  </motion.p>
                  {/* Scanning line */}
                  <motion.div
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', left: '10%', right: '10%', height: '2px',
                      background: 'linear-gradient(90deg, transparent, #FF6400, transparent)',
                      boxShadow: '0 0 20px rgba(255,100,0,0.6)',
                    }}
                  />
                </motion.div>
              )}

              {/* Result overlay */}
              {result && !analyzing && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '12px',
                    background: result.fire_detected
                      ? 'linear-gradient(to top, rgba(244,42,65,0.9), transparent)'
                      : 'linear-gradient(to top, rgba(16,185,129,0.9), transparent)',
                  }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    color: '#fff', fontSize: '14px', fontWeight: 700,
                  }}>
                    {result.fire_detected ? <Flame size={18} /> : <ShieldCheck size={18} />}
                    {result.fire_detected ? '🔥 FIRE DETECTED' : '✅ No Fire Detected'}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Result details card */}
            {result && !analyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '14px', borderRadius: '12px', marginBottom: '12px',
                  background: result.fire_detected
                    ? 'rgba(244,42,65,0.08)'
                    : 'rgba(16,185,129,0.08)',
                  border: `1px solid ${result.fire_detected ? 'rgba(244,42,65,0.2)' : 'rgba(16,185,129,0.2)'}`,
                }}
              >
                {/* Confidence bar */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', marginBottom: '6px',
                  }}>
                    <span style={{ fontSize: '11px', color: '#8899AA', fontWeight: 600 }}>
                      AI Confidence
                    </span>
                    <span style={{
                      fontSize: '12px', fontWeight: 800,
                      color: result.fire_detected ? '#F42A41' : '#10b981',
                    }}>
                      {Math.round((result.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <div style={{
                    height: '6px', borderRadius: '3px',
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((result.confidence || 0) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{
                        height: '100%', borderRadius: '3px',
                        background: result.fire_detected
                          ? 'linear-gradient(90deg, #FF6400, #F42A41)'
                          : 'linear-gradient(90deg, #10b981, #34d399)',
                      }}
                    />
                  </div>
                </div>

                <p style={{
                  fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5,
                }}>
                  {result.details}
                </p>

                {/* Fire detected — emergency auto-created */}
                {result.fire_detected && result.emergency_created && (
                  <div style={{
                    marginTop: '10px', padding: '10px', borderRadius: '8px',
                    background: 'rgba(244,42,65,0.1)', border: '1px solid rgba(244,42,65,0.2)',
                    fontSize: '12px', color: '#F42A41', fontWeight: 600, textAlign: 'center',
                  }}>
                    🚒 Emergency dispatched as CRITICAL! Fire responders are being notified.
                  </div>
                )}

                {/* No fire — allow manual submit */}
                {!result.fire_detected && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      marginBottom: '10px', fontSize: '11px', color: '#f59e0b',
                    }}>
                      <AlertTriangle size={13} />
                      <span>No fire detected. You can still submit if you believe there is a fire.</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={onManualSubmit}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer',
                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                        color: '#f59e0b', fontSize: '12px', fontWeight: 700,
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      Submit Anyway (Manual Review)
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action buttons — when no result yet */}
            {!result && !analyzing && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #FF6400, #F42A41)',
                    border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: '0 4px 20px rgba(255,100,0,0.3)',
                  }}
                >
                  <Flame size={16} /> Analyze for Fire
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleRetake}
                  style={{
                    padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  <RotateCcw size={14} /> Retake
                </motion.button>
              </div>
            )}

            {/* Retake button when showing results */}
            {result && !analyzing && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleRetake}
                style={{
                  width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#8899AA', fontSize: '12px', fontWeight: 600, marginTop: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <RotateCcw size={13} /> Take Another Photo
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
