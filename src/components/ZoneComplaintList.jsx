    import { updateComplaintStatus } from "../services/zoneApi";
    import { uploadAfterImage } from "../services/complaintApi";

    const updateStatus = async (id, newStatus) => {
    try {
        await updateComplaintStatus(id, newStatus);

        setComplaints((prev) =>
        prev.map((c) =>
            c.id === id ? { ...c, status: newStatus } : c
        )
        );
    } catch (err) {
        alert("Failed to update status");
    }
    };
    {c.status === "IN_PROGRESS" && (
  <>
    <input
      type="file"
      accept="image/*"
      onChange={async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          await uploadAfterImage(c.id, file);
          updateStatus(c.id, "RESOLVED");
        } catch {
          alert("Failed to upload AFTER image");
        }
      }}
      className="text-xs"
    />
  </>
)}

