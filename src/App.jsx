import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterComplaint from "./pages/RegisterComplaint";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ZoneHeadDashboard from "./pages/ZoneHeadDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterComplaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/complaints/:id" element={<ComplaintDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
  path="/zone"
  element={
    <ProtectedRoute allowedRoles={["ZONE_HEAD"]}>
      <ZoneHeadDashboard />
    </ProtectedRoute>
  }
/>

      <Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
// check in backend 
// @GetMapping("/api/complaints")
// public List<Complaint> getAllComplaints() {
//     return complaintRepository.findAll();
// }