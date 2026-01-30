import { useEffect, useState } from "react";
import { getComplaintImages } from "../services/complaintApi";

export default function ComplaintImages({ complaintId }) {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);

  useEffect(() => {
    getComplaintImages(complaintId)
      .then((res) => {
        const images = res.data;

        setBeforeImage(
          images.find((i) => i.imageType === "BEFORE")?.imageUrl
        );

        setAfterImage(
          images.find((i) => i.imageType === "AFTER")?.imageUrl
        );
      })
      .catch(() => {
        console.error("Failed to load images");
      });
  }, [complaintId]);

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-6">
      <h3 className="font-semibold mb-4">
        Before / After Images
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE */}
        <div>
          <p className="text-sm font-medium mb-2 text-gray-600">
            Before
          </p>
          {beforeImage ? (
            <img
              src={`http://localhost:8080${beforeImage}`}
              alt="Before"
              className="rounded-lg border"
            />
          ) : (
            <p className="text-xs text-gray-400">
              No image uploaded
            </p>
          )}
        </div>

        {/* AFTER */}
        <div>
          <p className="text-sm font-medium mb-2 text-gray-600">
            After
          </p>
          {afterImage ? (
            <img
              src={`http://localhost:8080${afterImage}`}
              alt="After"
              className="rounded-lg border"
            />
          ) : (
            <p className="text-xs text-gray-400">
              Not resolved yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
