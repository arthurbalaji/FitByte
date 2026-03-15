import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, ZoomIn, Download, Eye } from 'lucide-react';

// Gemini API configuration
const GEMINI_API_KEY = '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';

const ANGLES = [
  { id: 'front', label: 'Front View', position: 'photographed directly from the front, camera facing the chest/torso area, buttons and front details clearly visible' },
  { id: 'back', label: 'Back View', position: 'photographed directly from behind, camera facing the back of the garment, showing the back panel and rear details' },
  { id: 'left', label: 'Left Side', position: 'photographed from the LEFT side at 90 degrees, camera positioned to the left of the garment looking at the left sleeve and left side seam' },
  { id: 'right', label: 'Right Side', position: 'photographed from the RIGHT side at 90 degrees, camera positioned to the right of the garment looking at the right sleeve and right side seam' },
];

// Helper to generate consistent dress description
const generateDressDescription = (clothingType, fabricName, fabricColor, patternName, gender) => {
  const colorName = getColorName(fabricColor);
  const patternDesc = patternName?.toLowerCase() === 'solid' ? '' : `with ${patternName?.toLowerCase()} pattern`;
  
  // Gender-specific clothing descriptions
  const genderPrefix = gender === 'male' ? "men's" : gender === 'female' ? "women's" : "children's";
  
  // Clothing type specific descriptions
  const clothingDescriptions = {
    // Male
    'Shirt': `${genderPrefix} formal dress shirt`,
    'Pant': `${genderPrefix} formal trousers`,
    'Kurta': `${genderPrefix} traditional Indian kurta`,
    'Suit': `${genderPrefix} business suit with blazer and trousers`,
    'Blazer': `${genderPrefix} formal blazer jacket`,
    'Sherwani': `${genderPrefix} traditional Indian sherwani with embroidery`,
    // Female
    'Blouse': `${genderPrefix} elegant blouse`,
    'Salwar': `${genderPrefix} traditional salwar kameez set`,
    'Lehenga': `${genderPrefix} traditional bridal lehenga with embroidery`,
    'Dress': `${genderPrefix} elegant dress`,
    'Kurti': `${genderPrefix} Indian kurti tunic`,
    'Saree Blouse': `${genderPrefix} saree blouse choli`,
    // Kids
    'School Uniform': `${genderPrefix} school uniform set`,
    'Casual Wear': `${genderPrefix} casual outfit`,
    'Party Wear': `${genderPrefix} party dress outfit`,
    'Ethnic Wear': `${genderPrefix} traditional ethnic outfit`,
  };
  
  const clothingDesc = clothingDescriptions[clothingType] || `${genderPrefix} ${clothingType?.toLowerCase()}`;
  
  return {
    type: clothingDesc,
    fabric: fabricName?.toLowerCase() || 'cotton',
    color: colorName,
    pattern: patternDesc,
    full: `${clothingDesc} made of ${fabricName?.toLowerCase() || 'cotton'} fabric in ${colorName} color ${patternDesc}`.trim()
  };
};

