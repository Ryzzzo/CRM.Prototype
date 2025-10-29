import { useState, useEffect } from 'react';
import { Upload, FileText, Image as ImageIcon, FileSpreadsheet, File as FileIcon, Download, Trash2, X, Filter } from 'lucide-react';
import { supabase, File as FileType } from '../lib/supabase';

interface FilesTabProps {
  contactId: string;
}

export default function FilesTab({ contactId }: FilesTabProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<FileType['category']>('Document');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [contactId]);

  const loadFiles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (data) {
      setFiles(data as FileType[]);
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileData: Partial<FileType> = {
        contact_id: contactId,
        filename: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        category: uploadCategory,
        storage_path: `/demo/${contactId}/${file.name}`,
      };

      await supabase.from('files').insert(fileData);
    }

    setUploading(false);
    setShowUploadModal(false);
    setSelectedFiles(null);
    loadFiles();
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      await supabase.from('files').delete().eq('id', fileId);
      loadFiles();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="text-purple-400" size={40} />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="text-green-400" size={40} />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="text-red-400" size={40} />;
    return <FileIcon className="text-cyan-400" size={40} />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Contract': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Proposal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Invoice': return 'bg-green-100 text-green-800 border-green-200';
      case 'Document': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Image': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredFiles = categoryFilter === 'All'
    ? files
    : files.filter(f => f.category === categoryFilter);

  const totalSize = files.reduce((sum, f) => sum + f.file_size, 0);
  const maxStorage = 100 * 1024 * 1024;
  const storagePercent = (totalSize / maxStorage) * 100;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 skeleton rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-cyan-100 uppercase tracking-wide">File Attachments</h3>
          <p className="text-sm text-cyan-400 mt-1">
            {formatFileSize(totalSize)} of {formatFileSize(maxStorage)} used
          </p>
          <div className="w-64 h-2 bg-slate-900 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all"
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            ></div>
          </div>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 gradient-button text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-cyan-500/30"
        >
          <Upload size={18} />
          Upload File
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-cyan-300">
          <Filter size={18} />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        {['All', 'Contract', 'Proposal', 'Invoice', 'Document', 'Image', 'Other'].map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === category
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:bg-slate-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-xl border-2 border-cyan-500/20">
          <Upload className="mx-auto text-cyan-400/50 mb-4" size={64} />
          <p className="text-cyan-300 text-lg mb-2">No files yet</p>
          <p className="text-cyan-400 text-sm">Upload files to get started</p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-slate-900 p-5 rounded-xl border-2 border-cyan-500/40 hover:border-cyan-400 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-cyan-100 truncate">{file.filename}</p>
                    <p className="text-xs text-cyan-400">{formatFileSize(file.file_size)}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      if (file.file_type.startsWith('image/')) {
                        setPreviewImage(file.storage_path);
                      }
                    }}
                    className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(file.category)}`}>
                  {file.category}
                </span>
                <span className="text-xs text-cyan-500">{formatDate(file.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full border-2 border-cyan-500/40 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-cyan-100">Upload Files</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-cyan-400 hover:text-cyan-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as FileType['category'])}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Contract">Contract</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Document">Document</option>
                  <option value="Image">Image</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Select Files
                </label>
                <div className="border-2 border-dashed border-cyan-500/40 rounded-xl p-8 text-center hover:border-cyan-400 transition-all bg-slate-900">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto text-cyan-400 mb-3" size={48} />
                    <p className="text-cyan-100 font-medium mb-1">
                      Drop files here or click to upload
                    </p>
                    <p className="text-sm text-cyan-400">Max 10MB per file</p>
                    {selectedFiles && selectedFiles.length > 0 && (
                      <p className="text-sm text-cyan-300 mt-3 font-bold">
                        {selectedFiles.length} file(s) selected
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 text-cyan-100 rounded-xl font-medium hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFiles || uploading}
                  className="flex-1 gradient-button text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-cyan-400 bg-slate-800 p-3 rounded-full"
            >
              <X size={24} />
            </button>
            <div className="bg-slate-800 p-4 rounded-xl">
              <p className="text-cyan-100 text-center font-medium mb-2">Image Preview</p>
              <p className="text-cyan-400 text-sm text-center">(Demo: Actual image would display here)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
