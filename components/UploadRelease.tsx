'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Music, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore, Release } from '@/lib/store';
import { generateISRC, generateUPC, validateAudioFile, validateArtwork, GENRES, LANGUAGES, TERRITORIES } from '@/lib/utils';

interface UploadReleaseProps {
  editingRelease?: Release | null;
  onComplete?: () => void;
}

export default function UploadRelease({ editingRelease, onComplete }: UploadReleaseProps) {
  const { addRelease, updateRelease } = useStore();
  const [step, setStep] = useState(1);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    trackTitle: '',
    version: '',
    primaryArtist: '',
    albumTitle: '',
    albumType: 'single' as 'single' | 'ep' | 'album',
    isrc: '',
    upc: '',
    composer: '',
    lyricist: '',
    producer: '',
    featuringArtists: '',
    primaryGenre: '',
    secondaryGenre: '',
    language: '',
    releaseDate: '',
    preOrderDate: '',
    labelName: '',
    copyrightYear: new Date().getFullYear().toString(),
    isExplicit: false,
    territories: 'Worldwide',
    lyrics: '',
  });

  useEffect(() => {
    if (editingRelease) {
      setFormData({
        trackTitle: editingRelease.trackTitle,
        version: '',
        primaryArtist: editingRelease.primaryArtist,
        albumTitle: editingRelease.albumTitle || '',
        albumType: editingRelease.albumType,
        isrc: editingRelease.isrc || '',
        upc: editingRelease.upc || '',
        composer: editingRelease.composer || '',
        lyricist: editingRelease.lyricist || '',
        producer: editingRelease.producer || '',
        featuringArtists: editingRelease.featuringArtists || '',
        primaryGenre: editingRelease.primaryGenre || '',
        secondaryGenre: editingRelease.secondaryGenre || '',
        language: editingRelease.language || '',
        releaseDate: editingRelease.releaseDate || '',
        preOrderDate: editingRelease.preOrderDate || '',
        labelName: editingRelease.labelName || '',
        copyrightYear: editingRelease.copyrightYear || new Date().getFullYear().toString(),
        isExplicit: editingRelease.isExplicit,
        territories: editingRelease.territories || 'Worldwide',
        lyrics: editingRelease.lyrics || '',
      });
    }
  }, [editingRelease]);

  const onAudioDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        setErrors({ ...errors, audio: validation.error! });
        return;
      }
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
      setErrors({ ...errors, audio: '' });
    }
  }, [errors]);

  const onArtworkDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const validation = validateArtwork(file);
      if (!validation.valid) {
        setErrors({ ...errors, artwork: validation.error! });
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        if (img.width < 3000 || img.height < 3000) {
          setErrors({ ...errors, artwork: 'Image must be at least 3000x3000 pixels.' });
        } else {
          setArtworkFile(file);
          setArtworkPreview(URL.createObjectURL(file));
          setErrors({ ...errors, artwork: '' });
        }
      };
      img.src = URL.createObjectURL(file);
    }
  }, [errors]);

  const audioDropzone = useDropzone({
    onDrop: onAudioDrop,
    accept: { 'audio/*': ['.wav', '.flac', '.mp3'] },
    maxFiles: 1,
  });

  const artworkDropzone = useDropzone({
    onDrop: onArtworkDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
  });

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!audioFile && !editingRelease) newErrors.audio = 'Audio file is required';
    if (!artworkFile && !editingRelease) newErrors.artwork = 'Artwork is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.trackTitle) newErrors.trackTitle = 'Track title is required';
    if (!formData.primaryArtist) newErrors.primaryArtist = 'Primary artist is required';
    if (!formData.albumTitle) newErrors.albumTitle = 'Album title is required';
    if (!formData.primaryGenre) newErrors.primaryGenre = 'Primary genre is required';
    if (!formData.language) newErrors.language = 'Language is required';
    if (!formData.releaseDate) newErrors.releaseDate = 'Release date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleGenerateISRC = () => {
    setFormData({ ...formData, isrc: generateISRC() });
  };

  const handleGenerateUPC = () => {
    setFormData({ ...formData, upc: generateUPC() });
  };

  const handleSubmit = (status: 'draft' | 'under_review') => {
    if (!validateStep2()) return;

    const release: Release = {
      id: editingRelease?.id || Date.now().toString(),
      trackTitle: formData.trackTitle,
      primaryArtist: formData.primaryArtist,
      albumTitle: formData.albumTitle,
      albumType: formData.albumType,
      status,
      audioFile: audioFile || editingRelease?.audioFile,
      artworkFile: artworkFile || editingRelease?.artworkFile,
      isrc: formData.isrc || generateISRC(),
      upc: formData.upc || (formData.albumType !== 'single' ? generateUPC() : undefined),
      composer: formData.composer,
      lyricist: formData.lyricist,
      producer: formData.producer,
      featuringArtists: formData.featuringArtists,
      primaryGenre: formData.primaryGenre,
      secondaryGenre: formData.secondaryGenre,
      language: formData.language,
      releaseDate: formData.releaseDate,
      preOrderDate: formData.preOrderDate,
      labelName: formData.labelName,
      copyrightYear: formData.copyrightYear,
      isExplicit: formData.isExplicit,
      territories: formData.territories,
      lyrics: formData.lyrics,
      createdAt: editingRelease?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingRelease) {
      updateRelease(editingRelease.id, release);
    } else {
      addRelease(release);
    }

    // Reset form
    setStep(1);
    setAudioFile(null);
    setArtworkFile(null);
    setAudioPreview(null);
    setArtworkPreview(null);
    setFormData({
      trackTitle: '',
      version: '',
      primaryArtist: '',
      albumTitle: '',
      albumType: 'single',
      isrc: '',
      upc: '',
      composer: '',
      lyricist: '',
      producer: '',
      featuringArtists: '',
      primaryGenre: '',
      secondaryGenre: '',
      language: '',
      releaseDate: '',
      preOrderDate: '',
      labelName: '',
      copyrightYear: new Date().getFullYear().toString(),
      isExplicit: false,
      territories: 'Worldwide',
      lyrics: '',
    });

    if (onComplete) onComplete();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {editingRelease ? 'Edit Release' : 'Upload New Release'}
        </h1>
        <p className="text-gray-600">Step {step} of 3</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Upload Files</span>
          <span>Metadata</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step 1: File Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upload Audio File</h2>
            <div
              {...audioDropzone.getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input {...audioDropzone.getInputProps()} />
              {audioFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-gray-900 font-medium">{audioFile.name}</p>
                  <p className="text-sm text-gray-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  {audioPreview && (
                    <audio controls src={audioPreview} className="mx-auto mt-4 w-full max-w-md" />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Music className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600">Drag & drop audio file here, or click to select</p>
                  <p className="text-sm text-gray-500">WAV, FLAC, or MP3 (320kbps) • Max 200MB</p>
                </div>
              )}
            </div>
            {errors.audio && (
              <div className="mt-2 flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.audio}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upload Artwork</h2>
            <div
              {...artworkDropzone.getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input {...artworkDropzone.getInputProps()} />
              {artworkFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-gray-900 font-medium">{artworkFile.name}</p>
                  {artworkPreview && (
                    <img src={artworkPreview} alt="Artwork preview" className="mx-auto mt-4 w-64 h-64 object-cover rounded" />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600">Drag & drop artwork here, or click to select</p>
                  <p className="text-sm text-gray-500">JPG or PNG • 3000x3000px minimum</p>
                </div>
              )}
            </div>
            {errors.artwork && (
              <div className="mt-2 flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.artwork}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next: Add Metadata
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Metadata */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Track Title *
              </label>
              <input
                type="text"
                value={formData.trackTitle}
                onChange={(e) => setFormData({ ...formData, trackTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.trackTitle && <p className="mt-1 text-sm text-red-600">{errors.trackTitle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Remix, Acoustic"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Artist *
              </label>
              <input
                type="text"
                value={formData.primaryArtist}
                onChange={(e) => setFormData({ ...formData, primaryArtist: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.primaryArtist && <p className="mt-1 text-sm text-red-600">{errors.primaryArtist}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featuring Artists
              </label>
              <input
                type="text"
                placeholder="Separate with commas"
                value={formData.featuringArtists}
                onChange={(e) => setFormData({ ...formData, featuringArtists: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Album Title *
              </label>
              <input
                type="text"
                value={formData.albumTitle}
                onChange={(e) => setFormData({ ...formData, albumTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.albumTitle && <p className="mt-1 text-sm text-red-600">{errors.albumTitle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Album Type *
              </label>
              <select
                value={formData.albumType}
                onChange={(e) => setFormData({ ...formData, albumType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="single">Single</option>
                <option value="ep">EP</option>
                <option value="album">Album</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISRC
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.isrc}
                  onChange={(e) => setFormData({ ...formData, isrc: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto-generated if empty"
                />
                <button
                  onClick={handleGenerateISRC}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPC/EAN
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.upc}
                  onChange={(e) => setFormData({ ...formData, upc: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="For albums/EPs"
                />
                <button
                  onClick={handleGenerateUPC}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Composer
              </label>
              <input
                type="text"
                value={formData.composer}
                onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lyricist
              </label>
              <input
                type="text"
                value={formData.lyricist}
                onChange={(e) => setFormData({ ...formData, lyricist: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producer
              </label>
              <input
                type="text"
                value={formData.producer}
                onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Genre *
              </label>
              <select
                value={formData.primaryGenre}
                onChange={(e) => setFormData({ ...formData, primaryGenre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select genre</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              {errors.primaryGenre && <p className="mt-1 text-sm text-red-600">{errors.primaryGenre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Genre
              </label>
              <select
                value={formData.secondaryGenre}
                onChange={(e) => setFormData({ ...formData, secondaryGenre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select genre</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language *
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select language</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              {errors.language && <p className="mt-1 text-sm text-red-600">{errors.language}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Release Date *
              </label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.releaseDate && <p className="mt-1 text-sm text-red-600">{errors.releaseDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pre-Order Date
              </label>
              <input
                type="date"
                value={formData.preOrderDate}
                onChange={(e) => setFormData({ ...formData, preOrderDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label Name
              </label>
              <input
                type="text"
                value={formData.labelName}
                onChange={(e) => setFormData({ ...formData, labelName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copyright Year
              </label>
              <input
                type="text"
                value={formData.copyrightYear}
                onChange={(e) => setFormData({ ...formData, copyrightYear: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Territories
              </label>
              <select
                value={formData.territories}
                onChange={(e) => setFormData({ ...formData, territories: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TERRITORIES.map((territory) => (
                  <option key={territory} value={territory}>{territory}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isExplicit}
                  onChange={(e) => setFormData({ ...formData, isExplicit: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Explicit Content</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lyrics (Optional)
              </label>
              <textarea
                value={formData.lyrics}
                onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lyrics here..."
              />
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next: Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Review Your Release</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Track Information</h3>
                <dl className="space-y-2 text-sm">
                  <div><dt className="text-gray-600 inline">Track:</dt> <dd className="inline font-medium">{formData.trackTitle}</dd></div>
                  <div><dt className="text-gray-600 inline">Artist:</dt> <dd className="inline font-medium">{formData.primaryArtist}</dd></div>
                  <div><dt className="text-gray-600 inline">Album:</dt> <dd className="inline font-medium">{formData.albumTitle}</dd></div>
                  <div><dt className="text-gray-600 inline">Type:</dt> <dd className="inline font-medium capitalize">{formData.albumType}</dd></div>
                  <div><dt className="text-gray-600 inline">ISRC:</dt> <dd className="inline font-medium">{formData.isrc || 'Auto-generated'}</dd></div>
                  {formData.upc && <div><dt className="text-gray-600 inline">UPC:</dt> <dd className="inline font-medium">{formData.upc}</dd></div>}
                </dl>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Release Details</h3>
                <dl className="space-y-2 text-sm">
                  <div><dt className="text-gray-600 inline">Genre:</dt> <dd className="inline font-medium">{formData.primaryGenre}</dd></div>
                  <div><dt className="text-gray-600 inline">Language:</dt> <dd className="inline font-medium">{formData.language}</dd></div>
                  <div><dt className="text-gray-600 inline">Release Date:</dt> <dd className="inline font-medium">{formData.releaseDate}</dd></div>
                  <div><dt className="text-gray-600 inline">Territories:</dt> <dd className="inline font-medium">{formData.territories}</dd></div>
                  <div><dt className="text-gray-600 inline">Explicit:</dt> <dd className="inline font-medium">{formData.isExplicit ? 'Yes' : 'No'}</dd></div>
                </dl>
              </div>
            </div>

            {artworkPreview && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-2">Artwork Preview</h3>
                <img src={artworkPreview} alt="Artwork" className="w-48 h-48 object-cover rounded" />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <div className="space-x-4">
              <button
                onClick={() => handleSubmit('draft')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSubmit('under_review')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