// Convert hex to color name
const getColorName = (hexCode) => {
  if (!hexCode) return 'blue';
  
  const colorMap = {
    '#FF0000': 'red', '#ff0000': 'red',
    '#00FF00': 'green', '#00ff00': 'green',
    '#0000FF': 'blue', '#0000ff': 'blue',
    '#FFFFFF': 'white', '#ffffff': 'white',
    '#000000': 'black',
    '#FFFF00': 'yellow', '#ffff00': 'yellow',
    '#FFA500': 'orange', '#ffa500': 'orange',
    '#800080': 'purple', '#800080': 'purple',
    '#FFC0CB': 'pink', '#ffc0cb': 'pink',
    '#A52A2A': 'brown', '#a52a2a': 'brown',
    '#808080': 'gray', '#808080': 'grey',
    '#000080': 'navy blue', '#000080': 'navy',
    '#800000': 'maroon',
    '#008080': 'teal',
    '#4a90d9': 'sky blue',
    '#C0C0C0': 'silver', '#c0c0c0': 'silver',
    '#FFD700': 'gold', '#ffd700': 'gold',
    '#F5F5DC': 'beige', '#f5f5dc': 'beige',
    '#00FFFF': 'cyan', '#00ffff': 'cyan',
    '#FF00FF': 'magenta', '#ff00ff': 'magenta',
  };
  
  if (colorMap[hexCode]) return colorMap[hexCode];
  
  // Parse RGB and describe color
  const r = parseInt(hexCode.slice(1, 3), 16);
  const g = parseInt(hexCode.slice(3, 5), 16);
  const b = parseInt(hexCode.slice(5, 7), 16);
  
  if (r > 200 && g > 200 && b > 200) return 'light colored';
  if (r < 50 && g < 50 && b < 50) return 'dark colored';
  if (r > g && r > b) return 'reddish';
  if (g > r && g > b) return 'greenish';
  if (b > r && b > g) return 'bluish';
  
  return 'colored';
};

