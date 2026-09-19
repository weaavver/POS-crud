import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../api/products';
import { useAuth } from '../../context/AuthContext';

const OS_OPTIONS = ['Windows 7', 'Windows 10', 'Windows 11', 'macOS', 'Linux'];
const PROCESSOR_OPTIONS = [
  'Intel i3-4160 / AMD equivalent',
  'Intel i5-6400 / AMD equivalent',
  'Intel i5-9400 / AMD Ryzen 5',
  'Intel i7-8700 / AMD Ryzen 7',
  'Intel i9 / AMD Ryzen 9',
];
const MEMORY_OPTIONS = ['2 GB RAM', '4 GB RAM', '8 GB RAM', '16 GB RAM', '32 GB RAM'];
const GRAPHICS_OPTIONS = [
  'Intel HD Graphics',
  'Nvidia GeForce GTX 760',
  'Nvidia GeForce GTX 960',
  'Nvidia GeForce GTX 1060 / AMD RX 580',
  'Nvidia GeForce RTX 2060',
  'Nvidia GeForce RTX 3070 or better',
];
const DIRECTX_OPTIONS = ['Version 9.0c', 'Version 10', 'Version 11', 'Version 12'];
const STORAGE_OPTIONS = ['1 GB available space', '5 GB available space', '15 GB available space', '30 GB available space', '50+ GB available space'];

export default function AddProduct() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    type: 'game',
    platform: '',
    cover_image: '',
    gallery_images: '',
    download_url: '',
  });
  const [sysReq, setSysReq] = useState({
    os: '',
    processor: '',
    memory: '',
    graphics: '',
    directx: '',
    storage: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSysReqChange = (e) => {
    setSysReq({ ...sysReq, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const hasSysReq = Object.values(sysReq).some((v) => v !== '');
      const payload = {
        ...form,
        price: parseFloat(form.price),
        cover_image: form.cover_image || null,
        gallery_images: form.gallery_images
          ? form.gallery_images.split(',').map((s) => s.trim())
          : [],
        system_requirements: form.type === 'game' && hasSysReq
          ? {
              os: sysReq.os || null,
              processor: sysReq.processor || null,
              memory: sysReq.memory || null,
              graphics: sysReq.graphics || null,
              directx: sysReq.directx || null,
              storage: sysReq.storage || null,
            }
          : null,
      };
      await createProduct(payload, token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Add Product</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title" name="title" value={form.title} onChange={handleChange} required />

        <div>
          <label className="block text-sm text-[#c7d5e0] mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full bg-[#1b2838] border border-[#2a3f5a] rounded px-3 py-2 text-white focus:outline-none focus:border-[#66c0f4]"
          />
        </div>

        <Field label="Price (USD)" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />

        <div>
          <label className="block text-sm text-[#c7d5e0] mb-1">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full bg-[#1b2838] border border-[#2a3f5a] rounded px-3 py-2 text-white focus:outline-none focus:border-[#66c0f4]"
          >
            <option value="game">Game</option>
            <option value="book">Book</option>
          </select>
        </div>

        <Field label="Platform" name="platform" value={form.platform} onChange={handleChange} required placeholder="e.g. Windows, PDF, EPUB" />
        <Field label="Cover Image URL" name="cover_image" value={form.cover_image} onChange={handleChange} placeholder="Optional for now" />
        <Field label="Gallery Image URLs (comma-separated)" name="gallery_images" value={form.gallery_images} onChange={handleChange} placeholder="Optional, up to 3" />
        <Field label="Download URL" name="download_url" value={form.download_url} onChange={handleChange} required />

        {form.type === 'game' && (
          <div className="border-t border-[#2a3f5a] pt-4 mt-6">
            <h2 className="text-lg font-semibold text-white mb-3">System Requirements</h2>
            <div className="space-y-3">
              <SelectField label="OS" name="os" value={sysReq.os} onChange={handleSysReqChange} options={OS_OPTIONS} />
              <SelectField label="Processor" name="processor" value={sysReq.processor} onChange={handleSysReqChange} options={PROCESSOR_OPTIONS} />
              <SelectField label="Memory" name="memory" value={sysReq.memory} onChange={handleSysReqChange} options={MEMORY_OPTIONS} />
              <SelectField label="Graphics" name="graphics" value={sysReq.graphics} onChange={handleSysReqChange} options={GRAPHICS_OPTIONS} />
              <SelectField label="DirectX" name="directx" value={sysReq.directx} onChange={handleSysReqChange} options={DIRECTX_OPTIONS} />
              <SelectField label="Storage" name="storage" value={sysReq.storage} onChange={handleSysReqChange} options={STORAGE_OPTIONS} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#66c0f4] text-[#171a21] font-semibold rounded py-2 hover:bg-[#7fd0ff] transition-colors disabled:opacity-50 mt-6"
        >
          {submitting ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', required = false, placeholder = '', step }) {
  return (
    <div>
      <label className="block text-sm text-[#c7d5e0] mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={step}
        className="w-full bg-[#1b2838] border border-[#2a3f5a] rounded px-3 py-2 text-white focus:outline-none focus:border-[#66c0f4]"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-[#c7d5e0] mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-[#1b2838] border border-[#2a3f5a] rounded px-3 py-2 text-white focus:outline-none focus:border-[#66c0f4]"
      >
        <option value="">— Select {label} —</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}