export default function ImageUpload({ onFileSelect }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <label className="block text-sm font-medium mb-2">
        Upload Issue Photo
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onFileSelect(e.target.files[0])}
        className="w-full text-sm"
      />
    </div>
  );
}