const GeminiDressPreview = ({ 
  gender = 'male', 
  clothingType = 'Shirt', 
  fabricColor = '#4a90d9', 
  patternName = 'solid', 
  fabricName = 'Cotton' 
}) => {
  const [images, setImages] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const [loading, setLoading] = useState({
    front: false,
    back: false,
    left: false,
    right: false,
  });
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  // Track previous props to detect changes
  const prevPropsRef = useRef({ gender, clothingType, fabricColor, patternName, fabricName });

  // Generate image using Gemini API
  const generateImage = useCallback(async (angle, dressDesc) => {
    const patternDetail = patternName?.toLowerCase() === 'solid' 
      ? 'solid color with no patterns or prints, uniform single color throughout'
      : patternName?.toLowerCase() === 'striped'
      ? 'vertical stripes pattern running from top to bottom'
      : patternName?.toLowerCase() === 'checked'
      ? 'checked/checkered square pattern'
      : patternName?.toLowerCase() === 'polka'
      ? 'polka dot pattern with small circular dots'
      : `${patternName?.toLowerCase()} pattern`;

    const designFingerprint = [
      `garment_type=${dressDesc.type}`,
      `fabric=${dressDesc.fabric}`,
      `color_name=${dressDesc.color}`,
      `color_hex=${fabricColor}`,
      `pattern=${patternDetail}`,
      `gender=${gender}`,
    ].join('; ');

    const orientationRule = angle.id === 'left'
      ? 'LEFT VIEW LOCK: show only the garment\'s LEFT profile. The front of the garment must point toward the RIGHT side of the frame. Do NOT mirror this view.'
      : angle.id === 'right'
      ? 'RIGHT VIEW LOCK: show only the garment\'s RIGHT profile. The front of the garment must point toward the LEFT side of the frame. Do NOT mirror this view.'
      : angle.id === 'front'
      ? 'FRONT VIEW LOCK: camera is directly in front; both left and right sides are symmetric around center.'
      : 'BACK VIEW LOCK: camera is directly behind; only back side visible, no front panel visible.';

    const prompt = `Create ONE photorealistic e-commerce apparel image of the SAME EXACT garment identity across multi-view generation.

IMMUTABLE GARMENT IDENTITY (must not change):
${designFingerprint}

STRICT CONSISTENCY RULES:
- Keep silhouette, seam lines, collar shape, sleeve shape, hem length, placket, pocket placement, button count/placement, and fit identical to the immutable identity.
- Do not alter shade, saturation, texture scale, or pattern geometry.
- Do not add/remove accessories, logos, embroidery, trims, props, or extra layers.
- This image must look like the same physical garment photographed from another angle, not a variation.

CAMERA VIEW REQUIRED:
${angle.position}
${orientationRule}

SUBJECT COUNT (MANDATORY):
- Exactly ONE garment instance in the frame.
- Never generate multiple garments, duplicates, tiled products, reflections, or collage panels.
- One camera frame, one product, one angle only.

COMPOSITION / OUTPUT SPECS:
- Aspect ratio: 3:4 portrait (exactly 1200x1600).
- Product centered, entire garment fully visible top-to-bottom with small clean margins.
- Keep camera distance and framing consistent with other angles.

BACKGROUND AND LIGHTING (MANDATORY):
- Pure white studio background only (#FFFFFF), evenly lit.
- No gradients, no shadows on background, no floor texture, no scene elements.
- Soft, neutral studio lighting with realistic garment shading only.

STYLE REQUIREMENTS:
- Ghost mannequin / invisible mannequin fashion catalog style.
- Ultra sharp fabric weave and stitching detail.
- High-end retail product photography quality.

NEGATIVE CONSTRAINTS:
- No person, no skin, no face, no hands.
- No text, watermark, logo, border, or collage.
- No mirrored side-view orientation mistakes.
- No second garment, no ghost duplicate, no repeated product in background.
- No cropped garment, no tilted camera, no dramatic perspective.

Return only the final image.`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"]
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract image from response
      if (data.candidates && data.candidates[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inlineData?.mimeType?.startsWith('image/')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      
      throw new Error('No image generated in response');
    } catch (error) {
      console.error(`Error generating ${angle.id} view:`, error);
      throw error;
    }
  }, []);

  // Generate all 4 images
  const generateAllImages = useCallback(async () => {
    setGenerating(true);
    setErrors({});
    setLoading({ front: true, back: true, left: true, right: true });
    
    const dressDesc = generateDressDescription(clothingType, fabricName, fabricColor, patternName, gender);
    
    // Generate images sequentially to maintain consistency and avoid rate limiting
    for (const angle of ANGLES) {
      try {
        setLoading(prev => ({ ...prev, [angle.id]: true }));
        const imageUrl = await generateImage(angle, dressDesc);
        setImages(prev => ({ ...prev, [angle.id]: imageUrl }));
        setLoading(prev => ({ ...prev, [angle.id]: false }));
      } catch (error) {
        setErrors(prev => ({ ...prev, [angle.id]: error.message }));
        setLoading(prev => ({ ...prev, [angle.id]: false }));
      }
      
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setGenerating(false);
  }, [clothingType, fabricName, fabricColor, patternName, gender, generateImage]);

  // Regenerate single image
  const regenerateImage = useCallback(async (angleId) => {
    const angle = ANGLES.find(a => a.id === angleId);
    if (!angle) return;
    
    setLoading(prev => ({ ...prev, [angleId]: true }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[angleId];
      return newErrors;
    });
    
    const dressDesc = generateDressDescription(clothingType, fabricName, fabricColor, patternName, gender);
    
    try {
      const imageUrl = await generateImage(angle, dressDesc);
      setImages(prev => ({ ...prev, [angleId]: imageUrl }));
    } catch (error) {
      setErrors(prev => ({ ...prev, [angleId]: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, [angleId]: false }));
    }
  }, [clothingType, fabricName, fabricColor, patternName, gender, generateImage]);

  // Auto-generate on prop changes (debounced)
  useEffect(() => {
    const prev = prevPropsRef.current;
    const hasChanged = 
      prev.gender !== gender ||
      prev.clothingType !== clothingType ||
      prev.fabricColor !== fabricColor ||
      prev.patternName !== patternName ||
      prev.fabricName !== fabricName;
    
    if (hasChanged) {
      prevPropsRef.current = { gender, clothingType, fabricColor, patternName, fabricName };
      // Don't auto-generate on every change to avoid excessive API calls
      // User can click "Generate Preview" button
    }
  }, [gender, clothingType, fabricColor, patternName, fabricName]);

  // Download image
  const downloadImage = (angleId) => {
    const imageUrl = images[angleId];
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${clothingType}_${angleId}_view.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasAnyImage = Object.values(images).some(img => img !== null);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Dress Preview</h3>
        <button
          onClick={generateAllImages}
          disabled={generating}
          style={{
            ...styles.generateButton,
            ...(generating ? styles.generateButtonDisabled : {})
          }}
        >
          <RefreshCw 
            size={16} 
            style={{ 
              marginRight: 8,
              animation: generating ? 'spin 1s linear infinite' : 'none'
            }} 
          />
          {generating ? 'Generating...' : hasAnyImage ? 'Regenerate All' : 'Generate Preview'}
        </button>
      </div>

      <div style={styles.configSummary}>
        <span style={styles.configItem}>
          <strong>Type:</strong> {clothingType}
        </span>
        <span style={styles.configItem}>
          <strong>Fabric:</strong> {fabricName}
        </span>
        <span style={styles.configItem}>
          <strong>Color:</strong> 
          <span 
            style={{ 
              ...styles.colorDot, 
              backgroundColor: fabricColor 
            }} 
          />
        </span>
        <span style={styles.configItem}>
          <strong>Pattern:</strong> {patternName}
        </span>
      </div>

      <div style={styles.grid}>
        {ANGLES.map((angle) => (
          <div key={angle.id} style={styles.imageCard}>
            <div style={styles.imageLabel}>{angle.label}</div>
            <div style={styles.imageContainer}>
              {loading[angle.id] ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner} />
                  <span style={styles.loadingText}>Generating...</span>
                </div>
              ) : errors[angle.id] ? (
                <div style={styles.errorContainer}>
                  <span style={styles.errorText}>Failed to generate</span>
                  <button
                    onClick={() => regenerateImage(angle.id)}
                    style={styles.retryButton}
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              ) : images[angle.id] ? (
                <>
                  <img
                    src={images[angle.id]}
                    alt={`${clothingType} ${angle.label}`}
                    style={styles.image}
                    onClick={() => setSelectedImage(angle.id)}
                  />
                  <div style={styles.imageOverlay}>
                    <button
                      onClick={() => setSelectedImage(angle.id)}
                      style={styles.overlayButton}
                      title="View full size"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      onClick={() => downloadImage(angle.id)}
                      style={styles.overlayButton}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => regenerateImage(angle.id)}
                      style={styles.overlayButton}
                      title="Regenerate"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div style={styles.placeholder}>
                  <Eye size={32} style={{ opacity: 0.3 }} />
                  <span style={styles.placeholderText}>
                    Click "Generate Preview" to see the dress
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Full-size image modal */}
      {selectedImage && images[selectedImage] && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              style={styles.closeButton}
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img
              src={images[selectedImage]}
              alt={`${clothingType} ${selectedImage} view`}
              style={styles.modalImage}
            />
            <div style={styles.modalLabel}>
              {ANGLES.find(a => a.id === selectedImage)?.label}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  generateButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  generateButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  configSummary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px',
    color: '#666',
  },
  configItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  colorDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #ddd',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    flex: 1,
    minHeight: 0,
  },
  imageCard: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  imageLabel: {
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fafafa',
  },
  imageContainer: {
    position: 'relative',
    flex: 1,
    minHeight: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    cursor: 'pointer',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    display: 'flex',
    gap: '6px',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  overlayButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '13px',
    color: '#666',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '20px',
  },
  errorText: {
    fontSize: '13px',
    color: '#dc2626',
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '20px',
    color: '#9ca3af',
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: '12px',
    maxWidth: '120px',
    lineHeight: '1.4',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
  },
  modalLabel: {
    padding: '12px 20px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    borderTop: '1px solid #eee',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '36px',
    height: '36px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
};

// Add hover effect for overlay
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .gemini-image-card:hover .image-overlay {
    opacity: 1 !important;
  }
`;
document.head.appendChild(styleSheet);

export default GeminiDressPreview;
