import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getClothingTypes, getFabrics, getFabricColors, getPatterns,
  getMeasurementFields, saveMeasurement,
} from '../api';
import { Check, Info, ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react';

const GENDERS = [
  { value: 'male', label: 'Male', emoji: '👔' },
  { value: 'female', label: 'Female', emoji: '👗' },
  { value: 'kids', label: 'Kids', emoji: '🧒' },
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const STEPS = [
  { num: 1, label: 'Gender & Type' },
  { num: 2, label: 'Fabric & Style' },
  { num: 3, label: 'Measurements' },
];

const NewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);

  // Restore state if coming back from TrialView
  const restoredState = location.state;

  // Step 1 state
  const [gender, setGender] = useState(restoredState?.gender || '');
  const [clothingTypes, setClothingTypes] = useState([]);
  const [selectedClothing, setSelectedClothing] = useState(restoredState?.selectedClothing || null);

  // Step 2 state
  const [fabrics, setFabrics] = useState([]);
  const [colors, setColors] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [selectedFabric, setSelectedFabric] = useState(restoredState?.selectedFabric || null);
  const [selectedColor, setSelectedColor] = useState(restoredState?.selectedColor || null);
  const [selectedPattern, setSelectedPattern] = useState(restoredState?.selectedPattern || null);
  const [fabricSource, setFabricSource] = useState(restoredState?.fabricSource || 'tailor');

  // Step 3 state
  const [sizeType, setSizeType] = useState(restoredState?.sizeType || 'standard');
  const [standardSize, setStandardSize] = useState(restoredState?.standardSize || '');
  const [measurementFields, setMeasurementFields] = useState([]);
  const [customMeasurements, setCustomMeasurements] = useState(restoredState?.customMeasurements || {});
  const [saveLabel, setSaveLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load clothing types when gender changes
  useEffect(() => {
    if (gender) {
      getClothingTypes(gender).then((res) => {
        setClothingTypes(res.data);
        setSelectedClothing(null);
      });
    }
  }, [gender]);

  // Load fabrics, colors, patterns for step 2
  useEffect(() => {
    getFabrics().then((res) => setFabrics(res.data));
    getFabricColors().then((res) => setColors(res.data));
    getPatterns().then((res) => setPatterns(res.data));
  }, []);

  // Load measurement fields when clothing selection changes
  const loadMeasurementFields = useCallback(() => {
    if (selectedClothing) {
      getMeasurementFields(selectedClothing.id).then((res) => {
        setMeasurementFields(res.data);
        const init = {};
        res.data.forEach((f) => { init[f.field_name] = ''; });
        setCustomMeasurements(init);
      });
    }
  }, [selectedClothing]);

  useEffect(() => {
    loadMeasurementFields();
  }, [loadMeasurementFields]);

  // Set step to 3 if restored from TrialView
  useEffect(() => {
    if (restoredState) setStep(3);
  }, [restoredState]);

  const canProceed = (s) => {
    if (s === 1) return gender && selectedClothing;
    if (s === 2) return selectedFabric;
    if (s === 3) return (sizeType === 'standard' && standardSize) || sizeType === 'custom';
    return true;
  };

  const handleNext = () => {
    if (canProceed(step) && step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSaveMeasurements = async () => {
    if (!saveLabel.trim()) {
      setError('Please enter a name for this measurement');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveMeasurement({
        label: saveLabel,
        clothing_type: selectedClothing.id,
        size_type: sizeType,
        standard_size: sizeType === 'standard' ? standardSize : null,
        measurements: sizeType === 'custom' ? customMeasurements : {},
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save measurements. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinueToTrialView = () => {
    const orderData = {
      gender,
      selectedClothing,
      selectedFabric,
      selectedColor,
      selectedPattern,
      fabricSource,
      sizeType,
      standardSize,
      customMeasurements,
    };
    navigate('/trial-view', { state: orderData });
  };

  const getClothingEmoji = (name) => {
    const map = {
      'Shirt': '👕', 'Pant': '👖', 'Kurta': '🥻', 'Suit': '🤵', 'Blazer': '🧥', 'Sherwani': '🥻',
      'Blouse': '👚', 'Salwar': '👗', 'Lehenga': '💃', 'Dress': '👗', 'Kurti': '👘', 'Saree Blouse': '🥻',
      'School Uniform': '🎓', 'Casual Wear': '👕', 'Party Wear': '🎉', 'Ethnic Wear': '🥻',
    };
    return map[name] || '👔';
  };

  const getFabricEmoji = (name) => {
    const map = {
      'Cotton': '🌿', 'Silk': '✨', 'Linen': '🌾', 'Wool': '🐑', 'Polyester': '🔷',
      'Chiffon': '🌸', 'Georgette': '🦋', 'Velvet': '🟣', 'Denim': '👖', 'Satin': '💎',
    };
    return map[name] || '🧵';
  };

  return (
    <div>
      <div className="page-header">
        <h1>New Custom Order</h1>
        <p>Follow the steps to configure your perfect outfit</p>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="stepper-step">
              <div className={`step-number ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span className={`step-label ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector ${step > s.num ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Gender & Clothing Type */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h2>Select Gender</h2>
            <p>Choose who this outfit is for</p>
          </div>

          <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 520 }}>
            {GENDERS.map((g) => (
              <div
                key={g.value}
                className={`selection-card ${gender === g.value ? 'selected' : ''}`}
                onClick={() => setGender(g.value)}
              >
                <div className="card-icon" style={{ fontSize: 36 }}>{g.emoji}</div>
                <span className="card-label">{g.label}</span>
              </div>
            ))}
          </div>

          {gender && (
            <>
              <hr className="section-divider" />
              <div className="card-header">
                <h2>Select Clothing Type</h2>
                <p>Choose the type of garment you'd like</p>
              </div>

              <div className="selection-grid">
                {clothingTypes.map((ct) => (
                  <div
                    key={ct.id}
                    className={`selection-card ${selectedClothing?.id === ct.id ? 'selected' : ''}`}
                    onClick={() => setSelectedClothing(ct)}
                  >
                    <div className="card-icon" style={{ fontSize: 32 }}>{getClothingEmoji(ct.name)}</div>
                    <span className="card-label">{ct.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="actions-bar">
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={16} /> Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ width: 'auto' }}
              disabled={!canProceed(1)}
              onClick={handleNext}
            >
              Next: Fabric & Style <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Fabric & Material */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <h2>Fabric Source</h2>
            <p>Will you provide the fabric or use ours?</p>
          </div>

          <div className="fabric-source-toggle">
            <button
              className={`fabric-source-btn ${fabricSource === 'tailor' ? 'active' : ''}`}
              onClick={() => setFabricSource('tailor')}
            >
              🧵 Tailor-provided fabric
            </button>
            <button
              className={`fabric-source-btn ${fabricSource === 'user' ? 'active' : ''}`}
              onClick={() => setFabricSource('user')}
            >
              📦 I'll provide my own
            </button>
          </div>

          {fabricSource === 'tailor' && (
            <>
              <hr className="section-divider" />
              <div className="card-header">
                <h2>Select Fabric</h2>
                <p>Choose from our premium fabric collection</p>
              </div>

              <div className="selection-grid">
                {fabrics.map((f) => (
                  <div
                    key={f.id}
                    className={`selection-card ${selectedFabric?.id === f.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFabric(f)}
                  >
                    <div className="card-icon" style={{ fontSize: 28 }}>{getFabricEmoji(f.name)}</div>
                    <span className="card-label">{f.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {fabricSource === 'user' && (
            <>
              <hr className="section-divider" />
              <div className="guide-tip">
                <Info size={18} className="guide-icon" />
                <span>You can bring your own fabric to the tailor. Just select the closest matching fabric type for reference.</span>
              </div>
              <div className="selection-grid">
                {fabrics.map((f) => (
                  <div
                    key={f.id}
                    className={`selection-card ${selectedFabric?.id === f.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFabric(f)}
                  >
                    <div className="card-icon" style={{ fontSize: 28 }}>{getFabricEmoji(f.name)}</div>
                    <span className="card-label">{f.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <hr className="section-divider" />

          <div className="card-header">
            <h2>Fabric Color</h2>
            <p>Select your preferred color (optional)</p>
          </div>

          <div className="color-grid">
            {colors.map((c) => (
              <div
                key={c.id}
                className={`color-swatch ${selectedColor?.id === c.id ? 'selected' : ''}`}
                style={{
                  background: c.hex_code || '#ccc',
                  border: c.name === 'White' ? '3px solid #e0e0e0' : undefined,
                }}
                title={c.name}
                onClick={() => setSelectedColor(selectedColor?.id === c.id ? null : c)}
              />
            ))}
          </div>
          {selectedColor && (
            <p style={{ fontSize: 13, color: '#555', marginTop: 8 }}>Selected: <strong>{selectedColor.name}</strong></p>
          )}

          <hr className="section-divider" />

          <div className="card-header">
            <h2>Pattern</h2>
            <p>Choose a pattern style (optional)</p>
          </div>

          <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {patterns.map((p) => (
              <div
                key={p.id}
                className={`selection-card ${selectedPattern?.id === p.id ? 'selected' : ''}`}
                onClick={() => setSelectedPattern(selectedPattern?.id === p.id ? null : p)}
                style={{ padding: '14px 12px' }}
              >
                <span className="card-label">{p.name}</span>
              </div>
            ))}
          </div>

          <div className="actions-bar">
            <button className="btn btn-secondary" onClick={handleBack}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              className="btn btn-primary"
              style={{ width: 'auto' }}
              disabled={!canProceed(2)}
              onClick={handleNext}
            >
              Next: Measurements <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Measurements */}
      {step === 3 && (
        <div className="card">
          <div className="card-header">
            <h2>Size & Measurements</h2>
            <p>For: <strong>{selectedClothing?.name}</strong> ({gender})</p>
          </div>

          <div className="tabs">
            <button
              className={`tab ${sizeType === 'standard' ? 'active' : ''}`}
              onClick={() => setSizeType('standard')}
            >
              Standard Sizes
            </button>
            <button
              className={`tab ${sizeType === 'custom' ? 'active' : ''}`}
              onClick={() => setSizeType('custom')}
            >
              Custom Measurements
            </button>
          </div>

          {sizeType === 'standard' && (
            <>
              <div className="guide-tip">
                <Info size={18} className="guide-icon" />
                <span>Select your standard size. If you're unsure, try our custom measurements option for a perfect fit.</span>
              </div>
              <div className="size-grid">
                {STANDARD_SIZES.map((s) => (
                  <div
                    key={s}
                    className={`size-card ${standardSize === s ? 'selected' : ''}`}
                    onClick={() => setStandardSize(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </>
          )}

          {sizeType === 'custom' && (
            <>
              <div className="guide-tip">
                <Info size={18} className="guide-icon" />
                <span>
                  Use a flexible measuring tape for accurate measurements. Measure over light clothing.
                  All measurements should be in <strong>inches</strong>.
                </span>
              </div>
              <div className="measurement-grid">
                {measurementFields.map((field) => (
                  <div key={field.id} className="measurement-field">
                    <label>{field.field_label} {field.is_required && '*'}</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="0.0"
                      value={customMeasurements[field.field_name] || ''}
                      onChange={(e) =>
                        setCustomMeasurements({
                          ...customMeasurements,
                          [field.field_name]: e.target.value,
                        })
                      }
                    />
                    <div className="unit">{field.unit}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <hr className="section-divider" />

          {/* Save for future */}
          <div className="card-header">
            <h2>Save Measurements</h2>
            <p>Save these measurements for quick reuse in future orders</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {saved && <div className="alert alert-success">Measurements saved successfully!</div>}

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Measurement Name</label>
              <input
                type="text"
                className="form-input"
                placeholder='e.g. "My Office Shirt" or "Party Outfit"'
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', height: 48 }}
              onClick={handleSaveMeasurements}
              disabled={saving || (!standardSize && sizeType === 'standard')}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="actions-bar">
            <button className="btn btn-secondary" onClick={handleBack}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: 'auto' }}
              disabled={!canProceed(3)}
              onClick={handleContinueToTrialView}
            >
              <Eye size={18} />
              Continue to Trial View <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewOrder;
