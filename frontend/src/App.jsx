import { useEffect, useMemo, useState } from "react";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  completeAppointment,
  cancelAppointment,
} from "./api";

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  title: "",
  description: "",
  date: today,
  start_time: "",
  end_time: "",
};

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;

  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function formatDate(date) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shortDate(date) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getStatusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      <span className="status-dot"></span>
      {getStatusLabel(status)}
    </span>
  );
}

function StatCard({ label, value, icon, type }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-card-icon">{icon}</div>

      <div>
        <div className="stat-number">{value}</div>
        <div className="stat-name">{label}</div>
      </div>
    </div>
  );
}

function AppointmentRow({
  appointment,
  onEdit,
  onComplete,
  onCancel,
}) {
  const {
    id,
    title,
    description,
    date,
    start_time,
    end_time,
    status,
  } = appointment;

  return (
    <div className={`schedule-row ${status}`}>
      <div className="schedule-time">
        <strong>{formatTime(start_time)}</strong>
        <span>{formatTime(end_time)}</span>
      </div>

      <div className="schedule-line">
        <div className="timeline-dot"></div>
        <div className="timeline-line"></div>
      </div>

      <div className="schedule-content">
        <div className="schedule-content-top">
          <div>
            <h3>{title}</h3>

            <div className="schedule-meta">
              <span>{shortDate(date)}</span>
              {description && <span>•</span>}
              {description && <span>{description}</span>}
            </div>
          </div>

          <StatusBadge status={status} />
        </div>

        {status === "scheduled" && (
          <div className="row-actions">
            <button
              className="small-button"
              onClick={() => onEdit(appointment)}
            >
              Edit
            </button>

            <button
              className="small-button complete"
              onClick={() => onComplete(id)}
            >
              ✓ Complete
            </button>

            <button
              className="small-button cancel"
              onClick={() => onCancel(id)}
            >
              Cancel
            </button>
          </div>
        )}

        {status === "completed" && (
          <div className="state-note completed-note">
            ✓ Appointment completed
          </div>
        )}

        {status === "cancelled" && (
          <div className="state-note cancelled-note">
            × Appointment cancelled
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentModal({ appointment, onSave, onClose }) {
  const editing = Boolean(appointment);

  const [form, setForm] = useState(
    appointment
      ? {
          title: appointment.title,
          description: appointment.description || "",
          date: appointment.date,
          start_time: appointment.start_time.slice(0, 5),
          end_time: appointment.end_time.slice(0, 5),
        }
      : emptyForm
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  async function submit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Appointment title is required.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    if (!form.start_time || !form.end_time) {
      setError("Please provide both start and end times.");
      return;
    }

    if (form.end_time <= form.start_time) {
      setError("End time must be after the start time.");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save this appointment. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-top">
          <div>
            <div className="modal-label">
              {editing ? "EDIT APPOINTMENT" : "NEW APPOINTMENT"}
            </div>

            <h2>
              {editing ? "Update appointment" : "Create appointment"}
            </h2>

            <p>
              {editing
                ? "Make changes to the appointment details."
                : "Add a new appointment to your team schedule."}
            </p>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <div className="error-icon">!</div>

            <div>
              <strong>Something needs your attention</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="field">
            <label>
              Title <span>*</span>
            </label>

            <input
              value={form.title}
              onChange={(e) => change("title", e.target.value)}
              placeholder="e.g. Client project review"
              autoFocus
            />
          </div>

          <div className="field">
            <label>Description</label>

            <textarea
              rows="4"
              value={form.description}
              onChange={(e) =>
                change("description", e.target.value)
              }
              placeholder="Add context or notes for this appointment..."
            />
          </div>

          <div className="field">
            <label>
              Date <span>*</span>
            </label>

            <input
              type="date"
              value={form.date}
              onChange={(e) => change("date", e.target.value)}
            />
          </div>

          <div className="two-fields">
            <div className="field">
              <label>
                Start time <span>*</span>
              </label>

              <input
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  change("start_time", e.target.value)
                }
              />
            </div>

            <div className="field">
              <label>
                End time <span>*</span>
              </label>

              <input
                type="time"
                value={form.end_time}
                onChange={(e) =>
                  change("end_time", e.target.value)
                }
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="modal-primary">
              {saving
                ? "Saving..."
                : editing
                ? "Save changes"
                : "Create appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState(null);

  const [toast, setToast] = useState(null);

  async function loadAppointments() {
    setLoading(true);

    try {
      const data = await getAppointments(filterDate, filterStatus);
      setAppointments(data);
    } catch (error) {
      showToast(
        "error",
        error?.message || "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [filterDate, filterStatus]);

  function showToast(type, message) {
    setToast({
      type,
      message,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  const visibleAppointments = useMemo(() => {
    let result = [...appointments];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((appointment) => {
        return (
          appointment.title.toLowerCase().includes(query) ||
          (appointment.description || "")
            .toLowerCase()
            .includes(query)
        );
      });
    }

    return result.sort((a, b) => {
      const first = `${a.date} ${a.start_time}`;
      const second = `${b.date} ${b.start_time}`;

      return first.localeCompare(second);
    });
  }, [appointments, search]);

  const stats = useMemo(() => {
    return {
      total: appointments.length,

      scheduled: appointments.filter(
        (a) => a.status === "scheduled"
      ).length,

      completed: appointments.filter(
        (a) => a.status === "completed"
      ).length,

      cancelled: appointments.filter(
        (a) => a.status === "cancelled"
      ).length,
    };
  }, [appointments]);

  const todayAppointments = useMemo(() => {
    return visibleAppointments.filter((a) => a.date === today);
  }, [visibleAppointments]);

  const upcomingAppointments = useMemo(() => {
    return visibleAppointments
      .filter((a) => a.date >= today && a.status === "scheduled")
      .slice(0, 4);
  }, [visibleAppointments]);

  async function saveAppointment(data) {
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, data);

      showToast(
        "success",
        "Appointment updated successfully."
      );
    } else {
      await createAppointment(data);

      showToast(
        "success",
        "Appointment created successfully."
      );
    }

    closeModal();
    await loadAppointments();
  }

  async function handleComplete(id) {
    try {
      await completeAppointment(id);

      showToast(
        "success",
        "Appointment marked as completed."
      );

      await loadAppointments();
    } catch (error) {
      showToast(
        "error",
        error?.message || "Unable to complete appointment."
      );
    }
  }

  async function handleCancel(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      await cancelAppointment(id);

      showToast(
        "success",
        "Appointment cancelled successfully."
      );

      await loadAppointments();
    } catch (error) {
      showToast(
        "error",
        error?.message || "Unable to cancel appointment."
      );
    }
  }

  function openCreate() {
    setEditingAppointment(null);
    setModalOpen(true);
  }

  function openEdit(appointment) {
    setEditingAppointment(appointment);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingAppointment(null);
  }

  function clearFilters() {
    setFilterDate("");
    setFilterStatus("");
    setSearch("");
  }

  return (
    <div className="application">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">✓</div>

          <div>
            <strong>Appening</strong>
            <span>Appointment Board</span>
          </div>
        </div>

        <nav className="navigation">
          <div className="nav-section">WORKSPACE</div>

          <button className="nav-item active">
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => {
              document
                .getElementById("appointments")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            <span>□</span>
            Appointments
          </button>

          <button
            className="nav-item"
            onClick={() => {
              setFilterDate(today);

              document
                .getElementById("appointments")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            <span>◷</span>
            Today's schedule
          </button>

          <div className="nav-section second">MANAGE</div>

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">?</div>

            <div>
              <strong>Need help?</strong>
              <span>Manage your schedule easily.</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main-content">
        <header className="mobile-header">
          <div className="mobile-brand">
            <div className="brand-logo">✓</div>
            <strong>Appening</strong>
          </div>

          <button onClick={openCreate}>+ Appointment</button>
        </header>

        <div className="content-wrapper">
          {/* TOP HEADER */}

          <section className="page-header">
            <div>
              <div className="date-label">
                {formatDate(today)}
              </div>

              <h1>Good morning 👋</h1>

              <p>
                Here's what's happening with your team's schedule.
              </p>
            </div>

            <button
              className="create-button"
              onClick={openCreate}
            >
              <span>+</span>
              New appointment
            </button>
          </section>

          {/* STATS */}

          <section className="stats">
            <StatCard
              label="Total appointments"
              value={stats.total}
              icon="▦"
              type="total"
            />

            <StatCard
              label="Scheduled"
              value={stats.scheduled}
              icon="◷"
              type="scheduled"
            />

            <StatCard
              label="Completed"
              value={stats.completed}
              icon="✓"
              type="completed"
            />

            <StatCard
              label="Cancelled"
              value={stats.cancelled}
              icon="×"
              type="cancelled"
            />
          </section>

          {/* CONTENT GRID */}

          <section className="dashboard-grid">
            {/* TODAY */}

            <div className="schedule-panel" id="appointments">
              <div className="panel-header">
                <div>
                  <h2>Today's schedule</h2>
                  <p>
                    {todayAppointments.length} appointment
                    {todayAppointments.length === 1
                      ? ""
                      : "s"} today
                  </p>
                </div>

                <button
                  className="panel-add"
                  onClick={openCreate}
                >
                  + Add
                </button>
              </div>

              {/* FILTER BAR */}

              <div className="filter-bar">
                <div className="search-input">
                  <span>⌕</span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search appointments..."
                  />
                </div>

                <input
                  className="date-filter"
                  type="date"
                  value={filterDate}
                  onChange={(e) =>
                    setFilterDate(e.target.value)
                  }
                />

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value)
                  }
                >
                  <option value="">All statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading schedule...</p>
                </div>
              ) : visibleAppointments.length === 0 ? (
                <div className="empty">
                  <div className="empty-symbol">□</div>

                  <h3>No appointments found</h3>

                  <p>
                    Try changing your filters or create a new
                    appointment.
                  </p>

                  <button onClick={openCreate}>
                    Create appointment
                  </button>
                </div>
              ) : (
                <div className="schedule-list">
                  {visibleAppointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={openEdit}
                      onComplete={handleComplete}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* UPCOMING */}

            <aside className="upcoming-panel">
              <div className="panel-header">
                <div>
                  <h2>Upcoming</h2>
                  <p>Your next scheduled appointments</p>
                </div>
              </div>

              <div className="upcoming-list">
                {upcomingAppointments.length === 0 ? (
                  <div className="upcoming-empty">
                    No upcoming appointments.
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div
                      className="upcoming-item"
                      key={appointment.id}
                    >
                      <div className="upcoming-date">
                        <strong>
                          {new Date(
                            `${appointment.date}T00:00:00`
                          ).getDate()}
                        </strong>

                        <span>
                          {new Date(
                            `${appointment.date}T00:00:00`
                          ).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div className="upcoming-details">
                        <strong>{appointment.title}</strong>

                        <span>
                          {formatTime(appointment.start_time)} –{" "}
                          {formatTime(appointment.end_time)}
                        </span>
                      </div>

                      <button
                        className="upcoming-edit"
                        onClick={() =>
                          openEdit(appointment)
                        }
                      >
                        →
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="upcoming-footer">
                <button
                  onClick={() => {
                    setFilterStatus("scheduled");

                    document
                      .getElementById("appointments")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                >
                  View all scheduled →
                </button>
              </div>
            </aside>
          </section>

          {/* FOOTER */}

          <footer className="footer">
            <span>Appointment Board</span>
            <span>Built with React + FastAPI</span>
          </footer>
        </div>
      </main>

      {/* TOAST */}

      {toast && (
        <div className={`toast ${toast.type}`}>
          <div className="toast-check">
            {toast.type === "success" ? "✓" : "!"}
          </div>

          <div>
            <strong>
              {toast.type === "success" ? "Success" : "Error"}
            </strong>

            <p>{toast.message}</p>
          </div>

          <button onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* MODAL */}

      {modalOpen && (
        <AppointmentModal
          appointment={editingAppointment}
          onSave={saveAppointment}
          onClose={closeModal}
        />
      )}
    </div>
  );
}