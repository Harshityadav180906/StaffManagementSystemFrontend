import React, { useState, useEffect } from "react";

const API_BASE = "https://staffmanagementsystem-xoo6.onrender.com/staff";

export default function App() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ name: "", role: "", department: "" });

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Could not reach backend API");
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openModal = (member = null) => {
    if (member) {
      setEditingStaff(member);
      setFormData({ name: member.name, role: member.role, department: member.department });
    } else {
      setEditingStaff(null);
      setFormData({ name: "", role: "", department: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        const res = await fetch(`${API_BASE}/${editingStaff.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Create failed");
      }
      closeModal();
      fetchStaff();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this record?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion failed");
      setStaff((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const departments = ["All", ...new Set(staff.map((s) => s.department))];
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.role.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "All" || member.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="container">
      {/* Top Header */}
      <div className="header">
        <div className="header-title-wrap">
          <div className="header-icon">🏛️</div>
          <div>
            <h1>Staff Management Directory</h1>
            <p>Maintain faculties, departments, and administrative personnel</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchStaff} title="Refresh">
            ↻ Sync
          </button>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Add Staff
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="controls">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by faculty name or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept === "All" ? "All Departments" : `${dept} Dept`}
            </option>
          ))}
        </select>
      </div>

      {/* Grid / States */}
      {loading ? (
        <div className="status-box">Fetching staff directory records...</div>
      ) : error ? (
        <div className="error-banner">
          ⚠️ <strong>Connection Error:</strong> {error}. Ensure your backend server is active on port 3000.
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="status-box">No staff members match the selected criteria.</div>
      ) : (
        <div className="grid">
          {filteredStaff.map((item) => (
            <div key={item.id} className="card">
              <div>
                <div className="card-top">
                  <span className="id-badge">EMP-{item.id}</span>
                  <span className="dept-badge">{item.department}</span>
                </div>
                <div className="profile-section">
                  <div className="avatar">{getInitials(item.name)}</div>
                  <div className="profile-details">
                    <div className="staff-name" title={item.name}>{item.name}</div>
                    <div className="staff-role">{item.role}</div>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button className="action-btn" onClick={() => openModal(item)}>
                  Edit
                </button>
                <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingStaff ? "Edit Staff Details" : "Create New Staff Record"}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kulkarni"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Role / Position</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Teacher"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Science"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStaff ? "Update Member" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}